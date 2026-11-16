import {
  Color4, DefaultRenderingPipeline, Engine, ImageProcessingConfiguration, Scene as BabylonScene
} from '@babylonjs/core';
import { CoralReef } from '../environment/coral';
import { DayNightCycle } from '../environment/day_night_cycle';
import { Flora } from '../environment/flora';
import { Rocks } from '../environment/rocks';
import { Seabed } from '../environment/seabed';
import { WaterEffects } from '../environment/water';
import { AmbienceBinder } from '../render/ambient';
import { ModelLibrary } from '../render/model_library';
import { Camera } from './Camera';

const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export type ProgressCallback = (label: string, fraction: number) => void;

/** Owns the Babylon engine/scene and every piece of non-simulated scenery. */
export class Scene {
  readonly engine: Engine;
  readonly scene: BabylonScene;
  camera!: Camera;
  dayNight!: DayNightCycle;
  seabed!: Seabed;
  water!: WaterEffects;
  models!: ModelLibrary;
  pipeline!: DefaultRenderingPipeline;
  binder!: AmbienceBinder;

  /** Simulation clock in seconds (frozen while paused). */
  simTime = 0;
  private realTime = 0;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    }, true);
    this.scene = new BabylonScene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.1, 0.15, 1);
    window.addEventListener('resize', () => this.engine.resize());
  }

  async initialize(progress: ProgressCallback = () => {}) {
    const step = async (label: string, fraction: number, work: () => void) => {
      progress(label, fraction);
      await nextTask();
      work();
    };

    await step('Warming the sun', 0.05, () => {
      this.dayNight = new DayNightCycle(this.scene);
      this.camera = new Camera(this.scene, this.canvas);
      this.binder = new AmbienceBinder(this.scene, this.dayNight, () => this.realTime);
    });
    await step('Sculpting the seabed', 0.2, () => {
      this.seabed = new Seabed(this.scene);
    });
    await step('Filling the water', 0.4, () => {
      this.water = new WaterEffects(this.scene, this.seabed.causticTexture);
    });
    await step('Planting kelp forests', 0.55, () => {
      new Flora(this.scene, this.binder);
    });
    await step('Growing coral', 0.7, () => {
      new CoralReef(this.scene);
      new Rocks(this.scene);
    });
    await step('Preparing creatures', 0.85, () => {
      this.models = new ModelLibrary(this.scene, this.binder, () => this.simTime);
    });
    await step('Polishing the light', 0.95, () => {
      this.setupPostProcessing();
    });

    this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.realTime += dt;
      this.dayNight.update(dt);
      this.seabed.update(this.realTime, this.dayNight.daylight);
      this.water.update(this.realTime, this.dayNight.daylight, this.dayNight.fogColor);
    });
    progress('Ready', 1);
  }

  private setupPostProcessing() {
    const pipeline = new DefaultRenderingPipeline('pipeline', true, this.scene, [this.camera.camera]);
    pipeline.samples = 4;
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.75;
    pipeline.bloomWeight = 0.32;
    pipeline.bloomKernel = 48;
    pipeline.bloomScale = 0.5;

    pipeline.imageProcessingEnabled = true;
    const ip = pipeline.imageProcessing;
    ip.toneMappingEnabled = true;
    ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    ip.exposure = 1.05;
    ip.contrast = 1.18;
    ip.vignetteEnabled = true;
    ip.vignetteWeight = 2.2;
    ip.vignetteStretch = 0.4;
    ip.vignetteColor = new Color4(0, 0.02, 0.05, 0);

    pipeline.chromaticAberrationEnabled = true;
    pipeline.chromaticAberration.aberrationAmount = 6;
    pipeline.chromaticAberration.radialIntensity = 1.2;
    pipeline.grainEnabled = true;
    pipeline.grain.intensity = 4;
    pipeline.grain.animated = true;
    this.pipeline = pipeline;
  }

  /** Toggle the expensive post-processing, for slower GPUs. */
  setEffectsEnabled(enabled: boolean) {
    this.pipeline.bloomEnabled = enabled;
    this.pipeline.chromaticAberrationEnabled = enabled;
    this.pipeline.grainEnabled = enabled;
    this.pipeline.samples = enabled ? 4 : 1;
    this.water.setParticlesEnabled(enabled);
  }

  startRenderLoop() {
    this.engine.runRenderLoop(() => this.scene.render());
  }

  getScene() { return this.scene; }
  getEngine() { return this.engine; }
}
