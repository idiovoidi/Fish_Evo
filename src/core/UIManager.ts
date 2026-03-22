export class UIManager {
  scene: any;
  simulation: any;
  PositionComponent: any;
  RenderableComponent: any;
  selectedEntity: any = null;
  isTrackingEntity: boolean = false;
  highlightMesh: any = null;
  highlightAnimation: any = null;
  updateInterval: any = null;
  hudElement: HTMLDivElement | null = null;
  inspectorElement: HTMLDivElement | null = null;
  inspectorContent: HTMLDivElement | null = null;
  inspectorControls: HTMLDivElement | null = null;

  constructor(scene: any, simulation: any, components: any = {}) {
    this.scene = scene;
    this.simulation = simulation;
    this.PositionComponent = components.Position ?? null;
    this.RenderableComponent = components.Renderable ?? null;
    this.selectedEntity = null;
    this.isTrackingEntity = false;
    this.highlightMesh = null;
    this.updateInterval = null;

    this.initStyles();
    this.initDOM();
    this.initObservers();
  }

  _getPositionComponent() {
    return this.PositionComponent ?? this.simulation?.world?.getComponent?.('Position') ?? null;
  }

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

  initDOM() {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'hud';
    this.hudElement.innerHTML = 'Initializing...';
    document.body.appendChild(this.hudElement);

    this.inspectorElement = document.createElement('div');
    this.inspectorElement.className = 'inspector';
    this.inspectorElement.innerHTML = `
      <div class="inspector-header"></div>
      <div class="inspector-content"></div>
      <div class="controls inspector-controls">
        <button type="button" class="btn" data-action="toggleTracking">Track Entity</button>
        <button type="button" class="btn" data-action="focusOnEntity">Focus Camera</button>
        <div class="update-rate">Live updates: OFF</div>
      </div>
    `;
    document.body.appendChild(this.inspectorElement);
    this.inspectorContent = this.inspectorElement.querySelector('.inspector-content');
    this.inspectorControls = this.inspectorElement.querySelector('.inspector-controls');
    this.inspectorElement.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.btn[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'toggleTracking') this.toggleTracking();
      else if (action === 'focusOnEntity') this.focusOnEntity();
    });
  }

  initObservers() {
    setInterval(() => this.updateHUD(), 1000);

    this.scene.onPointerDown = (evt: any, pickInfo: any) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        const pickedMesh = pickInfo.pickedMesh;
        let m: any = pickedMesh;
        let ent: any = null;
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
    
    this.scene.onBeforeRenderObservable.add(() => {
      this.updateCameraTracking();
    });
  }

  updateHUD() {
    let entityCount = '-';
    try {
      const stats = this.simulation?.world?.stats;
      if (stats && typeof stats.numEntities === 'number') {
        entityCount = stats.numEntities;
      }
    } catch (_) {}
    if (this.hudElement) {
      this.hudElement.innerHTML = `
        Entities: ${entityCount}<br>
        FPS: ${this.scene.getEngine().getFps().toFixed(0)}
      `;
    }
  }

  selectEntity(entity: any) {
    this.stopTracking();
    this.clearHighlight();
    
    this.selectedEntity = entity;
    if (this.inspectorElement) {
      this.inspectorElement.style.display = 'block';
    }
    
    this.createHighlight();
    this.startContinuousUpdates();
    this.updateInspector();
  }

  deselectEntity() {
    this.stopTracking();
    this.clearHighlight();
    this.stopContinuousUpdates();
    
    this.selectedEntity = null;
    if (this.inspectorElement) {
      this.inspectorElement.style.display = 'none';
    }
  }

  updateInspector() {
    if (!this.selectedEntity || !this.selectedEntity.alive) {
      this.deselectEntity();
      return;
    }

    let html = '';
    try {
      const componentTypes = this.selectedEntity.getComponentTypes();
      
      componentTypes.forEach((ComponentType: any) => {
        try {
          const instance = this.selectedEntity.getComponent(ComponentType);
          if (!instance) return;
          
          const compName = ComponentType.name || instance.constructor.name;
          html += `<div class="component"><h4>${compName}</h4>`;
          
          const schema = ComponentType.schema || instance.constructor.schema;
          if (schema) {
            for (const key in schema) {
              let val = (instance as any)[key];
              if (typeof val === 'number') val = val.toFixed(3);
              if (typeof val === 'boolean') val = val ? 'true' : 'false';
              if (Array.isArray(val)) {
                val = `[${val.map((v: any) => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}]`;
                if (key === 'color') {
                  const [r,g,b] = (instance as any)[key];
                  val += `<span class="genetics-color-swatch" style="background-color: rgb(${r},${g},${b});"></span>`;
                }
              }
              html += `<div class="prop"><span class="prop-key">${key}:</span> <span class="prop-val">${val}</span></div>`;
            }
          }
          html += `</div>`;
        } catch (compError: any) {
          html += `<div class="component"><h4>Error</h4><div class="prop"><span class="prop-key">component:</span> <span class="prop-val">${compError?.message || compError}</span></div></div>`;
        }
      });
    } catch (e: any) {
      html += `<div class="component"><h4>Error</h4><div class="prop"><span class="prop-key">message:</span> <span class="prop-val">${e?.message || e}</span></div></div>`;
    }
    
    const header = this.inspectorElement?.querySelector('.inspector-header');
    if (header) {
      header.innerHTML = `<h3>Entity #${this.selectedEntity.id ?? ''}</h3>`;
    }
    if (this.inspectorContent) {
      this.inspectorContent.innerHTML = html;
    }
    const trackBtn = this.inspectorControls?.querySelector('[data-action="toggleTracking"]');
    const rateEl = this.inspectorControls?.querySelector('.update-rate');
    if (trackBtn) {
      trackBtn.textContent = this.isTrackingEntity ? 'Stop Tracking' : 'Track Entity';
      trackBtn.classList.toggle('active', this.isTrackingEntity);
    }
    if (rateEl) rateEl.textContent = `Live updates: ${this.updateInterval ? 'ON' : 'OFF'}`;
  }
  
  startContinuousUpdates() {
    this.stopContinuousUpdates();
    
    this.updateInterval = setInterval(() => {
      if (this.selectedEntity && this.selectedEntity.alive) {
        this.updateInspector();
      } else {
        this.deselectEntity();
      }
    }, 100);
  }
  
  stopContinuousUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  createHighlight() {
    if (!this.selectedEntity) return;
    const Position = this._getPositionComponent();
    if (!Position) return;
    try {
      const position = this.selectedEntity.getComponent(Position);
      if (!position) return;
      
      this.highlightMesh = (window as any).BABYLON.MeshBuilder.CreateSphere('highlight', {
        diameter: 4
      }, this.scene);
      
      const highlightMaterial = new (window as any).BABYLON.StandardMaterial('highlightMaterial', this.scene);
      highlightMaterial.emissiveColor = new (window as any).BABYLON.Color3(0, 1, 1);
      highlightMaterial.alpha = 0.3;
      highlightMaterial.wireframe = true;
      
      this.highlightMesh.material = highlightMaterial;
      this.highlightMesh.position.set(position.x, position.y, position.z);
      
      this.highlightAnimation = this.scene.onBeforeRenderObservable.add(() => {
        if (this.highlightMesh && this.selectedEntity && this.selectedEntity.alive) {
          const time = performance.now() * 0.003;
          const pulse = 1 + Math.sin(time) * 0.2;
          this.highlightMesh.scaling.setAll(pulse);
          
          const pos = this.selectedEntity.getComponent(this._getPositionComponent());
          if (pos) {
            this.highlightMesh.position.set(pos.x, pos.y, pos.z);
          }
        }
      });
      
    } catch (error) {
      console.warn('Failed to create highlight:', error);
    }
  }
  
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
  
  toggleTracking() {
    if (this.isTrackingEntity) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
    this.updateInspector();
  }
  
  startTracking() {
    if (!this.selectedEntity) return;
    
    this.isTrackingEntity = true;
    console.log('Started tracking entity:', this.selectedEntity.id);
  }
  
  stopTracking() {
    this.isTrackingEntity = false;
  }
  
  focusOnEntity() {
    if (!this.selectedEntity) return;
    const Position = this._getPositionComponent();
    if (!Position) return;
    const position = this.selectedEntity.getComponent(Position);
    if (!position) return;
    
    const camera = this.scene.activeCamera;
    if (camera && camera.setTarget) {
      const targetPos = new (window as any).BABYLON.Vector3(position.x, position.y, position.z);
      
      (window as any).BABYLON.Animation.CreateAndStartAnimation(
        'focusCamera',
        camera,
        'target',
        60,
        30,
        camera.getTarget(),
        targetPos,
        (window as any).BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }
  }
  
  updateCameraTracking() {
    if (!this.isTrackingEntity || !this.selectedEntity || !this.selectedEntity.alive) return;
    const Position = this._getPositionComponent();
    if (!Position) return;
    const position = this.selectedEntity.getComponent(Position);
    if (!position) return;
    
    const camera = this.scene.activeCamera;
    if (camera && camera.setTarget) {
      const targetPos = new (window as any).BABYLON.Vector3(position.x, position.y, position.z);
      
      const currentTarget = camera.getTarget();
      const lerpFactor = 0.02;
      
      const newTarget = (window as any).BABYLON.Vector3.Lerp(currentTarget, targetPos, lerpFactor);
      camera.setTarget(newTarget);
    }
  }
  
  cleanup() {
    this.stopContinuousUpdates();
    this.clearHighlight();
    this.stopTracking();
  }
}
