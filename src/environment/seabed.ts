import {
  Color3, DynamicTexture, Mesh, Scene, StandardMaterial, Texture, VertexData
} from '@babylonjs/core';
import { fbm, lerp, smoothstep } from './noise';
import { terrainHeight } from './terrain_height';

const SIZE = 240;
const SUBDIVISIONS = 200;

/** Procedural, offline seabed: sand dunes, rocky slopes, animated caustics. */
export class Seabed {
  readonly mesh: Mesh;
  private causticLayers: { material: StandardMaterial; speed: [number, number] }[] = [];
  readonly causticTexture: DynamicTexture;

  constructor(private scene: Scene) {
    this.mesh = this.buildTerrain();
    this.causticTexture = this.buildCausticTexture();
    this.buildCausticOverlay(0, 9, [0.011, 0.007]);
    this.buildCausticOverlay(1, 5.5, [-0.006, 0.01]);
  }

  private buildTerrain(): Mesh {
    const verts = SUBDIVISIONS + 1;
    const positions = new Float32Array(verts * verts * 3);
    const uvs = new Float32Array(verts * verts * 2);
    const colors = new Float32Array(verts * verts * 4);
    const indices: number[] = [];
    const step = SIZE / SUBDIVISIONS;

    for (let j = 0; j < verts; j++) {
      for (let i = 0; i < verts; i++) {
        const x = -SIZE / 2 + i * step;
        const z = -SIZE / 2 + j * step;
        const y = terrainHeight(x, z);
        const v = j * verts + i;
        positions.set([x, y, z], v * 3);
        uvs.set([i / SUBDIVISIONS, j / SUBDIVISIONS], v * 2);

        const slope = Math.hypot(terrainHeight(x + 1, z) - y, terrainHeight(x, z + 1) - y);
        const grain = fbm(x * 0.35, z * 0.35, 3, 9);
        const heightT = smoothstep(0.3, 8, y);
        const sand: [number, number, number] = [
          lerp(0.46, 0.9, heightT), lerp(0.42, 0.8, heightT), lerp(0.34, 0.58, heightT)
        ];
        const rockMix = Math.min(1, smoothstep(0.7, 1.8, slope) * 0.8 + smoothstep(14, 30, y) * 0.6);
        const g = 0.82 + grain * 0.3;
        colors.set([
          lerp(sand[0], 0.4, rockMix) * g,
          lerp(sand[1], 0.5, rockMix) * g,
          lerp(sand[2], 0.52, rockMix) * g,
          1
        ], v * 4);
      }
    }
    for (let j = 0; j < SUBDIVISIONS; j++) {
      for (let i = 0; i < SUBDIVISIONS; i++) {
        const a = j * verts + i;
        const b = a + 1;
        const c = a + verts;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const normals = new Float32Array(positions.length);
    VertexData.ComputeNormals(positions, indices, normals);

    const mesh = new Mesh('seabed', this.scene);
    const data = new VertexData();
    data.positions = positions;
    data.indices = indices;
    data.normals = normals;
    data.uvs = uvs;
    data.colors = colors;
    data.applyToMesh(mesh);

    const mat = new StandardMaterial('seabedMat', this.scene);
    mat.diffuseColor = Color3.White();
    mat.specularColor = new Color3(0.04, 0.05, 0.06);
    mat.ambientColor = new Color3(0.5, 0.55, 0.6);
    mesh.material = mat;
    mesh.receiveShadows = true;
    mesh.isPickable = false;
    return mesh;
  }

  /** Tileable caustic web, evaluated once on the CPU. */
  private buildCausticTexture(): DynamicTexture {
    const N = 256;
    const tex = new DynamicTexture('causticTex', { width: N, height: N }, this.scene, true);
    const ctx = tex.getContext() as CanvasRenderingContext2D;
    const img = ctx.createImageData(N, N);
    const TAU = Math.PI * 2;
    const ITER = 5;
    for (let py = 0; py < N; py++) {
      for (let px = 0; px < N; px++) {
        const p0x = ((px / N) * TAU) % TAU - 250;
        const p0y = ((py / N) * TAU) % TAU - 250;
        let ix = p0x;
        let iy = p0y;
        let c = 1;
        const inten = 0.005;
        for (let n = 0; n < ITER; n++) {
          const t = 1.7 * (1 - 3.5 / (n + 1));
          ix = p0x + Math.cos(t - ix) + Math.sin(t + iy);
          iy = p0y + Math.sin(t - iy) + Math.cos(t + ix);
          c += 1 / Math.hypot(p0x / (Math.sin(ix + t) / inten), p0y / (Math.cos(iy + t) / inten));
        }
        c /= ITER;
        c = 1.17 - Math.pow(c, 1.4);
        const v = Math.min(1, Math.pow(Math.abs(c), 8));
        const o = (py * N + px) * 4;
        img.data[o] = 150 * v + 20;
        img.data[o + 1] = 235 * v + 30;
        img.data[o + 2] = 255 * v + 40;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    tex.update();
    tex.wrapU = tex.wrapV = Texture.WRAP_ADDRESSMODE;
    return tex;
  }

  /**
   * Additive overlay hugging the seabed's shape. Vertex colours act as a
   * distance mask so caustics fade out instead of tiling to the horizon.
   */
  private buildCausticOverlay(layer: number, tiling: number, speed: [number, number]) {
    const positions = this.mesh.getVerticesData('position')!;
    const uvs = this.mesh.getVerticesData('uv')!;
    const indices = this.mesh.getIndices()!;
    const count = positions.length / 3;
    const colors = new Float32Array(count * 4);
    const lifted = new Float32Array(positions);
    for (let v = 0; v < count; v++) {
      const d = Math.hypot(positions[v * 3], positions[v * 3 + 2]);
      const mask = 1 - smoothstep(40, 85, d);
      colors.set([mask, mask, mask, 1], v * 4);
      lifted[v * 3 + 1] += 0.04 + layer * 0.02;
    }
    const mesh = new Mesh(`caustics${layer}`, this.scene);
    const data = new VertexData();
    data.positions = lifted;
    data.indices = indices;
    data.uvs = uvs;
    data.colors = colors;
    data.applyToMesh(mesh);

    const mat = new StandardMaterial(`causticsMat${layer}`, this.scene);
    const tex = this.causticTexture.clone();
    tex.wrapU = tex.wrapV = Texture.WRAP_ADDRESSMODE;
    tex.uScale = tex.vScale = tiling;
    mat.diffuseTexture = tex;
    mat.disableLighting = true;
    mat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    mat.alphaMode = 1; // ALPHA_ADD
    mat.alpha = 0.999;
    mat.fogEnabled = false;
    mat.zOffset = -2;
    mesh.material = mat;
    mesh.isPickable = false;
    this.causticLayers.push({ material: mat, speed });
  }

  /** Called every frame. `intensity` is 0 at night and ~1 at noon. */
  update(time: number, intensity: number) {
    for (const layer of this.causticLayers) {
      const tex = layer.material.diffuseTexture as Texture;
      tex.uOffset = time * layer.speed[0];
      tex.vOffset = time * layer.speed[1];
      const k = 0.55 * intensity;
      layer.material.emissiveColor.set(k, k, k);
    }
  }
}
