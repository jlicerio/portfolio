// Scene data and geometry for the WebGPU grass study.
// Clump layout and blade distributions follow MarvinSchwaibold/grass-shader.

export const WIND_MIN = 0.35;
export const WIND_MAX = 3.6;
export const DEFAULT_WIND = WIND_MIN + 0.5 * (WIND_MAX - WIND_MIN);

export const BASE_SEGMENTS = 5;
export const MOUND_SEGMENTS = 7;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function seeded(index, salt) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

// [centerX, centerZ, radiusX, radiusZ, rotation, flow, collapse,
//  density, tone, lengthScale, species]
const FEATURED_CLUMPS = [
  [-5.55,-18.42,.92,.66,-.18,.45,.64,.86,.32,.86],[-3.46,-18.82,1.04,.72,.31,.72,.71,.94,.61,.92],[-1.17,-18.26,.88,.82,-.40,.55,.76,.79,.44,1.00],[.77,-18.73,1.12,.68,.24,.88,.69,.90,.74,.88],[3.02,-18.18,.91,.76,-.28,.38,.79,.82,.40,.95],[5.29,-18.61,1.04,.70,.42,.70,.65,.88,.58,.90],
  [-4.78,-16.06,1.16,.82,.18,.40,.68,.92,.56,.95],[-2.48,-15.72,.98,.96,-.38,.86,.72,.84,.35,1.02],[-.24,-16.31,1.25,.84,.26,.60,.80,.93,.70,.90],[2.18,-15.62,1.06,.92,-.16,.95,.66,.88,.47,1.00],[4.57,-16.16,1.18,.84,.34,.50,.75,.95,.65,.94],
  [-5.37,-13.62,1.12,.91,-.28,.76,.74,.81,.42,1.04],[-3.23,-14.08,1.27,.86,.36,.32,.67,.95,.68,.91],[-.82,-13.42,1.10,1.02,-.18,.98,.83,.89,.36,.98],[1.42,-13.93,1.31,.88,.30,.62,.70,.96,.59,1.05],[3.74,-13.36,1.08,1.00,-.42,.84,.78,.86,.76,.92],[5.62,-14.02,.98,.86,.22,.48,.64,.79,.48,1.02],
  [-4.73,-11.05,1.38,.99,.31,.88,.70,.94,.62,1.03],[-2.11,-11.52,1.17,1.12,-.36,.42,.84,.82,.34,.94],[.26,-10.87,1.44,.96,.14,1.02,.76,.97,.71,1.08],[2.88,-11.41,1.25,1.13,-.24,.60,.69,.88,.49,.96],[5.12,-10.71,1.33,.94,.39,.78,.81,.91,.66,1.01],
  [-5.36,-8.54,1.42,1.14,-.21,.36,.78,.86,.45,1.06],[-2.73,-8.97,1.51,1.02,.29,.91,.66,.96,.72,.98],[-.08,-8.24,1.31,1.24,-.35,.56,.88,.87,.30,1.00],[2.43,-8.82,1.55,1.07,.20,1.05,.74,.95,.61,1.10],[5.07,-8.18,1.41,1.18,-.32,.69,.82,.89,.51,.94],
  [-4.65,-5.83,1.68,1.22,.27,.82,.42,.93,.69,1.10],[-1.63,-6.31,1.48,1.36,-.41,.40,.86,.84,.38,.96],[1.13,-5.48,1.72,1.19,.18,.98,.52,.98,.58,1.16],[4.24,-6.02,1.59,1.31,-.28,.58,.73,.91,.47,1.00],
  [-5.20,-2.64,1.74,1.43,-.34,.36,.85,.87,.40,1.03],[-2.01,-3.17,2.02,1.42,.24,.86,.46,.97,.71,1.18],[1.19,-2.32,1.66,1.55,-.26,.52,.91,.90,.31,.98],[4.34,-3.03,1.88,1.34,.35,1.00,.78,.95,.60,1.08],
  [-4.53,.66,2.04,1.42,.20,.78,.58,.92,.64,1.10],[-.98,-.15,2.42,1.74,-.38,.39,.34,.98,.62,1.20],[2.75,.74,2.10,1.46,.29,.96,.66,.94,.57,1.14],[5.76,-.04,1.48,1.34,-.24,.55,.70,.78,.48,.95],
  [-5.02,4.16,2.13,1.63,-.29,.32,.90,.88,.43,1.04],[-1.32,3.48,2.55,1.85,.24,.84,.46,.98,.68,1.18],[2.58,4.43,2.24,1.58,-.36,.50,.94,.92,.32,1.00],[6.05,3.71,1.63,1.48,.31,1.02,.77,.80,.56,1.06],
  [-4.02,7.79,2.62,1.82,.26,.72,.94,.90,.54,1.05],[.31,7.18,2.72,1.93,-.33,.34,.88,.99,.39,1.10],[4.62,7.92,2.56,1.74,.20,.91,.96,.93,.65,1.00],

  [-1.95,-12.52,2.12,.30,-.22,.22,.98,.22,.49,.67],[3.45,-9.78,2.42,.34,.18,.91,.99,.26,.62,.71],[-3.18,-7.14,2.28,.36,-.31,.40,.97,.24,.44,.72],[1.86,-4.39,2.62,.38,.27,.78,.99,.28,.68,.66],[-2.44,-.94,2.75,.42,-.24,.28,.98,.30,.52,.70],[2.04,2.37,3.02,.45,.20,.88,.99,.33,.72,.64],[-1.06,6.02,3.32,.52,-.18,.38,.99,.34,.57,.68],
  [-3.92,-15.06,1.86,.42,.38,.62,.97,.34,.42,.62],[1.58,-12.04,2.42,.50,-.33,.25,.99,.36,.58,.58],[-.62,-8.68,3.04,.62,.18,.82,.98,.38,.46,.62],[3.08,-5.76,2.74,.68,-.25,.42,.99,.36,.66,.58],[-3.18,-3.02,3.12,.78,.30,.95,.98,.38,.52,.60],[.42,.38,3.82,.92,-.18,.35,.99,.38,.62,.56],[-1.68,3.72,4.58,1.05,.22,.78,.99,.39,.50,.54],[1.04,7.08,5.96,1.34,-.12,.28,.99,.39,.59,.52],
];

const MOUND_CLUMPS = FEATURED_CLUMPS.filter((clump) => clump[7] >= 0.405);

export function buildBladeStrip(segments) {
  const blade = new Float32Array((segments + 1) * 4);
  for (let i = 0; i <= segments; i += 1) blade.set([-1, i / segments, 1, i / segments], i * 4);
  return blade;
}

export function buildMoundInstances(requested, secondStudy = false) {
  const active = MOUND_CLUMPS;
  const weight = (clump, clumpIndex) =>
    clump[2] * clump[3] * clump[7] * (clump[7] < 0.405 ? 0.82 : 1) *
    (0.68 + seeded(clumpIndex, 31) * 0.72);
  const totalWeight = active.reduce((sum, clump, i) => sum + weight(clump, i), 0);
  const counts = active.map((clump, i) => Math.floor(requested * weight(clump, i) / totalWeight));
  let count = counts.reduce((sum, value) => sum + value, 0);
  for (let i = 0; count < requested; i = (i + 1) % counts.length) { counts[i] += 1; count += 1; }

  const instances = new Float32Array(count * 11);
  let index = 0;
  active.forEach(([
    centerX, centerZ, radiusX, radiusZ, rotation, flow, collapse,
    density, tone, lengthScale, species = 0,
  ], clumpIndex) => {
    const clumpPhase = seeded(clumpIndex, 20) * Math.PI * 2;
    const foreground = clamp((centerZ + 2) / 10, 0, 1);
    const rotationCos = Math.cos(rotation);
    const rotationSin = Math.sin(rotation);
    const localFlow = flow + (seeded(clumpIndex, 22) - 0.5) * (secondStudy ? 2.18 : 3.10);
    const flowX = Math.cos(localFlow);
    const flowZ = Math.sin(localFlow);
    const meanRadius = Math.sqrt(radiusX * radiusZ);
    const isContinuity = density < 0.405 ? 1 : 0;
    const posture = seeded(clumpIndex, 32);
    const upright = isContinuity > 0.5 ? 0 : posture < (secondStudy ? 0.18 : 0.29) ? 1 : 0;
    const flattened = isContinuity > 0.5 ? 0 : posture > (secondStudy ? 0.65 : 0.76) ? 1 : 0;
    const postureLength = upright > 0.5
      ? (secondStudy ? 1.10 : 1.22)
      : flattened > 0.5 ? (secondStudy ? 0.76 : 0.66) : 0.94;
    const postureLift = upright > 0.5
      ? (secondStudy ? 1.18 : 1.24)
      : flattened > 0.5 ? (secondStudy ? 0.52 : 0.54) : 0.90;
    const footprintScale = upright > 0.5 ? 0.88
      : flattened > 0.5 ? (secondStudy ? 1.16 : 1.18) : 1.0;
    const clumpLength = postureLength * (0.82 + seeded(clumpIndex, 15) * 0.38);
    const clumpCollapseBias = (seeded(clumpIndex, 16) - 0.5) * 0.42
      - upright * 0.16 + flattened * 0.30;
    const organicCenterX = centerX + (seeded(clumpIndex, 17) - 0.5) * 0.42;
    const organicCenterZ = centerZ + (seeded(clumpIndex, 18) - 0.5) * 0.54;
    for (let bladeIndex = 0; bladeIndex < counts[clumpIndex]; bladeIndex += 1) {
      const offset = index * 11;
      const angle = seeded(index, 1) * Math.PI * 2;
      const radialSeed = seeded(index, 2);
      const rootRatio = seeded(index, 17) < 0.55
        ? Math.pow(radialSeed, 1.42) * 0.90
        : Math.pow(radialSeed, 0.72);
      const edgeIrregularity = secondStudy ? 1.22 : 1;
      const brokenEdge = 1
        + Math.sin(angle * 3 + clumpPhase) * 0.18 * edgeIrregularity
        + Math.sin(angle * 5 - clumpPhase * 0.63) * 0.11 * edgeIrregularity;
      const localX = Math.cos(angle) * rootRatio * radiusX * brokenEdge * 0.96 * footprintScale;
      const localZ = Math.sin(angle) * rootRatio * radiusZ * brokenEdge * 0.96
        * (flattened > 0.5 ? 1.08 : upright > 0.5 ? 0.92 : 1);
      const lobeRoll = seeded(index, 14);
      const lobeSide = lobeRoll < 0.28 ? -1 : lobeRoll > 0.72 ? 1 : 0;
      const lobeDepth = lobeRoll < 0.16 ? -0.7 : lobeRoll > 0.84 ? 0.55 : 0;
      const rootX = localX * rotationCos - localZ * rotationSin
        - flowZ * lobeSide * radiusX * 0.13 + flowX * lobeDepth * radiusZ * 0.08;
      const rootZ = localX * rotationSin + localZ * rotationCos
        + flowX * lobeSide * radiusX * 0.13 + flowZ * lobeDepth * radiusZ * 0.08;
      const outwardLength = Math.hypot(rootX, rootZ) || 1;
      const outwardX = rootX / outwardLength;
      const outwardZ = rootZ / outwardLength;
      const flattenedMat = isContinuity;
      const broadFlow = flattenedMat > 0.5 ? 0.40 : (secondStudy ? 0.50 : 0.92);
      const fineFlow = flattenedMat > 0.5 ? 0.18 : (secondStudy ? 0.24 : 0.36);
      const bundleIndex = Math.floor((angle / (Math.PI * 2)) * 6);
      const bundleSeed = clumpIndex * 13 + bundleIndex;
      const bundleTurn = secondStudy ? (seeded(bundleSeed, 60) - 0.5) * 1.06 : 0;
      const bundleLength = secondStudy ? 0.86 + seeded(bundleSeed, 61) * 0.28 : 1;
      const bundleCollapse = secondStudy ? (seeded(bundleSeed, 62) - 0.5) * 0.30 : 0;
      const patchAngle = localFlow
        + Math.sin(angle * 2 + clumpPhase) * broadFlow
        + Math.sin(angle * 5 - clumpPhase * 0.72) * fineFlow
        + bundleTurn;
      const patchX = Math.cos(patchAngle);
      const patchZ = Math.sin(patchAngle);
      const directionX = patchX * 0.84 + outwardX * 0.16;
      const directionZ = patchZ * 0.84 + outwardZ * 0.16;
      const tangled = seeded(index, 19) < ((secondStudy ? 0.35 : 0.27) + flattenedMat * 0.12) ? 1 : 0;
      const direction = Math.atan2(directionZ, directionX)
        + (seeded(index, 5) - 0.5) * (flattenedMat > 0.5 ? 0.38 : (secondStudy ? 0.48 : 0.64))
        + tangled * (seeded(index, 20) - 0.5) * 1.82;
      const strandNoise = 0.82 + Math.pow(seeded(index, 3), 0.82) * 0.42;
      const irregularProfile = clamp(
        0.90 + Math.sin(angle * 2 + clumpPhase) * 0.12
          + Math.sin(angle * 5 - clumpPhase * 0.71) * 0.07,
        0.72, 1.12,
      );
      const strayLength = seeded(index, 13) > 0.93 ? 1.14 : seeded(index, 13) < 0.17 ? 0.72 : 1;
      const baseBlade = seeded(index, 21) < 0.36 ? 1 : 0;
      const contactPatch = rootRatio > 0.48 && Math.sin(angle * 3 + clumpPhase) > 0.42 ? 1 : 0;
      const edgeLength = 0.90 + (1 - rootRatio) * 0.12
        + clamp((rootX * flowX + rootZ * flowZ) / meanRadius * 0.12, -0.13, 0.13);
      const structuralLength = meanRadius <= 1.45
        ? meanRadius : 1.45 + (meanRadius - 1.45) * 0.28;
      let height = structuralLength * (secondStudy ? 0.90 : 0.98) * strandNoise * edgeLength
        * irregularProfile * strayLength * lengthScale * clumpLength * bundleLength
        * (1 - foreground * 0.10) * (1 - flattenedMat * 0.24)
        * (1 - contactPatch * 0.23) * (1 - baseBlade * 0.19)
        * (1 - tangled * 0.06);
      const worldRootX = organicCenterX + rootX;
      const worldRootZ = organicCenterZ + rootZ;
      if (species > 0.5) height *= 0.76;
      const roundedShoulder = Math.pow(Math.max(0, 1 - rootRatio), 1.12);
      const moundLift = roundedShoulder * meanRadius * (secondStudy ? 0.22 : 0.36) * postureLift
        * (1 - flattenedMat * 0.84);
      const rootLift = 0.018 + moundLift
        + (1 - rootRatio) * 0.045 * (1 - collapse * 0.54)
        + seeded(index, 12) * 0.018;
      instances[offset] = worldRootX;
      instances[offset + 1] = rootLift;
      instances[offset + 2] = worldRootZ;
      instances[offset + 3] = height;
      instances[offset + 4] = species > 0.5
        ? 0.011 + seeded(index, 4) * 0.009
        : (secondStudy
          ? 0.0060 + seeded(index, 4) * 0.0052
          : (0.0048 + seeded(index, 4) * 0.0047) * (1 + baseBlade * 0.10));
      instances[offset + 5] = direction;
      instances[offset + 6] = direction + Math.PI * 0.5 + (seeded(index, 6) - 0.5) * 0.62;
      instances[offset + 7] = seeded(index, 7) * Math.PI * 2;
      const family = seeded(index, 11);
      const bladeShade = clamp(
        tone * 0.68 + seeded(index, 8) * 0.28 + foreground * 0.08
          + (family > 0.72 ? 0.24 : 0) - (family < 0.11 ? 0.13 : 0),
        0.06, 0.98,
      );
      instances[offset + 8] = species > 0.5 ? 2 + bladeShade : bladeShade + flattenedMat;
      instances[offset + 9] = clumpPhase;
      instances[offset + 10] = clamp(
        0.14 + collapse * 0.48 + foreground * 0.03 + rootRatio * 0.13
          + clumpCollapseBias
          + Math.sin(angle * 2 + clumpPhase) * 0.075
          + Math.sin(angle * 5 - clumpPhase) * 0.035
          + bundleCollapse
          + flattenedMat * 0.46 + contactPatch * 0.16 - baseBlade * 0.07
          + tangled * 0.07 + (seeded(index, 9) - 0.5) * 0.32,
        0.26, 0.98,
      );
      index += 1;
    }
  });
  return { data: instances, count };
}

export function buildBaseInstances(requested, secondStudy = false) {
  const terrainWidth = 16.8;
  const terrainDepth = 35.0;
  const columns = Math.max(1, Math.round(Math.sqrt(requested * terrainWidth / terrainDepth)));
  const rows = Math.max(1, Math.ceil(requested / columns));
  const count = columns * rows;
  const instances = new Float32Array(count * 11);
  let instance = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const offset = instance * 11;
      const rootX = -8.4 + ((column + 0.16 + seeded(instance, 41) * 0.68) / columns) * terrainWidth;
      const rootZ = -23.0 + ((row + 0.16 + seeded(instance, 42) * 0.68) / rows) * terrainDepth;
      const regionColumn = Math.floor((rootX + 8.4) / 1.22);
      const regionRow = Math.floor((rootZ + 23.0) / 1.36);
      const region = regionRow * 19 + regionColumn;
      const regionPhase = seeded(region, 43) * Math.PI * 2;
      const compression = seeded(region, 44);
      const fieldDirection = regionPhase
        + Math.sin(rootX * 0.24 + rootZ * 0.11) * 0.38
        + Math.cos(rootZ * 0.19 - rootX * 0.07) * 0.24;
      const tangled = seeded(instance, 45) < (0.17 + compression * 0.16) ? 1 : 0;
      const direction = fieldDirection + (seeded(instance, 46) - 0.5) * (secondStudy ? 0.52 : 0.78)
        + tangled * (seeded(instance, 47) - 0.5) * 1.72;
      const compressedLength = compression > 0.72 ? 0.68 : compression < 0.20 ? 1.08 : 0.88;
      const height = (secondStudy ? 0.48 + seeded(instance, 48) * 0.42 : 0.42 + seeded(instance, 48) * 0.48)
        * compressedLength;
      const shade = clamp(
        (secondStudy ? 0.17 : 0.09) + seeded(instance, 49) * 0.54
          + (compression < 0.18 ? 0.18 : 0),
        0.04, 0.94,
      );
      instances[offset] = rootX;
      instances[offset + 1] = 0.010 + seeded(instance, 50) * 0.014;
      instances[offset + 2] = rootZ;
      instances[offset + 3] = height;
      instances[offset + 4] = secondStudy
        ? 0.0074 + seeded(instance, 51) * 0.0050
        : 0.0046 + seeded(instance, 51) * 0.0042;
      instances[offset + 5] = direction;
      instances[offset + 6] = direction + Math.PI * 0.5 + (seeded(instance, 52) - 0.5) * 0.48;
      instances[offset + 7] = seeded(instance, 53) * Math.PI * 2;
      instances[offset + 8] = 1 + shade;
      instances[offset + 9] = regionPhase;
      instances[offset + 10] = clamp(
        (secondStudy ? 0.68 : 0.48) + compression * (secondStudy ? 0.24 : 0.28)
          + (seeded(instance, 54) - 0.5) * 0.20 + tangled * 0.08,
        0.28, 0.98,
      );
      instance += 1;
    }
  }
  return { data: instances, count };
}

export function buildTerrainMesh(columns = 112, rows = 224) {
  const uvs = new Float32Array((columns + 1) * (rows + 1) * 2);
  let offset = 0;
  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      uvs[offset] = column / columns;
      uvs[offset + 1] = row / rows;
      offset += 2;
    }
  }
  const indices = new Uint32Array(columns * rows * 6);
  let indexOffset = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const topLeft = row * (columns + 1) + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns + 1;
      const bottomRight = bottomLeft + 1;
      indices.set([topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight], indexOffset);
      indexOffset += 6;
    }
  }
  return { uvs, indices };
}

// Deterministic value noise, used only for the generated terrain and fields.
function hash2(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
}

function fbm(x, y, octaves, scale) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = scale;
  for (let i = 0; i < octaves; i += 1) {
    sum += valueNoise(x * frequency, y * frequency) * amplitude;
    frequency *= 2.07;
    amplitude *= 0.5;
  }
  return sum;
}

const toByte = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));

// Returns the four maps the shaders sample. Coordinates mirror the shader:
// u = (x + 10) / 20 and v = (12 - z) / 34.
export function buildFields(width, height) {
  const relief = new Float32Array(width * height);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const u = (column + 0.5) / width;
      const v = (row + 0.5) / height;
      const x = -10 + 20 * u;
      const z = 12 - 34 * v;
      let value = 0.10 + fbm(x * 0.9, z * 0.9, 3, 0.42) * 0.16;
      for (const clump of MOUND_CLUMPS) {
        const dx = (x - clump[0]) / (clump[2] * 2.1);
        const dz = (z - clump[1]) / (clump[3] * 2.4);
        value += 0.50 * clump[7] * Math.exp(-2.4 * (dx * dx + dz * dz));
      }
      relief[row * width + column] = clamp(value, 0.06, 0.92);
    }
  }

  const heightData = new Uint8Array(width * height * 4);
  const visualData = new Uint8Array(width * height * 4);
  const referenceData = new Uint8Array(width * height * 4);
  const generatedData = new Uint8Array(width * height * 4);

  // Cushion-scale light and shade. The reference footage has deep dark gaps
  // between lit domes, so the fields must carry that contrast.
  const domeShade = new Float32Array(width * height);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const left = relief[row * width + Math.max(0, column - 1)];
      const right = relief[row * width + Math.min(width - 1, column + 1)];
      const up = relief[Math.max(0, row - 1) * width + column];
      const down = relief[Math.min(height - 1, row + 1) * width + column];
      const gradientX = (right - left) * 4.0;
      const gradientY = (down - up) * 4.0;
      const slopeLight = clamp(0.55 - gradientX * 0.55 - gradientY * 0.80, 0.18, 1.0);
      const dome = Math.pow(clamp(relief[index], 0, 1), 1.15);
      domeShade[index] = clamp(0.045 + dome * 0.46 * slopeLight, 0.03, 0.92);
    }
  }

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const i = row * width + column;
      const level = relief[i];
      const u = (column + 0.5) / width;
      const v = (row + 0.5) / height;
      const grain = fbm(u * 24, v * 24, 3, 1) - 0.5;
      heightData[i * 4] = toByte(level);
      heightData[i * 4 + 1] = toByte(level);
      heightData[i * 4 + 2] = toByte(level);
      heightData[i * 4 + 3] = 255;

      const warm = 0.045 + level * 0.14 + grain * 0.05;
      visualData[i * 4] = toByte(warm * 0.98);
      visualData[i * 4 + 1] = toByte(warm * 0.92);
      visualData[i * 4 + 2] = toByte(warm * 0.70);
      visualData[i * 4 + 3] = 255;

      const soft = fbm(u * 9.0, v * 9.0, 3, 1) - 0.5;
      const band = Math.max(0.02, domeShade[i] * (1.0 + soft * 0.22)
        * (0.94 + Math.pow(1 - v, 1.6) * 0.20));
      referenceData[i * 4] = toByte(band * 0.80);
      referenceData[i * 4 + 1] = toByte(band * 1.00);
      referenceData[i * 4 + 2] = toByte(band * 0.58);
      referenceData[i * 4 + 3] = 255;

      const soft2 = fbm(u * 6.5 + 17.3, v * 6.5 + 5.7, 3, 1) - 0.5;
      const band2 = Math.max(0.02, (domeShade[i] * 0.96 + 0.012)
        * (1.0 + soft2 * 0.16) * (0.94 + Math.pow(1 - v, 1.6) * 0.18));
      generatedData[i * 4] = toByte(band2 * 0.80);
      generatedData[i * 4 + 1] = toByte(band2 * 1.00);
      generatedData[i * 4 + 2] = toByte(band2 * 0.58);
      generatedData[i * 4 + 3] = 255;
    }
  }

  return {
    height: { data: heightData, width, height },
    visual: { data: visualData, width, height },
    reference: { data: referenceData, width, height },
    generated: { data: generatedData, width, height },
  };
}

export function buildMipChain({ data, width, height }) {
  const levels = [{ data, width, height }];
  let source = data;
  let sourceWidth = width;
  let sourceHeight = height;
  while (sourceWidth > 1 || sourceHeight > 1) {
    const nextWidth = Math.max(1, sourceWidth >> 1);
    const nextHeight = Math.max(1, sourceHeight >> 1);
    const next = new Uint8Array(nextWidth * nextHeight * 4);
    for (let y = 0; y < nextHeight; y += 1) {
      for (let x = 0; x < nextWidth; x += 1) {
        for (let channel = 0; channel < 4; channel += 1) {
          let sum = 0;
          let samples = 0;
          for (let dy = 0; dy < 2; dy += 1) {
            for (let dx = 0; dx < 2; dx += 1) {
              const sx = Math.min(sourceWidth - 1, x * 2 + dx);
              const sy = Math.min(sourceHeight - 1, y * 2 + dy);
              sum += source[(sy * sourceWidth + sx) * 4 + channel];
              samples += 1;
            }
          }
          next[(y * nextWidth + x) * 4 + channel] = Math.round(sum / samples);
        }
      }
    }
    levels.push({ data: next, width: nextWidth, height: nextHeight });
    source = next;
    sourceWidth = nextWidth;
    sourceHeight = nextHeight;
  }
  return levels;
}

export function perspective(aspect) {
  const near = 0.1;
  const far = 48;
  const f = 1 / Math.tan(Math.PI * 0.116);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far / (near - far), -1,
    0, 0, (near * far) / (near - far), 0,
  ]);
}

export function lookAt(eye, target) {
  const normalize3 = (v) => {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / length, v[1] / length, v[2] / length];
  };
  const cross3 = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = normalize3([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize3(cross3([0, 1, 0], z));
  const y = cross3(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot3(x, eye), -dot3(y, eye), -dot3(z, eye), 1,
  ]);
}

export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1]
        + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}
