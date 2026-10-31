#!/usr/bin/env node
// Verify one study page at fixed viewport sizes.
// Writes screenshots and a JSON report. Exits 1 when a gate fails.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const index = args.indexOf('--' + name);
  return index >= 0 ? args[index + 1] : fallback;
};

const slug = readFlag('slug');
const url = readFlag('url');
const minFps = Number(readFlag('min-fps', '50'));
const settleMs = Number(readFlag('settle', '3500'));
const sizesArg = readFlag('sizes', 'desktop:1440x900,phone:390x844');
const fullPage = args.includes('--full');

if (!slug || !url) {
  console.error('Usage: node pipeline/verify.mjs --slug <slug> --url <url> [--sizes desktop:1440x900,phone:390x844] [--min-fps 50]');
  process.exit(2);
}

const sizes = sizesArg.split(',').map((entry) => {
  const [name, size] = entry.split(':');
  const [width, height] = size.split('x').map(Number);
  return { name, width, height };
});

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9333;
const profile = '/tmp/portfolio-verify-profile';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--hide-scrollbars',
  '--mute-audio',
  '--enable-unsafe-webgpu',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + profile,
  '--no-first-run',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (response.ok) return response.json();
    } catch {}
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
      return;
    }
    const handler = listeners.get(message.method);
    if (handler) handler(message.params);
  };

  const ready = new Promise((resolveOpen, rejectOpen) => {
    socket.onopen = resolveOpen;
    socket.onerror = rejectOpen;
  });

  return {
    ready,
    send(method, params = {}) {
      return new Promise((resolveSend, rejectSend) => {
        const id = ++nextId;
        pending.set(id, { resolve: resolveSend, reject: rejectSend });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, handler) {
      listeners.set(method, handler);
    },
    close() {
      socket.close();
    },
  };
}

const report = {
  slug,
  url,
  checkedAt: new Date().toISOString(),
  minFps,
  sizes: [],
  pass: false,
};

try {
  const version = await waitForEndpoint();
  report.browser = version.Browser;

  const created = await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' });
  const target = await created.json();
  const client = connect(target.webSocketDebuggerUrl);
  await client.ready;

  const consoleErrors = [];
  const networkErrors = [];

  client.on('Runtime.consoleAPICalled', (params) => {
    if (params.type !== 'error') return;
    consoleErrors.push(params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
  });
  client.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'exception');
  });
  client.on('Log.entryAdded', (params) => {
    if (params.entry.level === 'error') {
      if ((params.entry.url || '').endsWith('/favicon.ico')) return;
      const source = params.entry.url ? ' ' + params.entry.url : '';
      consoleErrors.push(params.entry.text + source);
    }
  });
  client.on('Network.loadingFailed', (params) => {
    if (!params.canceled) networkErrors.push(params.errorText);
  });

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Network.enable');

  for (const size of sizes) {
    consoleErrors.length = 0;
    networkErrors.length = 0;

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1,
      mobile: size.name === 'phone',
    });

    await client.send('Page.navigate', { url });
    await sleep(settleMs);

    const measured = await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const fps = await new Promise((done) => {
          let frames = 0;
          const start = performance.now();
          const tick = (now) => {
            frames += 1;
            if (now - start < 1500) requestAnimationFrame(tick);
            else done(frames / ((now - start) / 1000));
          };
          requestAnimationFrame(tick);
        });
        const canvas = document.querySelector('canvas');
        return {
          fps: Math.round(fps * 10) / 10,
          canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
          bodyError: document.body.dataset.error === 'true',
          study: window.__study ? { ...window.__study } : null,
          title: document.title,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    let clip;
    if (fullPage) {
      await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
      await sleep(1500);
      await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
      const metrics = await client.send('Page.getLayoutMetrics');
      const height = Math.ceil(metrics.cssContentSize.height);
      clip = { x: 0, y: 0, width: size.width, height, scale: 1 };
    }
    const shot = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: fullPage,
      ...(clip ? { clip } : {}),
    });
    const shotPath = 'pipeline/reports/' + slug + '/' + size.name + '.png';
    mkdirSync(resolve(root, 'pipeline/reports/' + slug), { recursive: true });
    writeFileSync(resolve(root, shotPath), Buffer.from(shot.data, 'base64'));

    const value = measured.result.value;
    const entry = {
      ...size,
      fps: value.fps,
      canvas: value.canvas,
      study: value.study,
      title: value.title,
      bodyError: value.bodyError,
      errors: [...new Set(consoleErrors)],
      networkErrors: [...new Set(networkErrors)],
      screenshot: shotPath,
    };
    entry.pass = !entry.bodyError && entry.errors.length === 0 && entry.fps >= minFps;
    report.sizes.push(entry);
  }

  client.close();
  report.pass = report.sizes.every((size) => size.pass);
} catch (error) {
  report.error = error.message;
} finally {
  chrome.kill('SIGTERM');
}

mkdirSync(resolve(root, 'pipeline/reports'), { recursive: true });
const reportPath = resolve(root, 'pipeline/reports/' + slug + '.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

for (const size of report.sizes) {
  console.log(size.name + ' ' + size.width + 'x' + size.height + '  fps ' + size.fps + '  errors ' + size.errors.length + '  ' + (size.pass ? 'pass' : 'FAIL'));
}
if (report.error) console.error(report.error);
console.log(report.pass ? 'PASS' : 'FAIL');
process.exit(report.pass ? 0 : 1);
