import { Renderable } from '../components/Renderable.js';
import { FishTag, FoodTag } from '../components/Tags.js';

/**
 * BabylonMeshSystem - Creates and manages Babylon.js meshes for entities
 */
export class BabylonMeshSystem extends window.ECSY.System {
  init() {
    this.scene = null;
    this.fishModels = []; // Will store fish model templates to clone
    this.foodModels = []; // Will store food model templates to clone
  }
  
  /**
   * Set the Babylon.js scene
   * @param {BABYLON.Scene} scene - The Babylon.js scene
   */
  setScene(scene) {
    this.scene = scene;
    
    // Create model templates
    this.createModelTemplates();
  }
  
  /**
   * Create model templates for entities
   */
  createModelTemplates() {
    if (!this.scene) return;
    
    // Create fish model template
    const fishSphere = BABYLON.MeshBuilder.CreateSphere("fishTemplate", 
      { diameter: 2, segments: 8 }, this.scene);
    const fishMaterial = new BABYLON.StandardMaterial("fishMaterial", this.scene);
    fishMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.8, 1.0);
    fishSphere.material = fishMaterial;
    fishSphere.setEnabled(false); // Hide the template
    this.fishModels.push(fishSphere);
    
    // Create food model template
    const foodSphere = BABYLON.MeshBuilder.CreateSphere("foodTemplate",
      { diameter: 0.5, segments: 6 }, this.scene);
    const foodMaterial = new BABYLON.StandardMaterial("foodMaterial", this.scene);
    foodMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.2);
    foodSphere.material = foodMaterial;
    foodSphere.setEnabled(false); // Hide the template
    this.foodModels.push(foodSphere);
  }
  
  execute(delta, time) {
    if (!this.scene) return;
    
    // Create meshes for new fish entities
    this.queries.newFish.added.forEach(entity => {
      const renderable = entity.getMutableComponent(Renderable);
      const template = this.fishModels[0]; // Use the first template for now
      
      // Clone the template to create a new instance
      const fishMesh = template.clone("fish_" + entity.id);
      fishMesh.setEnabled(true);
      
      // Store the mesh in the renderable component
      renderable.model = fishMesh;
    });
    
    // Create meshes for new food entities
    this.queries.newFood.added.forEach(entity => {
      const renderable = entity.getMutableComponent(Renderable);
      const template = this.foodModels[0]; // Use the first template for now
      
      // Clone the template to create a new instance
      const foodMesh = template.clone("food_" + entity.id);
      foodMesh.setEnabled(true);
      foodMesh.scaling.x = renderable.scale;
      foodMesh.scaling.y = renderable.scale;
      foodMesh.scaling.z = renderable.scale;
      
      // Store the mesh in the renderable component
      renderable.model = foodMesh;
    });
    
    // Clean up removed entities
    this.queries.removed.removed.forEach(entity => {
      const renderable = entity.getComponent(Renderable);
      if (renderable && renderable.model) {
        renderable.model.dispose();
      }
    });
  }
}

// Define queries - which entities this system should process
BabylonMeshSystem.queries = {
  newFish: { components: [Renderable, FishTag], listen: { added: true } },
  newFood: { components: [Renderable, FoodTag], listen: { added: true } },
  removed: { components: [Renderable], listen: { removed: true } }
}; 