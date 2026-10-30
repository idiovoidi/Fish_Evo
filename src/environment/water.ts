import {
  Color3, Color4, DynamicTexture, MeshBuilder, ParticleSystem, Scene, StandardMaterial,
  Texture, TransformNode, Vector3
} from '@babylonjs/core';
import { seededRandom } from './noise';
import { terrainHeight, WATER_LEVEL } from './terrain_height';

function softDot(scene: Scene, size = 64): DynamicTexture {
  const tex = new DynamicTexture('softDot', { width: size, height: size }, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  tex.update();
  tex.hasAlpha = true;
  return tex;
}

function shaftTexture(scene: Scene): DynamicTexture {
  const w = 64;
  const h = 256;
  const tex = new DynamicTexture('shaftTex', { width: w, height: h }, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const along = 1 - y / (h - 1); // 1 at the surface, 0 at the bottom
    for (let x = 0; x < w; x++) {
      const across = 1 - Math.abs((x / (w - 1)) * 2 - 1);
      const a = Math.pow(across, 2.2) * (0.12 + 0.88 * Math.pow(along, 1.4));
      const o = (y * w + x) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
      img.data[o + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.update();
  tex.hasAlpha = true;
  return tex;
}

interface Shaft {
  root: TransformNode;
  material: StandardMaterial;
  phase: number;
  baseX: number;
}

/** Surface shimmer, light shafts, marine snow and bubble vents. */
export class WaterEffects {
  private surfaceMaterial: StandardMaterial;
  private shafts: Shaft[] = [];
  private snow: ParticleSystem;
  private vents: ParticleSystem[] = [];

  constructor(private scene: Scene, causticSource: Texture) {
    const dot = softDot(scene);

    // Surface seen from below.
    const surface = MeshBuilder.CreateGround('waterSurface', { width: 700, height: 700 }, scene);
    surface.position.y = WATER_LEVEL;
    surface.isPickable = false;
    const mat = new StandardMaterial('waterSurfaceMat', scene);
    const tex = causticSource.clone() as Texture;
    tex.uScale = tex.vScale = 22;
    mat.diffuseTexture = tex;
    mat.disableLighting = true;
    mat.emissiveColor = new Color3(0.4, 0.75, 0.9);
    mat.alpha = 0.5;
    mat.backFaceCulling = false;
    surface.material = mat;
    this.surfaceMaterial = mat;

    this.buildShafts();

    // Drifting plankton / marine snow.
    this.snow = new ParticleSystem('marineSnow', 900, scene);
    this.snow.particleTexture = dot;
    this.snow.createBoxEmitter(new Vector3(-0.15, -0.12, -0.1), new Vector3(0.15, 0.05, 0.1),
      new Vector3(-62, 1, -62), new Vector3(62, WATER_LEVEL - 1, 62));
    this.snow.minLifeTime = 10;
    this.snow.maxLifeTime = 18;
    this.snow.emitRate = 70;
    this.snow.minSize = 0.07;
    this.snow.maxSize = 0.2;
    this.snow.minEmitPower = 0.3;
    this.snow.maxEmitPower = 0.8;
    this.snow.color1 = new Color4(0.75, 0.92, 1, 0.55);
    this.snow.color2 = new Color4(0.5, 0.8, 0.95, 0.35);
    this.snow.colorDead = new Color4(0.5, 0.8, 0.95, 0);
    this.snow.blendMode = ParticleSystem.BLENDMODE_ADD;
    this.snow.preWarmCycles = 160;
    this.snow.preWarmStepOffset = 8;
    this.snow.emitter = Vector3.Zero();
    this.snow.start();

    // Bubble columns rising from a few vents.
    const rand = seededRandom(404);
    for (let i = 0; i < 4; i++) {
      const x = (rand() - 0.5) * 70;
      const z = (rand() - 0.5) * 70;
      const ps = new ParticleSystem(`vent${i}`, 220, scene);
      ps.particleTexture = dot;
      ps.emitter = new Vector3(x, terrainHeight(x, z) + 0.2, z);
      ps.minEmitBox = new Vector3(-0.3, 0, -0.3);
      ps.maxEmitBox = new Vector3(0.3, 0, 0.3);
      ps.direction1 = new Vector3(-0.15, 1, -0.15);
      ps.direction2 = new Vector3(0.15, 1, 0.15);
      ps.minEmitPower = 2.4;
      ps.maxEmitPower = 3.6;
      ps.minLifeTime = 5;
      ps.maxLifeTime = 8;
      ps.emitRate = 22;
      ps.minSize = 0.12;
      ps.maxSize = 0.42;
      ps.gravity = new Vector3(0, 0.4, 0);
      ps.color1 = new Color4(0.85, 0.97, 1, 0.55);
      ps.color2 = new Color4(0.7, 0.9, 1, 0.35);
      ps.colorDead = new Color4(0.7, 0.9, 1, 0);
      ps.blendMode = ParticleSystem.BLENDMODE_ADD;
      ps.preWarmCycles = 100;
      ps.preWarmStepOffset = 6;
      ps.start();
      this.vents.push(ps);
    }
  }

  private buildShafts() {
    const rand = seededRandom(77);
    const tex = shaftTexture(this.scene);
    const count = 11;
    for (let i = 0; i < count; i++) {
      const root = new TransformNode(`shaft${i}`, this.scene);
      const x = (rand() - 0.5) * 120;
      const z = (rand() - 0.5) * 120;
      root.position.set(x, WATER_LEVEL - 19, z);
      root.rotation.z = 0.2;
      root.rotation.x = 0.1;
      const width = 6 + rand() * 12;

      const material = new StandardMaterial(`shaftMat${i}`, this.scene);
      material.diffuseTexture = tex;
      material.useAlphaFromDiffuseTexture = true;
      material.emissiveColor = new Color3(0.55, 0.9, 1);
      material.disableLighting = true;
      material.alphaMode = 1; // additive
      material.backFaceCulling = false;
      material.fogEnabled = false;
      material.disableDepthWrite = true;

      for (let k = 0; k < 2; k++) {
        const plane = MeshBuilder.CreatePlane(`shaft${i}_${k}`, { width, height: 44 }, this.scene);
        plane.parent = root;
        plane.rotation.y = (k * Math.PI) / 2;
        plane.material = material;
        plane.isPickable = false;
      }
      this.shafts.push({ root, material, phase: rand() * 10, baseX: x });
    }
  }

  update(time: number, daylight: number, fogColor: Color3) {
    for (const s of this.shafts) {
      const pulse = 0.65 + 0.35 * Math.sin(time * 0.35 + s.phase);
      s.material.alpha = 0.16 * daylight * pulse;
      s.root.rotation.z = 0.2 + Math.sin(time * 0.12 + s.phase) * 0.04;
      s.root.position.x = s.baseX + Math.sin(time * 0.05 + s.phase) * 4;
    }
    const tex = this.surfaceMaterial.diffuseTexture as Texture;
    tex.uOffset = time * 0.006;
    tex.vOffset = time * 0.004;
    const k = 0.25 + 0.75 * daylight;
    this.surfaceMaterial.emissiveColor.set(0.4 * k + fogColor.r * 0.5, 0.75 * k + fogColor.g * 0.3, 0.9 * k + fogColor.b * 0.3);
  }

  setParticlesEnabled(enabled: boolean) {
    for (const ps of [this.snow, ...this.vents]) {
      if (enabled) ps.start(); else ps.stop();
    }
  }
}
