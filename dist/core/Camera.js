export class Camera {
    constructor(scene, canvas) {
        this.camera = null;
        this.scene = scene;
        this.canvas = canvas;
        this.camera = null;
    }
    setupMainCamera() {
        this.camera = new window.BABYLON.ArcRotateCamera('mainCamera', 0, Math.PI / 3, 50, window.BABYLON.Vector3.Zero(), this.scene);
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 100;
        this.camera.lowerBetaLimit = 0.1;
        this.camera.upperBetaLimit = Math.PI / 2;
        this.camera.setPosition(new window.BABYLON.Vector3(20, 20, 20));
        this.camera.setTarget(window.BABYLON.Vector3.Zero());
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
    setTarget(target) {
        if (this.camera) {
            this.camera.setTarget(target);
        }
    }
    setPosition(position) {
        if (this.camera) {
            this.camera.setPosition(position);
        }
    }
}
//# sourceMappingURL=Camera.js.map