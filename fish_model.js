/**
 * Create a procedural fish model using merged geometry
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @returns {BABYLON.Mesh} The fish mesh template
 */
function createFishModel(scene) {
  // Create fish body - capsule for streamlined shape
  const body = BABYLON.MeshBuilder.CreateCapsule(
    'fishBody',
    { radius: 0.2, height: 1.0 },
    scene
  );

  // Create tail - cone shape for classic fish tail
  const tail = BABYLON.MeshBuilder.CreateCylinder(
    'fishTail',
    { diameterTop: 0.35, diameterBottom: 0, height: 0.45 },
    scene
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.z = -0.7;

  // Create left fin
  const finL = BABYLON.MeshBuilder.CreateCylinder(
    'fishFinL',
    { diameterTop: 0.15, diameterBottom: 0, height: 0.25 },
    scene
  );
  finL.rotation.z = -Math.PI / 4;
  finL.position.set(0.25, 0, 0);

  // Create right fin
  const finR = finL.clone('fishFinR');
  finR.rotation.z = Math.PI / 4;
  finR.position.x = -0.25;

  // Merge all parts into a single mesh for performance
  const fishMesh = BABYLON.Mesh.MergeMeshes(
    [body, tail, finL, finR],
    true,
    true,
    undefined,
    false,
    true
  );
  fishMesh.name = 'fishPrimitiveTemplate';

  // Create fish material with blue-green coloring
  const fishMaterial = new BABYLON.StandardMaterial('fishMaterial', scene);
  fishMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1.0); // Light blue
  fishMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  fishMesh.material = fishMaterial;
  fishMesh.setEnabled(false); // Hide template

  console.log('Fish primitive template created successfully');

  return fishMesh;
}
