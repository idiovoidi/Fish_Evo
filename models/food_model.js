/**
 * Create an enhanced food particle model using simple geometry
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @returns {BABYLON.Mesh} The food mesh template
 */
function createFoodModel(scene) {
  // Create food sphere - small particle with better tessellation
  const foodSphere = BABYLON.MeshBuilder.CreateSphere(
    'foodTemplate',
    { diameter: 0.5, segments: 10 },
    scene
  );

  // Create enhanced food material with PBR for better appearance
  const foodMaterial = new BABYLON.PBRMaterial('foodMaterial', scene);
  foodMaterial.albedoColor = new BABYLON.Color3(1.0, 0.75, 0.15); // Golden yellow
  foodMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.05); // Warm glow
  foodMaterial.metallic = 0.0;
  foodMaterial.roughness = 0.7;
  foodMaterial.environmentIntensity = 0.2;

  foodSphere.material = foodMaterial;
  foodSphere.setEnabled(false); // Hide template

  console.log('Enhanced food template created successfully');

  return foodSphere;
}
