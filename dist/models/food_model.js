export function createFoodModel(scene) {
    const foodSphere = window.BABYLON.MeshBuilder.CreateSphere('foodTemplate', { diameter: 0.5, segments: 10 }, scene);
    const foodMaterial = new window.BABYLON.PBRMaterial('foodMaterial', scene);
    foodMaterial.albedoColor = new window.BABYLON.Color3(1.0, 0.75, 0.15);
    foodMaterial.emissiveColor = new window.BABYLON.Color3(0.3, 0.2, 0.05);
    foodMaterial.metallic = 0.0;
    foodMaterial.roughness = 0.7;
    foodMaterial.environmentIntensity = 0.2;
    foodSphere.material = foodMaterial;
    foodSphere.setEnabled(false);
    console.log('Enhanced food template created successfully');
    return foodSphere;
}
//# sourceMappingURL=food_model.js.map