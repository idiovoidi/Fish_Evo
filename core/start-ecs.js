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

    // If no usable glTF exists, ensure we can generate a simple fish glTF for external tools if needed
    if (BABYLON && BABYLON.GLTF2Export && manager && manager.getScene) {
      // No-op now; helper available for manual export from console if desired
      window.exportSimpleFishGLTF = async function exportSimpleFishGLTF() {
        const s = manager.getScene();
        // Build a minimal fish out of primitives
        const body = BABYLON.MeshBuilder.CreateCapsule('pf_body', { radius: 0.2, height: 1 }, s);
        const tail = BABYLON.MeshBuilder.CreateCylinder('pf_tail', { diameterTop: 0.3, diameterBottom: 0, height: 0.4 }, s);
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -0.7;
        const finL = BABYLON.MeshBuilder.CreateCylinder('pf_finL', { diameterTop: 0.15, diameterBottom: 0, height: 0.25 }, s);
        finL.rotation.z = -Math.PI/4; finL.position.set(0.25, 0, 0);
        const finR = finL.clone('pf_finR'); finR.rotation.z = Math.PI/4; finR.position.x = -0.25;
        const fish = BABYLON.Mesh.MergeMeshes([body, tail, finL, finR], true, true, undefined, false, true);
        fish.name = 'ParamFish';
        const mat = new BABYLON.StandardMaterial('pf_mat', s);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1.0);
        fish.material = mat;
        const gltf = await BABYLON.GLTF2Export.GLBAsync(s, 'parametric_fish');
        gltf.downloadFiles();
        fish.dispose();
      };
    }

    const simulation = new Simulation();
    simulation.initialize(scene);
    console.log('ECS Simulation started');
  } catch (err) {
    console.error('Failed to start ECS Simulation:', err);
  }
})();


