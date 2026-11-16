import { Color3, DirectionalLight, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';
import { lerp, smoothstep } from './noise';

const FOG_DAY = new Color3(0.04, 0.34, 0.52);
const FOG_DUSK = new Color3(0.26, 0.2, 0.36);
const FOG_NIGHT = new Color3(0.012, 0.045, 0.1);

const SUN_NOON = new Color3(1, 0.96, 0.82);
const SUN_LOW = new Color3(1, 0.58, 0.38);
const MOON = new Color3(0.5, 0.65, 1);

const lerpColor = (a: Color3, b: Color3, t: number, out = new Color3()) =>
  out.set(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));

/**
 * Owns the sun/moon, ambient light and the underwater fog palette, and exposes
 * the resulting values so custom materials (fish, kelp, ...) can match them.
 */
export class DayNightCycle {
  readonly sunLight: DirectionalLight;
  readonly hemiLight: HemisphericLight;

  /** Hour of day, 0..24. */
  hour = 10;
  /** Real seconds for one full simulated day. */
  dayLength = 180;
  paused = false;

  /** 0 at night, 1 at midday. */
  daylight = 1;
  /** Direction the light travels (sun by day, moon by night). */
  readonly lightDirection = new Vector3(-0.3, -1, -0.2);
  readonly lightColor = new Color3();
  readonly ambientColor = new Color3();
  readonly fogColor = new Color3();
  fogDensity = 0.016;

  constructor(private scene: Scene) {
    this.sunLight = new DirectionalLight('sun', this.lightDirection.clone(), scene);
    this.sunLight.position = new Vector3(0, 90, 0);
    this.sunLight.shadowMinZ = 1;
    this.sunLight.shadowMaxZ = 260;

    this.hemiLight = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    this.hemiLight.specular = Color3.Black();

    scene.fogMode = Scene.FOGMODE_EXP2;
    this.apply();
  }

  /** Simulated seconds advance the clock; `dt` is in real seconds. */
  update(dt: number) {
    if (!this.paused) {
      this.hour = (this.hour + (dt / this.dayLength) * 24) % 24;
    }
    this.apply();
  }

  setHour(hour: number) {
    this.hour = ((hour % 24) + 24) % 24;
    this.apply();
  }

  get isNight() {
    return this.daylight < 0.25;
  }

  private apply() {
    const angle = ((this.hour - 6) / 24) * Math.PI * 2;
    const elevation = Math.sin(angle);
    this.daylight = smoothstep(-0.1, 0.5, elevation);

    // Sun by day, moon (mirrored across the horizon) by night.
    const sx = Math.cos(angle) * 0.65;
    const sy = elevation >= 0 ? elevation : -elevation;
    const sz = 0.4;
    const flip = elevation >= 0 ? 1 : -1;
    this.lightDirection.set(-sx * flip, -Math.max(0.25, sy), -sz * flip).normalize();
    this.sunLight.direction.copyFrom(this.lightDirection);
    this.sunLight.position.set(-this.lightDirection.x * 90, -this.lightDirection.y * 90, -this.lightDirection.z * 90);

    const warm = Math.max(0, 1 - Math.abs(elevation) / 0.32) * (elevation > -0.12 ? 1 : 0);
    const dayAmount = this.daylight;

    lerpColor(MOON, lerpColor(SUN_NOON, SUN_LOW, warm * 0.8), dayAmount, this.lightColor);
    this.sunLight.diffuse.copyFrom(this.lightColor);
    this.sunLight.specular.copyFrom(this.lightColor);
    this.sunLight.intensity = lerp(0.7, 2.1, dayAmount);

    lerpColor(FOG_NIGHT, FOG_DAY, dayAmount, this.fogColor);
    lerpColor(this.fogColor, FOG_DUSK, warm * 0.55, this.fogColor);
    this.fogDensity = lerp(0.02, 0.0115, dayAmount);

    this.hemiLight.diffuse.set(lerp(0.14, 0.3, dayAmount), lerp(0.24, 0.55, dayAmount), lerp(0.46, 0.75, dayAmount));
    this.hemiLight.groundColor.set(lerp(0.03, 0.12, dayAmount), lerp(0.05, 0.13, dayAmount), lerp(0.1, 0.1, dayAmount));
    this.hemiLight.intensity = lerp(0.8, 0.95, dayAmount);
    this.ambientColor.set(this.hemiLight.diffuse.r, this.hemiLight.diffuse.g, this.hemiLight.diffuse.b)
      .scaleInPlace(this.hemiLight.intensity);

    this.scene.fogColor.copyFrom(this.fogColor);
    this.scene.fogDensity = this.fogDensity;
    this.scene.clearColor.set(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
    this.scene.ambientColor.copyFrom(this.ambientColor);
  }

  formatClock(): string {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
