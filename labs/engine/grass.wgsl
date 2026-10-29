struct Uniforms {
  vp: mat4x4<f32>,
  camera: vec4<f32>,      // xyz = eye, w = time
  params: vec4<f32>,      // windScale, bladeLengthScale, terrainDepth, study
  resolution: vec4<f32>,  // xy = drawing buffer size
  pointer: vec4<f32>,     // xz = ground point, z = radius, w = strength
  fog: vec4<f32>,         // rgb = fog colour, w = density
  collider: vec4<f32>,    // xz = centre, z = radius, w = strength
  path: vec4<f32>,        // xz = start, zw = end
};

@group(0) @binding(0) var<uniform> U: Uniforms;
@group(0) @binding(1) var terrainTex: texture_2d<f32>;
@group(0) @binding(2) var terrainSamp: sampler;
@group(0) @binding(3) var referenceField: texture_2d<f32>;
@group(0) @binding(4) var generatedField: texture_2d<f32>;
@group(0) @binding(5) var fieldSamp: sampler;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
  @location(1) world: vec3<f32>,
  @location(2) t: f32,
  @location(3) shade: f32,
  @location(4) gust: f32,
  @location(5) rootXZ: vec2<f32>,
};

fn terrainUV(xz: vec2<f32>) -> vec2<f32> {
  return vec2((xz.x + 10.0) / 20.0, (12.0 - xz.y) / 34.0);
}

fn terrainShape(xz: vec2<f32>) -> f32 {
  let sampleColor = textureSampleLevel(
    terrainTex, terrainSamp, clamp(terrainUV(xz), vec2(0.0), vec2(1.0)), 5.0).rgb;
  let luminance = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
  return smoothstep(0.19, 0.76, luminance);
}

fn hash21(p: vec2<f32>) -> f32 {
  var q = fract(p * vec2(127.1, 311.7));
  q += dot(q, q.yx + 33.33);
  return fract(q.x * q.y);
}

fn noise2(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2(1.0, 0.0));
  let c = hash21(i + vec2(0.0, 1.0));
  let d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

fn fbm2(p0: vec2<f32>) -> f32 {
  var p = p0;
  var sum = 0.0;
  var amplitude = 0.5;
  for (var i = 0; i < 2; i += 1) {
    sum += amplitude * noise2(p);
    p = p * 2.03 + vec2(11.3, 7.7);
    amplitude *= 0.5;
  }
  return sum;
}

@vertex
fn vs(
  @location(0) blade: vec2<f32>,
  @location(1) root: vec3<f32>,
  @location(2) shape: vec4<f32>,
  @location(3) motion: vec4<f32>,
) -> VSOut {
  var out: VSOut;
  let side = blade.x;
  // Cloth mode: mown cells truncate the blade parameter, so the tip ends blunt.
  var cut = 1.0;
  if (U.resolution.z > 0.5) {
    let cutDrift = noise2(root.xz * 0.40) - 0.5;
    let cutX = (root.x + cutDrift * 0.05) / 1.00;
    let cutZ = (root.z + cutDrift * 0.05) / 1.00;
    let rowSum = step(0.5, fract(cutZ * 0.5)) + step(0.5, fract(cutX * 0.5));
    let cutLevel = rowSum - 2.0 * floor(rowSum * 0.5);
    cut = mix(0.29, 1.0, cutLevel);
  }
  let t = blade.y * cut;
  let time = U.camera.w;
  let windScale = U.params.x;
  let bladeLengthScale = U.params.y;
  let terrainDepth = U.params.z;
  let secondStudy = step(0.5, U.params.w);

  let terrainLevel = terrainShape(root.xz);
  let terrainX = terrainShape(root.xz + vec2(0.16, 0.0));
  let terrainZ = terrainShape(root.xz + vec2(0.0, 0.16));

  let authoredTerrainStrength = mix(0.58, 0.43, secondStudy);
  let depthInput = max(terrainDepth * 0.5, 0.0);
  var depthScale: f32;
  if (depthInput <= 1.0) {
    depthScale = pow(depthInput, 1.55);
  } else {
    depthScale = 1.0 + pow(depthInput - 1.0, 1.15) * 4.5;
  }
  let terrainStrength = authoredTerrainStrength * depthScale;
  let terrainY = (terrainLevel - 0.5) * terrainStrength;
  let orientationStrength = authoredTerrainStrength;
  let terrainGradient = vec2(terrainX - terrainLevel, terrainZ - terrainLevel) * orientationStrength / 0.16;
  let terrainNormal = normalize(vec3(-terrainGradient.x, 1.0, -terrainGradient.y));
  let slopeAmount = smoothstep(0.018, 0.18, length(terrainGradient));
  let downhill = normalize(-terrainGradient + vec2(0.0001));
  // A prop crushes the blades under its footprint to stubble, so nothing pierces it.
  var crush = 1.0;
  if (U.collider.w > 0.0) {
    let seatOffset = root.xz - U.collider.xy;
    let footprint = max(abs(seatOffset.x), abs(seatOffset.y)) / max(U.collider.z, 0.001);
    crush = mix(0.14, 1.0, smoothstep(0.40, 0.98, footprint));
  }
  // A mown route runs from the near field to the chair.
  if (U.path.z > 0.0001 || U.path.w > 0.0001) {
    let segment = U.path.zw - U.path.xy;
    let along = clamp(dot(root.xz - U.path.xy, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    let closest = U.path.xy + segment * along;
    let route = length(root.xz - closest);
    crush = min(crush, mix(0.30, 1.0, smoothstep(0.16, 0.46, route)));
  }
  let height = shape.x * bladeLengthScale * crush * mix(0.94, 1.06, terrainLevel);
  let width = shape.y;
  let radial = vec2(cos(shape.z), sin(shape.z));
  let bladeSide = vec2(cos(shape.w), sin(shape.w));
  let windDirection = normalize(mix(vec2(0.78, 0.63), vec2(-0.18, 0.98), secondStudy));

  let frontDirection = normalize(mix(vec2(0.56, 0.83), vec2(-0.12, 0.99), secondStudy));
  let frontSide = vec2(-frontDirection.y, frontDirection.x);
  let alongFront = dot(root.xz, frontDirection);
  let acrossFront = dot(root.xz, frontSide);
  let clumpLag = sin(motion.z * 1.37) * 0.52;
  let frontPhase = fract((alongFront - time * mix(1.06, 0.72, secondStudy) + clumpLag) / 18.0);
  let frontDistance = min(frontPhase, 1.0 - frontPhase) * 18.0;
  let primaryFront = 1.0 - smoothstep(0.75, 3.15, frontDistance);
  let primaryRegion = 0.18 + 0.82 * pow(
    sin(acrossFront * 0.31 - time * 0.23 + motion.z * 0.11) * 0.5 + 0.5, 1.65);
  let secondPhase = fract((dot(root.xz, vec2(-0.84, 0.54))
    - time * 0.68 - clumpLag * 0.42) / 23.0);
  let secondDistance = min(secondPhase, 1.0 - secondPhase) * 23.0;
  let secondFront = (1.0 - smoothstep(0.55, 2.45, secondDistance))
    * (0.24 + 0.76 * pow(sin(root.x * 0.26 + time * 0.17) * 0.5 + 0.5, 2.0));
  let clumpBreath = sin(time * (0.86 + sin(motion.z) * 0.12) + motion.z) * 0.5 + 0.5;
  let frontResponse = 0.68 + 0.32 * (sin(motion.z * 1.91) * 0.5 + 0.5);
  let gust = clamp(primaryFront * primaryRegion * frontResponse + secondFront * 0.38, 0.0, 1.0);
  let peakGust = pow(gust, 2.20);
  let extremeWind = smoothstep(1.0, 3.6, windScale);
  let chaosA = sin(dot(root.xz, vec2(0.91, -0.47)) * 1.16 - time * 3.60 + motion.z * 0.72);
  let chaosB = sin(dot(root.xz, vec2(-0.38, 0.96)) * 1.74 - time * 4.85 + motion.z * 1.31);
  let chaosC = sin(dot(root.xz, vec2(0.52, 0.68)) * 2.43 + time * 2.95 + motion.x * 0.19);
  let chaosPulse = clamp(0.52 + chaosA * 0.25 + chaosB * 0.16 + chaosC * 0.11, 0.0, 1.0);
  let individualTurn = sin(motion.x * 1.23 + time * 6.20 + dot(root.xz, vec2(0.21, -0.17)));
  let crossWind = vec2(-windDirection.y, windDirection.x);
  let chaoticWindDirection = normalize(windDirection
    + crossWind * (chaosA * 1.06 + individualTurn * 0.52) * extremeWind
    + radial * (chaosB * 0.46 + individualTurn * 0.26) * extremeWind);
  var wind = mix(0.11, 0.085, secondStudy)
    + gust * mix(0.48, 0.37, secondStudy)
    + clumpBreath * mix(0.10, 0.075, secondStudy)
    + secondFront * 0.045;
  wind += sin(time * 2.20 + motion.z) * 0.008
    + sin(time * 3.10 + motion.z * 0.63) * 0.004;
  wind *= mix(1.0, 0.58 + chaosPulse * 1.04, extremeWind);
  wind = clamp(wind * windScale, 0.05, 2.10);

  let curve = t * t;
  let arch = pow(t, 1.38);
  let tip = pow(t, 2.15);
  let taper = pow(max(1.0 - t, 0.0), 0.66);
  let lean = motion.w;
  let bendDirection = normalize(
    radial * (mix(1.22, 1.58, secondStudy) - wind * mix(0.34, 0.24, secondStudy))
    + chaoticWindDirection * (mix(0.06, 0.04, secondStudy) + wind * mix(0.46, 0.34, secondStudy))
    + downhill * slopeAmount * 0.11);
  let curlAngle = sin(motion.x * 1.37) * 0.22 * arch + sin(motion.x * 0.71) * 0.06 * tip;
  let curlCos = cos(curlAngle);
  let curlSin = sin(curlAngle);
  let curveDirection = vec2(
    bendDirection.x * curlCos - bendDirection.y * curlSin,
    bendDirection.x * curlSin + bendDirection.y * curlCos);
  let rippleDirection = vec2(-chaoticWindDirection.y, chaoticWindDirection.x);
  let bladeFlutter = sin(motion.x * 1.71 + time * 5.40 + t * 3.2)
    + sin(motion.x * 0.83 - time * 7.10 + t * 5.1) * 0.46;
  let ripple = sin(motion.x + time * 1.74 + t * 2.7) * 0.006 * height
    + bladeFlutter * extremeWind * height * (0.020 + gust * 0.028);

  let naturalReach = height * (0.050 * t + lean * mix(0.62, 0.72, secondStudy) * arch);
  let gustReach = height * wind * (
    0.12 + gust * 0.10 + peakGust * 0.18
    + extremeWind * (0.09 + gust * 0.16 + peakGust * 0.22)
  ) * curve * mix(1.0, 0.78, secondStudy);
  var world = root;
  world.y += terrainY;
  world.xz += terrainNormal.xz * height * t * (0.30 - arch * 0.08);
  world.xz += curveDirection * naturalReach;
  world.xz += chaoticWindDirection * gustReach;
  world.xz += rippleDirection * ripple * tip;
  let verticalLift = max(0.018,
    1.0 - lean * mix(0.58, 0.76, secondStudy) * arch
      - wind * mix(0.16, 0.11, secondStudy) * tip
      - peakGust * mix(0.42, 0.30, secondStudy) * tip
      - extremeWind * (0.28 + gust * 0.20 + peakGust * 0.38) * tip
      - extremeWind * abs(chaosB) * 0.14 * tip);
  world.y += height * t * verticalLift * terrainNormal.y;
  world.xz += bladeSide * side * width * taper;

  // A moving pointer parts the grass in a soft ring, like a hand brushing through.
  let pointerDelta = world.xz - U.pointer.xy;
  let pointerRadius = max(U.pointer.z, 0.001);
  let pointerDistance = length(pointerDelta) / pointerRadius;
  let ring = smoothstep(0.08, 0.55, pointerDistance)
    * (1.0 - smoothstep(0.80, 1.0, pointerDistance));
  let push = ring * U.pointer.w;
  let pushDirection = normalize(pointerDelta + vec2(0.0001, 0.0001));
  world.xz += pushDirection * push * height * 0.40 * (0.30 + t);
  world.y -= push * height * 0.10 * t;

  // A solid prop presses the grass down and aside.
  let seatDelta = world.xz - U.collider.xy;
  let seatSquare = max(abs(seatDelta.x), abs(seatDelta.y)) / max(U.collider.z, 0.001);
  let contact = (1.0 - smoothstep(0.40, 1.05, seatSquare)) * U.collider.w;
  world.xz += normalize(seatDelta + vec2(0.0001, 0.0001)) * contact * 0.42 * (0.45 + t);
  world.y -= contact * height * 0.45 * t;

  let horizontalTangent = curveDirection * (lean * 1.02 + 0.08)
    + chaoticWindDirection * (wind * (0.36 + gust * 0.14) + peakGust * 0.42
      + extremeWind * (0.34 + gust * 0.38 + peakGust * 0.62))
    + rippleDirection * chaosC * extremeWind * 0.38;
  let tangent = normalize(vec3(
    horizontalTangent.x * arch + terrainNormal.x * (1.0 - arch) * 0.34,
    max(0.018, 1.0 - lean * 0.70 * arch - wind * 0.28 * tip - peakGust * 0.48 * tip
      - extremeWind * (0.34 + peakGust * 0.44) * tip) * terrainNormal.y,
    horizontalTangent.y * arch + terrainNormal.z * (1.0 - arch) * 0.34));

  out.normal = normalize(cross(vec3(bladeSide.x, 0.0, bladeSide.y), tangent));
  out.world = world;
  out.t = t;
  out.shade = motion.y;
  out.gust = gust * 0.78 + wind * 0.22;
  out.rootXZ = root.xz;
  out.position = U.vp * vec4(world, 1.0);
  return out;
}

struct FSIn {
  @builtin(position) position: vec4<f32>,
  @builtin(front_facing) front: bool,
  @location(0) normal: vec3<f32>,
  @location(1) world: vec3<f32>,
  @location(2) t: f32,
  @location(3) shade: f32,
  @location(4) gust: f32,
  @location(5) rootXZ: vec2<f32>,
};

@fragment
fn fs(in: FSIn) -> @location(0) vec4<f32> {
  let secondStudy = step(0.5, U.params.w);
  let normal = normalize(select(-in.normal, in.normal, in.front));
  let sun = normalize(vec3(-0.54, 0.78, 0.32));
  let view = normalize(U.camera.xyz - in.world);
  let halfDirection = normalize(sun + view);
  let direct = max(dot(normal, sun), 0.0);
  let translucent = pow(max(dot(-normal, sun), 0.0), 1.2);
  let specular = pow(max(dot(normal, halfDirection), 0.0), 28.0);
  let silverEdge = pow(1.0 - abs(dot(normal, view)), 7.0);

  let root = vec3(0.0980, 0.1569, 0.0941);
  let shadowBlade = vec3(0.1804, 0.2431, 0.1490);
  let coolBlade = vec3(0.2196, 0.2902, 0.2275);
  let naturalBlade = vec3(0.4314, 0.5216, 0.2588);
  let freshBlade = vec3(0.5765, 0.6549, 0.2510);
  let oliveBlade = vec3(0.4784, 0.5373, 0.2627);
  let grayBlade = vec3(0.6863, 0.7412, 0.5569);
  let strawBlade = vec3(0.7608, 0.7529, 0.5216);
  let paleBlade = vec3(0.8549, 0.8941, 0.7137);
  let silver = vec3(0.9608, 0.9765, 0.9098);

  let accentPlant = step(2.0, in.shade);
  let flattened = step(1.0, in.shade) * (1.0 - accentPlant);
  let shade = fract(in.shade);
  let strandFlash = smoothstep(0.72, 0.97, fract(shade * 29.73));
  var color = select(
    select(
      select(
        select(
          select(strawBlade, grayBlade, shade < 0.84),
          oliveBlade, shade < 0.68),
        freshBlade, shade < 0.52),
      naturalBlade, shade < 0.32),
    coolBlade, shade < 0.14);
  let dryFamily = smoothstep(0.60, 0.93, shade);
  let weathered = select(grayBlade, strawBlade, fract(shade * 13.71) < 0.52);
  color = mix(color, weathered, dryFamily * 0.74);
  let familyLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  let studyTwoMuted = mix(
    vec3(0.185, 0.255, 0.155),
    vec3(0.625, 0.660, 0.455),
    smoothstep(0.10, 0.72, familyLuma));
  color = mix(color, studyTwoMuted, secondStudy * 0.24);
  color = mix(color, mix(shadowBlade, coolBlade, 0.62),
    flattened * (0.34 + dryFamily * 0.16));
  color *= mix(0.82, 1.12, fract(shade * 7.31));
  let accentRoot = vec3(0.2784, 0.3216, 0.0471);
  let accentLeaf = mix(
    vec3(0.6196, 0.6902, 0.0235),
    vec3(0.8706, 0.8549, 0.0745),
    shade);
  color = mix(color, accentLeaf, accentPlant);
  let rootColor = mix(root, accentRoot, accentPlant);
  color = mix(rootColor, color, smoothstep(0.05, 0.44, in.t));
  color = mix(color, shadowBlade, (1.0 - smoothstep(0.03, 0.26, in.t)) * 0.20);
  let sunWash = smoothstep(0.48, 0.96, direct) * smoothstep(0.44, 1.0, in.t);
  color = mix(color, paleBlade,
    sunWash * (0.25 + flattened * 0.06) * mix(1.0, 0.76, secondStudy));
  let illumination = 0.70 + direct * 0.72 + translucent * 0.18 + in.gust * 0.016;
  color *= illumination;
  color += paleBlade * silverEdge * (0.080 + in.t * 0.185) * mix(1.0, 0.82, secondStudy);
  color += silver * strandFlash * direct * 0.48 * smoothstep(0.16, 1.0, in.t)
    * mix(1.0, 0.76, secondStudy);
  color += silver * specular * (1.10 + in.gust * 0.36) * smoothstep(0.20, 1.0, in.t)
    * mix(1.0, 0.78, secondStudy);
  color *= mix(1.0, 1.06, smoothstep(0.16, 0.78, in.t));

  let resolution = U.resolution.xy;
  let fieldUV = clamp(
    vec2(in.position.x / resolution.x, 1.0 - in.position.y / resolution.y),
    vec2(0.0), vec2(1.0));
  let reference = textureSample(referenceField, fieldSamp, fieldUV).rgb;
  let referenceLuma = dot(reference, vec3(0.2126, 0.7152, 0.0722));
  let sourceLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  let referenceChroma = reference / max(referenceLuma, 0.055);
  let spatialLuma = mix(sourceLuma, referenceLuma, 0.28);
  let spatialTint = referenceChroma * spatialLuma;
  color = mix(color, spatialTint, mix(0.34, 0.40, secondStudy));

  // Cloth mode: the field becomes a woven plaid of green shades.
  // The branch stays uniform, so other pages do not pay for the noise.
  if (U.resolution.z > 0.5) {
    let cell = 1.00;
    let drift = noise2(in.rootXZ * 0.40) - 0.5;
    let grain = fbm2(in.rootXZ * 5.4 + vec2(3.1, 8.4)) - 0.5;
    let cellX = (in.rootXZ.x + drift * 0.04) / cell;
    let cellZ = (in.rootXZ.y + drift * 0.04) / cell;
    let rowBand = step(0.5, fract(cellZ * 0.5));
    let columnBand = step(0.5, fract(cellX * 0.5));
    // Four evenly spaced tonal levels shape the plaid. The hedge keeps its own palette.
    let level = (rowBand + columnBand * 2.0) / 3.0;
    var gain = mix(0.60, 1.22, level);
    // Canopy occlusion: the base of every blade sits in shade.
    let occlusion = 0.62 + 0.38 * smoothstep(0.0, 0.55, in.t);
    gain *= mix(occlusion, 1.0, level);
    gain *= 1.0 + grain * 0.20 + drift * 0.12;
    let thread = fract(in.rootXZ.y * 11.0);
    gain *= 0.97 + 0.03 * step(0.5, thread);
    color *= gain;
  }

  let tintedLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  let midtoneMask = smoothstep(0.14, 0.34, tintedLuma)
    * (1.0 - smoothstep(0.62, 0.84, tintedLuma));
  color *= 1.0 + midtoneMask * 0.075;

  let sunlitBlade = smoothstep(0.42, 0.92, direct) * smoothstep(0.25, 1.0, in.t);
  let reflectedFlash = clamp(
    0.16 + silverEdge * 0.38 + strandFlash * 0.24 + specular * 0.45, 0.0, 1.0);
  color += vec3(0.043, 0.052, 0.046) * sunlitBlade * reflectedFlash;

  let lowerHalf = 1.0 - smoothstep(0.38, 0.76, fieldUV.y);
  let strawVariation = clamp(lowerHalf * 0.55 + flattened * 0.70, 0.0, 1.0)
    * dryFamily * smoothstep(0.30, 1.0, in.t);
  color = mix(color, vec3(0.67, 0.63, 0.50), strawVariation * mix(0.085, 0.15, secondStudy));

  let refinedLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  let shadowLift = 1.0 - smoothstep(0.11, 0.29, refinedLuma);
  color += vec3(0.016, 0.022, 0.018) * shadowLift;

  let generated = textureSample(generatedField, fieldSamp, fieldUV).rgb;
  let generatedLuma = dot(generated, vec3(0.2126, 0.7152, 0.0722));
  let generatedChroma = generated / max(generatedLuma, 0.055);
  let chromaRatio = clamp(
    referenceChroma / max(generatedChroma, vec3(0.16)),
    vec3(0.78), vec3(1.22));
  color *= mix(vec3(1.0), chromaRatio, 0.24);

  let comparisonLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  let lumaScale = mix(0.72, 0.10, step(0.5, U.resolution.z));
  let spatialValueOffset = (referenceLuma - generatedLuma) * lumaScale;
  let correctedLuma = clamp(comparisonLuma + spatialValueOffset, 0.052, 0.965);
  color *= correctedLuma / max(comparisonLuma, 0.032);
  let fogDistance = length(U.camera.xyz - in.world);
  let fogAmount = clamp(1.0 - exp(-pow(fogDistance * U.fog.w, 2.0)), 0.0, 1.0) * 0.94;
  color = mix(color, U.fog.rgb, fogAmount);
  let seatDelta = in.world.xz - U.collider.xy;
  let seatSquare = max(abs(seatDelta.x), abs(seatDelta.y)) / max(U.collider.z, 0.001);
  let contactShade = 1.0 - smoothstep(0.45, 1.35, seatSquare);
  color *= 1.0 - contactShade * 0.55;
  color = min(color, silver);
  color = max(color, vec3(0.0, 0.117647, 0.031373));
  return vec4(color, 1.0);
}
