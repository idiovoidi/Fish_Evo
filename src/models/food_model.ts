import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial } from '@babylonjs/core';

/** A glowing amber pellet; the emissive colour feeds the bloom pass. */
export function createFoodMesh(scene: Scene): Mesh {
  const pellet = MeshBuilder.CreateIcoSphere('foodTemplate', { radius: 0.24, subdivisions: 2 }, scene);
  const mat = new StandardMaterial('foodMat', scene);
  mat.diffuseColor = new Color3(1, 0.72, 0.2);
  mat.emissiveColor = new Color3(0.95, 0.55, 0.1);
  mat.specularColor = new Color3(1, 0.9, 0.6);
  pellet.material = mat;
  pellet.isVisible = false;
  return pellet;
}
