class Camera {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.camera = null;
    }

    setupMainCamera() {
        // Create arc rotate camera
        this.camera = new BABYLON.ArcRotateCamera(
            'mainCamera',
            0,
            Math.PI / 3,
            50,
            BABYLON.Vector3.Zero(),
            this.scene
        );

        // Set camera limits
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 100;
        this.camera.lowerBetaLimit = 0.1;
        this.camera.upperBetaLimit = Math.PI / 2;

        // Set camera initial position for better view
        this.camera.setPosition(new BABYLON.Vector3(20, 20, 20));
        this.camera.setTarget(BABYLON.Vector3.Zero());

        // Attach camera controls
        this.camera.attachControl(this.canvas, true);

        // Adjust camera settings for smooth control
        this.camera.panningSensibility = 50;
        this.camera.wheelPrecision = 50;
        this.camera.pinchPrecision = 50;

        // Add inertia for smoother camera movement
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