import {
  Color3, Matrix, Mesh, Quaternion, Scene, ShaderMaterial, Vector3, VertexData
} from '@babylonjs/core';
import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration';
import '@babylonjs/core/Shaders/ShadersInclude/instancesVertex';
import { AMBIENT_GLSL, AMBIENT_UNIFORMS, AmbienceBinder } from '../render/ambient';
import { fbm, seededRandom, smoothstep } from './noise';
import { terrainHeight } from './terrain_height';

const VERTEX = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec4 instColor;
#include<instancesDeclaration>
uniform mat4 viewProjection;
uniform float time;
uniform float swayAmp;
uniform float swaySpeed;
varying vec2 vUV;
varying vec3 vWorldPos;
varying vec4 vInst;

void main() {
  #include<instancesVertex>
  float h = uv.y;
  vec4 wp = finalWorld * vec4(position, 1.0);
  float ph = instColor.a * 6.2831;
  float s1 = sin(time * swaySpeed + wp.x * 0.15 + wp.z * 0.11 + ph);
  float s2 = sin(time * swaySpeed * 1.7 + ph * 2.0 + wp.x * 0.3);
  float bend = h * h;
  wp.x += (s1 * swayAmp + s2 * swayAmp * 0.35) * bend;
  wp.z += (s2 * 0.6 - s1 * 0.25) * swayAmp * bend;
  vWorldPos = wp.xyz;
  vUV = uv;
  vInst = instColor;
  gl_Position = viewProjection * wp;
}
`;

const FRAGMENT = `
precision highp float;
varying vec2 vUV;
varying vec3 vWorldPos;
varying vec4 vInst;
${AMBIENT_GLSL}

void main() {
  float h = vUV.y;
  vec3 base = mix(vInst.rgb * 0.4, vInst.rgb * 1.2, h);
  vec3 L = normalize(-lightDir);
  float lit = 0.5 + 0.5 * abs(L.y);
  vec3 col = base * (ambientColor * 1.7 + lightColor * lit * 0.6);
  // Light bleeding through thin fronds towards the tips.
  col += vInst.rgb * lightColor * 0.22 * h * daylight;
  float edge = 1.0 - abs(vUV.x * 2.0 - 1.0);
  col *= 0.8 + 0.2 * edge;
  gl_FragColor = vec4(applyFog(col, vWorldPos), 1.0);
}
`;

interface FieldOptions {
  name: string;
  count: number;
  minHeight: number;
  maxHeight: number;
  width: number;
  segments: number;
  sway: number;
  swaySpeed: number;
  palette: Color3[];
  seed: number;
  /** Noise threshold for patchiness: higher means sparser clumps. */
  patchiness: number;
  maxSlope: number;
  maxAltitude: number;
  spread: number;
}

function bladeGeometry(segments: number, width: number): VertexData {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let k = 0; k <= segments; k++) {
    const t = k / segments;
    const half = width * 0.5 * (1 - Math.pow(t, 1.6) * 0.92);
    const curve = t * t * 0.18;
    positions.push(-half, t, curve, half, t, curve);
    uvs.push(0, t, 1, t);
    if (k < segments) {
      const a = k * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const data = new VertexData();
  data.positions = positions;
  data.uvs = uvs;
  data.indices = indices;
  return data;
}

export class Flora {
  private materials: ShaderMaterial[] = [];

  constructor(private scene: Scene, private binder: AmbienceBinder) {
    this.field({
      name: 'kelp', count: 260, minHeight: 6, maxHeight: 17, width: 1.1, segments: 12,
      sway: 1.3, swaySpeed: 0.75, seed: 11, patchiness: 0.55, maxSlope: 0.9, maxAltitude: 5.5, spread: 54,
      palette: [new Color3(0.12, 0.38, 0.1), new Color3(0.2, 0.45, 0.08), new Color3(0.32, 0.46, 0.1), new Color3(0.08, 0.34, 0.2)]
    });
    this.field({
      name: 'seagrass', count: 2600, minHeight: 0.9, maxHeight: 2.6, width: 0.22, segments: 5,
      sway: 0.35, swaySpeed: 1.2, seed: 29, patchiness: 0.5, maxSlope: 0.7, maxAltitude: 6, spread: 56,
      palette: [new Color3(0.18, 0.5, 0.14), new Color3(0.3, 0.58, 0.2), new Color3(0.14, 0.42, 0.26), new Color3(0.42, 0.55, 0.18)]
    });
  }

  private field(o: FieldOptions) {
    const rand = seededRandom(o.seed);
    const mesh = new Mesh(o.name, this.scene);
    bladeGeometry(o.segments, o.width).applyToMesh(mesh);

    const material = new ShaderMaterial(`${o.name}Mat`, this.scene, { vertexSource: VERTEX, fragmentSource: FRAGMENT }, {
      attributes: ['position', 'uv', 'instColor'],
      uniforms: ['world', 'viewProjection', 'swayAmp', 'swaySpeed', ...AMBIENT_UNIFORMS]
    });
    material.backFaceCulling = false;
    material.setFloat('swayAmp', o.sway);
    material.setFloat('swaySpeed', o.swaySpeed);
    this.binder.add(material);
    this.materials.push(material);
    mesh.material = material;

    const matrices = new Float32Array(o.count * 16);
    const colors = new Float32Array(o.count * 4);
    let placed = 0;
    let attempts = 0;
    const m = new Matrix();
    while (placed < o.count && attempts < o.count * 40) {
      attempts++;
      const x = (rand() - 0.5) * 2 * o.spread;
      const z = (rand() - 0.5) * 2 * o.spread;
      const y = terrainHeight(x, z);
      if (y > o.maxAltitude) continue;
      const slope = Math.hypot(terrainHeight(x + 1, z) - y, terrainHeight(x, z + 1) - y);
      if (slope > o.maxSlope) continue;
      const patch = fbm(x * 0.055, z * 0.055, 3, o.seed);
      if (patch < o.patchiness && rand() > 0.04) continue;

      const height = o.minHeight + rand() * (o.maxHeight - o.minHeight) * (0.6 + 0.4 * smoothstep(o.patchiness, 0.8, patch));
      const widthScale = 0.8 + rand() * 0.5;
      Matrix.ComposeToRef(
        new Vector3(widthScale, height, widthScale),
        Quaternion.RotationYawPitchRoll(rand() * Math.PI * 2, 0, 0),
        new Vector3(x, y - 0.1, z),
        m
      );
      m.copyToArray(matrices, placed * 16);
      const c = o.palette[Math.floor(rand() * o.palette.length)];
      const jitter = 0.85 + rand() * 0.3;
      colors.set([c.r * jitter, c.g * jitter, c.b * jitter, rand()], placed * 4);
      placed++;
    }

    mesh.thinInstanceSetBuffer('matrix', matrices.subarray(0, placed * 16), 16, true);
    mesh.thinInstanceSetBuffer('instColor', colors.subarray(0, placed * 4), 4, true);
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.isPickable = false;
  }
}
