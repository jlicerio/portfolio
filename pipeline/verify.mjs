#!/usr/bin/env node
// Verify one study page at fixed viewport sizes.
// Requires a live canvas, advancing frames, no study error, and clean console.
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
const pageMode = args.includes('--page');

if (!slug || !url) {
  console.error('Usage: node pipeline/verify.mjs --slug <slug> --url <url> [--sizes desktop:1440x900,phone:390x844] [--min-fps 50] [--full]');
  process.exit(2);
}

const sizes = sizesArg.split(',').map((entry) => {
  const [name, size] = entry.split(':');
  const [width, height] = size.split('x').map(Number);
  return { name, width, height };
});

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9400 + Math.floor(Math.random() * 300);
const profile = '/tmp/portfolio-verify-' + process.pid;

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

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
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
      clearTimeout(item.timer);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
      return;
    }
    const handler = listeners.get(message.method);
    if (handler) handler(message.params);
  };

  socket.onclose = () => {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error('DevTools connection closed'));
    }
    pending.clear();
  };

  const ready = new Promise((resolveOpen, rejectOpen) => {
    socket.onopen = resolveOpen;
    socket.onerror = rejectOpen;
  });

  return {
    ready,
    send(method, params = {}, timeout = 15000) {
      return new Promise((resolveSend, rejectSend) => {
        const id = ++nextId;
        const timer = setTimeout(() => {
          pending.delete(id);
          rejectSend(new Error('DevTools timeout: ' + method));
        }, timeout);
        pending.set(id, { resolve: resolveSend, reject: rejectSend, timer });
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

const readStudy = `(() => {
  const frame = document.querySelector('iframe');
  const inner = frame && frame.contentWindow;
  return (window.__study || (inner && inner.__study) || null);
})()`;

const readyExpression = '(() => { const s = ' + readStudy + '; return s ? Boolean(s.ready) : null; })()';

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
  const badResponses = [];
  let navError = null;

  client.on('Runtime.consoleAPICalled', (params) => {
    if (params.type !== 'error') return;
    consoleErrors.push(params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
  });
  client.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'exception');
  });
  client.on('Log.entryAdded', (params) => {
    if (params.entry.level !== 'error') return;
    if ((params.entry.url || '').endsWith('/favicon.ico')) return;
    consoleErrors.push(params.entry.text + (params.entry.url ? ' ' + params.entry.url : ''));
  });
  client.on('Network.loadingFailed', (params) => {
    if (params.canceled) return;
    networkErrors.push(params.errorText);
  });
  client.on('Network.responseReceived', (params) => {
    const response = params.response;
    if (response.status < 400) return;
    if (response.url.endsWith('/favicon.ico')) return;
    badResponses.push(response.status + ' ' + response.url);
  });

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Network.enable');

  for (const size of sizes) {
    consoleErrors.length = 0;
    networkErrors.length = 0;
    badResponses.length = 0;
    navError = null;

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1,
      mobile: size.name === 'phone',
    });

    const navigation = await client.send('Page.navigate', { url });
    if (navigation.errorText) navError = navigation.errorText;
    await sleep(settleMs);

    let ready = null;
    let readyTimedOut = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const state = await client.send('Runtime.evaluate', {
        expression: readyExpression,
        returnByValue: true,
      });
      ready = state.result.value;
      if (ready === null || ready === true) break;
      await sleep(500);
      if (attempt === 59) readyTimedOut = true;
    }

    const measured = await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const frame = document.querySelector('canvas')
          || document.querySelector('iframe')?.contentDocument?.querySelector('canvas');
        const study = window.__study
          || document.querySelector('iframe')?.contentWindow?.__study
          || null;
        const start = performance.now();
        const first = study ? study.frames : null;
        let raf = 0;
        await new Promise((done) => {
          const timer = setTimeout(done, 5000);
          const tick = () => {
            raf += 1;
            if (performance.now() - start < 1500) requestAnimationFrame(tick);
            else {
              clearTimeout(timer);
              done();
            }
          };
          requestAnimationFrame(tick);
        });
        const elapsed = (performance.now() - start) / 1000;
        const last = study ? study.frames : null;
        const frames = first !== null && last !== null ? last - first : raf;
        return {
          fps: Math.round((frames / elapsed) * 10) / 10,
          frames,
          elapsed: Math.round(elapsed * 100) / 100,
          canvas: frame ? { width: frame.width, height: frame.height } : null,
          study: study ? { ...study } : null,
          bodyError: document.body.dataset.error === 'true',
          title: document.title,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
      timeout: 20000,
    });

    let clip;
    const probeA = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await sleep(600);
    const probeB = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const pixelsChanged = probeA.data !== probeB.data;

    if (fullPage) {
      await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
      await sleep(1500);
      await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
      const metrics = await client.send('Page.getLayoutMetrics');
      clip = { x: 0, y: 0, width: size.width, height: Math.ceil(metrics.cssContentSize.height), scale: 1 };
    }
    const shot = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: fullPage,
      ...(clip ? { clip } : {}),
    }, 30000);

    const shotPath = 'pipeline/reports/' + slug + '/' + size.name + '.png';
    mkdirSync(resolve(root, 'pipeline/reports/' + slug), { recursive: true });
    writeFileSync(resolve(root, shotPath), Buffer.from(shot.data, 'base64'));

    const value = measured.result.value;
    const errors = [...new Set(consoleErrors)];
    const studyError = value.study?.error || null;
    const entry = {
      ...size,
      fps: value.fps,
      frames: value.frames,
      canvas: value.canvas,
      study: value.study,
      title: value.title,
      bodyError: value.bodyError,
      studyError,
      ready,
      readyTimedOut,
      navError,
      pixelsChanged,
      errors,
      networkErrors: [...new Set(networkErrors)],
      badResponses: [...new Set(badResponses)],
      screenshot: shotPath,
    };
    const mediaGate = pageMode
      ? true
      : Boolean(entry.canvas)
        && (entry.study ? entry.frames >= 5 : entry.pixelsChanged)
        && entry.fps >= minFps;
    entry.pass = !entry.bodyError
      && !entry.studyError
      && !entry.navError
      && !entry.readyTimedOut
      && entry.errors.length === 0
      && entry.networkErrors.length === 0
      && entry.badResponses.length === 0
      && mediaGate;
    report.sizes.push(entry);
  }

  client.close();
  report.pass = report.sizes.length > 0 && report.sizes.every((size) => size.pass);
} catch (error) {
  report.error = error.message;
} finally {
  chrome.kill('SIGTERM');
}

mkdirSync(resolve(root, 'pipeline/reports'), { recursive: true });
writeFileSync(resolve(root, 'pipeline/reports/' + slug + '.json'), JSON.stringify(report, null, 2) + '\n');

for (const size of report.sizes) {
  const issues = size.errors.length + size.networkErrors.length + size.badResponses.length;
  console.log(size.name + ' ' + size.width + 'x' + size.height + '  fps ' + size.fps + '  frames ' + size.frames + '  issues ' + issues + '  ' + (size.pass ? 'pass' : 'FAIL'));
}
if (report.error) console.error(report.error);
console.log(report.pass ? 'PASS' : 'FAIL');
process.exit(report.pass ? 0 : 1);
