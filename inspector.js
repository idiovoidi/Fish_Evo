class FishInspector {
    constructor(sceneInstance) {
        this.sceneInstance = sceneInstance;  // Store the Scene instance
        this.scene = sceneInstance.scene;    // Store the Babylon scene
        this.selectedFish = null;
        this.highlightMesh = null;
        this.inspectorUI = null;
        
        this.setupUI();
        this.setupHighlight();
        this.setupClickHandler();
    }

    setupUI() {
        // Create fullscreen UI
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("inspectorUI");
        this.inspectorUI = advancedTexture;

        // Create inspector panel
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "200px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "20px";
        panel.right = "20px";
        advancedTexture.addControl(panel);

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.height = "30px";
        title.text = "Fish Inspector";
        title.color = "white";
        title.fontSize = 20;
        panel.addControl(title);

        // Energy bar background
        const energyBarBg = new BABYLON.GUI.Rectangle();
        energyBarBg.width = "180px";
        energyBarBg.height = "20px";
        energyBarBg.cornerRadius = 10;
        energyBarBg.color = "white";
        energyBarBg.thickness = 2;
        energyBarBg.background = "#333333";
        panel.addControl(energyBarBg);

        // Energy bar fill
        const energyBarFill = new BABYLON.GUI.Rectangle();
        energyBarFill.width = "180px";
        energyBarFill.height = "20px";
        energyBarFill.cornerRadius = 10;
        energyBarFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        energyBarFill.background = "green";
        energyBarFill.scaleX = 1;
        energyBarBg.addControl(energyBarFill);
        this.energyBar = energyBarFill;

        // Energy text
        const energyText = new BABYLON.GUI.TextBlock();
        energyText.height = "20px";
        energyText.text = "Energy: 100%";
        energyText.color = "white";
        panel.addControl(energyText);
        this.energyText = energyText;

        // State text
        const stateText = new BABYLON.GUI.TextBlock();
        stateText.height = "20px";
        stateText.text = "State: None";
        stateText.color = "white";
        panel.addControl(stateText);
        this.stateText = stateText;

        // Initially hide the panel
        panel.isVisible = false;
        this.panel = panel;
    }

    setupHighlight() {
        // Create highlight mesh
        const highlight = BABYLON.MeshBuilder.CreateTorus("highlight", {
            diameter: 2,
            thickness: 0.1,
            tessellation: 32
        }, this.scene);
        highlight.rotation.x = Math.PI / 2; // Align with fish
        
        // Create glowing material
        const highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", this.scene);
        highlightMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        highlightMaterial.alpha = 0.6;
        highlight.material = highlightMaterial;
        
        highlight.isVisible = false;
        this.highlightMesh = highlight;
    }

    setupClickHandler() {
        // Setup click picking for left mouse button only
        this.scene.onPointerDown = (evt, pickResult) => {
            if (evt.button !== 0) return; // Only handle left mouse button (0)
            
            if (pickResult.hit) {
                const mesh = pickResult.pickedMesh;
                const fish = this.findFishByMesh(mesh);
                
                if (fish) {
                    this.selectFish(fish);
                } else {
                    this.clearSelection();
                }
            } else {
                this.clearSelection();
            }
        };
    }

    findFishByMesh(mesh) {
        // Access fish through the stored Scene instance's entity handler and fish manager
        const entityHandler = this.sceneInstance.entityHandler;
        if (!entityHandler || !entityHandler.fishManager) return null;
        
        const fishes = entityHandler.fishManager.getFish() || [];
        return fishes.find(fish => fish.renderComponent === mesh);
    }

    selectFish(fish) {
        this.selectedFish = fish;
        this.panel.isVisible = true;
        this.highlightMesh.isVisible = true;
        
        // Start updating the inspector
        if (!this._updateLoop) {
            this._updateLoop = this.update.bind(this);
            this.scene.onBeforeRenderObservable.add(this._updateLoop);
        }
    }

    clearSelection() {
        this.selectedFish = null;
        this.panel.isVisible = false;
        this.highlightMesh.isVisible = false;
        
        // Stop updating the inspector
        if (this._updateLoop) {
            this.scene.onBeforeRenderObservable.remove(this._updateLoop);
            this._updateLoop = null;
        }
    }

    update() {
        if (!this.selectedFish) return;

        // Update highlight position
        this.highlightMesh.position.copyFrom(this.selectedFish.position);

        // Update energy display
        const energy = this.selectedFish.energy;
        this.energyBar.scaleX = energy;
        this.energyText.text = `Energy: ${Math.round(energy * 100)}%`;

        // Update state display
        const states = [];
        if (this.selectedFish.state.isHungry) states.push("Hungry");
        if (this.selectedFish.state.hasFood) states.push("Has Food Target");
        if (this.selectedFish.state.isSafe) states.push("Safe");
        if (this.selectedFish.seekFoodBehavior.active) states.push("Seeking Food");
        
        this.stateText.text = `State: ${states.length > 0 ? states.join(", ") : "Normal"}`;

        // Update highlight color based on state
        const material = this.highlightMesh.material;
        if (this.selectedFish.state.isHungry) {
            material.emissiveColor.set(1, 0, 0); // Red for hungry
        } else if (this.selectedFish.state.hasFood) {
            material.emissiveColor.set(1, 1, 0); // Yellow when has food target
        } else {
            material.emissiveColor.set(0, 1, 0); // Green for normal state
        }
    }

    dispose() {
        if (this.highlightMesh) {
            this.highlightMesh.dispose();
        }
        if (this.inspectorUI) {
            this.inspectorUI.dispose();
        }
        if (this._updateLoop) {
            this.scene.onBeforeRenderObservable.remove(this._updateLoop);
        }
    }
} 