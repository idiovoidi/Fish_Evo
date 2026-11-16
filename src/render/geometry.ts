import { Mesh, Scene, VertexData } from '@babylonjs/core';

export type Vec3 = [number, number, number];
export type Paint = (x: number, y: number, z: number) => [number, number, number, number];

/**
 * Accumulates procedurally lofted parts (bodies, fins, eyes) into a single
 * mesh. Each vertex carries:
 *   color.r = fin factor, color.g = eye factor, color.b/a = free
 *   swim    = how strongly the vertex follows the swimming wave (0 head → 1+ tail)
 */
export class GeometryBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private colors: number[] = [];
  private swim: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];

  constructor(private swimFn: (z: number) => number) {}

  /** Adds a part, auto-orienting winding so normals face away from its centroid. */
  addSolid(pos: number[], idx: number[], paint: Paint) {
    this.addPart(pos, idx, paint, true);
  }

  /**
   * Adds a flat part (a fin). Every vertex gets the sheet's plane normal; the
   * fragment shader flips it for back faces, so one layer of triangles suffices.
   */
  addSheet(pos: number[], idx: number[], paint: Paint) {
    // The largest triangle defines the plane's orientation.
    let best: Vec3 = [1, 0, 0];
    let bestArea = 0;
    for (let i = 0; i < idx.length; i += 3) {
      const [ax, ay, az] = pos.slice(idx[i] * 3, idx[i] * 3 + 3);
      const [bx, by, bz] = pos.slice(idx[i + 1] * 3, idx[i + 1] * 3 + 3);
      const [cx, cy, cz] = pos.slice(idx[i + 2] * 3, idx[i + 2] * 3 + 3);
      const ux = bx - ax, uy = by - ay, uz = bz - az;
      const vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const area = Math.hypot(nx, ny, nz);
      if (area > bestArea) { bestArea = area; best = [nx / area, ny / area, nz / area]; }
    }
    const normals: number[] = [];
    for (let i = 0; i < pos.length / 3; i++) normals.push(...best);
    this.addPart(pos, idx, paint, false, normals);
  }

  private addPart(pos: number[], idx: number[], paint: Paint, orient: boolean, explicitNormals?: number[]) {
    let indices = idx;
    let normals: ArrayLike<number> = explicitNormals ?? new Float32Array(pos.length);
    if (!explicitNormals) VertexData.ComputeNormals(pos, indices, normals as Float32Array);

    if (orient && !explicitNormals) {
      let cx = 0, cy = 0, cz = 0;
      const n = pos.length / 3;
      for (let i = 0; i < n; i++) { cx += pos[i * 3]; cy += pos[i * 3 + 1]; cz += pos[i * 3 + 2]; }
      cx /= n; cy /= n; cz /= n;
      let facing = 0;
      for (let i = 0; i < n; i++) {
        facing += normals[i * 3] * (pos[i * 3] - cx)
          + normals[i * 3 + 1] * (pos[i * 3 + 1] - cy)
          + normals[i * 3 + 2] * (pos[i * 3 + 2] - cz);
      }
      if (facing < 0) {
        indices = idx.slice();
        for (let i = 0; i < indices.length; i += 3) {
          const t = indices[i + 1];
          indices[i + 1] = indices[i + 2];
          indices[i + 2] = t;
        }
        normals = new Float32Array(pos.length);
        VertexData.ComputeNormals(pos, indices, normals as Float32Array);
      }
    }

    const base = this.positions.length / 3;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      this.positions.push(x, y, z);
      this.normals.push(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
      this.colors.push(...paint(x, y, z));
      this.swim.push(this.swimFn(z));
      this.uvs.push(0, 0);
    }
    for (const i of indices) this.indices.push(i + base);
  }

  /** A lofted tube: rings of `ringCount` vertices placed at each station. */
  loft(
    stations: { z: number; h: number; w: number; y?: number }[],
    ringCount: number,
    bellyScale: number,
    paint: Paint
  ) {
    const pos: number[] = [];
    const idx: number[] = [];
    for (const s of stations) {
      for (let j = 0; j < ringCount; j++) {
        const a = (j / ringCount) * Math.PI * 2;
        const sa = Math.sin(a);
        pos.push(Math.cos(a) * s.w, (s.y ?? 0) + sa * s.h * (sa < 0 ? bellyScale : 1), s.z);
      }
    }
    for (let i = 0; i < stations.length - 1; i++) {
      for (let j = 0; j < ringCount; j++) {
        const a = i * ringCount + j;
        const b = i * ringCount + ((j + 1) % ringCount);
        const c = a + ringCount;
        const d = b + ringCount;
        idx.push(a, b, c, b, d, c);
      }
    }
    // Close the tail end with a fan.
    const last = stations[stations.length - 1];
    const centre = pos.length / 3;
    pos.push(0, last.y ?? 0, last.z);
    const lastRing = (stations.length - 1) * ringCount;
    for (let j = 0; j < ringCount; j++) {
      idx.push(lastRing + j, centre, lastRing + ((j + 1) % ringCount));
    }
    this.addSolid(pos, idx, paint);
  }

  /** Triangle-fan polygon fin (points in order around the outline). */
  fin(points: Vec3[], paint: Paint) {
    const pos: number[] = [];
    const idx: number[] = [];
    for (const p of points) pos.push(...p);
    for (let i = 1; i < points.length - 1; i++) idx.push(0, i, i + 1);
    this.addSheet(pos, idx, paint);
  }

  sphere(cx: number, cy: number, cz: number, r: number, paint: Paint, lat = 6, lon = 8) {
    const pos: number[] = [];
    const normals: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= lat; i++) {
      const v = (i / lat) * Math.PI;
      for (let j = 0; j <= lon; j++) {
        const u = (j / lon) * Math.PI * 2;
        const nx = Math.sin(v) * Math.cos(u), ny = Math.cos(v), nz = Math.sin(v) * Math.sin(u);
        pos.push(cx + r * nx, cy + r * ny, cz + r * nz);
        normals.push(nx, ny, nz);
      }
    }
    for (let i = 0; i < lat; i++) {
      for (let j = 0; j < lon; j++) {
        const a = i * (lon + 1) + j;
        const b = a + lon + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    this.addPart(pos, idx, paint, false, normals);
  }

  build(scene: Scene, name: string): Mesh {
    const mesh = new Mesh(name, scene);
    const data = new VertexData();
    data.positions = this.positions;
    data.normals = this.normals;
    data.uvs = this.uvs;
    data.colors = this.colors;
    data.indices = this.indices;
    data.applyToMesh(mesh);
    mesh.setVerticesData('swim', this.swim, false, 1);
    return mesh;
  }
}
