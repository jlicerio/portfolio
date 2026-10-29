struct PostUniforms {
  params: vec4<f32>,      // x = glow, y = grain, z = vignette, w = time
  resolution: vec4<f32>,  // xy = full resolution
};

@group(0) @binding(0) var<uniform> U: PostUniforms;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var bloomTexture: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) index: u32) -> VSOut {
  var corners = array<vec2<f32>, 3>(
    vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  var out: VSOut;
  let corner = corners[index];
  out.position = vec4(corner, 0.0, 1.0);
  out.uv = corner * 0.5 + 0.5;
  return out;
}

fn hash21(p: vec2<f32>) -> f32 {
  var q = fract(p * vec2(127.1, 311.7));
  q += dot(q, q.yx + 33.33);
  return fract(q.x * q.y);
}

@fragment
fn bloom(in: VSOut) -> @location(0) vec4<f32> {
  let texel = 3.0 / U.resolution.xy;
  let flipped = vec2<f32>(in.uv.x, 1.0 - in.uv.y);
  var sum = vec3(0.0);
  var weight = 0.0;
  for (var y = -5; y <= 5; y += 1) {
    for (var x = -5; x <= 5; x += 1) {
      let offset = vec2<f32>(f32(x), f32(y)) * texel;
      let sample = textureSample(sceneTexture, linearSampler, flipped + offset).rgb;
      let luminance = dot(sample, vec3(0.2126, 0.7152, 0.0722));
      let mask = smoothstep(0.52, 0.92, luminance);
      let gaussian = exp(-(f32(x * x + y * y)) / 12.0);
      sum += sample * mask * gaussian;
      weight += gaussian;
    }
  }
  let glow = sum / max(weight, 0.0001);
  return vec4(glow, 1.0);
}

@fragment
fn composite(in: VSOut) -> @location(0) vec4<f32> {
  let flipped = vec2<f32>(in.uv.x, 1.0 - in.uv.y);
  let base = textureSample(sceneTexture, linearSampler, flipped).rgb;
  let glow = textureSample(bloomTexture, linearSampler, flipped).rgb;
  var color = base + glow * U.params.x;

  let centered = (in.uv - vec2(0.5, 0.5)) * vec2(1.06, 0.94);
  let vignette = smoothstep(0.92, 0.28, length(centered));
  color *= mix(1.0, vignette, U.params.z);

  let grain = hash21(in.uv * U.resolution.xy + U.params.w * 91.7) - 0.5;
  color += grain * U.params.y;

  // Film response: lift the toe, roll the shoulder.
  color = color / (color + vec3(0.70)) * 1.14;
  color = clamp(color, vec3(0.0), vec3(1.0));
  return vec4(color, 1.0);
}
