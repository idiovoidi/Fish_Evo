class FishInspector {
    constructor(sceneInstance) {
        this.sceneInstance = sceneInstance;  // Store the Scene instance
        this.scene = sceneInstance.scene;    // Store the Babylon scene
        this.selectedFish = null;
        this.highlightMesh = null;
        this.inspectorUI = null;
        this.fishListPanel = null;
        this.isListExpanded = false;
        
        this.setupUI();
        this.setupHighlight();
        this.setupClickHandler();
    }

    setupUI() {
        console.log("Setting up Fish Inspector UI...");
        // Create fullscreen UI
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("inspectorUI");
        this.inspectorUI = advancedTexture;

        // Create main inspector panel
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "200px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "20px";
        panel.right = "20px";
        panel.background = "#264d59AA";  // Semi-transparent background
        panel.paddingBottom = "10px";
        panel.paddingTop = "10px";
        panel.isVisible = true;  // Make sure panel is visible by default
        advancedTexture.addControl(panel);
        this.panel = panel;

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.height = "30px";
        title.text = "Fish Inspector";
        title.color = "white";
        title.fontSize = 20;
        panel.addControl(title);

        // Add fish list toggle button
        const toggleButton = new BABYLON.GUI.Button();
        toggleButton.name = "toggleButton";
        toggleButton.width = "180px";
        toggleButton.height = "30px";
        toggleButton.color = "white";
        toggleButton.cornerRadius = 10;
        toggleButton.background = "#407080";
        toggleButton.thickness = 1;

        const buttonText = new BABYLON.GUI.TextBlock();
        buttonText.text = "Show Fish List";
        buttonText.color = "white";
        buttonText.fontSize = 14;
        toggleButton.addControl(buttonText);
        
        toggleButton.onPointerClickObservable.add(() => {
            console.log("Toggle button clicked");
            this.toggleFishList();
        });
        panel.addControl(toggleButton);
        this.toggleButton = toggleButton;
        this.toggleButtonText = buttonText;

        // Create collapsible fish list panel
        const fishListPanel = new BABYLON.GUI.StackPanel();
        fishListPanel.width = "180px";
        fishListPanel.height = "0px"; // Start collapsed
        fishListPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        fishListPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        fishListPanel.top = "70px";
        fishListPanel.right = "20px";
        fishListPanel.background = "#264d59";
        fishListPanel.paddingBottom = "10px";
        fishListPanel.paddingTop = "10px";
        fishListPanel.isVisible = false;
        advancedTexture.addControl(fishListPanel);
        this.fishListPanel = fishListPanel;

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
        energyText.text = "Energy: --";
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

        console.log("Fish Inspector UI setup complete");
    }

    toggleFishList() {
        this.isListExpanded = !this.isListExpanded;
        console.log("Fish list toggled:", this.isListExpanded ? "expanded" : "collapsed");
        
        // Update button text
        this.toggleButtonText.text = this.isListExpanded ? "Hide Fish List" : "Show Fish List";
        
        // Show/hide and update fish list
        this.fishListPanel.isVisible = this.isListExpanded;
        if (this.isListExpanded) {
            this.updateFishList();
        }
    }

    updateFishList() {
        // Clear existing list
        this.fishListPanel.children.slice().forEach(child => {
            this.fishListPanel.removeControl(child);
        });

        // Get all fish from the entity handler
        const entityHandler = this.sceneInstance.entityHandler;
        if (!entityHandler || !entityHandler.fishManager) return;
        
        const fishes = entityHandler.fishManager.getFish() || [];
        
        // Calculate total height needed
        const buttonHeight = 30;
        const totalHeight = (fishes.length * (buttonHeight + 5)) + 20; // 5px spacing, 20px padding
        this.fishListPanel.height = `${totalHeight}px`;

        // Add a button for each fish
        fishes.forEach((fish, index) => {
            const button = new BABYLON.GUI.Button();
            button.name = `fish_button_${fish.id}`;
            button.width = "160px";
            button.height = `${buttonHeight}px`;
            button.color = "white";
            button.cornerRadius = 5;
            button.background = this.selectedFish === fish ? "#5e9ca9" : "#407080";
            button.thickness = 1;

            const buttonText = new BABYLON.GUI.TextBlock();
            buttonText.text = `Fish ${fish.id}\nEnergy: ${Math.round(fish.energy * 100)}%`;
            buttonText.color = "white";
            buttonText.fontSize = 14;
            button.addControl(buttonText);

            // Add click handler
            button.onPointerClickObservable.add(() => {
                this.selectFish(fish);
                this.updateFishList(); // Refresh list to update selection highlighting
            });

            this.fishListPanel.addControl(button);
        });
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
        console.log("Selecting fish:", fish.id);
        this.selectedFish = fish;
        this.highlightMesh.isVisible = true;
        
        // Update fish list if expanded
        if (this.isListExpanded) {
            this.updateFishList();
        }
        
        // Start updating the inspector
        if (!this._updateLoop) {
            this._updateLoop = this.update.bind(this);
            this.scene.onBeforeRenderObservable.add(this._updateLoop);
        }
    }

    clearSelection() {
        console.log("Clearing fish selection");
        this.selectedFish = null;
        this.highlightMesh.isVisible = false;
        
        // Reset display texts
        this.energyText.text = "Energy: --";
        this.stateText.text = "State: None";
        
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

        // Update fish list periodically if expanded
        if (this.isListExpanded && this.frameCount % 30 === 0) {
            this.updateFishList();
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