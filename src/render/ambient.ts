import { Scene, ShaderMaterial } from '@babylonjs/core';
import type { DayNightCycle } from '../environment/day_night_cycle';

/**
 * Uniforms every custom material shares so it matches the scene's lighting and
 * underwater fog. Declare these in the material's `uniforms` option and the
 * fragment shader gets sun/ambient/fog without any per-material wiring.
 */
export const AMBIENT_UNIFORMS = [
  'time', 'lightDir', 'lightColor', 'ambientColor', 'fogColor', 'fogDensity',
  'daylight', 'cameraPosition'
];

/** GLSL declarations + helper matching Babylon's EXP2 fog. */
export const AMBIENT_GLSL = `
uniform float time;
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 fogColor;
uniform float fogDensity;
uniform float daylight;
uniform vec3 cameraPosition;

vec3 applyFog(vec3 color, vec3 worldPos) {
  float d = length(worldPos - cameraPosition) * fogDensity;
  return mix(fogColor, color, exp(-d * d));
}
`;

/** Keeps shader materials in sync with the environment before every frame. */
export class AmbienceBinder {
  private materials = new Map<ShaderMaterial, () => number>();

  constructor(private scene: Scene, private env: DayNightCycle, private defaultClock: () => number) {
    scene.onBeforeRenderObservable.add(() => this.update());
  }

  /** `clock` lets a material run on simulation time (pauses with the sim). */
  add(material: ShaderMaterial, clock: () => number = this.defaultClock) {
    this.materials.set(material, clock);
    this.bind(material, clock());
    return material;
  }

  update() {
    this.materials.forEach((clock, m) => this.bind(m, clock()));
  }

  private bind(m: ShaderMaterial, time: number) {
    const env = this.env;
    m.setFloat('time', time);
    m.setVector3('lightDir', env.lightDirection);
    m.setColor3('lightColor', env.lightColor);
    m.setColor3('ambientColor', env.ambientColor);
    m.setColor3('fogColor', env.fogColor);
    m.setFloat('fogDensity', env.fogDensity);
    m.setFloat('daylight', env.daylight);
    const cam = this.scene.activeCamera;
    if (cam) m.setVector3('cameraPosition', cam.globalPosition);
  }
}
