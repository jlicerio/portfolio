const canvas = document.querySelector('#view');
const label = new URL(import.meta.url).searchParams.get('shader') || 'contour';

const stats = { ready: false, error: null, frames: 0, fps: 0, shader: label };
window.__panel = stats;

async function main() {
  if (!navigator.gpu) {
    stats.error = 'no-webgpu';
    return;
  }
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) {
    stats.error = 'no-adapter';
    return;
  }
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const code = await fetch('./src/' + label + '.wgsl').then((response) => response.text());
  const module = device.createShaderModule({ code });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });

  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const uniformData = new Float32Array(4);
  let previous = performance.now();
  let clock = 0;
  let windowStart = previous;
  let windowFrames = 0;

  function frame(now) {
    const delta = Math.min(Math.max((now - previous) / 1000, 0), 0.05);
    previous = now;
    clock += delta;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    uniformData[0] = clock;
    uniformData[1] = 0;
    uniformData[2] = width;
    uniformData[3] = height;
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.027, g: 0.031, b: 0.039, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);

    stats.frames += 1;
    windowFrames += 1;
    const elapsed = now - windowStart;
    if (elapsed > 500) {
      stats.fps = Math.round((windowFrames * 1000) / elapsed);
      windowFrames = 0;
      windowStart = now;
    }
    requestAnimationFrame(frame);
  }

  stats.ready = true;
  requestAnimationFrame(frame);
}

main().catch((error) => { stats.error = String(error?.message || error); });
