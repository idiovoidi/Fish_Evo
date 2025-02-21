class Food {
    constructor(scene, position) {
        this.scene = scene;
        this.mesh = null;
        this.energy = 0.3; // Energy value when eaten
        this.creationTime = performance.now();
        this.lifetime = this.getRandomLifetime();
        this.isActive = true;
        
        this.createMesh(position);
        this.setupAnimations();
    }

    getRandomLifetime() {
        return SimulationConfig.food.lifetime.min + 
               Math.random() * (SimulationConfig.food.lifetime.max - SimulationConfig.food.lifetime.min);
    }

    createMesh(position) {
        // Create food mesh
        this.mesh = BABYLON.MeshBuilder.CreateSphere("food", {
            diameter: 0.3,
            segments: 8
        }, this.scene);
        
        // Position food
        this.mesh.position = position.clone();
        
        // Create glowing material
        const foodMaterial = new BABYLON.StandardMaterial("foodMaterial", this.scene);
        foodMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.6, 0.3);
        foodMaterial.alpha = 0.8;
        this.mesh.material = foodMaterial;
        
        // Add glow layer if not exists
        if (!this.scene.glowLayer) {
            this.scene.glowLayer = new BABYLON.GlowLayer("foodGlow", this.scene, {
                mainTextureFixedSize: 512,
                blurKernelSize: 32
            });
        }
        this.scene.glowLayer.addIncludedOnlyMesh(this.mesh);

        // Store reference to this Food instance on the mesh
        this.mesh.food = this;
    }

    setupAnimations() {
        // Add subtle floating animation
        const amplitude = 0.1;
        const frequency = 1;
        
        this._animationObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (!this.isActive) return;
            
            // Floating motion
            this.mesh.position.y += Math.sin(performance.now() * 0.001) * amplitude * frequency * 0.01;
            
            // Check lifetime
            if (performance.now() - this.creationTime > this.lifetime) {
                this.dispose();
            }
        });
    }

    getPosition() {
        return this.mesh.position;
    }

    getEnergy() {
        return this.energy;
    }

    isExpired() {
        return !this.isActive || (performance.now() - this.creationTime > this.lifetime);
    }

    dispose() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Remove from glow layer
        if (this.scene.glowLayer) {
            this.scene.glowLayer.removeIncludedOnlyMesh(this.mesh);
        }
        
        // Remove animation observer
        if (this._animationObserver) {
            this.scene.onBeforeRenderObservable.remove(this._animationObserver);
        }
        
        // Dispose mesh
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
} 