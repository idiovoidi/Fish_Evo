export class Camera {
  scene: any;
  canvas: HTMLCanvasElement;
  camera: any = null;

  constructor(scene: any, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = null;
  }

  setupMainCamera() {
    this.camera = new (window as any).BABYLON.ArcRotateCamera(
      'mainCamera',
      0,
      Math.PI / 3,
      50,
      (window as any).BABYLON.Vector3.Zero(),
      this.scene
    );

    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 100;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2;

    this.camera.setPosition(new (window as any).BABYLON.Vector3(20, 20, 20));
    this.camera.setTarget((window as any).BABYLON.Vector3.Zero());

    this.camera.attachControl(this.canvas, true);

    this.camera.panningSensibility = 50;
    this.camera.wheelPrecision = 50;
    this.camera.pinchPrecision = 50;

    this.camera.inertia = 0.7;
    this.camera.angularSensibilityX = 500;
    this.camera.angularSensibilityY = 500;

    return this.camera;
  }

  getCamera() {
    return this.camera;
  }

  setTarget(target: any) {
    if (this.camera) {
      this.camera.setTarget(target);
    }
  }

  setPosition(position: any) {
    if (this.camera) {
      this.camera.setPosition(position);
    }
  }
}
