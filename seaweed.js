class Seaweed {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.segments = [];
        this.createSeaweed();
    }

    createSeaweed() {
        const NUM_SEGMENTS = 12 + Math.floor(Math.random() * 4); // 12-15 segments for much taller seaweed
        const SEGMENT_HEIGHT = 4.0;  // Significantly increased base height
        const SEGMENT_WIDTH = 0.8;   // Significantly increased base width

        // Create segments from bottom to top
        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const height = SEGMENT_HEIGHT * (1 - i * 0.05); // More gradual taper (reduced from 0.08)
            const width = SEGMENT_WIDTH * (1 - i * 0.05);   // More gradual taper
            
            // Create segment mesh
            const segment = BABYLON.MeshBuilder.CreateCylinder(`seaweed-segment-${i}`, {
                height: height,
                diameter: width,
                tessellation: 12,
                subdivisions: 1
            }, this.scene);

            // Position segment with more overlap for smoother appearance
            segment.position = new BABYLON.Vector3(
                this.position.x,
                this.position.y + (i * SEGMENT_HEIGHT * 0.85), // More overlap between segments
                this.position.z
            );

            // Create material with enhanced underwater look
            const material = new BABYLON.StandardMaterial(`seaweed-material-${i}`, this.scene);
            
            // More varied and vibrant colors
            const greenIntensity = 0.4 + Math.random() * 0.3; // Base green value
            material.diffuseColor = new BABYLON.Color3(
                0.1 + Math.random() * 0.1,    // Slight red variation
                greenIntensity,               // Dominant green
                greenIntensity * 0.4          // Some blue for underwater feel
            );
            
            material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            material.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.05); // Slight glow
            material.alpha = 0.9; // Slight transparency
            segment.material = material;

            // Store reference to segment
            this.segments.push(segment);

            // Parent each segment to the previous one (except the first)
            if (i > 0) {
                segment.parent = this.segments[i - 1];
            }
        }

        // Randomly rotate the entire seaweed plant
        this.segments[0].rotate(BABYLON.Vector3.Up(), Math.random() * Math.PI * 2);

        // Add swaying animation
        this.addSwayingAnimation();
    }

    addSwayingAnimation() {
        const MAIN_SWAY_SPEED = 0.3;    // Base sway speed
        const SECONDARY_SWAY_SPEED = 0.17; // Secondary motion speed
        const BASE_AMPLITUDE = 0.4;      // Significantly increased base sway amplitude
        const PHASE_OFFSET = Math.random() * Math.PI * 2; // Random starting phase
        
        // Create a more complex water current effect
        const currentDirection = new BABYLON.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize();
        
        this.scene.onBeforeRenderObservable.add(() => {
            const time = performance.now() * 0.001;
            
            this.segments.forEach((segment, index) => {
                if (index === 0) return; // Skip root segment
                
                // Calculate sway based on height with more dramatic top movement
                const heightFactor = Math.pow(index / this.segments.length, 2.0); // More exponential movement
                const swayAmount = BASE_AMPLITUDE * heightFactor;
                
                // Main swaying motion
                const mainSway = Math.sin(time * MAIN_SWAY_SPEED + PHASE_OFFSET) * swayAmount;
                
                // Secondary motions for more complexity
                const secondarySway = Math.sin(time * SECONDARY_SWAY_SPEED + index * 0.5) * swayAmount * 0.5;
                const tertiarySway = Math.cos(time * 0.1 + index * 0.2) * swayAmount * 0.3;
                
                // Combine movements with water current influence
                const totalSway = mainSway + secondarySway + tertiarySway;
                
                // Create rotation that combines circular and wave-like motion
                const targetRotation = new BABYLON.Vector3(
                    currentDirection.x * totalSway * 1.5,
                    Math.sin(time * 0.2 + index * 0.1) * 0.1, // Slight twist
                    currentDirection.z * totalSway * 1.5
                );
                
                // Apply smooth interpolation with faster response for underwater feel
                segment.rotation = BABYLON.Vector3.Lerp(
                    segment.rotation,
                    targetRotation,
                    0.1 // Increased from 0.05 for more responsive movement
                );
            });
        });
    }

    dispose() {
        this.segments.forEach(segment => segment.dispose());
    }
}

class SeaweedManager {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.seaweed = [];
        this.createSeaweedPatches();
    }

    createSeaweedPatches() {
        const TERRAIN_SIZE = 100;
        const EDGE_DENSITY = 0.9;  // Increased edge density
        const CENTER_DENSITY = 0.3; // Increased center density
        const TOTAL_SEAWEED = 100;  // Reduced count but each seaweed is much larger

        for (let i = 0; i < TOTAL_SEAWEED; i++) {
            // Generate position with higher probability near edges
            let x, z;
            const edgeSpawn = Math.random() < 0.8; // Increased edge spawn chance

            if (edgeSpawn) {
                // Generate position near edges
                if (Math.random() < 0.5) {
                    x = (Math.random() < 0.5 ? -1 : 1) * (TERRAIN_SIZE/2 - Math.random() * 20);
                    z = (Math.random() - 0.5) * TERRAIN_SIZE;
                } else {
                    x = (Math.random() - 0.5) * TERRAIN_SIZE;
                    z = (Math.random() < 0.5 ? -1 : 1) * (TERRAIN_SIZE/2 - Math.random() * 20);
                }
            } else {
                // Generate position anywhere
                x = (Math.random() - 0.5) * TERRAIN_SIZE;
                z = (Math.random() - 0.5) * TERRAIN_SIZE;
            }

            // Get height at this position
            const y = this.landscape.getHeightAtPoint(x, z);
            
            // Calculate spawn probability based on height
            const heightFactor = Math.max(0, 1 - (y + 10) / 10); // Less likely on higher terrain
            const edgeFactor = edgeSpawn ? EDGE_DENSITY : CENTER_DENSITY;
            
            // Spawn seaweed based on combined probability
            if (Math.random() < heightFactor * edgeFactor) {
                const position = new BABYLON.Vector3(x, y, z);
                const seaweed = new Seaweed(this.scene, position);
                this.seaweed.push(seaweed);
            }
        }

        console.log(`Created ${this.seaweed.length} seaweed plants`);
    }

    dispose() {
        this.seaweed.forEach(plant => plant.dispose());
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Seaweed, SeaweedManager };
} else if (typeof window !== 'undefined') {
    window.Seaweed = Seaweed;
    window.SeaweedManager = SeaweedManager;
} 