class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = null;
        this.landscape = null;
        this.entityHandler = null;
        this.dayNightCycle = null;
        this.coralManager = null;
        this.debrisManager = null;
        this.sharkHandler = null;
        this.foodSpawner = null;
        this.seaweedManager = null;
        this.frameCount = 0;
        this.fpsDisplay = null;
        
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
            
            // Only enable debug layer if configured
            if (SimulationConfig.debug.showNavMesh) {
                this.scene.debugLayer.show({
                    embedMode: true,
                    overlay: true
                });
            }

            // Setup FPS display if enabled
            if (SimulationConfig.debug.showFPS) {
                const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                this.fpsDisplay = new BABYLON.GUI.TextBlock("fpsCounter");
                this.fpsDisplay.text = "FPS: 0";
                this.fpsDisplay.color = "white";
                this.fpsDisplay.fontSize = 24;
                this.fpsDisplay.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                this.fpsDisplay.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                this.fpsDisplay.left = 10;
                this.fpsDisplay.top = 10;
                advancedTexture.addControl(this.fpsDisplay);
            }

            // Enhanced underwater fog effect with configurable density
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogColor = new BABYLON.Color3(0.1, 0.2, 0.3);
            this.scene.fogDensity = SimulationConfig.graphics.fog.dayDensity;

            // Setup camera
            console.log("Setting up camera");
            this.camera = new Camera(this.scene, this.canvas);
            this.camera.setupMainCamera();

            // Add underwater post-processing with optimized settings
            const defaultPipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", true, this.scene, [this.camera.getCamera()]
            );
            
            // Configure pipeline based on performance settings
            defaultPipeline.imageProcessing.exposure = 0.8;
            defaultPipeline.imageProcessing.contrast = 1.2;
            
            // Apply chromatic aberration settings
            defaultPipeline.chromaticAberration.isEnabled = SimulationConfig.graphics.postProcessing.chromaticAberration.enabled;
            if (defaultPipeline.chromaticAberration.isEnabled) {
                defaultPipeline.chromaticAberration.aberrationAmount = 3;
            }
            
            // Apply bloom settings
            defaultPipeline.bloomEnabled = SimulationConfig.graphics.postProcessing.bloomEnabled;
            if (defaultPipeline.bloomEnabled) {
                defaultPipeline.bloomThreshold = 0.3;
                defaultPipeline.bloomWeight = 0.5;
                defaultPipeline.bloomKernel = SimulationConfig.graphics.postProcessing.bloomKernel;
            }

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

            // Initialize coral
            console.log("Creating coral reef");
            this.coralManager = new CoralManager(this.scene, this.landscape);

            // Initialize ocean debris
            console.log("Creating ocean debris");
            this.debrisManager = new DebrisManager(this.scene, this.landscape);

            // Initialize seaweed
            console.log("Creating seaweed");
            this.seaweedManager = new SeaweedManager(this.scene, this.landscape);
            this.seaweedManager.initialize();

            // (Shark, legacy entities, and legacy food spawner are handled by ECS; remove legacy initializations)

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

            // Fish inspector handled by ECS UIManager; legacy inspector removed

            console.log("Entity initialization complete");

            // Update animation loop to include food spawner
            this.scene.onBeforeRenderObservable.add(() => {
                this.frameCount++;
                
                // Update seaweed manager if needed
                if (this.seaweedManager) {
                    this.seaweedManager.update();
                }
                
                // Update shadows based on configured interval
                if (this.frameCount % SimulationConfig.graphics.shadows.updateInterval === 0) {
                    this.scene.shadowGenerator?.getShadowMap()?.refresh();
                }
                
                // Update FPS display
                if (this.fpsDisplay && this.frameCount % 30 === 0) {
                    this.fpsDisplay.text = `FPS: ${Math.round(this.engine.getFps())}`;
                }
                
                // Reset frame counter to prevent overflow
                if (this.frameCount > 1000000) {
                    this.frameCount = 0;
                }
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
// Expose globally so ECS bootstrap can attach later
if (typeof window !== 'undefined') {
    window.sceneManager = sceneManager;
}

sceneManager.initialize().then(() => {
    console.log("Scene initialization complete, starting render loop");
    sceneManager.startRenderLoop();
}).catch(error => {
    console.error("Application failed to start:", error);
}); 