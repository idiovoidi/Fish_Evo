import './ui/styles.css';
import { Scene } from './core/Scene';
import { Simulation } from './core/Simulation';
import { UI } from './ui/UI';

const loading = document.getElementById('loading');
const loadingLabel = document.getElementById('loading-label');
const loadingBar = document.getElementById('loading-bar');

function setProgress(label: string, fraction: number) {
  if (loadingLabel) loadingLabel.textContent = label;
  if (loadingBar) loadingBar.style.width = `${Math.round(fraction * 100)}%`;
}

async function boot() {
  try {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const scene = new Scene(canvas);
    await scene.initialize(setProgress);

    const simulation = new Simulation();
    simulation.initialize(scene);
    const ui = new UI(scene, simulation);

    scene.startRenderLoop();
    // Handy for poking around in the console.
    (window as any).fishEvo = { scene, simulation, ui };

    loading?.classList.add('done');
    setTimeout(() => loading?.remove(), 1200);
  } catch (error) {
    console.error('Failed to start Fish Evo:', error);
    setProgress(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`, 1);
    loading?.classList.add('error');
  }
}

boot();
