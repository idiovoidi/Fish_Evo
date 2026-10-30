import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, VertexData } from '@babylonjs/core';
import { seededRandom, valueNoise } from './noise';
import { terrainHeight } from './terrain_height';

function lumpyRock(scene: Scene, seed: number, flatten: number): Mesh {
  const rock = MeshBuilder.CreateIcoSphere('rock', { radius: 1, subdivisions: 4, flat: false, updatable: true }, scene);
  const pos = rock.getVerticesData('position')!;
  const colors = new Float32Array((pos.length / 3) * 4);
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i];
    const y = pos[i + 1];
    const z = pos[i + 2];
    const n = valueNoise(x * 1.7 + seed, y * 1.7 + z * 1.3, seed) * 0.5
      + valueNoise(x * 4 + seed, z * 4 - y * 3, seed + 3) * 0.2;
    const r = 0.72 + n;
    pos[i] = x * r;
    pos[i + 1] = y * r * flatten;
    pos[i + 2] = z * r;
    const moss = Math.max(0, y) * 0.35;
    const g = 0.78 + valueNoise(x * 6, z * 6, seed) * 0.3;
    colors.set([(0.42 - moss * 0.2) * g, (0.4 + moss * 0.15) * g, (0.38 - moss * 0.05) * g, 1], (i / 3) * 4);
  }
  rock.updateVerticesData('position', pos);
  const normals = new Float32Array(pos.length);
  VertexData.ComputeNormals(pos, rock.getIndices()!, normals);
  rock.updateVerticesData('normal', normals);
  rock.setVerticesData('color', colors);
  return rock;
}

/** Boulders and pebbles scattered over the seabed, with big ones ringing the arena. */
export class Rocks {
  readonly meshes: Mesh[] = [];

  constructor(scene: Scene) {
    const rand = seededRandom(909);
    const material = new StandardMaterial('rockMat', scene);
    material.diffuseColor = Color3.White();
    material.specularColor = new Color3(0.05, 0.05, 0.05);

    const templates = [1, 2, 3].map((i) => {
      const t = lumpyRock(scene, i * 13, 0.6 + i * 0.12);
      t.material = material;
      t.isVisible = false;
      t.isPickable = false;
      this.meshes.push(t);
      return t;
    });

    const place = (count: number, minR: number, maxR: number, minS: number, maxS: number) => {
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const r = minR + rand() * (maxR - minR);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const s = minS + rand() * (maxS - minS);
        const inst = templates[Math.floor(rand() * templates.length)].createInstance(`rock_${this.meshes.length}`);
        inst.position.set(x, terrainHeight(x, z) + s * 0.12, z);
        inst.rotation.set(rand() * 0.4, rand() * Math.PI * 2, rand() * 0.4);
        inst.scaling.set(s * (0.8 + rand() * 0.5), s * (0.7 + rand() * 0.5), s * (0.8 + rand() * 0.5));
        inst.isPickable = false;
      }
    };

    place(55, 6, 58, 0.25, 0.9); // pebbles
    place(22, 8, 52, 1.0, 2.6); // boulders
    place(16, 46, 62, 3.5, 8.5); // arena rim
  }
}
