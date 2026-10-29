import {
  BASE_SEGMENTS, MOUND_SEGMENTS,
  buildBladeStrip, buildMoundInstances, buildBaseInstances,
  buildTerrainMesh, buildFields, buildMipChain,
  perspective, lookAt, multiply,
} from './scene.js';
import { loadGlb } from './glb.js';

const SAMPLE_COUNT = 4;

function uploadTexture(device, image, levels) {
  const { width, height } = image;
  const texture = device.createTexture({
    size: [width, height, 1],
    format: 'rgba8unorm',
    mipLevelCount: levels.length,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  levels.forEach((level, mip) => {
    device.queue.writeTexture(
      { texture, mipLevel: mip },
      level.data,
      { bytesPerRow: level.width * 4, rowsPerImage: level.height },
      [level.width, level.height, 1],
    );
  });
  return texture;
}

function vertexBuffer(device, data) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

export async function createGrassEngine(device, format, options = {}) {
  const bladeScale = options.bladeScale ?? 1;
  const secondStudy = options.secondStudy ?? false;
  const code = await fetch(new URL('./grass.wgsl', import.meta.url)).then((r) => r.text());
  const sceneFormat = options.post ? 'rgba16float' : format;
  const module = device.createShaderModule({ code });
  const terrainCode = await fetch(new URL('./terrain.wgsl', import.meta.url)).then((r) => r.text());
  const terrainModule = device.createShaderModule({ code: terrainCode });

  const counts = {
    mound: Math.round(136000 * bladeScale),
    base: Math.round(188000 * bladeScale),
  };
  const moundInstances = buildMoundInstances(counts.mound, secondStudy);
  const baseInstances = buildBaseInstances(counts.base, secondStudy);
  const bladeCount = moundInstances.count + baseInstances.count;

  const layers = [
    {
      strip: vertexBuffer(device, buildBladeStrip(MOUND_SEGMENTS)),
      inst: vertexBuffer(device, moundInstances.data),
      vertices: (MOUND_SEGMENTS + 1) * 2,
      count: moundInstances.count,
    },
    {
      strip: vertexBuffer(device, buildBladeStrip(BASE_SEGMENTS)),
      inst: vertexBuffer(device, baseInstances.data),
      vertices: (BASE_SEGMENTS + 1) * 2,
      count: baseInstances.count,
    },
  ];

  const terrainMesh = buildTerrainMesh();
  const fields = buildFields(384, 688);
  const detail = buildFields(256, 456);

  const heightTexture = uploadTexture(device, fields.height, buildMipChain(fields.height).slice(0, 1));
  const visualTexture = uploadTexture(device, fields.visual, buildMipChain(fields.visual));
  const referenceTexture = uploadTexture(device, detail.reference, buildMipChain(detail.reference));
  const generatedTexture = uploadTexture(device, detail.generated, buildMipChain(detail.generated));

  const terrainSampler = device.createSampler({
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    magFilter: 'nearest',
    minFilter: 'nearest',
    mipmapFilter: 'nearest',
  });
  const fieldSampler = device.createSampler({
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
  });

  const terrainVertexBuffer = vertexBuffer(device, terrainMesh.uvs);
  const terrainIndexBuffer = device.createBuffer({
    size: terrainMesh.indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(terrainIndexBuffer, 0, terrainMesh.indices);

  const uniformBuffer = device.createBuffer({
    size: 176,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const terrainUniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const grassPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        { arrayStride: 8, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }] },
        {
          arrayStride: 44,
          stepMode: 'instance',
          attributes: [
            { shaderLocation: 1, offset: 0, format: 'float32x3' },
            { shaderLocation: 2, offset: 12, format: 'float32x4' },
            { shaderLocation: 3, offset: 28, format: 'float32x4' },
          ],
        },
      ],
    },
    fragment: { module, entryPoint: 'fs', targets: [{ format: sceneFormat }] },
    primitive: { topology: 'triangle-strip', cullMode: 'none', frontFace: 'ccw' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less-equal' },
    multisample: { count: SAMPLE_COUNT },
  });

  const terrainPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: terrainModule,
      entryPoint: 'vs',
      buffers: [{ arrayStride: 8, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }] }],
    },
    fragment: { module: terrainModule, entryPoint: 'fs', targets: [{ format: sceneFormat }] },
    primitive: { topology: 'triangle-list', cullMode: 'none' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' },
    multisample: { count: SAMPLE_COUNT },
  });

  const grassBindGroup = device.createBindGroup({
    layout: grassPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: heightTexture.createView() },
      { binding: 2, resource: terrainSampler },
      { binding: 3, resource: referenceTexture.createView() },
      { binding: 4, resource: generatedTexture.createView() },
      { binding: 5, resource: fieldSampler },
    ],
  });
  const terrainBindGroup = device.createBindGroup({
    layout: terrainPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: terrainUniformBuffer } },
      { binding: 1, resource: heightTexture.createView() },
      { binding: 2, resource: terrainSampler },
      { binding: 3, resource: visualTexture.createView() },
      { binding: 4, resource: fieldSampler },
    ],
  });

  const cameraEye = options.camera?.eye ?? [0, 10.2, 8.0];
  const cameraTarget = options.camera?.target ?? [0, 0.30, -2.35];
  const viewMatrix = lookAt(cameraEye, cameraTarget);
  const uniformData = new Float32Array(44);

  // Optional post stack: bloom plus a film composite.
  let post = null;
  if (options.post) {
    const postCode = await fetch(new URL('./post.wgsl', import.meta.url)).then((r) => r.text());
    const postModule = device.createShaderModule({ code: postCode });
    const bloomPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: postModule, entryPoint: 'vs' },
      fragment: { module: postModule, entryPoint: 'bloom', targets: [{ format: 'rgba16float' }] },
      primitive: { topology: 'triangle-list' },
    });
    const compositePipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: postModule, entryPoint: 'vs' },
      fragment: { module: postModule, entryPoint: 'composite', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
    });
    post = {
      bloomPipeline,
      compositePipeline,
      bloomLayout: bloomPipeline.getBindGroupLayout(0),
      compositeLayout: compositePipeline.getBindGroupLayout(0),
      uniform: device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      data: new Float32Array(8),
      sampler: device.createSampler({
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
        magFilter: 'linear',
        minFilter: 'linear',
      }),
      sceneMsaaView: null,
      sceneResolvedView: null,
      bloomView: null,
      bindGroup: null,
      settings: {
        glow: options.post.glow ?? 0.85,
        grain: options.post.grain ?? 0.028,
        vignette: options.post.vignette ?? 0.55,
      },
    };
  }

  // Optional sky: a full screen gradient with distant hills.
  let sky = null;
  if (options.sky) {
    const skyCode = await fetch(new URL('./sky.wgsl', import.meta.url)).then((r) => r.text());
    const skyModule = device.createShaderModule({ code: skyCode });
    const skyPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: skyModule, entryPoint: 'vs' },
      fragment: { module: skyModule, entryPoint: 'fs', targets: [{ format: sceneFormat }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' },
      multisample: { count: SAMPLE_COUNT },
    });
    const skyUniform = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(skyUniform, 0, new Float32Array([
      options.sky.horizon ?? 0.46, 0, 0, 0,
    ]));
    sky = {
      pipeline: skyPipeline,
      bindGroup: device.createBindGroup({
        layout: skyPipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: skyUniform } }],
      }),
    };
  }
  const drawTerrain = options.terrain !== false;

  // Optional prop: a GLB mesh dropped into the field.
  let chair = null;
  if (options.chair) {
    const mesh = await loadGlb(options.chair.url);
    const interleaved = new Float32Array(mesh.vertexCount * 6);
    for (let i = 0; i < mesh.vertexCount; i += 1) {
      interleaved[i * 6] = mesh.positions[i * 3];
      interleaved[i * 6 + 1] = mesh.positions[i * 3 + 1];
      interleaved[i * 6 + 2] = mesh.positions[i * 3 + 2];
      interleaved[i * 6 + 3] = mesh.normals[i * 3];
      interleaved[i * 6 + 4] = mesh.normals[i * 3 + 1];
      interleaved[i * 6 + 5] = mesh.normals[i * 3 + 2];
    }
    const vertexBufferData = device.createBuffer({
      size: interleaved.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBufferData, 0, interleaved);
    const indexBuffer = device.createBuffer({
      size: mesh.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(indexBuffer, 0, mesh.indices);

    const chairCode = await fetch(new URL('./chair.wgsl', import.meta.url)).then((r) => r.text());
    const chairModule = device.createShaderModule({ code: chairCode });
    const chairPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: chairModule,
        entryPoint: 'vs',
        buffers: [{
          arrayStride: 24,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
          ],
        }],
      },
      fragment: { module: chairModule, entryPoint: 'fs', targets: [{ format: sceneFormat }] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less-equal' },
      multisample: { count: SAMPLE_COUNT },
    });
    const chairUniform = device.createBuffer({
      size: 160,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const chairBindGroup = device.createBindGroup({
      layout: chairPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: chairUniform } }],
    });
    chair = {
      pipeline: chairPipeline,
      bindGroup: chairBindGroup,
      uniform: chairUniform,
      vertexBuffer: vertexBufferData,
      indexBuffer,
      indexCount: mesh.indices.length,
      data: new Float32Array(40),
      position: options.chair.position ?? [0, 0, -1.6],
      rotationY: options.chair.rotationY ?? 0,
      scale: options.chair.scale ?? 1,
      tint: options.chair.tint ?? [0.32, 0.30, 0.29],
    };
  }

  let msaaView = null;
  let depthView = null;
  let targetWidth = 0;
  let targetHeight = 0;

  function resize(width, height) {
    if (width === targetWidth && height === targetHeight) return;
    targetWidth = width;
    targetHeight = height;
    msaaView = device.createTexture({
      size: [width, height, 1],
      sampleCount: SAMPLE_COUNT,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    }).createView();
    depthView = device.createTexture({
      size: [width, height, 1],
      sampleCount: SAMPLE_COUNT,
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    }).createView();
    if (post) {
      post.sceneMsaaView = device.createTexture({
        size: [width, height, 1],
        sampleCount: SAMPLE_COUNT,
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      }).createView();
      const resolved = device.createTexture({
        size: [width, height, 1],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      post.sceneResolvedView = resolved.createView();
      const bloomTexture = device.createTexture({
        size: [Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2)), 1],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      post.bloomView = bloomTexture.createView();
      post.bloomBindGroup = device.createBindGroup({
        layout: post.bloomLayout,
        entries: [
          { binding: 0, resource: { buffer: post.uniform } },
          { binding: 1, resource: post.sceneResolvedView },
          { binding: 3, resource: post.sampler },
        ],
      });
      post.compositeBindGroup = device.createBindGroup({
        layout: post.compositeLayout,
        entries: [
          { binding: 0, resource: { buffer: post.uniform } },
          { binding: 1, resource: post.sceneResolvedView },
          { binding: 2, resource: post.bloomView },
          { binding: 3, resource: post.sampler },
        ],
      });
    }
  }

  const terrainDepth = 2.0;

  function draw(encoder, state) {
    const { width, height, time, wind, pointer, resolveView } = state;
    resize(width, height);

    const projection = perspective(width / height);
    const viewProjection = multiply(projection, viewMatrix);
    uniformData.set(viewProjection, 0);
    uniformData[16] = cameraEye[0];
    uniformData[17] = cameraEye[1];
    uniformData[18] = cameraEye[2];
    uniformData[19] = time;
    uniformData[20] = wind;
    uniformData[21] = options.bladeLength ?? 1.0;
    uniformData[22] = terrainDepth;
    uniformData[23] = secondStudy ? 1 : 0;
    uniformData[24] = width;
    uniformData[25] = height;
    uniformData[26] = state.weave ?? 0;
    uniformData[27] = 0;
    uniformData[28] = pointer?.x ?? 0;
    uniformData[29] = pointer?.z ?? 0;
    uniformData[30] = pointer?.radius ?? 0;
    uniformData[31] = pointer?.strength ?? 0;
    const fog = state.fog ?? { color: [0.784, 0.878, 0.969], density: 0 };
    uniformData[32] = fog.color[0];
    uniformData[33] = fog.color[1];
    uniformData[34] = fog.color[2];
    uniformData[35] = fog.density;
    const collider = chair
      ? {
        x: chair.position[0],
        z: chair.position[2],
        radius: chair.alignCell ? 0.43 : chair.scale * 0.78,
        strength: 1.0,
      }
      : { x: 0, z: 0, radius: 0, strength: 0 };
    uniformData[36] = collider.x;
    uniformData[37] = collider.z;
    uniformData[38] = collider.radius;
    uniformData[39] = collider.strength;
    const path = state.path ?? { start: [0, 0], end: [0, 0] };
    uniformData[40] = path.start[0];
    uniformData[41] = path.start[1];
    uniformData[42] = path.end[0];
    uniformData[43] = path.end[1];
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);
    device.queue.writeBuffer(terrainUniformBuffer, 0, new Float32Array([terrainDepth, 0, 0, 0]));

    if (post) {
      post.data[0] = post.settings.glow;
      post.data[1] = post.settings.grain;
      post.data[2] = post.settings.vignette;
      post.data[3] = state.time;
      post.data[4] = width;
      post.data[5] = height;
      device.queue.writeBuffer(post.uniform, 0, post.data);
    }

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: post ? post.sceneMsaaView : msaaView,
        resolveTarget: post ? post.sceneResolvedView : resolveView,
        clearValue: { r: 0.0, g: 0.117647, b: 0.031373, a: 1 },
        loadOp: 'clear',
        storeOp: 'discard',
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
      },
    });
    if (sky) {
      pass.setPipeline(sky.pipeline);
      pass.setBindGroup(0, sky.bindGroup);
      pass.draw(3);
    }

    if (drawTerrain) {
      pass.setPipeline(terrainPipeline);
      pass.setBindGroup(0, terrainBindGroup);
      pass.setVertexBuffer(0, terrainVertexBuffer);
      pass.setIndexBuffer(terrainIndexBuffer, 'uint32');
      pass.drawIndexed(terrainMesh.indices.length);
    }

    if (chair) {
      const yaw = chair.rotationY;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const scale = chair.scale;
      const model = chair.data.subarray(16, 32);
      model[0] = cosYaw * scale; model[1] = 0; model[2] = -sinYaw * scale; model[3] = 0;
      model[4] = -sinYaw * scale; model[5] = 0; model[6] = -cosYaw * scale; model[7] = 0;
      model[8] = 0; model[9] = scale; model[10] = 0; model[11] = 0;
      model[12] = chair.position[0];
      model[13] = chair.position[1];
      model[14] = chair.position[2];
      model[15] = 1;
      chair.data.set(viewProjection, 0);
      chair.data[32] = chair.tint[0];
      chair.data[33] = chair.tint[1];
      chair.data[34] = chair.tint[2];
      chair.data[35] = 1;
      chair.data[36] = fog.color[0];
      chair.data[37] = fog.color[1];
      chair.data[38] = fog.color[2];
      chair.data[39] = fog.density * 0.05;
      device.queue.writeBuffer(chair.uniform, 0, chair.data);
      pass.setPipeline(chair.pipeline);
      pass.setBindGroup(0, chair.bindGroup);
      pass.setVertexBuffer(0, chair.vertexBuffer);
      pass.setIndexBuffer(chair.indexBuffer, 'uint32');
      pass.drawIndexed(chair.indexCount);
    }

    pass.setPipeline(grassPipeline);
    pass.setBindGroup(0, grassBindGroup);
    for (const layer of layers) {
      pass.setVertexBuffer(0, layer.strip);
      pass.setVertexBuffer(1, layer.inst);
      pass.draw(layer.vertices, layer.count);
    }
    pass.end();

    if (post) {
      const bloomPass = encoder.beginRenderPass({
        colorAttachments: [{
          view: post.bloomView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      bloomPass.setPipeline(post.bloomPipeline);
      bloomPass.setBindGroup(0, post.bloomBindGroup);
      bloomPass.draw(3);
      bloomPass.end();

      const compositePass = encoder.beginRenderPass({
        colorAttachments: [{
          view: resolveView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      compositePass.setPipeline(post.compositePipeline);
      compositePass.setBindGroup(0, post.compositeBindGroup);
      compositePass.draw(3);
      compositePass.end();
    }
    return bladeCount;
  }

  return { draw, resize, bladeCount, cameraEye };
}
