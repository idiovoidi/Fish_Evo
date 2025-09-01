/**
 * Manages all UI elements for the simulation, including HUD, inspector, and user interactions.
 */
export class UIManager {
  constructor(scene, simulation) {
    this.scene = scene;
    this.simulation = simulation;
    this.selectedEntity = null;
    this.isTrackingEntity = false;
    this.highlightMesh = null;
    this.updateInterval = null;

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
      .inspector { display: none; position: absolute; top: 15px; right: 15px; width: 320px; max-height: 90vh; background: rgba(0,0,0,0.75); color: white; padding: 15px; font-family: monospace; z-index: 101; border-radius: 5px; overflow-y: auto; }
      .inspector h3 { margin-top: 0; border-bottom: 1px solid #555; padding-bottom: 5px; }
      .inspector .component { margin-bottom: 10px; }
      .inspector .prop { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
      .inspector .prop-key { color: #aaa; }
      .inspector .prop-val { color: #0f0; }
      .inspector .genetics-color-swatch { width: 12px; height: 12px; display: inline-block; border: 1px solid #fff; vertical-align: middle; margin-left: 5px; }
      .inspector .controls { margin-top: 15px; padding-top: 10px; border-top: 1px solid #555; }
      .inspector .btn { background: #007acc; color: white; border: none; padding: 8px 12px; margin: 5px 5px 5px 0; border-radius: 4px; cursor: pointer; font-size: 11px; }
      .inspector .btn:hover { background: #0099ff; }
      .inspector .btn.active { background: #ff6600; }
      .inspector .btn:disabled { background: #333; cursor: not-allowed; }
      .inspector .update-rate { color: #888; font-size: 10px; margin-top: 5px; }
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
        // Walk up parents to find .entity
        let m = pickedMesh;
        let ent = null;
        while (m && !ent) { ent = m.entity || null; m = m.parent; }
        if (ent) {
          this.selectEntity(ent);
        } else {
          this.deselectEntity();
        }
      } else {
        this.deselectEntity();
      }
    };
    
    // Camera tracking update loop
    this.scene.onBeforeRenderObservable.add(() => {
      this.updateCameraTracking();
    });
  }

  /**
   * Updates the main HUD with statistics.
   */
  updateHUD() {
    let entityCount = '-';
    try {
      const stats = this.simulation?.world?.stats;
      if (stats && typeof stats.numEntities === 'number') {
        entityCount = stats.numEntities;
      }
    } catch (_) {}
    this.hudElement.innerHTML = `
      Entities: ${entityCount}<br>
      FPS: ${this.scene.getEngine().getFps().toFixed(0)}
    `;
  }

  /**
   * Selects an entity and displays its details in the inspector.
   * @param {ecsy.Entity} entity The entity to inspect.
   */
  selectEntity(entity) {
    // Stop previous tracking and clear highlight
    this.stopTracking();
    this.clearHighlight();
    
    this.selectedEntity = entity;
    this.inspectorElement.style.display = 'block';
    
    // Create highlight for selected entity
    this.createHighlight();
    
    // Start continuous updates
    this.startContinuousUpdates();
    
    // Initial inspector update
    this.updateInspector();
  }

  /**
   * Clears the current selection and hides the inspector.
   */
  deselectEntity() {
    this.stopTracking();
    this.clearHighlight();
    this.stopContinuousUpdates();
    
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

    let html = `<h3>Entity #${this.selectedEntity.id || ''}</h3>`;
    
    try {
      // Get all component types from the entity
      const componentTypes = this.selectedEntity.getComponentTypes();
      
      componentTypes.forEach(ComponentType => {
        try {
          const instance = this.selectedEntity.getComponent(ComponentType);
          if (!instance) return;
          
          const compName = ComponentType.name || instance.constructor.name;
          html += `<div class="component"><h4>${compName}</h4>`;
          
          const schema = ComponentType.schema || instance.constructor.schema;
          if (schema) {
            for (const key in schema) {
              let val = instance[key];
              if (typeof val === 'number') val = val.toFixed(3);
              if (typeof val === 'boolean') val = val ? 'true' : 'false';
              if (Array.isArray(val)) {
                val = `[${val.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}]`;
                if (key === 'color') {
                  const [r,g,b] = instance[key];
                  val += `<span class="genetics-color-swatch" style="background-color: rgb(${r},${g},${b});"></span>`;
                }
              }
              html += `<div class="prop"><span class="prop-key">${key}:</span> <span class="prop-val">${val}</span></div>`;
            }
          }
          html += `</div>`;
        } catch (compError) {
          html += `<div class="component"><h4>Error</h4><div class="prop"><span class="prop-key">component:</span> <span class="prop-val">${compError?.message || compError}</span></div></div>`;
        }
      });
    } catch (e) {
      html += `<div class="component"><h4>Error</h4><div class="prop"><span class="prop-key">message:</span> <span class="prop-val">${e?.message || e}</span></div></div>`;
    }
    
    // Add control buttons
    html += `
      <div class="controls">
        <button class="btn ${this.isTrackingEntity ? 'active' : ''}" onclick="window.uiManager.toggleTracking()">
          ${this.isTrackingEntity ? 'Stop Tracking' : 'Track Entity'}
        </button>
        <button class="btn" onclick="window.uiManager.focusOnEntity()">
          Focus Camera
        </button>
        <div class="update-rate">Live updates: ${this.updateInterval ? 'ON' : 'OFF'}</div>
      </div>
    `;

    this.inspectorElement.innerHTML = html;
  }
  
  /**
   * Start continuous updates of inspector data
   */
  startContinuousUpdates() {
    this.stopContinuousUpdates(); // Clear any existing interval
    
    this.updateInterval = setInterval(() => {
      if (this.selectedEntity && this.selectedEntity.alive) {
        this.updateInspector();
      } else {
        this.deselectEntity();
      }
    }, 100); // Update every 100ms for smooth real-time data
  }
  
  /**
   * Stop continuous updates
   */
  stopContinuousUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Create highlight effect for selected entity
   */
  createHighlight() {
    if (!this.selectedEntity) return;
    
    try {
      // Get components directly from world registry
      const Position = this.simulation.world.getComponent('Position') || window.Position;
      const Renderable = this.simulation.world.getComponent('Renderable') || window.Renderable;
      
      const renderable = this.selectedEntity.getComponent(Renderable);
      const position = this.selectedEntity.getComponent(Position);
      
      if (!position) return;
      
      // Create highlight outline
      this.highlightMesh = BABYLON.MeshBuilder.CreateSphere('highlight', {
        diameter: 4
      }, this.scene);
      
      // Create glowing material
      const highlightMaterial = new BABYLON.StandardMaterial('highlightMaterial', this.scene);
      highlightMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1); // Cyan glow
      highlightMaterial.alpha = 0.3;
      highlightMaterial.wireframe = true;
      
      this.highlightMesh.material = highlightMaterial;
      
      // Position highlight at entity location
      this.highlightMesh.position.set(position.x, position.y, position.z);
      
      // Add pulsing animation
      this.highlightAnimation = this.scene.onBeforeRenderObservable.add(() => {
        if (this.highlightMesh && this.selectedEntity && this.selectedEntity.alive) {
          const time = performance.now() * 0.003;
          const pulse = 1 + Math.sin(time) * 0.2;
          this.highlightMesh.scaling.setAll(pulse);
          
          // Update position to follow entity
          const pos = this.selectedEntity.getComponent(Position);
          if (pos) {
            this.highlightMesh.position.set(pos.x, pos.y, pos.z);
          }
        }
      });
      
    } catch (error) {
      console.warn('Failed to create highlight:', error);
    }
  }
  
  /**
   * Remove highlight effect
   */
  clearHighlight() {
    if (this.highlightMesh) {
      this.highlightMesh.dispose();
      this.highlightMesh = null;
    }
    
    if (this.highlightAnimation) {
      this.scene.onBeforeRenderObservable.remove(this.highlightAnimation);
      this.highlightAnimation = null;
    }
  }
  
  /**
   * Toggle camera tracking on/off
   */
  toggleTracking() {
    if (this.isTrackingEntity) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
    this.updateInspector(); // Refresh to update button state
  }
  
  /**
   * Start tracking the selected entity
   */
  startTracking() {
    if (!this.selectedEntity) return;
    
    this.isTrackingEntity = true;
    console.log('Started tracking entity:', this.selectedEntity.id);
  }
  
  /**
   * Stop tracking
   */
  stopTracking() {
    this.isTrackingEntity = false;
  }
  
  /**
   * Focus camera on selected entity (one-time)
   */
  focusOnEntity() {
    if (!this.selectedEntity) return;
    
    const Position = this.simulation.world.getComponent('Position') || window.Position;
    const position = this.selectedEntity.getComponent(Position);
    if (!position) return;
    
    const camera = this.scene.activeCamera;
    if (camera && camera.setTarget) {
      const targetPos = new BABYLON.Vector3(position.x, position.y, position.z);
      
      // Smooth animation to the entity
      BABYLON.Animation.CreateAndStartAnimation(
        'focusCamera',
        camera,
        'target',
        60,
        30,
        camera.getTarget(),
        targetPos,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }
  }
  
  /**
   * Update camera tracking if active
   */
  updateCameraTracking() {
    if (!this.isTrackingEntity || !this.selectedEntity || !this.selectedEntity.alive) return;
    
    const Position = this.simulation.world.getComponent('Position') || window.Position;
    const position = this.selectedEntity.getComponent(Position);
    if (!position) return;
    
    const camera = this.scene.activeCamera;
    if (camera && camera.setTarget) {
      const targetPos = new BABYLON.Vector3(position.x, position.y, position.z);
      
      // Smooth tracking with interpolation
      const currentTarget = camera.getTarget();
      const lerpFactor = 0.02; // Smooth following
      
      const newTarget = BABYLON.Vector3.Lerp(currentTarget, targetPos, lerpFactor);
      camera.setTarget(newTarget);
    }
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.stopContinuousUpdates();
    this.clearHighlight();
    this.stopTracking();
    
    // Remove global reference
    if (window.uiManager === this) {
      delete window.uiManager;
    }
  }
} 