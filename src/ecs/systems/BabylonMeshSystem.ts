import { Renderable } from "../components/Renderable";
import { FishTag, FoodTag, SharkTag, CrabTag } from "../components/Tags";
import { Genetics } from "../components/Genetics";

export class BabylonMeshSystem extends (window as any).ECSY.System {
  scene: any = null;
  fishModels: any[] = [];
  fishTemplate: any = null;
  fishPrimitiveTemplate: any = null;
  foodModels: any[] = [];
  materialCache: Map<string, any> = new Map();
  sharkTemplate: any = null;
  crabTemplate: any = null;

  init() {
    this.scene = null;
    this.fishModels = [];
    this.fishTemplate = null;
    this.fishPrimitiveTemplate = null;
    this.foodModels = [];
    this.materialCache = new Map();
  }

  setScene(scene: any) {
    this.scene = scene;
    this.createModelTemplates();
  }

  createModelTemplates() {
    if (!this.scene) return;

    // These will be loaded dynamically from the model files
    // For now, just initialize the arrays
    this.fishModels = [];
    this.foodModels = [];
  }

  execute() {
    if (!this.scene) return;

    this.queries.newFish.added.forEach((entity: any) => {
      this.createFishMesh(entity);
    });

    this.queries.newFood.added.forEach((entity: any) => {
      this.createSimpleMesh(entity, this.foodModels[0], "food");
    });

    this.queries.newShark.added.forEach((entity: any) => {
      this.createSimpleMesh(entity, this.sharkTemplate, "shark");
    });

    this.queries.newCrab.added.forEach((entity: any) => {
      this.createSimpleMesh(entity, this.crabTemplate, "crab");
    });

    this.queries.removed.removed.forEach((entity: any) => {
      const renderable = entity.getComponent(Renderable);
      if (renderable && renderable.model) {
        renderable.model.dispose();
      }
    });
  }

  createSimpleMesh(entity: any, template: any, prefix: string) {
    const renderable = entity.getMutableComponent(Renderable);
    const mesh = template.clone(`${prefix}_${entity.id}`);
    mesh.setEnabled(true);

    if (typeof renderable.scale === "number") {
      mesh.scaling.set(renderable.scale, renderable.scale, renderable.scale);
    }

    mesh.rotation.y = Math.random() * Math.PI * 2;

    renderable.model = mesh;
    renderable.model.entity = entity;
  }

  createFishMesh(entity: any) {
    const renderable = entity.getMutableComponent(Renderable);
    const genetics = entity.getComponent(Genetics);

    // Create a basic sphere as fallback
    const sphere = (window as any).BABYLON.MeshBuilder.CreateSphere(
      "fish_" + entity.id,
      { diameter: 2, segments: 8 },
      this.scene
    );
    
    renderable.model = sphere;
    
    if (typeof renderable.scale === "number") {
      sphere.scaling.set(renderable.scale, renderable.scale, renderable.scale);
    }

    sphere.rotation.y = Math.random() * Math.PI * 2;
    sphere.entity = entity;
  }

  applyColorToNode(node: any, rgbArray: number[]) {
    if (!rgbArray || !Array.isArray(rgbArray)) return;
    const [r, g, b] = rgbArray;
    const color3 = new (window as any).BABYLON.Color3(r / 255, g / 255, b / 255);
    node.getChildMeshes().forEach((mesh: any) => {
      if (!mesh.material) return;
      if (
        typeof mesh.getClassName === "function" &&
        mesh.getClassName() === "InstancedMesh"
      ) {
        return;
      }
      const key = `pbr_${rgbArray.join(",")}`;
      let mat = this.materialCache.get(key);
      if (!mat) {
        if (mesh.material instanceof (window as any).BABYLON.PBRMaterial) {
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

(BabylonMeshSystem as any).queries = {
  newFish: { components: [Renderable, FishTag], listen: { added: true } },
  newFood: { components: [Renderable, FoodTag], listen: { added: true } },
  newShark: { components: [Renderable, SharkTag], listen: { added: true } },
  newCrab: { components: [Renderable, CrabTag], listen: { added: true } },
  removed: { components: [Renderable], listen: { removed: true } },
};
