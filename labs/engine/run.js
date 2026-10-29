import { createGrassEngine } from './grass-engine.js';

// Shared runner. Every grass based study passes a config object.
export async function runStudy(canvas, config = {}) {
  const stats = { ready: false, error: null, frames: 0, fps: 0, blades: 0 };
  window.__study = stats;

  const status = document.querySelector(config.statusSelector ?? '#live-status');
  const setStatus = (text) => {
    if (status) status.textContent = text;
  };
  const setError = (text) => {
    stats.error = text;
    if (status) {
      status.textContent = text;
      status.dataset.error = 'true';
    }
  };

  if (!navigator.gpu) {
    setError('This browser has no WebGPU. Use Chrome 113+ or Safari 26+.');
    return stats;
  }
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) {
    setError('No WebGPU adapter. Check hardware acceleration.');
    return stats;
  }
  const device = await adapter.requestDevice();
  device.lost.then((info) => setError('Device lost: ' + info.message));

  const context = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const engine = await createGrassEngine(device, format, config);
  stats.blades = engine.bladeCount;

  const pointer = { ndc: [0, 0], ground: null, strength: 0, target: 0, lastX: 0, lastY: 0, lastMove: 0 };
  if (config.pointer) {
    const eye = config.camera?.eye ?? [0, 10.2, 8.0];
    const target = config.camera?.target ?? [0, 0.30, -2.35];
    const plane = config.pointerPlane ?? 0.5;
    const backward = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const right = normalize(cross([0, 1, 0], backward));
    const up = cross(backward, right);
    const forward = [-backward[0], -backward[1], -backward[2]];
    const tanHalf = Math.tan(Math.PI * 0.116);

    const toGround = (ndcX, ndcY, aspect) => {
      const sx = ndcX * tanHalf * aspect;
      const sy = ndcY * tanHalf;
      const direction = normalize([
        right[0] * sx + up[0] * sy + forward[0],
        right[1] * sx + up[1] * sy + forward[1],
        right[2] * sx + up[2] * sy + forward[2],
      ]);
      if (Math.abs(direction[1]) < 1e-5) return null;
      const distance = (plane - eye[1]) / direction[1];
      if (distance < 0) return null;
      return { x: eye[0] + direction[0] * distance, z: eye[2] + direction[2] * distance };
    };

    window.addEventListener('pointermove', (event) => {
      pointer.ndc = [
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      ];
      const now = performance.now();
      const elapsed = Math.max(8, now - pointer.lastMove);
      const speed = Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY) / elapsed;
      pointer.target = Math.min(1.6, pointer.target * 0.45 + speed * 0.85 + 0.18);
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastMove = now;
    }, { passive: true });

    pointer.toGround = toGround;
  }

  let clock = 0;
  let previous = performance.now();
  let window_ = { frames: 0, start: previous };

  const frame = (now) => {
    const delta = Math.min(Math.max((now - previous) / 1000, 0), 0.05);
    previous = now;
    clock += delta;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 1728 / Math.max(rect.width, 1));
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    let pointerGround = null;
    if (pointer.toGround) {
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, delta * 9);
      pointer.target *= Math.pow(0.12, delta);
      const idle = now - pointer.lastMove > 900;
      if (idle) pointer.strength *= Math.pow(0.2, delta);
      pointer.ground = pointer.toGround(pointer.ndc[0], pointer.ndc[1], width / height);
      if (pointer.ground) {
        pointerGround = {
          x: pointer.ground.x,
          z: pointer.ground.z,
          radius: config.pointerRadius ?? 2.4,
          strength: pointer.strength,
        };
      }
    }

    const encoder = device.createCommandEncoder();
    engine.draw(encoder, {
      width,
      height,
      time: clock,
      wind: config.wind ?? 1.35,
      weave: config.weave ? 1 : 0,
      fog: config.fog ?? null,
      path: config.path ?? null,
      pointer: pointerGround,
      resolveView: context.getCurrentTexture().createView(),
    });
    device.queue.submit([encoder.finish()]);

    stats.frames += 1;
    window_.frames += 1;
    const elapsed = now - window_.start;
    if (elapsed > 600) {
      stats.fps = Math.round((window_.frames * 1000) / elapsed);
      window_ = { frames: 0, start: now };
      setStatus(stats.fps + ' fps · ' + Math.round(stats.blades / 1000) + 'k blades · live');
    }
    requestAnimationFrame(frame);
  };

  stats.ready = true;
  setStatus('Live · ' + Math.round(stats.blades / 1000) + 'k blades');
  requestAnimationFrame(frame);
  return stats;
}

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
