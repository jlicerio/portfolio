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

fn hash1(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453);
}

fn noise1(x: f32) -> f32 {
  let i = floor(x);
  let f = fract(x);
  let w = f * f * (3.0 - 2.0 * f);
  return mix(hash1(i), hash1(i + 1.0), w);
}

fn ridge(x: f32) -> f32 {
  var sum = 0.0;
  var amplitude = 0.5;
  var p = x;
  for (var i = 0; i < 5; i += 1) {
    sum += amplitude * noise1(p);
    p = p * 2.11 + 13.7;
    amplitude *= 0.52;
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
  let columns = 260.0;
  let t = u.time * 0.16;
  let column = floor(in.uv.x * columns);
  let center = (column + 0.5) / columns;
  let offset = fract(in.uv.x * columns) - 0.5;

  let drift = t + column * 0.0021;
  let height = 0.10 + 0.84 * ridge(center * 5.4 + drift);
  let side = 1.0 - smoothstep(0.20, 0.40, abs(offset));
  let top = 1.0 - smoothstep(height - 0.012, height, in.uv.y);
  let tip = smoothstep(height - 0.22, height, in.uv.y);

  var ink = side * top;
  ink *= 0.30 + 0.70 * (1.0 - tip);
  ink *= 0.60 + 0.40 * height;

  let base = vec3(0.031, 0.031, 0.035);
  let color = base + vec3(0.86, 0.88, 0.82) * ink;
  return vec4(color, 1.0);
}
