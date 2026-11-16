import { Color3, Scene, ShaderMaterial } from '@babylonjs/core';
import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration';
import '@babylonjs/core/Shaders/ShadersInclude/instancesVertex';
import { AMBIENT_GLSL, AMBIENT_UNIFORMS } from './ambient';

/**
 * Per-instance data, delivered as instanced vertex buffers:
 *   instColor  = (r, g, b, vitality)     vitality 1 = alive, 0 = dead/greyed
 *   instParams = (phase, swimRate, hunger, flash)
 */
const VERTEX = `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute float swim;
attribute vec4 instColor;
attribute vec4 instParams;
#include<instancesDeclaration>
uniform mat4 viewProjection;
uniform float time;
uniform float swimAmp;
uniform float swimFreq;
uniform float waveLength;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vLocal;
varying vec3 vLocalN;
varying vec4 vColor;
varying vec4 vInstColor;
varying vec4 vInstParams;

void main() {
  #include<instancesVertex>
  float w = swim * swim;
  float phase = time * swimFreq * instParams.y + instParams.x;
  vec3 p = position;
  float wave = sin(phase - position.z * waveLength);
  p.x += wave * swimAmp * w;
  // Slight yaw of the tail section keeps the silhouette believable.
  p.z += (1.0 - cos(wave * swimAmp * w * 0.8)) * 0.4;
  vec4 wp = finalWorld * vec4(p, 1.0);
  vNormalW = normalize(mat3(finalWorld) * normal);
  vWorldPos = wp.xyz;
  vLocal = position;
  vLocalN = normal;
  vColor = color;
  vInstColor = instColor;
  vInstParams = instParams;
  gl_Position = viewProjection * wp;
}
`;

const FRAGMENT = `
precision highp float;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vLocal;
varying vec3 vLocalN;
varying vec4 vColor;
varying vec4 vInstColor;
varying vec4 vInstParams;
${AMBIENT_GLSL}
uniform vec3 bellyColor;
uniform float countershade;
uniform float sheen;

void main() {
  vec3 N = normalize(vNormalW + vec3(0.0, 0.00001, 0.0));
  if (!gl_FrontFacing) N = -N;
  vec3 L = normalize(-lightDir);
  vec3 V = normalize(cameraPosition - vWorldPos);

  vec3 body = vInstColor.rgb;
  float up = vLocalN.y;
  vec3 belly = mix(body, bellyColor, 0.42);
  vec3 back = body * (1.0 - countershade);
  vec3 skin = mix(belly, back, smoothstep(-0.3, 0.5, up));

  // Lateral line and faint scale shimmer.
  float line = (1.0 - smoothstep(0.0, 0.1, abs(vLocal.y - 0.02))) * (1.0 - smoothstep(0.2, 1.2, abs(vLocal.z)));
  skin = mix(skin, body * 1.25 + 0.06, line * 0.25);
  skin *= 0.96 + 0.04 * sin(vLocal.z * 70.0 + vLocal.y * 40.0);

  vec3 finCol = mix(body * 1.15 + 0.05, vec3(1.0, 0.62, 0.3), 0.18 * vColor.a);
  vec3 albedo = mix(skin, finCol, vColor.r);
  albedo = mix(albedo, vec3(0.012, 0.014, 0.02), vColor.g);

  // Dead fish fade towards grey.
  float lum = dot(albedo, vec3(0.3, 0.55, 0.15));
  albedo = mix(vec3(lum) * 0.8, albedo, vInstColor.a);

  float ndl = dot(N, L);
  float diffuse = max(ndl, 0.0) * 0.85 + 0.15 * (ndl * 0.5 + 0.5);
  vec3 col = albedo * (ambientColor * 1.5 + lightColor * diffuse * 0.8);

  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 40.0);
  col += lightColor * spec * sheen * (1.0 - vColor.r) * (1.0 - vColor.g);
  col += vColor.g * lightColor * pow(max(dot(N, H), 0.0), 120.0) * 1.5;

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += (fogColor * 1.4 + albedo * 0.15) * fres * 0.35;

  // Hunger: a red throb once a fish is properly starving.
  float hungry = smoothstep(0.55, 1.0, vInstParams.z);
  float pulse = 0.65 + 0.35 * sin(time * 5.0 + vInstParams.x);
  col += vec3(0.45, 0.04, 0.02) * hungry * pulse * (1.0 - vColor.g);
  // Eating / breeding flash.
  col += vec3(0.5, 0.45, 0.25) * vInstParams.w;
  // A faint bioluminescent glow once it's dark.
  col += body * 0.06 * (1.0 - daylight) * (1.0 - vColor.g);

  col *= mix(0.55, 1.0, vInstColor.a);
  gl_FragColor = vec4(applyFog(col, vWorldPos), 1.0);
}
`;

export interface CreatureStyle {
  swimAmp: number;
  swimFreq: number;
  waveLength: number;
  bellyColor: [number, number, number];
  countershade: number;
  sheen: number;
}

export function createCreatureMaterial(name: string, scene: Scene, style: CreatureStyle): ShaderMaterial {
  const mat = new ShaderMaterial(name, scene, { vertexSource: VERTEX, fragmentSource: FRAGMENT }, {
    attributes: ['position', 'normal', 'color', 'swim', 'instColor', 'instParams'],
    uniforms: [
      'world', 'viewProjection', 'swimAmp', 'swimFreq', 'waveLength', 'bellyColor', 'countershade', 'sheen',
      ...AMBIENT_UNIFORMS
    ]
  });
  mat.backFaceCulling = false;
  mat.setFloat('swimAmp', style.swimAmp);
  mat.setFloat('swimFreq', style.swimFreq);
  mat.setFloat('waveLength', style.waveLength);
  mat.setFloat('countershade', style.countershade);
  mat.setFloat('sheen', style.sheen);
  mat.setColor3('bellyColor', new Color3(...style.bellyColor));
  return mat;
}
