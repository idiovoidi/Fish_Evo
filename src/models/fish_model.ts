import { Mesh, Scene } from '@babylonjs/core';
import { GeometryBuilder, Paint, Vec3 } from '../render/geometry';

const BODY: Paint = () => [0, 0, 0, 1];
const FIN: Paint = (_x, _y, z) => [1, 0, 0, Math.min(1, Math.max(0, (-z - 0.7) * 2))];
const EYE: Paint = () => [0, 1, 0, 1];

/** Half-height of the body at normalised position t (0 = nose, 1 = tail root). */
function halfHeight(t: number): number {
  const s = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.7);
  return 0.4 * s + 0.07 * t;
}

const NOSE_Z = 1.0;
const TAIL_Z = -0.75;
const zAt = (t: number) => NOSE_Z + (TAIL_Z - NOSE_Z) * t;

/**
 * Builds the fish template, facing +Z, roughly 2 units long. Every vertex
 * carries a `swim` weight so the vertex shader can ripple the tail.
 */
export function createFishMesh(scene: Scene): Mesh {
  // Weight rises from 0 at mid-body to 1 at the tail root and beyond on the fin.
  const g = new GeometryBuilder((z) => Math.min(1.4, Math.max(0, (0.15 - z) / 1.0)));

  const stations = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const h = halfHeight(t);
    return { z: zAt(t), h, w: h * 0.58 };
  });
  g.loft(stations, 14, 0.86, BODY);

  const topAt = (z: number) => halfHeight((NOSE_Z - z) / (NOSE_Z - TAIL_Z));

  // Forked tail.
  const tail: Vec3[] = [
    [0, 0.08, TAIL_Z + 0.04],
    [0, 0.24, -0.98],
    [0, 0.5, -1.25],
    [0, 0.1, -1.04],
    [0, -0.1, -1.04],
    [0, -0.5, -1.25],
    [0, -0.24, -0.98],
    [0, -0.08, TAIL_Z + 0.04]
  ];
  g.fin(tail, FIN);

  // Dorsal fin.
  const dTop = (z: number) => topAt(z) - 0.03;
  g.fin([
    [0, dTop(0.42), 0.42],
    [0, dTop(0.2) + 0.26, 0.2],
    [0, dTop(-0.1) + 0.42, -0.12],
    [0, dTop(-0.35) + 0.16, -0.38],
    [0, dTop(-0.5), -0.5]
  ], FIN);

  // Anal fin.
  g.fin([
    [0, -topAt(-0.28) * 0.86 + 0.03, -0.28],
    [0, -topAt(-0.4) * 0.86 - 0.2, -0.46],
    [0, -topAt(-0.55) * 0.86 + 0.03, -0.58]
  ], FIN);

  // Pectoral fins.
  for (const side of [1, -1]) {
    g.fin([
      [side * 0.2, -0.04, 0.42],
      [side * 0.2, -0.13, 0.26],
      [side * 0.52, -0.24, 0.12],
      [side * 0.42, -0.1, 0.34]
    ], FIN);
  }

  // Eyes.
  for (const side of [1, -1]) g.sphere(side * 0.185, 0.1, 0.7, 0.07, EYE);

  const mesh = g.build(scene, 'fishTemplate');
  mesh.isPickable = true;
  return mesh;
}
