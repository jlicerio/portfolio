struct U {
  time: f32,
  pad: f32,
  res: vec2<f32>,
};

@group(0) @binding(0) var<uniform> u: U;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

fn hash2(p: vec2<f32>) -> f32 {
  var q = fract(p * vec2(127.1, 311.7));
  q += dot(q, q.yx + 33.33);
  return fract(q.x * q.y);
}

fn vnoise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash2(i);
  let b = hash2(i + vec2(1.0, 0.0));
  let c = hash2(i + vec2(0.0, 1.0));
  let d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

fn fbm(p0: vec2<f32>) -> f32 {
  var p = p0;
  var amplitude = 0.5;
  var sum = 0.0;
  for (var i = 0; i < 4; i += 1) {
    sum += amplitude * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
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
  out.pos = vec4(corner, 0.0, 1.0);
  out.uv = corner * 0.5 + 0.5;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let t = u.time * 0.028;
  let aspect = u.res.x / max(u.res.y, 1.0);
  var uv = in.uv * 2.0 - 1.0;
  uv.x *= aspect;
  let p = uv * 1.05;

  let warp = vec2(
    fbm(p * 0.8 + vec2(0.0, t)),
    fbm(p * 0.8 + vec2(5.2, 1.3) - t));
  let field = fbm(p + warp * 1.5 + vec2(t * 0.4, 0.0));

  let bands = field * 16.0;
  let edge = abs(fract(bands) - 0.5);
  let antialias = max(fwidth(bands) * 0.75, 0.0001);
  let lineWidth = 0.010;
  var ink = 1.0 - smoothstep(lineWidth, lineWidth + antialias, edge);
  ink *= 0.80;

  let vignette = smoothstep(2.0, 0.3, length(uv * vec2(0.75, 0.95)));
  ink *= 0.45 + 0.55 * vignette;

  let base = vec3(0.031, 0.031, 0.035);
  var color = base + vec3(0.90, 0.89, 0.86) * ink;
  color *= 1.0 - 0.22 * (1.0 - vignette);
  return vec4(color, 1.0);
}
