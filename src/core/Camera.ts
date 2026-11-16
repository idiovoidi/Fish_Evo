import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';
import { terrainHeight, WATER_LEVEL } from '../environment/terrain_height';

/** Orbit camera that stays underwater, above the seabed, and idles in a slow drift. */
export class Camera {
  readonly camera: ArcRotateCamera;

  constructor(private scene: Scene, private canvas: HTMLCanvasElement) {
    const cam = new ArcRotateCamera('mainCamera', -Math.PI / 3, 1.38, 52, new Vector3(0, 11, 0), scene);
    cam.lowerRadiusLimit = 6;
    cam.upperRadiusLimit = 115;
    cam.lowerBetaLimit = 0.15;
    cam.upperBetaLimit = Math.PI / 2 + 0.25;
    cam.minZ = 0.3;
    cam.maxZ = 500;
    cam.fov = 0.9;

    cam.wheelDeltaPercentage = 0.012;
    cam.pinchDeltaPercentage = 0.012;
    cam.panningSensibility = 60;
    cam.angularSensibilityX = 900;
    cam.angularSensibilityY = 900;
    cam.inertia = 0.88;
    cam.panningInertia = 0.85;
    cam.attachControl(canvas, true);

    cam.useAutoRotationBehavior = true;
    const idle = cam.autoRotationBehavior!;
    idle.idleRotationSpeed = 0.035;
    idle.idleRotationWaitTime = 6000;
    idle.idleRotationSpinupTime = 3000;
    idle.zoomStopsAnimation = true;

    this.camera = cam;
    scene.onBeforeRenderObservable.add(() => this.constrain());
  }

  setAutoOrbit(enabled: boolean) {
    this.camera.useAutoRotationBehavior = enabled;
    if (enabled) {
      const idle = this.camera.autoRotationBehavior!;
      idle.idleRotationSpeed = 0.035;
      idle.idleRotationWaitTime = 6000;
      idle.idleRotationSpinupTime = 3000;
    }
  }

  get autoOrbit() {
    return this.camera.useAutoRotationBehavior;
  }

  /** Keeps the eye below the surface and above the dunes. */
  private constrain() {
    const cam = this.camera;
    const t = cam.target;
    t.x = Math.max(-60, Math.min(60, t.x));
    t.z = Math.max(-60, Math.min(60, t.z));
    t.y = Math.max(terrainHeight(t.x, t.z) + 1.5, Math.min(WATER_LEVEL - 3, t.y));

    // Highest allowed beta so the eye clears the floor, lowest so it stays below the surface.
    const r = cam.radius;
    const ceiling = (WATER_LEVEL - 1.5 - t.y) / r;
    if (ceiling < 1) cam.beta = Math.max(cam.beta, Math.acos(Math.max(-1, ceiling)));

    const p = cam.position;
    const floor = terrainHeight(p.x, p.z) + 1.4;
    if (p.y < floor) {
      const need = (floor - t.y) / r;
      if (need < 1 && need > -1) cam.beta = Math.min(cam.beta, Math.acos(need));
    }
  }

  setTarget(target: Vector3) {
    this.camera.setTarget(target);
  }
}
