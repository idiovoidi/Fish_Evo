import { Renderable } from "../components/Renderable.js";
import { FishTag, FoodTag, SharkTag, CrabTag } from "../components/Tags.js";
import { Genetics } from "../components/Genetics.js";

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
    const fishSphere = BABYLON.MeshBuilder.CreateSphere(
      "fishTemplateFallback",
      { diameter: 2, segments: 8 },
      this.scene
    );
    const fishMaterial = new BABYLON.StandardMaterial(
      "fishMaterial",
      this.scene
    );
    fishMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.8, 1.0);
    fishSphere.material = fishMaterial;
    fishSphere.setEnabled(false); // Hide the template
    this.fishModels.push(fishSphere);

    // Procedural primitive fish template (merged mesh)
    try {
      this.fishPrimitiveTemplate = createFishModel(this.scene);
    } catch (e) {
      console.warn(
        "Failed to create primitive fish; fallback sphere will be used.",
        e
      );
    }

    // Load remote GLB (Barramundi) first; fallback to local stub; then procedural/sphere
    const attachAsTemplate = (meshes) => {
      if (!meshes || meshes.length === 0) return;
      const root = new BABYLON.TransformNode("fishTemplate", this.scene);
      meshes.forEach((m) => {
        if (m && m !== root) {
          m.setEnabled(false);
          m.parent = root;
        }
      });
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
        () => {
          this.fishTemplate = null;
        }
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
    const foodTemplate = createFoodModel(this.scene);
    this.foodModels.push(foodTemplate);

    // Create shark model template with realistic shark geometry
    this.createSharkTemplate();

    // Create crab model template
    this.createCrabTemplate();
  }

  execute() {
    if (!this.scene) return;

    // Create meshes for new fish entities
    this.queries.newFish.added.forEach((entity) => {
      this.createFishMesh(entity);
    });

    // Create meshes for new food entities
    this.queries.newFood.added.forEach((entity) => {
      this.createSimpleMesh(entity, this.foodModels[0], "food");
    });

    // Create meshes for new shark entities
    this.queries.newShark.added.forEach((entity) => {
      this.createSimpleMesh(entity, this.sharkTemplate, "shark");
    });

    // Create meshes for new crab entities
    this.queries.newCrab.added.forEach((entity) => {
      this.createSimpleMesh(entity, this.crabTemplate, "crab");
    });

    // Clean up removed entities
    this.queries.removed.removed.forEach((entity) => {
      const renderable = entity.getComponent(Renderable);
      if (renderable && renderable.model) {
        renderable.model.dispose();
      }
    });
  }

  /**
   * Create a simple mesh from a template
   */
  createSimpleMesh(entity, template, prefix) {
    const renderable = entity.getMutableComponent(Renderable);
    const mesh = template.clone(`${prefix}_${entity.id}`);
    mesh.setEnabled(true);

    // Apply scale from renderable
    if (typeof renderable.scale === "number") {
      mesh.scaling.set(renderable.scale, renderable.scale, renderable.scale);
    }

    // Set initial random orientation
    mesh.rotation.y = Math.random() * Math.PI * 2;

    renderable.model = mesh;
    renderable.model.entity = entity;
  }

  /**
   * Create fish mesh with genetics color support
   */
  createFishMesh(entity) {
    const renderable = entity.getMutableComponent(Renderable);
    const genetics = entity.getComponent(Genetics);

    // Prefer glTF template when available; else use primitive merged mesh; else fallback sphere
    if (this.fishTemplate) {
      const fishRoot = this.fishTemplate.clone("fish_" + entity.id);
      fishRoot.setEnabled(true);
      fishRoot.getChildMeshes().forEach((m) => m.setEnabled(true));
      renderable.model = fishRoot;

      if (typeof renderable.scale === "number") {
        fishRoot.scaling.set(
          renderable.scale,
          renderable.scale,
          renderable.scale
        );
      }

      fishRoot.rotation.y = Math.random() * Math.PI * 2;

      if (genetics) {
        this.applyColorToNode(fishRoot, genetics.color);
      }

      fishRoot.getChildMeshes().forEach((m) => {
        m.entity = entity;
      });
    } else if (this.fishPrimitiveTemplate) {
      const mesh = this.fishPrimitiveTemplate.clone("fish_" + entity.id);
      mesh.setEnabled(true);
      renderable.model = mesh;

      if (typeof renderable.scale === "number") {
        mesh.scaling.set(renderable.scale, renderable.scale, renderable.scale);
      }

      mesh.rotation.y = Math.random() * Math.PI * 2;

      if (genetics) {
        const key = "pf_" + genetics.color.join(",");
        let mat = this.materialCache.get(key);
        if (!mat) {
          mat = this.fishPrimitiveTemplate.material.clone("mat_" + key);
          const [r, g, b] = genetics.color;
          if (mat.albedoColor)
            mat.albedoColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
          if (mat.diffuseColor)
            mat.diffuseColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
          this.materialCache.set(key, mat);
        }
        mesh.material = mat;
      }
      renderable.model.entity = entity;
    } else {
      const fishMesh = this.fishModels[0].clone("fish_" + entity.id);
      fishMesh.setEnabled(true);
      renderable.model = fishMesh;
      fishMesh.rotation.y = Math.random() * Math.PI * 2;

      if (genetics) {
        const key = genetics.color.join(",");
        let mat = this.materialCache.get(key);
        if (!mat) {
          mat = this.fishModels[0].material.clone("mat_" + key);
          const [r, g, b] = genetics.color;
          mat.diffuseColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
          this.materialCache.set(key, mat);
        }
        fishMesh.material = mat;
      }
      renderable.model.entity = entity;
    }
  }

  /**
   * Create a realistic shark model template using procedural geometry
   */
  createSharkTemplate() {
    if (!this.scene) return;
    this.sharkTemplate = createSharkModel(this.scene);
  }

  /**
   * Create a crab model template using procedural geometry
   */
  createCrabTemplate() {
    if (!this.scene) return;
    this.crabTemplate = createCrabModel(this.scene);
  }

  applyColorToNode(node, rgbArray) {
    if (!rgbArray || !Array.isArray(rgbArray)) return;
    const [r, g, b] = rgbArray;
    const color3 = new BABYLON.Color3(r / 255, g / 255, b / 255);
    node.getChildMeshes().forEach((mesh) => {
      if (!mesh.material) return;
      // Avoid setting material on InstancedMesh (has no effect)
      if (
        typeof mesh.getClassName === "function" &&
        mesh.getClassName() === "InstancedMesh"
      ) {
        return;
      }
      // Clone material per color key to avoid global material changes
      const key = `pbr_${rgbArray.join(",")}`;
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
  newCrab: { components: [Renderable, CrabTag], listen: { added: true } },
  removed: { components: [Renderable], listen: { removed: true } },
};
