class FoodSpawner {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.foodParticles = [];
        this.maxFoodParticles = 80;
        this.spawnInterval = 500;
        this.lastSpawnTime = 0;
        this.debugMode = false;
        
        // Create food particle system
        this.particleSystem = new BABYLON.ParticleSystem("foodParticles", 2000, this.scene);
        this.setupParticleSystem();
        
        // Initial food spawn
        this.initialFoodSpawn();
    }

    setupParticleSystem() {
        // Create a procedural texture instead of loading an external file
        const foodTexture = this.createFoodTexture();
        this.particleSystem.particleTexture = foodTexture;
        
        // Colors
        this.particleSystem.color1 = new BABYLON.Color4(0.7, 0.6, 0.3, 1.0);
        this.particleSystem.color2 = new BABYLON.Color4(0.6, 0.5, 0.2, 1.0);
        
        // Size and lifetime
        this.particleSystem.minSize = 0.1;
        this.particleSystem.maxSize = 0.3;
        this.particleSystem.minLifeTime = 8;
        this.particleSystem.maxLifeTime = 12;
        
        // Emission
        this.particleSystem.emitRate = 15;
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

    createFoodTexture() {
        // Create a dynamic texture for food particles
        const size = 64;
        const texture = new BABYLON.DynamicTexture("foodParticleTexture", size, this.scene, false);
        const ctx = texture.getContext();
        
        // Clear the canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw a circular gradient (food particle)
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 4;
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        
        // Add color stops
        gradient.addColorStop(0, 'rgba(255, 230, 150, 1)');    // Center: light yellow
        gradient.addColorStop(0.7, 'rgba(200, 170, 50, 0.8)'); // Middle: gold
        gradient.addColorStop(1, 'rgba(150, 120, 30, 0)');     // Edge: transparent brown
        
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some "food particle" details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        
        // Add a few small dots
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.6;
            const dotX = centerX + Math.cos(angle) * distance;
            const dotY = centerY + Math.sin(angle) * distance;
            const dotSize = 2 + Math.random() * 3;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Update the texture
        texture.update();
        
        return texture;
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
                
                // Create food at collision point
                this.createFood(particle.position);
                
                // Recycle particle
                particle.age = particle.lifeTime;
            }
        };
        
        // Clear cache periodically
        setInterval(() => collisionCache.clear(), 5000);
    }

    initialFoodSpawn() {
        // Spawn initial food particles to ensure fish have food at start
        const initialCount = Math.min(30, this.maxFoodParticles);
        
        for (let i = 0; i < initialCount; i++) {
            const position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 40,
                0.5 + Math.random() * 5, // Spawn at various depths
                (Math.random() - 0.5) * 40
            );
            
            this.createFood(position);
        }
        
        if (this.debugMode) {
            console.log(`Initially spawned ${initialCount} food particles`);
        }
    }

    createFood(position) {
        // Remove oldest food if at max capacity
        while (this.foodParticles.length >= this.maxFoodParticles) {
            const oldestFood = this.foodParticles.shift();
            if (!oldestFood.isDisposed()) {
                oldestFood.dispose();
            }
        }

        // Create new food instance - using an icosphere for better appearance
        const food = BABYLON.MeshBuilder.CreateIcoSphere("food", {
            radius: 0.15,
            subdivisions: 2,
            updatable: false
        }, this.scene);
        
        // Position food
        food.position = position.clone();
        
        // Create glowing material
        const foodMaterial = new BABYLON.StandardMaterial("foodMaterial", this.scene);
        
        // Create a procedural texture for the food
        const foodTexture = new BABYLON.DynamicTexture("foodTexture", 128, this.scene, false);
        const ctx = foodTexture.getContext();
        
        // Clear the canvas
        ctx.clearRect(0, 0, 128, 128);
        
        // Create a gradient background
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, '#ffe696');  // Light yellow center
        gradient.addColorStop(0.7, '#c8aa32'); // Gold middle
        gradient.addColorStop(1, '#96781e');   // Brown edge
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        // Add some texture details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const size = 2 + Math.random() * 5;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Update the texture
        foodTexture.update();
        
        // Apply the texture to the material
        foodMaterial.diffuseTexture = foodTexture;
        foodMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.6, 0.3);
        foodMaterial.specularColor = new BABYLON.Color3(1, 1, 0.8);
        foodMaterial.alpha = 0.9;
        
        // Apply material to the food mesh
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
        const rotationSpeed = 0.001;
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            if (food.isDisposed()) {
                this.scene.onBeforeRenderObservable.remove(observer);
                return;
            }
            
            // Floating motion
            food.position.y += Math.sin(performance.now() * 0.001) * amplitude * frequency * 0.01;
            
            // Slow rotation
            food.rotation.y += rotationSpeed;
            food.rotation.x += rotationSpeed * 0.5;
        });
        
        if (this.debugMode) {
            console.log(`Food created at position (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
        }
        
        return food;
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
                this.particleSystem.emitRate = (hour >= 6 && hour <= 18) ? 
                    25 / 60 : 
                    10 / 60;
            }
            
            // Emergency food spawn if running low
            if (this.foodParticles.length < 10) {
                const position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 40,
                    0.5 + Math.random() * 5,
                    (Math.random() - 0.5) * 40
                );
                this.createFood(position);
                
                if (this.debugMode) {
                    console.log(`Emergency food spawn. Current count: ${this.foodParticles.length}`);
                }
            }
        }

        // Clean up expired food - removed expiration check since we're using meshes
        // Instead, we'll maintain a maximum count
        while (this.foodParticles.length > this.maxFoodParticles) {
            const oldestFood = this.foodParticles.shift();
            if (!oldestFood.isDisposed()) {
                oldestFood.dispose();
            }
        }
        
        // Log food count periodically for debugging
        if (this.debugMode && currentTime % 5000 < 20) {
            console.log(`Current food count: ${this.foodParticles.length}`);
        }
    }

    dispose() {
        this.particleSystem.dispose();
        this.foodParticles.forEach(food => {
            if (!food.isDisposed()) {
                food.dispose();
            }
        });
        this.foodParticles = [];
    }
} 