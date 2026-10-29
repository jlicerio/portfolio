struct SkyUniforms {
  params: vec4<f32>,  // x = horizon height in screen space
};

@group(0) @binding(0) var<uniform> U: SkyUniforms;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

fn hash11(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453);
}

fn noise1(x: f32) -> f32 {
  let i = floor(x);
  let f = fract(x);
  let w = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), w);
}

fn fbm1(x0: f32) -> f32 {
  var p = x0;
  var sum = 0.0;
  var amplitude = 0.5;
  for (var i = 0; i < 4; i += 1) {
    sum += amplitude * noise1(p);
    p = p * 2.07 + 11.3;
    amplitude *= 0.5;
  }
  return sum;
}

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

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let horizon = U.params.x;
  let uv = in.uv;
  let skyTop = vec3(0.043, 0.216, 0.596);
  let skyMid = vec3(0.294, 0.549, 0.851);
  let skyHaze = vec3(0.784, 0.878, 0.969);

  var color = mix(skyHaze, skyMid, smoothstep(horizon, horizon + 0.30, uv.y));
  color = mix(color, skyTop, smoothstep(horizon + 0.22, 1.0, uv.y));
  let glow = smoothstep(0.62, 0.0, distance(uv, vec2(0.26, 1.04)));
  color += vec3(0.15, 0.12, 0.05) * glow * 0.9;

  let x = uv.x * 3.2;
  let farHills = horizon + (fbm1(x + 2.0) - 0.5) * 0.115 + 0.020;
  let nearHills = horizon + (fbm1(x * 1.90 + 9.0) - 0.5) * 0.055 + 0.004;
  let farTone = vec3(0.502, 0.627, 0.549);
  let nearTone = vec3(0.302, 0.463, 0.259);

  if (uv.y < farHills) {
    let haze = smoothstep(farHills - 0.06, farHills, uv.y);
    let depthShade = 0.82 + 0.34 * smoothstep(horizon - 0.10, farHills, uv.y);
    color = mix(farTone * depthShade, skyHaze, haze * 0.55);
  }
  if (uv.y < nearHills) {
    let haze = smoothstep(nearHills - 0.05, nearHills, uv.y);
    let mottle = fbm1(uv.x * 16.0) - 0.5;
    let depthShade = 0.80 + 0.40 * smoothstep(horizon - 0.12, nearHills, uv.y);
    color = mix(nearTone * depthShade * (1.0 + mottle * 0.22), skyHaze, haze * 0.30);
  }
  return vec4(color, 1.0);
}
