import { Simulation } from './Simulation.js';

// Wait for sceneManager created by core/Scene.js
function waitForSceneManager(maxMs = 5000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    (function check() {
      if (window.sceneManager && window.sceneManager.getScene) {
        resolve(window.sceneManager);
        return;
      }
      if (performance.now() - start > maxMs) {
        reject(new Error('Timed out waiting for sceneManager'));
        return;
      }
      setTimeout(check, 50);
    })();
  });
}

(async function bootstrapECS() {
  try {
    const manager = await waitForSceneManager();
    const scene = manager.getScene();
    if (!scene) throw new Error('Scene not initialized');

    const simulation = new Simulation();
    simulation.initialize(scene);
    console.log('ECS Simulation started');
  } catch (err) {
    console.error('Failed to start ECS Simulation:', err);
  }
})();


