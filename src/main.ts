import './config/simulation_config';
import { Scene } from './core/Scene';
import { Simulation } from './core/Simulation';

// Wait for libraries to load
async function waitForLibraries(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkLibraries = () => {
      attempts++;
      if (typeof BABYLON !== 'undefined' && 
          typeof Recast !== 'undefined' && 
          typeof YUKA !== 'undefined' &&
          typeof (window as any).ECSY !== 'undefined') {
        console.log('All libraries loaded successfully');
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Timeout waiting for libraries to load'));
      } else {
        setTimeout(checkLibraries, 100);
      }
    };
    checkLibraries();
  });
}

async function initApp(): Promise<void> {
  try {
    await waitForLibraries();
    console.log('Initializing application...');
    
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const scene = new Scene(canvas);
    await scene.initialize();
    
    // Expose scene globally for ECS
    (window as any).scene = scene;
    
    // Start ECS simulation
    const simulation = new Simulation();
    simulation.initialize(scene);
    (window as any).simulation = simulation;
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    alert(`Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

initApp();
