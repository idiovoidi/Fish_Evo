class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = null;
        this.landscape = null;
        this.entityHandler = null;
        this.dayNightCycle = null;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    async initialize() {
        try {
            console.log("Starting scene initialization");

            // Setup basic scene properties
            this.scene.clearColor = new BABYLON.Color4(0.05, 0.1, 0.15, 1);
            this.scene.ambientColor = new BABYLON.Color3(0.1, 0.2, 0.3);
            
            // Enable debug layer
            this.scene.debugLayer.show({
                embedMode: true,
                overlay: true
            });

            // Enhanced underwater fog effect
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogColor = new BABYLON.Color3(0.1, 0.2, 0.3);
            this.scene.fogDensity = 0.03;

            // Setup camera
            console.log("Setting up camera");
            this.camera = new Camera(this.scene, this.canvas);
            this.camera.setupMainCamera();

            // Add underwater post-processing
            const defaultPipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", true, this.scene, [this.camera.getCamera()]
            );
            
            // Configure pipeline for underwater effect
            defaultPipeline.imageProcessing.exposure = 0.8;
            defaultPipeline.imageProcessing.contrast = 1.2;
            defaultPipeline.chromaticAberration.aberrationAmount = 3;
            defaultPipeline.chromaticAberration.isEnabled = true;
            defaultPipeline.bloomEnabled = true;
            defaultPipeline.bloomThreshold = 0.3;
            defaultPipeline.bloomWeight = 0.5;
            defaultPipeline.bloomKernel = 64;

            // Initialize day/night cycle before landscape
            console.log("Initializing day/night cycle");
            this.dayNightCycle = new DayNightCycle(this.scene);
            
            // Create underwater landscape
            console.log("Creating landscape");
            this.landscape = new UnderwaterLandscape(this.scene);
            await this.landscape.setup();
            
            // Register landscape meshes for shadows
            if (this.landscape.terrain) {
                this.dayNightCycle.addShadowCaster(this.landscape.terrain);
            }
            console.log("Landscape setup complete");

            // Initialize entity handler
            console.log("Initializing entities");
            this.entityHandler = new EntityHandler(this.scene, this.landscape);
            await this.entityHandler.initialize();
            
            // Register entities for shadows
            if (this.entityHandler.crabManager) {
                this.entityHandler.crabManager.crabs.forEach(crab => {
                    if (crab.renderComponent) {
                        this.dayNightCycle.addShadowCaster(crab.renderComponent);
                    }
                });
            }
            console.log("Entity initialization complete");

            // Enhanced water material adjustments based on time of day
            if (this.landscape.waterBox) {
                const waterMaterial = this.landscape.waterBox.material;
                this.scene.onBeforeRenderObservable.add(() => {
                    const hour = this.dayNightCycle.getCurrentHour();
                    const isNight = hour < 6 || hour > 18;
                    
                    // Adjust water properties based on time
                    waterMaterial.alpha = isNight ? 0.5 : 0.4;
                    waterMaterial.diffuseColor = isNight 
                        ? new BABYLON.Color3(0.1, 0.15, 0.25)  // Darker water at night
                        : new BABYLON.Color3(0.2, 0.3, 0.4);   // Darker water during day
                    
                    // Update fog based on time
                    this.scene.fogDensity = isNight ? 0.03 : 0.02;
                    this.scene.fogColor = isNight
                        ? new BABYLON.Color3(0.05, 0.1, 0.15)
                        : new BABYLON.Color3(0.1, 0.2, 0.3);
                });
            }

            // Setup animation loop
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.entityHandler) this.entityHandler.update();
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

    getDayNightCycle() {
        return this.dayNightCycle;
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