export class DebrisManager {
  scene: any;
  landscape: any;
  debrisMeshes: any[] = [];

  constructor(scene: any, landscape: any) {
    this.scene = scene;
    this.landscape = landscape;
    this.generateDebris();
  }

  private generateDebris(): void {
    const BABYLON = (window as any).BABYLON;
    const debrisCount = 10;

    for (let i = 0; i < debrisCount; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      
      // Random debris shapes
      const type = Math.random();
      let debris: any;
      
      if (type < 0.33) {
        debris = BABYLON.MeshBuilder.CreateBox(`debris_${i}`, { size: 0.5 + Math.random() }, this.scene);
      } else if (type < 0.66) {
        debris = BABYLON.MeshBuilder.CreateSphere(`debris_${i}`, { diameter: 0.5 + Math.random() }, this.scene);
      } else {
        debris = BABYLON.MeshBuilder.CreateCylinder(`debris_${i}`, { height: 0.3, diameter: 0.8 }, this.scene);
      }
      
      debris.position.set(x, 0.2 + Math.random() * 0.3, z);
      debris.rotation.set(Math.random(), Math.random(), Math.random());
      
      const material = new BABYLON.StandardMaterial(`debrisMat_${i}`, this.scene);
      material.diffuseColor = new BABYLON.Color3(0.4, 0.35, 0.3);
      debris.material = material;
      
      this.debrisMeshes.push(debris);
    }
  }
}
