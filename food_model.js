/**
 * Create a food particle model using simple geometry
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @returns {BABYLON.Mesh} The food mesh template
 */
function createFoodModel(scene) {
  // Create food sphere - small particle
  const foodSphere = BABYLON.MeshBuilder.CreateSphere(
    'foodTemplate',
    { diameter: 0.5, segments: 6 },
    scene
  );

  // Create food material with yellow-orange coloring
  const foodMaterial = new BABYLON.StandardMaterial('foodMaterial', scene);
  foodMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.2); // Yellow-orange
  foodMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.0); // Slight glow

  foodSphere.material = foodMaterial;
  foodSphere.setEnabled(false); // Hide template

  console.log('Food template created successfully');

  return foodSphere;
}
