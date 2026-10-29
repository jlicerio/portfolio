struct ChairUniforms {
  vp: mat4x4<f32>,
  model: mat4x4<f32>,
  tint: vec4<f32>,
  fog: vec4<f32>,
};

@group(0) @binding(0) var<uniform> U: ChairUniforms;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
  @location(1) world: vec3<f32>,
};

@vertex
fn vs(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VSOut {
  var out: VSOut;
  let world = U.model * vec4(position, 1.0);
  out.position = U.vp * world;
  out.world = world.xyz;
  out.normal = normalize((U.model * vec4(normal, 0.0)).xyz);
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let normal = normalize(in.normal);
  let sun = normalize(vec3(-0.54, 0.78, 0.32));
  let view = normalize(vec3(0.0, 6.4, 6.2) - in.world);
  let halfDirection = normalize(sun + view);
  let direct = max(dot(normal, sun), 0.0);
  let specular = pow(max(dot(normal, halfDirection), 0.0), 48.0);
  let rim = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
  let ambient = 0.42 + 0.22 * normal.y;
  var color = U.tint.rgb * (ambient + direct * 1.05);
  color += vec3(0.96, 0.97, 0.94) * specular * 0.42;
  color += U.tint.rgb * rim * 0.34;
  color = min(color, vec3(1.0));
  let fogDistance = length(vec3(0.0, 6.4, 6.2) - in.world);
  let fogAmount = clamp(1.0 - exp(-pow(fogDistance * U.fog.w, 2.0)), 0.0, 1.0) * 0.94;
  color = mix(color, U.fog.rgb, fogAmount);
  return vec4(color, 1.0);
}
