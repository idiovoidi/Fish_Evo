import { Simulation } from './Simulation.js';

// Global reference for debugging
let simulation: Simulation | null = null;

function startECS(): void {
  // Scene should be initialized by Scene.ts and available on window
  const scene = (window as any).scene;
  
  if (!scene) {
    console.error('Scene not initialized. Cannot start ECS.');
    return;
  }
  
  // Create and initialize simulation
  simulation = new Simulation();
  simulation.initialize(scene);
  
  // Expose for debugging
  (window as any).simulation = simulation;
  
  console.log('ECS simulation started successfully');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startECS);
} else {
  // DOM already loaded, check if scene is ready
  if ((window as any).scene) {
    startECS();
  } else {
    // Wait a bit for scene initialization
    setTimeout(startECS, 100);
  }
}
