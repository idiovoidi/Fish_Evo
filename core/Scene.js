class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = null;
        this.landscape = null;
        this.crabManager = null;
        this.fishManager = null;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    async initialize() {
        try {
            console.log("Starting scene initialization");

            // Setup basic scene properties
            this.scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.3, 1);
            this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            
            // Add basic lighting
            const light = new BABYLON.HemisphericLight(
                'mainLight',
                new BABYLON.Vector3(0, 1, 0),
                this.scene
            );
            light.intensity = 0.7;
            
            // Add secondary light for better underwater effect
            const dirLight = new BABYLON.DirectionalLight(
                'dirLight',
                new BABYLON.Vector3(-1, -2, -1),
                this.scene
            );
            dirLight.intensity = 0.3;

            // Enable fog for underwater effect
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
            this.scene.fogColor = new BABYLON.Color3(0.4, 0.6, 0.9);
            this.scene.fogDensity = 0.01;

            // Setup camera
            console.log("Setting up camera");
            this.camera = new Camera(this.scene, this.canvas);
            this.camera.setupMainCamera();

            // Create underwater landscape
            console.log("Creating landscape");
            this.landscape = new UnderwaterLandscape(this.scene);
            await this.landscape.setup();
            console.log("Landscape setup complete");

            // Create crab manager and initialize crabs
            console.log("Creating crabs");
            this.crabManager = new CrabManager(
                this.scene, 
                this.landscape.getNavigationPlugin(), 
                this.landscape
            );
            this.crabManager.createCrabs(10);
            console.log("Crabs created");

            // Create fish manager and initialize fish
            console.log("Creating fish");
            this.fishManager = new FishManager(this.scene);
            this.fishManager.createFishSchool(50);
            console.log("Fish created");

            // Setup animation loop
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.crabManager) this.crabManager.update();
                if (this.fishManager) this.fishManager.update();
            });

            console.log("Scene initialization complete");
        } catch (error) {
            console.error("Error during scene initialization:", error);
            throw error;
        }
    }

    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    getScene() {
        return this.scene;
    }

    getEngine() {
        return this.engine;
    }

    getCamera() {
        return this.camera;
    }

    getLandscape() {
        return this.landscape;
    }
}

// Initialize the scene
console.log("Starting application");
const canvas = document.getElementById('renderCanvas');
const sceneManager = new Scene(canvas);

sceneManager.initialize().then(() => {
    console.log("Scene initialization complete, starting render loop");
    sceneManager.startRenderLoop();
}).catch(error => {
    console.error("Application failed to start:", error);
}); 