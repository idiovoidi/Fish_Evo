export class DayNightCycle {
  scene: any;
  sunLight: any;
  hemiLight: any;
  shadowGenerator: any;
  time: number = 0;
  dayDuration: number = 60; // seconds per day

  constructor(scene: any) {
    this.scene = scene;
    this.setupLights();
  }

  private setupLights(): void {
    const BABYLON = (window as any).BABYLON;
    
    // Sun directional light
    this.sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-0.5, -1, -0.3),
      this.scene
    );
    this.sunLight.intensity = 1.2;
    this.sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    this.sunLight.specular = new BABYLON.Color3(1, 1, 1);

    // Hemisphere light for ambient
    this.hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.6;
    this.hemiLight.diffuse = new BABYLON.Color3(0.2, 0.4, 0.6);
    this.hemiLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    // Shadow generator
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sunLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
  }

  addShadowCaster(mesh: any): void {
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }

  getCurrentHour(): number {
    return (this.time % this.dayDuration) / this.dayDuration * 24;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    const hour = this.getCurrentHour();
    const isNight = hour < 6 || hour > 18;

    const BABYLON = (window as any).BABYLON;

    // Update sun position based on time
    const angle = ((hour - 6) / 12) * Math.PI; // Sunrise at 6, sunset at 18
    this.sunLight.direction = new BABYLON.Vector3(
      -Math.cos(angle) * 0.5,
      -Math.sin(angle),
      -0.3
    );

    // Adjust light intensity
    if (isNight) {
      this.sunLight.intensity = 0.1;
      this.hemiLight.intensity = 0.2;
      this.hemiLight.diffuse = new BABYLON.Color3(0.05, 0.1, 0.2);
    } else {
      const dayProgress = Math.sin(angle);
      this.sunLight.intensity = 1.2 * dayProgress;
      this.hemiLight.intensity = 0.6;
      this.hemiLight.diffuse = new BABYLON.Color3(0.2, 0.4, 0.6);
    }
  }
}
