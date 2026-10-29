struct TerrainUniforms {
  depth: vec4<f32>,  // x = terrain depth control
};

@group(0) @binding(0) var<uniform> T: TerrainUniforms;
@group(0) @binding(1) var heightTex: texture_2d<f32>;
@group(0) @binding(2) var heightSamp: sampler;
@group(0) @binding(3) var visualTex: texture_2d<f32>;
@group(0) @binding(4) var visualSamp: sampler;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) level: f32,
};

fn terrainShape(uv: vec2<f32>) -> f32 {
  let sampleColor = textureSampleLevel(
    heightTex, heightSamp, clamp(uv, vec2(0.0), vec2(1.0)), 4.0).rgb;
  let luminance = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
  return smoothstep(0.19, 0.76, luminance);
}

@vertex
fn vs(@location(0) meshUV: vec2<f32>) -> VSOut {
  var out: VSOut;
  let uv = vec2(mix(0.00466, 0.99534, meshUV.x), meshUV.y);
  let level = terrainShape(uv);
  let depthInput = max(T.depth.x * 0.5, 0.0);
  var authoredDepth: f32;
  if (depthInput <= 1.0) {
    authoredDepth = pow(depthInput, 1.55);
  } else {
    authoredDepth = 1.0 + pow(depthInput - 1.0, 1.15) * 4.5;
  }
  let height = (level - 0.5) * authoredDepth;
  var clip = meshUV * 2.0 - 1.0;
  clip += vec2(-0.020, 0.085) * height;
  let w = 1.0 - height * 0.075;
  let glZ = clamp(-height * 0.30, -0.9, 0.9);
  out.position = vec4(clip, (glZ + w) * 0.5, w);
  out.uv = uv;
  out.level = level;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let mapColor = textureSample(visualTex, visualSamp, in.uv).rgb;
  let terrainSize = vec2<f32>(textureDimensions(heightTex, 0));
  let texel = 1.0 / max(terrainSize, vec2(1.0));
  let level = in.level;
  let levelX = terrainShape(in.uv + vec2(texel.x * 2.0, 0.0));
  let levelY = terrainShape(in.uv + vec2(0.0, texel.y * 2.0));
  let gradient = vec2(levelX - level, levelY - level) / max(texel * 2.0, vec2(0.0001));
  let depthInput = max(T.depth.x * 0.5, 0.0);
  var authoredDepth: f32;
  if (depthInput <= 1.0) {
    authoredDepth = pow(depthInput, 1.55);
  } else {
    authoredDepth = 1.0 + pow(depthInput - 1.0, 1.15) * 4.5;
  }
  let normal = normalize(vec3(
    -gradient.x * 0.020 * authoredDepth,
    1.0,
    -gradient.y * 0.020 * authoredDepth));
  let sun = normalize(vec3(-0.54, 0.78, 0.32));
  let direct = max(dot(normal, sun), 0.0);
  let flatDirect = sun.y;
  let reliefLight = 1.0 + (direct - flatDirect) * (0.46 + authoredDepth * 0.10);
  let color = mapColor * clamp(reliefLight, 0.72, 1.28);
  return vec4(color, 1.0);
}
