import { Renderable } from '../components/Renderable.js';
import { FishTag, FoodTag, SharkTag } from '../components/Tags.js';
import { Genetics } from '../components/Genetics.js';

/**
 * BabylonMeshSystem - Creates and manages Babylon.js meshes for entities
 */
export class BabylonMeshSystem extends window.ECSY.System {
  init() {
    this.scene = null;
    this.fishModels = []; // Will store fish model templates to clone (sphere fallback)
    this.fishTemplate = null; // glTF-based fish template (TransformNode)
    this.fishPrimitiveTemplate = null; // Procedural primitive fish (merged mesh)
    this.foodModels = []; // Will store food model templates to clone
    this.fishPool = [];
    this.foodPool = [];
    this.sharkPool = [];
    this.materialCache = new Map();
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
    
    // Fallback fish model template (simple sphere)
    const fishSphere = BABYLON.MeshBuilder.CreateSphere("fishTemplateFallback", 
      { diameter: 2, segments: 8 }, this.scene);
    const fishMaterial = new BABYLON.StandardMaterial("fishMaterial", this.scene);
    fishMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.8, 1.0);
    fishSphere.material = fishMaterial;
    fishSphere.setEnabled(false); // Hide the template
    this.fishModels.push(fishSphere);

    // Procedural primitive fish template (merged mesh)
    try {
      const body = BABYLON.MeshBuilder.CreateCapsule('pf_body', { radius: 0.2, height: 1.0 }, this.scene);
      const tail = BABYLON.MeshBuilder.CreateCylinder('pf_tail', { diameterTop: 0.35, diameterBottom: 0, height: 0.45 }, this.scene);
      tail.rotation.x = Math.PI / 2;
      tail.position.z = -0.7;
      const finL = BABYLON.MeshBuilder.CreateCylinder('pf_finL', { diameterTop: 0.15, diameterBottom: 0, height: 0.25 }, this.scene);
      finL.rotation.z = -Math.PI/4; finL.position.set(0.25, 0, 0);
      const finR = finL.clone('pf_finR'); finR.rotation.z = Math.PI/4; finR.position.x = -0.25;
      const fishMerged = BABYLON.Mesh.MergeMeshes([body, tail, finL, finR], true, true, undefined, false, true);
      fishMerged.name = 'fishPrimitiveTemplate';
      const pfMat = new BABYLON.StandardMaterial('pf_mat', this.scene);
      pfMat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1.0);
      fishMerged.material = pfMat;
      fishMerged.setEnabled(false);
      this.fishPrimitiveTemplate = fishMerged;
    } catch (e) {
      console.warn('Failed to create primitive fish; fallback sphere will be used.', e);
    }

    // Load remote GLB (Barramundi) first; fallback to local stub; then procedural/sphere
    const attachAsTemplate = (meshes) => {
      if (!meshes || meshes.length === 0) return;
      const root = new BABYLON.TransformNode("fishTemplate", this.scene);
      meshes.forEach(m => { if (m && m !== root) { m.setEnabled(false); m.parent = root; } });
      root.setEnabled(false);
      this.fishTemplate = root;
    };

    const loadLocalFallback = () => {
      BABYLON.SceneLoader.ImportMesh(
        "",
        "models/",
        "fish.gltf",
        this.scene,
        (meshes) => attachAsTemplate(meshes),
        null,
        () => { this.fishTemplate = null; }
      );
    };

    BABYLON.SceneLoader.ImportMesh(
      "",
      "",
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb",
      this.scene,
      (meshes) => attachAsTemplate(meshes),
      null,
      () => loadLocalFallback()
    );
    
    // Create food model template
    const foodSphere = BABYLON.MeshBuilder.CreateSphere("foodTemplate",
      { diameter: 0.5, segments: 6 }, this.scene);
    const foodMaterial = new BABYLON.StandardMaterial("foodMaterial", this.scene);
    foodMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.2);
    foodSphere.material = foodMaterial;
    foodSphere.setEnabled(false); // Hide the template
    this.foodModels.push(foodSphere);
    
    // Create shark model template
    const sharkMesh = BABYLON.MeshBuilder.CreateBox("sharkTemplate", {size:3, height:1}, this.scene);
    const sharkMat = new BABYLON.StandardMaterial("sharkMat", this.scene);
    sharkMat.diffuseColor = new BABYLON.Color3(0.2,0.2,0.2);
    sharkMesh.material = sharkMat;
    sharkMesh.setEnabled(false);
    this.sharkTemplate = sharkMesh;
  }
  
  execute(delta, time) {
    if (!this.scene) return;
    
    // Create meshes for new fish entities
    this.queries.newFish.added.forEach(entity => {
      const renderable = entity.getMutableComponent(Renderable);
      const genetics = entity.getComponent(Genetics);

      // Prefer glTF template when available; else use primitive merged mesh; else fallback sphere
      if (this.fishTemplate) {
        const fishRoot = this.fishTemplate.clone("fish_" + entity.id);
        fishRoot.setEnabled(true);
        // Enable all child meshes on the cloned node
        fishRoot.getChildMeshes().forEach(m => m.setEnabled(true));
        renderable.model = fishRoot;
        // Apply scale from renderable
        if (typeof renderable.scale === 'number') {
          fishRoot.scaling.set(renderable.scale, renderable.scale, renderable.scale);
        }
        // Apply genetics color to child meshes
        if (genetics) {
          this.applyColorToNode(fishRoot, genetics.color);
        }
        // Tag all child meshes for picking back to ECS entity
        fishRoot.getChildMeshes().forEach(m => { m.entity = entity; });
      } else if (this.fishPrimitiveTemplate) {
        const mesh = this.fishPrimitiveTemplate.clone('fish_' + entity.id);
        mesh.setEnabled(true);
        renderable.model = mesh;
        if (typeof renderable.scale === 'number') {
          mesh.scaling.set(renderable.scale, renderable.scale, renderable.scale);
        }
        // Apply / reuse material based on genetics color
        if (genetics) {
          const key = 'pf_' + genetics.color.join(',');
          let mat = this.materialCache.get(key);
          if (!mat) {
            mat = this.fishPrimitiveTemplate.material.clone('mat_' + key);
            const [r,g,b] = genetics.color;
            if (mat.albedoColor) mat.albedoColor = new BABYLON.Color3(r/255, g/255, b/255);
            if (mat.diffuseColor) mat.diffuseColor = new BABYLON.Color3(r/255, g/255, b/255);
            this.materialCache.set(key, mat);
          }
          mesh.material = mat;
        }
        renderable.model.entity = entity;
      } else {
        let fishMesh;
        if (this.fishPool.length) {
          fishMesh = this.fishPool.pop();
        } else {
          fishMesh = this.fishModels[0].clone("fish_" + entity.id);
        }
        fishMesh.setEnabled(true);
        renderable.model = fishMesh;
        // Apply / reuse material based on genetics color
        if (genetics) {
          const key = genetics.color.join(',');
          let mat = this.materialCache.get(key);
          if (!mat) {
            mat = this.fishModels[0].material.clone("mat_" + key);
            const [r,g,b]=genetics.color;
            mat.diffuseColor = new BABYLON.Color3(r/255, g/255, b/255);
            this.materialCache.set(key, mat);
          }
          fishMesh.material = mat;
        }
        renderable.model.entity = entity;
      }
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
      renderable.model.entity = entity;
    });
    
    // Create meshes for new shark entities
    this.queries.newShark.added.forEach(entity => {
      const rend = entity.getMutableComponent(Renderable);
      const mesh = this.sharkTemplate.clone("shark_" + entity.id);
      mesh.setEnabled(true);
      rend.model = mesh;
      rend.model.entity = entity;
    });
    
    // Clean up removed entities
    this.queries.removed.removed.forEach(entity => {
      const renderable = entity.getComponent(Renderable);
      if (renderable && renderable.model) {
        renderable.model.dispose();
      }
    });
  }

  applyColorToNode(node, rgbArray) {
    if (!rgbArray || !Array.isArray(rgbArray)) return;
    const [r, g, b] = rgbArray;
    const color3 = new BABYLON.Color3(r/255, g/255, b/255);
    node.getChildMeshes().forEach(mesh => {
      if (!mesh.material) return;
      // Avoid setting material on InstancedMesh (has no effect)
      if (typeof mesh.getClassName === 'function' && mesh.getClassName() === 'InstancedMesh') {
        return;
      }
      // Clone material per color key to avoid global material changes
      const key = `pbr_${rgbArray.join(',')}`;
      let mat = this.materialCache.get(key);
      if (!mat) {
        if (mesh.material instanceof BABYLON.PBRMaterial) {
          mat = mesh.material.clone(`mat_${key}`);
          mat.albedoColor = color3;
        } else {
          mat = mesh.material.clone(`mat_${key}`);
          if (mat.diffuseColor) mat.diffuseColor = color3;
          else if (mat.emissiveColor) mat.emissiveColor = color3;
        }
        this.materialCache.set(key, mat);
      }
      mesh.material = mat;
    });
  }
}

// Define queries - which entities this system should process
BabylonMeshSystem.queries = {
  newFish: { components: [Renderable, FishTag], listen: { added: true } },
  newFood: { components: [Renderable, FoodTag], listen: { added: true } },
  newShark: { components: [Renderable, SharkTag], listen: { added: true } },
  removed: { components: [Renderable], listen: { removed: true } }
}; 