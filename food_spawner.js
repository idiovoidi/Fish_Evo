class FoodSpawner {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.foodParticles = [];
        this.maxFoodParticles = SimulationConfig.food.maxParticles;
        this.spawnInterval = SimulationConfig.food.spawnInterval;
        this.lastSpawnTime = 0;
        
        // Create food particle system
        this.particleSystem = new BABYLON.ParticleSystem("foodParticles", 2000, this.scene);
        this.setupParticleSystem();
    }

    setupParticleSystem() {
        // Texture
        this.particleSystem.particleTexture = new BABYLON.Texture("textures/food_particle.png", this.scene);
        
        // Colors
        this.particleSystem.color1 = new BABYLON.Color4(0.7, 0.6, 0.3, 1.0);
        this.particleSystem.color2 = new BABYLON.Color4(0.6, 0.5, 0.2, 1.0);
        
        // Size and lifetime
        this.particleSystem.minSize = 0.1;
        this.particleSystem.maxSize = 0.3;
        this.particleSystem.minLifeTime = 8;
        this.particleSystem.maxLifeTime = 12;
        
        // Emission
        this.particleSystem.emitRate = 10;
        this.particleSystem.minEmitBox = new BABYLON.Vector3(-20, 15, -20);
        this.particleSystem.maxEmitBox = new BABYLON.Vector3(20, 15, 20);
        
        // Gravity and movement
        this.particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
        this.particleSystem.minEmitPower = 0.1;
        this.particleSystem.maxEmitPower = 0.3;
        
        // Rotation
        this.particleSystem.minAngularSpeed = -0.5;
        this.particleSystem.maxAngularSpeed = 0.5;
        
        // Blending
        this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // Update speed
        this.particleSystem.updateSpeed = 0.016;
        
        // Collision handling
        this.setupCollisions();
        
        // Start the particle system
        this.particleSystem.start();
    }

    setupCollisions() {
        // Create collision cache to improve performance
        const collisionCache = new Set();
        
        // Update function for each particle
        this.particleSystem.updateParticle = (particle) => {
            // Skip if particle was already processed
            if (collisionCache.has(particle.id)) return;
            
            // Check collision with terrain or minimum depth
            if (particle.position.y <= 0.5) {
                // Add to cache to prevent multiple collisions
                collisionCache.add(particle.id);
                
                // Create food mesh at collision point
                this.createFoodMesh(particle.position);
                
                // Recycle particle
                particle.age = particle.lifeTime;
            }
        };
        
        // Clear cache periodically
        setInterval(() => collisionCache.clear(), 5000);
    }

    createFoodMesh(position) {
        if (this.foodParticles.length >= this.maxFoodParticles) {
            // Remove oldest food particle if at max capacity
            const oldestFood = this.foodParticles.shift();
            oldestFood.dispose();
        }

        // Create food mesh
        const food = BABYLON.MeshBuilder.CreateSphere("food", {
            diameter: 0.3,
            segments: 8
        }, this.scene);
        
        // Position food
        food.position = position.clone();
        
        // Create glowing material
        const foodMaterial = new BABYLON.StandardMaterial("foodMaterial", this.scene);
        foodMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.6, 0.3);
        foodMaterial.alpha = 0.8;
        food.material = foodMaterial;
        
        // Add glow layer if not exists
        if (!this.scene.glowLayer) {
            this.scene.glowLayer = new BABYLON.GlowLayer("foodGlow", this.scene, {
                mainTextureFixedSize: 512,
                blurKernelSize: 32
            });
        }
        this.scene.glowLayer.addIncludedOnlyMesh(food);
        
        // Add to tracking array
        this.foodParticles.push(food);
        
        // Add subtle animation
        const amplitude = 0.1;
        const frequency = 1;
        this.scene.onBeforeRenderObservable.add(() => {
            food.position.y += Math.sin(this.scene.getEngine().getFps() * 0.01) * amplitude * frequency * 0.01;
        });
    }

    update() {
        const currentTime = performance.now();
        
        // Check if it's time to spawn new food
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.lastSpawnTime = currentTime;
            
            // Update particle system emission rate based on time of day
            if (this.scene.dayNightCycle) {
                const hour = this.scene.dayNightCycle.getCurrentHour();
                // Spawn more food during day (6-18) than night
                this.particleSystem.emitRate = (hour >= 6 && hour <= 18) ? 15 : 5;
            }
        }
    }

    dispose() {
        this.particleSystem.dispose();
        this.foodParticles.forEach(food => food.dispose());
        this.foodParticles = [];
    }
} 