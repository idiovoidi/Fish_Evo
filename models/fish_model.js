/**
 * Create an enhanced procedural fish model using merged geometry
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @returns {BABYLON.Mesh} The fish mesh template
 */
export function createFishModel(scene) {
  // Create fish body - capsule for streamlined shape
  const body = BABYLON.MeshBuilder.CreateCapsule(
    "fishBody",
    { radius: 0.25, height: 1.2, tessellation: 16 },
    scene
  );

  // Create tail - fan-shaped for realistic fish tail
  const tail = BABYLON.MeshBuilder.CreateCylinder(
    "fishTail",
    { diameterTop: 0.45, diameterBottom: 0.05, height: 0.5, tessellation: 12 },
    scene
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.z = -0.85;

  // Create dorsal fin - top fin
  const dorsalFin = BABYLON.MeshBuilder.CreateCylinder(
    "dorsalFin",
    { diameterTop: 0.05, diameterBottom: 0.25, height: 0.4, tessellation: 8 },
    scene
  );
  dorsalFin.position.set(0, 0.25, -0.1);
  dorsalFin.rotation.z = -0.1;

  // Create pectoral fins - side fins (larger and more prominent)
  const finL = BABYLON.MeshBuilder.CreateCylinder(
    "fishFinL",
    { diameterTop: 0.08, diameterBottom: 0.3, height: 0.35, tessellation: 10 },
    scene
  );
  finL.rotation.z = -Math.PI / 3;
  finL.rotation.x = Math.PI / 2;
  finL.position.set(0.3, -0.05, 0.1);

  const finR = finL.clone("fishFinR");
  finR.rotation.z = Math.PI / 3;
  finR.position.x = -0.3;

  // Create pelvic fins - smaller bottom fins
  const pelvicFinL = BABYLON.MeshBuilder.CreateCylinder(
    "pelvicFinL",
    { diameterTop: 0.05, diameterBottom: 0.15, height: 0.2, tessellation: 8 },
    scene
  );
  pelvicFinL.rotation.z = -Math.PI / 6;
  pelvicFinL.rotation.x = Math.PI / 2;
  pelvicFinL.position.set(0.15, -0.15, -0.2);

  const pelvicFinR = pelvicFinL.clone("pelvicFinR");
  pelvicFinR.rotation.z = Math.PI / 6;
  pelvicFinR.position.x = -0.15;

  // Create eyes - small spheres
  const eyeL = BABYLON.MeshBuilder.CreateSphere(
    "eyeL",
    { diameter: 0.08, segments: 8 },
    scene
  );
  eyeL.position.set(0.15, 0.1, 0.5);

  const eyeR = eyeL.clone("eyeR");
  eyeR.position.x = -0.15;

  // Merge all parts into a single mesh for performance
  const fishMesh = BABYLON.Mesh.MergeMeshes(
    [body, tail, dorsalFin, finL, finR, pelvicFinL, pelvicFinR, eyeL, eyeR],
    true,
    true,
    undefined,
    false,
    true
  );
  fishMesh.name = "fishPrimitiveTemplate";

  // Create enhanced fish material with PBR for better appearance
  const fishMaterial = new BABYLON.PBRMaterial("fishMaterial", scene);
  fishMaterial.albedoColor = new BABYLON.Color3(0.4, 0.7, 0.9); // Blue-cyan
  fishMaterial.metallic = 0.3; // Slight metallic sheen
  fishMaterial.roughness = 0.5; // Semi-glossy, wet appearance
  fishMaterial.environmentIntensity = 0.3;

  fishMesh.material = fishMaterial;
  fishMesh.setEnabled(false); // Hide template

  console.log("Enhanced fish primitive template created successfully");

  return fishMesh;
}
