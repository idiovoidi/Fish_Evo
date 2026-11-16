import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial } from '@babylonjs/core';

/** A rounded little crab, claws towards +Z, roughly 1.8 units across. */
export function createCrabMesh(scene: Scene): Mesh {
  const parts: Mesh[] = [];
  const add = (m: Mesh) => { parts.push(m); return m; };

  const shell = add(MeshBuilder.CreateSphere('shell', { diameter: 1, segments: 16 }, scene));
  shell.scaling.set(1.5, 0.5, 1.05);
  shell.position.y = 0.34;
  shell.bakeCurrentTransformIntoVertices();

  const belly = add(MeshBuilder.CreateSphere('belly', { diameter: 1, segments: 10 }, scene));
  belly.scaling.set(1.2, 0.25, 0.85);
  belly.position.y = 0.2;
  belly.bakeCurrentTransformIntoVertices();

  for (const side of [1, -1]) {
    // Eye stalks.
    const stalk = add(MeshBuilder.CreateCylinder('stalk', { diameter: 0.07, height: 0.22, tessellation: 6 }, scene));
    stalk.position.set(side * 0.2, 0.68, 0.38);
    const eye = add(MeshBuilder.CreateSphere('eye', { diameter: 0.13, segments: 6 }, scene));
    eye.position.set(side * 0.2, 0.82, 0.4);

    // Arm + claw.
    const arm = add(MeshBuilder.CreateCylinder('arm', { diameter: 0.14, height: 0.7, tessellation: 6 }, scene));
    arm.rotation.x = Math.PI / 2;
    arm.rotation.z = side * 0.55;
    arm.position.set(side * 0.55, 0.38, 0.62);
    const claw = add(MeshBuilder.CreateSphere('claw', { diameter: 0.5, segments: 8 }, scene));
    claw.scaling.set(0.9, 0.55, 1.35);
    claw.position.set(side * 0.78, 0.4, 0.98);
    claw.bakeCurrentTransformIntoVertices();
    const pincer = add(MeshBuilder.CreateCylinder('pincer', { diameterTop: 0, diameterBottom: 0.2, height: 0.34, tessellation: 6 }, scene));
    pincer.rotation.x = Math.PI / 2;
    pincer.position.set(side * 0.78, 0.4, 1.25);

    // Four legs a side.
    for (let i = 0; i < 4; i++) {
      const leg = add(MeshBuilder.CreateCylinder('leg', { diameter: 0.07, height: 0.78, tessellation: 5 }, scene));
      leg.rotation.z = side * (Math.PI / 2 - 0.5);
      leg.rotation.y = (i - 1.5) * -0.28 * side;
      leg.position.set(side * 0.88, 0.2, -0.22 + i * 0.2 - 0.1);
    }
  }

  const merged = Mesh.MergeMeshes(parts, true, true)!;
  merged.name = 'crabTemplate';

  const pos = merged.getVerticesData('position')!;
  const colors = new Float32Array((pos.length / 3) * 4);
  for (let i = 0; i < pos.length / 3; i++) {
    const y = pos[i * 3 + 1];
    const t = Math.min(1, Math.max(0, (y - 0.15) / 0.6));
    colors.set([0.62 + 0.3 * t, 0.2 + 0.1 * t, 0.12 + 0.05 * t, 1], i * 4);
  }
  merged.setVerticesData('color', colors);

  const mat = new StandardMaterial('crabMat', scene);
  mat.diffuseColor = Color3.White();
  mat.specularColor = new Color3(0.25, 0.2, 0.2);
  mat.specularPower = 24;
  merged.material = mat;
  merged.isVisible = false;
  return merged;
}
