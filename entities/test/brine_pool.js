class BrinePool {
    constructor(scene, position, landscape) {
        this.scene = scene;
        this.position = position;
        this.landscape = landscape;
        this.mesh = null;
        this.particleSystem = null;
        this.size = 2 + Math.random() * 3; // Random size between 2 and 5 units
        
        // Get base terrain height at pool center
        this.baseHeight = this.landscape.getHeightAtPoint(position.x, position.z);
        this.position.y = this.baseHeight; // Set pool position to terrain height
        
        this.createPool();
        this.createParticleSystem();
        this.addShimmerEffect();
    }

    createPool() {
        // Create a slightly concave surface for the pool
        const poolPoints = [];
        const segments = 20;
        
        // Calculate average terrain height around pool for better alignment
        let avgHeight = 0;
        let samples = 0;
        for (let i = -this.size/2; i <= this.size/2; i += this.size/4) {
            for (let j = -this.size/2; j <= this.size/2; j += this.size/4) {
                avgHeight += this.landscape.getHeightAtPoint(this.position.x + i, this.position.z + j);
                samples++;
            }
        }
        avgHeight /= samples;

        // Create pool surface points
        for (let i = 0; i <= segments; i++) {
            const row = [];
            for (let j = 0; j <= segments; j++) {
                const x = (i / segments - 0.5) * this.size;
                const z = (j / segments - 0.5) * this.size;
                const distFromCenter = Math.sqrt(x * x + z * z);
                
                // Get terrain height at this point
                const worldX = this.position.x + x;
                const worldZ = this.position.z + z;
                const terrainY = this.landscape.getHeightAtPoint(worldX, worldZ);
                
                // Create a bowl shape that follows terrain contours
                const normalizedDist = distFromCenter / (this.size * 0.5);
                const edgeFactor = Math.pow(normalizedDist, 2);
                
                // Blend between pool depth and terrain height
                const poolDepth = 0.3; // Maximum depth of the pool
                const y = terrainY - this.baseHeight - (poolDepth * (1 - edgeFactor));
                
                row.push(new BABYLON.Vector3(x, y, z));
            }
            poolPoints.push(row);
        }

        // Create the pool surface
        this.mesh = BABYLON.MeshBuilder.CreateRibbon(
            "brinePool",
            { pathArray: poolPoints },
            this.scene
        );
        this.mesh.position = this.position.clone();
        
        // Create and apply the brine material
        const brineMaterial = new BABYLON.StandardMaterial("brineMaterial", this.scene);
        
        // Create a procedural texture for the brine
        const noiseTexture = new BABYLON.NoiseProceduralTexture("perlinNoise", 256, this.scene);
        noiseTexture.animationSpeedFactor = 0.5;
        noiseTexture.persistence = 2;
        noiseTexture.brightness = 0.5;
        noiseTexture.octaves = 3;
        
        brineMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.2);
        brineMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.1);
        brineMaterial.specularColor = new BABYLON.Color3(0.2, 0.4, 0.3);
        brineMaterial.specularPower = 32;
        brineMaterial.alpha = 0.9;
        
        // Use noise texture for opacity to create a shifting liquid effect
        brineMaterial.opacityTexture = noiseTexture;
        
        this.mesh.material = brineMaterial;
    }

    createParticleSystem() {
        // Create particle system for the toxic mist
        this.particleSystem = new BABYLON.ParticleSystem("brineParticles", 2000, this.scene);
        this.particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        
        // Particle emission properties
        this.particleSystem.emitter = new BABYLON.Vector3(
            this.position.x,
            this.baseHeight + 0.1, // Emit from just above the terrain
            this.position.z
        );
        this.particleSystem.minEmitBox = new BABYLON.Vector3(-this.size/2, 0, -this.size/2);
        this.particleSystem.maxEmitBox = new BABYLON.Vector3(this.size/2, 0, this.size/2);
        
        // Particle properties
        this.particleSystem.color1 = new BABYLON.Color4(0.2, 0.6, 0.4, 0.1);
        this.particleSystem.color2 = new BABYLON.Color4(0.1, 0.3, 0.2, 0.3);
        this.particleSystem.colorDead = new BABYLON.Color4(0.1, 0.2, 0.1, 0);
        
        this.particleSystem.minSize = 0.1;
        this.particleSystem.maxSize = 0.3;
        
        this.particleSystem.minLifeTime = 2;
        this.particleSystem.maxLifeTime = 3.5;
        
        this.particleSystem.emitRate = 100;
        
        // Particle movement
        this.particleSystem.direction1 = new BABYLON.Vector3(-0.1, 0.2, -0.1);
        this.particleSystem.direction2 = new BABYLON.Vector3(0.1, 0.4, 0.1);
        
        this.particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);
        this.particleSystem.minAngularSpeed = -0.5;
        this.particleSystem.maxAngularSpeed = 0.5;
        
        // Start particle system
        this.particleSystem.start();
    }

    addShimmerEffect() {
        // Add a subtle animation to simulate liquid movement
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.mesh) {
                const time = performance.now() * 0.001;
                const vertexData = BABYLON.VertexData.ExtractFromMesh(this.mesh);
                const positions = vertexData.positions;

                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const z = positions[i + 2];
                    const distFromCenter = Math.sqrt(x * x + z * z);
                    
                    // Add ripple effect that diminishes near edges
                    const edgeFactor = 1 - Math.min(1, distFromCenter / (this.size * 0.5));
                    positions[i + 1] += Math.sin(time * 2 + distFromCenter * 3) * 0.01 * edgeFactor;
                }

                vertexData.applyToMesh(this.mesh);
            }
        });
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
    }
}

class BrinePoolManager {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.pools = [];
        this.createBrinePools();
    }

    isValidPoolLocation(position) {
        // Check if the location is too steep
        const SLOPE_CHECK_DISTANCE = 1;
        const heightDiffs = [];
        
        // Check height differences in multiple directions
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const checkX = position.x + Math.cos(angle) * SLOPE_CHECK_DISTANCE;
            const checkZ = position.z + Math.sin(angle) * SLOPE_CHECK_DISTANCE;
            const checkHeight = this.landscape.getHeightAtPoint(checkX, checkZ);
            heightDiffs.push(Math.abs(checkHeight - position.y));
        }

        // Calculate maximum slope
        const maxSlope = Math.max(...heightDiffs) / SLOPE_CHECK_DISTANCE;
        if (maxSlope > 0.3) { // Maximum allowed slope of 30%
            return false;
        }

        // Check distance from other pools
        for (const pool of this.pools) {
            const distance = BABYLON.Vector3.Distance(position, pool.position);
            if (distance < 15) { // Minimum 15 units between pools
                return false;
            }
        }

        return true;
    }

    createBrinePools() {
        const POOL_COUNT = 8;
        const TERRAIN_SIZE = 100;
        const EDGE_MARGIN = 15;

        for (let i = 0; i < POOL_COUNT; i++) {
            let validPosition = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 30;

            while (!validPosition && attempts < MAX_ATTEMPTS) {
                // Generate random position
                const x = (Math.random() - 0.5) * (TERRAIN_SIZE - 2 * EDGE_MARGIN);
                const z = (Math.random() - 0.5) * (TERRAIN_SIZE - 2 * EDGE_MARGIN);
                
                // Find the lowest point in a small area
                const SAMPLE_RADIUS = 2;
                const SAMPLES = 5;
                let lowestY = Infinity;
                let lowestPoint = null;

                for (let sx = -SAMPLE_RADIUS; sx <= SAMPLE_RADIUS; sx += SAMPLE_RADIUS/SAMPLES) {
                    for (let sz = -SAMPLE_RADIUS; sz <= SAMPLE_RADIUS; sz += SAMPLE_RADIUS/SAMPLES) {
                        const sampleX = x + sx;
                        const sampleZ = z + sz;
                        const y = this.landscape.getHeightAtPoint(sampleX, sampleZ);
                        
                        if (y < lowestY) {
                            lowestY = y;
                            lowestPoint = new BABYLON.Vector3(sampleX, y + 0.1, sampleZ);
                        }
                    }
                }

                if (lowestPoint && this.isValidPoolLocation(lowestPoint)) {
                    const pool = new BrinePool(this.scene, lowestPoint, this.landscape);
                    this.pools.push(pool);
                    validPosition = true;
                }

                attempts++;
            }
        }

        console.log(`Created ${this.pools.length} brine pools`);
    }

    dispose() {
        this.pools.forEach(pool => pool.dispose());
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BrinePool, BrinePoolManager };
} else if (typeof window !== 'undefined') {
    window.BrinePool = BrinePool;
    window.BrinePoolManager = BrinePoolManager;
} 