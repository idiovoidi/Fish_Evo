import { Mesh, Scene } from '@babylonjs/core';
import { GeometryBuilder, Paint, Vec3 } from '../render/geometry';

const BODY: Paint = () => [0, 0, 0, 1];
const FIN: Paint = () => [1, 0, 0, 1];
const EYE: Paint = () => [0, 1, 0, 1];

const NOSE_Z = 1.5;
const TAIL_Z = -1.4;

function halfHeight(t: number): number {
  const s = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.5)), 0.85);
  return 0.2 * s + 0.035 * t;
}

const zAt = (t: number) => NOSE_Z + (TAIL_Z - NOSE_Z) * t;

/** Torpedo-shaped shark template facing +Z, roughly 3.6 units long. */
export function createSharkMesh(scene: Scene): Mesh {
  const g = new GeometryBuilder((z) => Math.min(1.5, Math.max(0, (0.6 - z) / 2.0)));

  const stations = Array.from({ length: 32 }, (_, i) => {
    const t = i / 31;
    const h = halfHeight(t);
    return { z: zAt(t), h, w: h * 1.05 };
  });
  g.loft(stations, 16, 0.8, BODY);

  const topAt = (z: number) => halfHeight((NOSE_Z - z) / (NOSE_Z - TAIL_Z));

  // First dorsal: tall, swept back.
  g.fin([
    [0, topAt(0.45) - 0.02, 0.45],
    [0, topAt(0.2) + 0.2, 0.2],
    [0, topAt(0.0) + 0.5, -0.06],
    [0, topAt(-0.25) + 0.05, -0.3],
    [0, topAt(-0.28) - 0.03, -0.32]
  ], FIN);

  // Second dorsal and anal fin.
  g.fin([[0, topAt(-0.8) - 0.01, -0.7], [0, topAt(-0.9) + 0.13, -0.92], [0, topAt(-1.0) - 0.01, -1.04]], FIN);
  g.fin([[0, -topAt(-0.8) * 0.8 + 0.01, -0.8], [0, -topAt(-0.9) * 0.8 - 0.12, -0.98], [0, -topAt(-1.0) * 0.8 + 0.01, -1.06]], FIN);

  // Heterocercal tail: long upper lobe.
  const tail: Vec3[] = [
    [0, 0.045, TAIL_Z + 0.05],
    [0, 0.2, -1.62],
    [0, 0.62, -2.05],
    [0, 0.26, -1.78],
    [0, 0.0, -1.7],
    [0, -0.22, -1.82],
    [0, -0.34, -1.99],
    [0, -0.12, -1.6],
    [0, -0.045, TAIL_Z + 0.05]
  ];
  g.fin(tail, FIN);

  // Pectoral and pelvic fins.
  for (const side of [1, -1]) {
    g.fin([
      [side * 0.18, -0.1, 0.62],
      [side * 0.22, -0.13, 0.36],
      [side * 0.78, -0.4, 0.06],
      [side * 0.55, -0.2, 0.46]
    ], FIN);
    g.fin([
      [side * 0.12, -0.14, -0.55],
      [side * 0.12, -0.15, -0.7],
      [side * 0.3, -0.25, -0.76]
    ], FIN);
  }

  for (const side of [1, -1]) g.sphere(side * 0.19, 0.06, 1.12, 0.045, EYE, 6, 8);

  const mesh = g.build(scene, 'sharkTemplate');
  mesh.isPickable = true;
  return mesh;
}
