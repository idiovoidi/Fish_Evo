import {
  Color3, Mesh, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3, VertexData
} from '@babylonjs/core';
import { lerp, seededRandom } from './noise';
import { terrainHeight } from './terrain_height';

type Rand = () => number;

/** Bake a base→tip vertical gradient into vertex colours. */
function paint(mesh: Mesh, base: Color3, tip: Color3) {
  const pos = mesh.getVerticesData('position')!;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    minY = Math.min(minY, pos[i]);
    maxY = Math.max(maxY, pos[i]);
  }
  const colors = new Float32Array((pos.length / 3) * 4);
  for (let v = 0; v < pos.length / 3; v++) {
    const t = (pos[v * 3 + 1] - minY) / Math.max(0.001, maxY - minY);
    colors.set([lerp(base.r, tip.r, t), lerp(base.g, tip.g, t), lerp(base.b, tip.b, t), 1], v * 4);
  }
  mesh.setVerticesData('color', colors);
}

function branching(rand: Rand, scene: Scene): Mesh {
  const parts: Mesh[] = [];
  const up = Vector3.Up();
  const grow = (origin: Vector3, dir: Vector3, length: number, radius: number, depth: number) => {
    const seg = MeshBuilder.CreateCylinder('b', {
      height: length, diameterBottom: radius * 2, diameterTop: radius * 1.5, tessellation: 6
    }, scene);
    const axis = Vector3.Cross(up, dir);
    const angle = Math.acos(Math.min(1, Math.max(-1, Vector3.Dot(up, dir))));
    seg.rotationQuaternion = axis.lengthSquared() < 1e-6
      ? Quaternion.Identity()
      : Quaternion.RotationAxis(axis.normalize(), angle);
    const end = origin.add(dir.scale(length));
    seg.position = origin.add(end).scale(0.5);
    parts.push(seg);
    if (depth <= 0) {
      const tip = MeshBuilder.CreateSphere('t', { diameter: radius * 2.2, segments: 4 }, scene);
      tip.position = end;
      parts.push(tip);
      return;
    }
    const kids = 2 + (rand() < 0.45 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const spread = 0.55 + rand() * 0.35;
      const d = dir.add(new Vector3((rand() - 0.5) * 2 * spread, 0.25 + rand() * 0.3, (rand() - 0.5) * 2 * spread)).normalize();
      grow(end, d, length * (0.68 + rand() * 0.12), radius * 0.72, depth - 1);
    }
  };
  grow(Vector3.Zero(), up, 0.7, 0.14, 3);
  return Mesh.MergeMeshes(parts, true, true)!;
}

function brain(rand: Rand, scene: Scene): Mesh {
  const mesh = MeshBuilder.CreateSphere('brain', { diameter: 2.2, segments: 28, updatable: true }, scene);
  const pos = mesh.getVerticesData('position')!;
  const phase = rand() * 10;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i];
    const y = pos[i + 1];
    const z = pos[i + 2];
    const ridge = Math.sin(x * 11 + Math.sin(z * 7 + phase) * 2.2) * 0.5 + 0.5;
    const r = 1 + 0.07 * ridge;
    pos[i] = x * r * 1.0;
    pos[i + 1] = Math.max(-0.1, y * 0.6 * r);
    pos[i + 2] = z * r;
  }
  mesh.updateVerticesData('position', pos);
  const normals = new Float32Array(pos.length);
  VertexData.ComputeNormals(pos, mesh.getIndices()!, normals);
  mesh.updateVerticesData('normal', normals);
  return mesh;
}

function table(rand: Rand, scene: Scene): Mesh {
  const parts: Mesh[] = [];
  const stalk = MeshBuilder.CreateCylinder('s', { height: 0.9, diameterTop: 0.35, diameterBottom: 0.6, tessellation: 8 }, scene);
  stalk.position.y = 0.45;
  parts.push(stalk);
  const tiers = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < tiers; i++) {
    const d = 2.8 - i * 0.7 + rand() * 0.4;
    const disc = MeshBuilder.CreateCylinder('d', { height: 0.1, diameterTop: d, diameterBottom: d * 0.82, tessellation: 24 }, scene);
    disc.position.y = 0.9 + i * 0.28;
    disc.rotation.z = (rand() - 0.5) * 0.12;
    disc.rotation.x = (rand() - 0.5) * 0.12;
    parts.push(disc);
  }
  return Mesh.MergeMeshes(parts, true, true)!;
}

function pipes(rand: Rand, scene: Scene): Mesh {
  const parts: Mesh[] = [];
  const n = 6 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const h = 0.8 + rand() * 1.5;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.55;
    const tube = MeshBuilder.CreateCylinder('p', { height: h, diameterTop: 0.2 + rand() * 0.12, diameterBottom: 0.32, tessellation: 10 }, scene);
    tube.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    tube.rotation.x = (rand() - 0.5) * 0.35;
    tube.rotation.z = (rand() - 0.5) * 0.35;
    parts.push(tube);
  }
  return Mesh.MergeMeshes(parts, true, true)!;
}

interface Palette { base: Color3; tip: Color3 }

const PALETTES: Palette[] = [
  { base: new Color3(0.78, 0.22, 0.34), tip: new Color3(1.0, 0.5, 0.52) },
  { base: new Color3(0.52, 0.2, 0.62), tip: new Color3(0.86, 0.5, 0.9) },
  { base: new Color3(0.9, 0.45, 0.14), tip: new Color3(1.0, 0.78, 0.36) },
  { base: new Color3(0.14, 0.52, 0.55), tip: new Color3(0.45, 0.9, 0.82) }
];

/** Coral reef clusters built from a handful of instanced procedural templates. */
export class CoralReef {
  readonly meshes: Mesh[] = [];

  constructor(private scene: Scene) {
    const rand = seededRandom(2024);
    const builders = [branching, brain, table, pipes];

    const material = new StandardMaterial('coralMat', scene);
    material.diffuseColor = Color3.White();
    material.specularColor = new Color3(0.12, 0.12, 0.12);
    material.emissiveColor = new Color3(0.05, 0.03, 0.04);

    // builders × palettes → templates (disabled sources for instancing)
    const templates: Mesh[][] = builders.map((build) =>
      PALETTES.map((p, i) => {
        const mesh = build(rand, scene);
        mesh.name = `${build.name}_${i}`;
        paint(mesh, p.base, p.tip);
        mesh.material = material;
        mesh.isVisible = false;
        mesh.isPickable = false;
        this.meshes.push(mesh);
        return mesh;
      })
    );

    // Cluster centres on gentle, shallow ground.
    const centres: { x: number; z: number; palette: number }[] = [];
    let guard = 0;
    while (centres.length < 11 && guard++ < 400) {
      const x = (rand() - 0.5) * 84;
      const z = (rand() - 0.5) * 84;
      const y = terrainHeight(x, z);
      const slope = Math.hypot(terrainHeight(x + 1, z) - y, terrainHeight(x, z + 1) - y);
      if (y > 5 || slope > 0.8) continue;
      if (centres.some((c) => Math.hypot(c.x - x, c.z - z) < 14)) continue;
      centres.push({ x, z, palette: Math.floor(rand() * PALETTES.length) });
    }

    for (const c of centres) {
      const count = 9 + Math.floor(rand() * 9);
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 6.5;
        const x = c.x + Math.cos(a) * r;
        const z = c.z + Math.sin(a) * r;
        const type = Math.floor(rand() * builders.length);
        const palette = rand() < 0.7 ? c.palette : Math.floor(rand() * PALETTES.length);
        const inst = templates[type][palette].createInstance(`coral_${this.meshes.length}`);
        const s = 0.9 + rand() * 1.5;
        inst.position.set(x, terrainHeight(x, z) - 0.05, z);
        inst.rotation.y = rand() * Math.PI * 2;
        inst.scaling.set(s, s * (0.8 + rand() * 0.5), s);
        inst.isPickable = false;
      }
    }
  }
}
