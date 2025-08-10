/**
 * Manages all UI elements for the simulation, including HUD, inspector, and user interactions.
 */
export class UIManager {
  constructor(scene, simulation) {
    this.scene = scene;
    this.simulation = simulation;
    this.selectedEntity = null;

    this.initStyles();
    this.initDOM();
    this.initObservers();
  }

  /**
   * Injects necessary CSS styles into the document head.
   */
  initStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .hud { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); color: white; padding: 10px; font-family: monospace; z-index: 100; border-radius: 5px; }
      .inspector { display: none; position: absolute; top: 15px; right: 15px; width: 280px; max-height: 90vh; background: rgba(0,0,0,0.75); color: white; padding: 15px; font-family: monospace; z-index: 101; border-radius: 5px; overflow-y: auto; }
      .inspector h3 { margin-top: 0; border-bottom: 1px solid #555; padding-bottom: 5px; }
      .inspector .component { margin-bottom: 10px; }
      .inspector .prop { display: flex; justify-content: space-between; font-size: 12px; }
      .inspector .prop-key { color: #aaa; }
      .inspector .prop-val { color: #0f0; }
      .inspector .genetics-color-swatch { width: 12px; height: 12px; display: inline-block; border: 1px solid #fff; vertical-align: middle; margin-left: 5px; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Creates the necessary DOM elements for the UI.
   */
  initDOM() {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'hud';
    this.hudElement.innerHTML = 'Initializing...';
    document.body.appendChild(this.hudElement);

    this.inspectorElement = document.createElement('div');
    this.inspectorElement.className = 'inspector';
    document.body.appendChild(this.inspectorElement);
  }

  /**
   * Sets up event listeners and observers for UI updates and interactions.
   */
  initObservers() {
    // Regular HUD update
    setInterval(() => this.updateHUD(), 1000);

    // Click handler for entity selection
    this.scene.onPointerDown = (evt, pickInfo) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        const pickedMesh = pickInfo.pickedMesh;
        // Check if mesh is associated with an entity
        if (pickedMesh.entity) {
          this.selectEntity(pickedMesh.entity);
        } else {
          this.deselectEntity();
        }
      } else {
        this.deselectEntity();
      }
    };
  }

  /**
   * Updates the main HUD with statistics.
   */
  updateHUD() {
    const stats = this.simulation.world.stats;
    this.hudElement.innerHTML = `
      Entities: ${stats.numEntities}<br>
      FPS: ${this.scene.getEngine().getFps().toFixed(0)}
    `;
  }

  /**
   * Selects an entity and displays its details in the inspector.
   * @param {ecsy.Entity} entity The entity to inspect.
   */
  selectEntity(entity) {
    this.selectedEntity = entity;
    this.inspectorElement.style.display = 'block';
    this.updateInspector();
  }

  /**
   * Clears the current selection and hides the inspector.
   */
  deselectEntity() {
    this.selectedEntity = null;
    this.inspectorElement.style.display = 'none';
  }

  /**
   * Re-renders the inspector panel with data from the currently selected entity.
   */
  updateInspector() {
    if (!this.selectedEntity || !this.selectedEntity.alive) {
      this.deselectEntity();
      return;
    }

    let html = `<h3>Entity #${this.selectedEntity.id}</h3>`;
    for (const Comp of this.selectedEntity.getComponents()) {
      const compName = Comp.constructor.name;
      html += `<div class="component"><h4>${compName}</h4>`;
      const schema = Comp.constructor.schema;
      if (schema) {
        for (const key in schema) {
          let val = Comp[key];
          if (typeof val === 'number') val = val.toFixed(2);
          if (Array.isArray(val)) {
            val = `[${val.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}]`;
            if (key === 'color') {
              const [r,g,b] = Comp[key];
              val += `<span class="genetics-color-swatch" style="background-color: rgb(${r},${g},${b});"></span>`;
            }
          }
          html += `<div class="prop"><span class="prop-key">${key}:</span> <span class="prop-val">${val}</span></div>`;
        }
      }
      html += `</div>`;
    }

    this.inspectorElement.innerHTML = html;
  }
} 