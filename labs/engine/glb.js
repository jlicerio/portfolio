// Minimal GLB reader: first mesh primitive with positions, normals, and indices.

function readAccessor(json, binary, index) {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor.bufferView];
  const componentSize = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }[accessor.componentType];
  const componentCount = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[accessor.type];
  const stride = view.byteStride ?? componentSize * componentCount;
  const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const out = new Float32Array(accessor.count * componentCount);
  const dataView = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  for (let i = 0; i < accessor.count; i += 1) {
    for (let c = 0; c < componentCount; c += 1) {
      const at = base + i * stride + c * componentSize;
      let value;
      if (accessor.componentType === 5126) value = dataView.getFloat32(at, true);
      else if (accessor.componentType === 5123) value = dataView.getUint16(at, true);
      else if (accessor.componentType === 5125) value = dataView.getUint32(at, true);
      else if (accessor.componentType === 5121) value = dataView.getUint8(at);
      else value = dataView.getInt16(at, true);
      out[i * componentCount + c] = value;
    }
  }
  return out;
}

export async function loadGlb(url) {
  const buffer = await fetch(url).then((response) => response.arrayBuffer());
  const view = new DataView(buffer);
  let json = null;
  let binary = null;

  if (view.getUint32(0, true) === 0x46546c67) {
    const length = view.getUint32(8, true);
    let offset = 12;
    while (offset < length) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const start = offset + 8;
      if (chunkType === 0x4e4f534a) {
        json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, chunkLength)));
      } else if (chunkType === 0x004e4942) {
        binary = new Uint8Array(buffer, start, chunkLength);
      }
      offset = start + chunkLength + ((4 - (chunkLength % 4)) % 4);
    }
  } else {
    // Plain .gltf with an embedded base64 buffer.
    json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer)));
    const uri = json.buffers?.[0]?.uri ?? '';
    const encoded = uri.slice(uri.indexOf(',') + 1);
    const raw = atob(encoded);
    binary = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) binary[i] = raw.charCodeAt(i);
  }
  if (!json || !binary) throw new Error('Mesh data is missing');

  const mesh = json.meshes[0];
  let positions = null;
  let normals = null;
  let indices = null;
  let vertexCount = 0;

  for (const primitive of mesh.primitives) {
    const positionAccessor = primitive.attributes.POSITION;
    if (positionAccessor === undefined) continue;
    const primitivePositions = readAccessor(json, binary, positionAccessor);
    const primitiveNormals = primitive.attributes.NORMAL !== undefined
      ? readAccessor(json, binary, primitive.attributes.NORMAL)
      : new Float32Array(primitivePositions.length);
    const primitiveIndices = primitive.indices !== undefined
      ? readAccessor(json, binary, primitive.indices)
      : Uint32Array.from({ length: primitivePositions.length / 3 }, (_, i) => i);
    const count = primitivePositions.length / 3;
    const mergedPositions = new Float32Array(positions ? positions.length + primitivePositions.length : primitivePositions.length);
    if (positions) mergedPositions.set(positions, 0);
    mergedPositions.set(primitivePositions, positions ? positions.length : 0);
    const mergedNormals = new Float32Array(normals ? normals.length + primitiveNormals.length : primitiveNormals.length);
    if (normals) mergedNormals.set(normals, 0);
    mergedNormals.set(primitiveNormals, normals ? normals.length : 0);
    const mergedIndices = new Uint32Array(indices ? indices.length + primitiveIndices.length : primitiveIndices.length);
    if (indices) mergedIndices.set(indices, 0);
    for (let i = 0; i < primitiveIndices.length; i += 1) {
      mergedIndices[(indices ? indices.length : 0) + i] = primitiveIndices[i] + vertexCount;
    }
    positions = mergedPositions;
    normals = mergedNormals;
    indices = mergedIndices;
    vertexCount += count;
  }
  if (!positions) throw new Error('GLB has no positions');
  return { positions, normals, indices, vertexCount };
}
