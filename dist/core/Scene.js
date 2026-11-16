import { DayNightCycle } from '../environment/day_night_cycle';
import { UnderwaterLandscape } from '../environment/landscape';
import { CoralManager } from '../environment/coral';
import { DebrisManager } from '../environment/debris';
import { SeaweedManager } from '../environment/seaweed';
export class Scene {
    constructor(canvas) {
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
        this.canvas = canvas;
        this.engine = new window.BABYLON.Engine(canvas, true);
        this.scene = new window.BABYLON.Scene(this.engine);
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
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    async initialize() {
        try {
            console.log("Starting scene initialization");
            this.scene.clearColor = new window.BABYLON.Color4(0.05, 0.1, 0.15, 1);
            this.scene.ambientColor = new window.BABYLON.Color3(0.1, 0.2, 0.3);
            const SimulationConfig = window.SimulationConfig;
            if (SimulationConfig?.debug?.showNavMesh) {
                this.scene.debugLayer.show({
                    embedMode: true,
                    overlay: true
                });
            }
            if (SimulationConfig?.debug?.showFPS) {
                const advancedTexture = window.BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                this.fpsDisplay = new window.BABYLON.GUI.TextBlock("fpsCounter");
                this.fpsDisplay.text = "FPS: 0";
                this.fpsDisplay.color = "white";
                this.fpsDisplay.fontSize = 24;
                this.fpsDisplay.textHorizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                this.fpsDisplay.textVerticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                this.fpsDisplay.left = 10;
                this.fpsDisplay.top = 10;
                advancedTexture.addControl(this.fpsDisplay);
            }
            this.scene.fogMode = window.BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogColor = new window.BABYLON.Color3(0.1, 0.2, 0.3);
            this.scene.fogDensity = SimulationConfig?.graphics?.fog?.dayDensity || 0.02;
            console.log("Setting up camera");
            const { Camera } = await import('./Camera');
            this.camera = new Camera(this.scene, this.canvas);
            this.camera.setupMainCamera();
            const defaultPipeline = new window.BABYLON.DefaultRenderingPipeline("defaultPipeline", true, this.scene, [this.camera.getCamera()]);
            defaultPipeline.imageProcessing.exposure = 0.8;
            defaultPipeline.imageProcessing.contrast = 1.2;
            defaultPipeline.chromaticAberration.isEnabled = SimulationConfig?.graphics?.postProcessing?.chromaticAberration?.enabled || false;
            if (defaultPipeline.chromaticAberration.isEnabled) {
                defaultPipeline.chromaticAberration.aberrationAmount = 3;
            }
            defaultPipeline.bloomEnabled = SimulationConfig?.graphics?.postProcessing?.bloomEnabled || false;
            if (defaultPipeline.bloomEnabled) {
                defaultPipeline.bloomThreshold = 0.3;
                defaultPipeline.bloomWeight = 0.5;
                defaultPipeline.bloomKernel = SimulationConfig?.graphics?.postProcessing?.bloomKernel || 32;
            }
            console.log("Initializing day/night cycle");
            this.dayNightCycle = new DayNightCycle(this.scene);
            console.log("Creating landscape");
            this.landscape = new UnderwaterLandscape(this.scene);
            await this.landscape.setup();
            if (this.landscape.terrain) {
                this.dayNightCycle.addShadowCaster(this.landscape.terrain);
            }
            console.log("Landscape setup complete");
            console.log("Creating coral reef");
            this.coralManager = new CoralManager(this.scene, this.landscape);
            console.log("Creating ocean debris");
            this.debrisManager = new DebrisManager(this.scene, this.landscape);
            console.log("Creating seaweed");
            this.seaweedManager = new SeaweedManager(this.scene, this.landscape);
            this.seaweedManager.initialize();
            if (this.landscape.waterBox) {
                const waterMaterial = this.landscape.waterBox.material;
                this.scene.onBeforeRenderObservable.add(() => {
                    const hour = this.dayNightCycle.getCurrentHour();
                    const isNight = hour < 6 || hour > 18;
                    waterMaterial.alpha = isNight ? 0.5 : 0.4;
                    waterMaterial.diffuseColor = isNight
                        ? new window.BABYLON.Color3(0.1, 0.15, 0.25)
                        : new window.BABYLON.Color3(0.2, 0.3, 0.4);
                    this.scene.fogDensity = isNight ? 0.03 : 0.02;
                    this.scene.fogColor = isNight
                        ? new window.BABYLON.Color3(0.05, 0.1, 0.15)
                        : new window.BABYLON.Color3(0.1, 0.2, 0.3);
                });
            }
            console.log("Entity initialization complete");
            this.scene.onBeforeRenderObservable.add(() => {
                this.frameCount++;
                if (this.seaweedManager) {
                    this.seaweedManager.update();
                }
                if (this.frameCount % (SimulationConfig?.graphics?.shadows?.updateInterval || 5) === 0) {
                    this.scene.shadowGenerator?.getShadowMap()?.refresh();
                }
                if (this.fpsDisplay && this.frameCount % 30 === 0) {
                    this.fpsDisplay.text = `FPS: ${Math.round(this.engine.getFps())}`;
                }
                if (this.frameCount > 1000000) {
                    this.frameCount = 0;
                }
            });
            console.log("Scene initialization complete");
        }
        catch (error) {
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
//# sourceMappingURL=Scene.js.map