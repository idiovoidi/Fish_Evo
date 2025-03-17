class Seaweed {
    constructor(scene, position, options = {}) {
        this.scene = scene;
        this.position = position;
        
        // Set default options
        this.options = Object.assign({
            type: 'kelp',
            height: 5,
            segments: 8,
            width: 0.5,
            color: new BABYLON.Color3(0.1, 0.5, 0.1),
            variation: Math.random()
        }, options);
        
        this.mesh = null;
        this.skeleton = null;
        this.animationGroups = [];
        
        this.createSeaweed();
    }
    
    createSeaweed() {
        try {
            // Create different types of seaweed
            switch (this.options.type) {
                case 'kelp':
                    this.createKelp();
                    break;
                case 'seagrass':
                    this.createSeagrass();
                    break;
                case 'algae':
                    this.createAlgae();
                    break;
                default:
                    this.createKelp();
            }
            
            // Position the seaweed
            if (this.mesh) {
                this.mesh.position = this.position;
            }
            
            return this.mesh;
        } catch (error) {
            console.error("Error creating seaweed:", error);
            return null;
        }
    }
    
    createKelp() {
        // Create a ribbon for the kelp
        const points = [];
        const segmentHeight = this.options.height / this.options.segments;
        
        // Create points for the kelp shape with slight randomization
        for (let i = 0; i <= this.options.segments; i++) {
            const xOffset = (i / this.options.segments) * Math.sin(i + this.options.variation * 10) * 0.3;
            points.push(new BABYLON.Vector3(xOffset, i * segmentHeight, 0));
        }
        
        // Create a path for the ribbon
        const path = [];
        const pathCount = 5; // Number of parallel paths to create width
        const pathStep = this.options.width / (pathCount - 1);
        
        for (let i = 0; i < pathCount; i++) {
            const offset = (i * pathStep) - (this.options.width / 2);
            const pathPoints = points.map(p => new BABYLON.Vector3(offset + p.x, p.y, p.z));
            path.push(pathPoints);
        }
        
        // Create the ribbon mesh
        this.mesh = BABYLON.MeshBuilder.CreateRibbon("kelp", {
            pathArray: path,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            updatable: true
        }, this.scene);
        
        // Create material
        const material = new BABYLON.StandardMaterial("kelpMaterial", this.scene);
        material.diffuseColor = this.options.color;
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        material.alpha = 0.9;
        this.mesh.material = material;
        
        // Create skeleton for animation
        this.createSkeleton();
        
        // Create animation
        this.createKelpAnimation();
    }
    
    createSeagrass() {
        // Create multiple thin blades of grass
        const bladeCount = 3 + Math.floor(this.options.variation * 4);
        const bladeWidth = this.options.width / bladeCount;
        
        // Create parent mesh
        this.mesh = new BABYLON.Mesh("seagrass", this.scene);
        
        for (let b = 0; b < bladeCount; b++) {
            // Create points for a single blade
            const points = [];
            const segmentHeight = this.options.height / this.options.segments;
            const bladeHeight = this.options.height * (0.7 + this.options.variation * 0.6);
            
            // Create curved blade shape
            for (let i = 0; i <= this.options.segments; i++) {
                const t = i / this.options.segments;
                const xOffset = Math.sin(t * Math.PI) * (0.5 + this.options.variation * 0.5);
                points.push(new BABYLON.Vector3(xOffset, i * segmentHeight * (bladeHeight / this.options.height), 0));
            }
            
            // Create blade mesh
            const blade = BABYLON.MeshBuilder.CreateLines(`seagrassBlade${b}`, {
                points: points,
                updatable: true
            }, this.scene);
            
            // Position blade
            const bladeOffset = (b - (bladeCount - 1) / 2) * bladeWidth * 1.5;
            blade.position = new BABYLON.Vector3(bladeOffset, 0, 0);
            
            // Rotate blade slightly
            blade.rotation.y = (Math.random() - 0.5) * Math.PI * 0.25;
            
            // Create material
            const material = new BABYLON.StandardMaterial(`seagrassMaterial${b}`, this.scene);
            material.diffuseColor = new BABYLON.Color3(
                this.options.color.r * (0.8 + Math.random() * 0.4),
                this.options.color.g * (0.8 + Math.random() * 0.4),
                this.options.color.b * (0.8 + Math.random() * 0.4)
            );
            material.emissiveColor = material.diffuseColor.scale(0.5);
            blade.color = material.diffuseColor;
            
            // Parent to main mesh
            blade.parent = this.mesh;
            
            // Create animation for this blade
            this.createGrassBladeAnimation(blade, b);
        }
    }
    
    createAlgae() {
        // Create a cluster of small algae fronds
        const frondCount = 5 + Math.floor(this.options.variation * 7);
        
        // Create parent mesh
        this.mesh = new BABYLON.Mesh("algae", this.scene);
        
        for (let f = 0; f < frondCount; f++) {
            // Randomize frond properties
            const frondHeight = this.options.height * (0.4 + Math.random() * 0.6);
            const frondWidth = this.options.width * (0.3 + Math.random() * 0.7);
            const frondSegments = Math.max(3, Math.floor(this.options.segments * (0.5 + Math.random() * 0.5)));
            
            // Create points for the frond shape
            const points = [];
            const segmentHeight = frondHeight / frondSegments;
            
            // Create curved frond shape
            for (let i = 0; i <= frondSegments; i++) {
                const t = i / frondSegments;
                const xOffset = Math.sin(t * Math.PI) * (0.3 + Math.random() * 0.3);
                points.push(new BABYLON.Vector3(xOffset, i * segmentHeight, 0));
            }
            
            // Create a path for the ribbon
            const path = [];
            const pathCount = 3; // Thinner fronds
            const pathStep = frondWidth / (pathCount - 1);
            
            for (let i = 0; i < pathCount; i++) {
                const offset = (i * pathStep) - (frondWidth / 2);
                const pathPoints = points.map(p => new BABYLON.Vector3(offset + p.x, p.y, p.z));
                path.push(pathPoints);
            }
            
            // Create the ribbon mesh
            const frond = BABYLON.MeshBuilder.CreateRibbon(`algaeFrond${f}`, {
                pathArray: path,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                updatable: true
            }, this.scene);
            
            // Position frond
            const radius = this.options.width * 1.5;
            const angle = (f / frondCount) * Math.PI * 2 + this.options.variation * Math.PI;
            frond.position = new BABYLON.Vector3(
                Math.cos(angle) * radius * Math.random(),
                0,
                Math.sin(angle) * radius * Math.random()
            );
            
            // Rotate frond
            frond.rotation.y = Math.random() * Math.PI * 2;
            
            // Create material
            const material = new BABYLON.StandardMaterial(`algaeMaterial${f}`, this.scene);
            material.diffuseColor = new BABYLON.Color3(
                this.options.color.r * (0.7 + Math.random() * 0.6),
                this.options.color.g * (0.7 + Math.random() * 0.6),
                this.options.color.b * (0.7 + Math.random() * 0.6)
            );
            material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            material.alpha = 0.9;
            frond.material = material;
            
            // Parent to main mesh
            frond.parent = this.mesh;
            
            // Create animation for this frond
            this.createAlgaeFrondAnimation(frond, f);
        }
    }
    
    createSkeleton() {
        // Create a skeleton for the seaweed
        this.skeleton = new BABYLON.Skeleton("seaweedSkeleton", "seaweedSkeleton", this.scene);
        
        // Create bones
        const bones = [];
        let parentBone = null;
        
        // Create a bone for each segment
        for (let i = 0; i <= this.options.segments; i++) {
            const bone = new BABYLON.Bone(
                `seaweedBone${i}`, 
                this.skeleton, 
                parentBone, 
                i === 0 
                    ? BABYLON.Matrix.Identity() 
                    : BABYLON.Matrix.Translation(0, this.options.height / this.options.segments, 0)
            );
            bones.push(bone);
            parentBone = bone;
        }
        
        // Assign bones to skeleton
        this.skeleton.bones = bones;
        
        // Assign skeleton to mesh
        this.mesh.skeleton = this.skeleton;
    }
    
    createKelpAnimation() {
        // Create animation group
        const animationGroup = new BABYLON.AnimationGroup("kelpAnimation");
        
        // Create animations for each bone except the root
        for (let i = 1; i <= this.options.segments; i++) {
            const bone = this.skeleton.bones[i];
            
            // Create rotation animation
            const rotationAnimation = new BABYLON.Animation(
                `kelpRotation${i}`,
                "rotation",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            // Calculate animation parameters based on bone position
            const amplitude = 0.05 * i; // Increasing amplitude for higher bones
            const phaseOffset = i * 0.2 + this.options.variation * 5; // Phase offset for each bone
            const speed = 2 + this.options.variation * 1.5; // Randomized speed
            
            // Create keyframes
            const keyFrames = [];
            for (let frame = 0; frame <= 60; frame++) {
                const value = new BABYLON.Vector3(
                    Math.sin(frame / speed + phaseOffset) * amplitude,
                    0,
                    Math.cos(frame / speed + phaseOffset * 0.7) * amplitude * 0.5
                );
                
                keyFrames.push({
                    frame: frame,
                    value: value
                });
            }
            
            // Set keyframes
            rotationAnimation.setKeys(keyFrames);
            
            // Add animation to group
            animationGroup.addTargetedAnimation(rotationAnimation, bone);
        }
        
        // Start animation
        animationGroup.play(true);
        this.animationGroups.push(animationGroup);
    }
    
    createGrassBladeAnimation(blade, index) {
        // Create animation group
        const animationGroup = new BABYLON.AnimationGroup(`seagrassAnimation${index}`);
        
        // Create rotation animation
        const rotationAnimation = new BABYLON.Animation(
            `seagrassRotation${index}`,
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Calculate animation parameters
        const phaseOffset = index * 0.7 + this.options.variation * 10;
        const speed = 3 + this.options.variation * 2;
        
        // Create keyframes
        const keyFrames = [];
        for (let frame = 0; frame <= 60; frame++) {
            const value = new BABYLON.Vector3(
                Math.sin(frame / speed + phaseOffset) * 0.1,
                Math.sin(frame / speed + phaseOffset * 1.3) * 0.05,
                Math.cos(frame / speed + phaseOffset * 0.7) * 0.15
            );
            
            keyFrames.push({
                frame: frame,
                value: value
            });
        }
        
        // Set keyframes
        rotationAnimation.setKeys(keyFrames);
        
        // Add animation to group
        animationGroup.addTargetedAnimation(rotationAnimation, blade);
        
        // Start animation
        animationGroup.play(true);
        this.animationGroups.push(animationGroup);
    }
    
    createAlgaeFrondAnimation(frond, index) {
        // Create animation group
        const animationGroup = new BABYLON.AnimationGroup(`algaeAnimation${index}`);
        
        // Create rotation animation
        const rotationAnimation = new BABYLON.Animation(
            `algaeRotation${index}`,
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Calculate animation parameters
        const phaseOffset = index * 0.5 + this.options.variation * 8;
        const speed = 4 + this.options.variation * 3;
        
        // Create keyframes
        const keyFrames = [];
        for (let frame = 0; frame <= 60; frame++) {
            const value = new BABYLON.Vector3(
                Math.sin(frame / speed + phaseOffset) * 0.08,
                frond.rotation.y + Math.sin(frame / speed + phaseOffset * 1.1) * 0.03,
                Math.cos(frame / speed + phaseOffset * 0.9) * 0.08
            );
            
            keyFrames.push({
                frame: frame,
                value: value
            });
        }
        
        // Set keyframes
        rotationAnimation.setKeys(keyFrames);
        
        // Add animation to group
        animationGroup.addTargetedAnimation(rotationAnimation, frond);
        
        // Start animation
        animationGroup.play(true);
        this.animationGroups.push(animationGroup);
    }
    
    dispose() {
        // Stop animations
        this.animationGroups.forEach(group => {
            group.stop();
            group.dispose();
        });
        this.animationGroups = [];
        
        // Dispose skeleton
        if (this.skeleton) {
            this.skeleton.dispose();
            this.skeleton = null;
        }
        
        // Dispose mesh
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}

class SeaweedManager {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.seaweeds = [];
        
        // Configuration
        this.config = {
            count: 150,
            minHeight: 3,
            maxHeight: 8,
            minWidth: 0.3,
            maxWidth: 0.8,
            minSegments: 5,
            maxSegments: 10,
            spawnRadius: 80,
            minDistance: 5, // Minimum distance between seaweeds
            types: ['kelp', 'seagrass', 'algae'],
            typeDistribution: {
                kelp: 0.4,     // 40% kelp
                seagrass: 0.4, // 40% seagrass
                algae: 0.2     // 20% algae
            },
            colors: {
                kelp: [
                    new BABYLON.Color3(0.1, 0.5, 0.1),  // Green
                    new BABYLON.Color3(0.15, 0.4, 0.1), // Dark green
                    new BABYLON.Color3(0.2, 0.5, 0.2)   // Light green
                ],
                seagrass: [
                    new BABYLON.Color3(0.2, 0.6, 0.2),  // Bright green
                    new BABYLON.Color3(0.3, 0.6, 0.3),  // Light green
                    new BABYLON.Color3(0.15, 0.45, 0.15) // Medium green
                ],
                algae: [
                    new BABYLON.Color3(0.1, 0.4, 0.3),  // Teal
                    new BABYLON.Color3(0.2, 0.3, 0.1),  // Olive
                    new BABYLON.Color3(0.3, 0.5, 0.2)   // Yellow-green
                ]
            },
            // Distribution settings
            clusterProbability: 0.6,  // 60% chance of creating a cluster
            clusterSize: { min: 3, max: 8 },  // Number of seaweeds in a cluster
            clusterRadius: { min: 1, max: 3 }  // Radius of a cluster
        };
    }
    
    initialize() {
        console.log("Initializing seaweed...");
        
        // Spawn seaweed
        this.spawnSeaweed();
        
        console.log(`Created ${this.seaweeds.length} seaweed plants`);
    }
    
    getRandomSeaweedType() {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const type of this.config.types) {
            cumulativeProbability += this.config.typeDistribution[type];
            if (rand <= cumulativeProbability) {
                return type;
            }
        }
        
        return this.config.types[0]; // Default to first type
    }
    
    getRandomColorForType(type) {
        const colors = this.config.colors[type];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    spawnSeaweed() {
        const attempts = this.config.count * 2; // Allow more attempts than needed
        const positions = [];
        
        for (let i = 0; i < attempts && positions.length < this.config.count; i++) {
            // Determine if we should create a cluster
            const createCluster = Math.random() < this.config.clusterProbability;
            
            if (createCluster) {
                // Generate cluster center position
                const centerX = (Math.random() - 0.5) * this.config.spawnRadius * 2;
                const centerZ = (Math.random() - 0.5) * this.config.spawnRadius * 2;
                
                // Get terrain height at center position
                let centerY = 0;
                try {
                    if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
                        centerY = this.landscape.getHeightAtPoint(centerX, centerZ);
                    }
                } catch (e) {
                    console.warn("Could not get terrain height, using default");
                }
                
                // Only spawn if underwater (centerY < 0)
                if (centerY < 0) {
                    // Determine cluster size
                    const clusterSize = Math.floor(
                        this.config.clusterSize.min + 
                        Math.random() * (this.config.clusterSize.max - this.config.clusterSize.min + 1)
                    );
                    
                    // Determine cluster radius
                    const clusterRadius = 
                        this.config.clusterRadius.min + 
                        Math.random() * (this.config.clusterRadius.max - this.config.clusterRadius.min);
                    
                    // Determine seaweed type for the cluster (mostly same type with some variation)
                    const primaryType = this.getRandomSeaweedType();
                    
                    // Create seaweeds in the cluster
                    for (let j = 0; j < clusterSize; j++) {
                        // Generate position within cluster radius
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * clusterRadius;
                        const x = centerX + Math.cos(angle) * distance;
                        const z = centerZ + Math.sin(angle) * distance;
                        
                        // Get terrain height at position
                        let y = centerY;
                        try {
                            if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
                                y = this.landscape.getHeightAtPoint(x, z);
                            }
                        } catch (e) {
                            // Use center height if can't get specific height
                        }
                        
                        // Create position
                        const position = new BABYLON.Vector3(x, y, z);
                        positions.push(position);
                        
                        // Determine seaweed type (90% chance of primary type, 10% chance of random type)
                        const type = Math.random() < 0.9 ? primaryType : this.getRandomSeaweedType();
                        
                        // Randomize seaweed properties
                        const height = this.config.minHeight + Math.random() * (this.config.maxHeight - this.config.minHeight);
                        const segments = Math.floor(this.config.minSegments + Math.random() * (this.config.maxSegments - this.config.minSegments + 1));
                        const width = this.config.minWidth + Math.random() * (this.config.maxWidth - this.config.minWidth);
                        const color = this.getRandomColorForType(type);
                        
                        // Create seaweed
                        const seaweed = new Seaweed(this.scene, position, {
                            type: type,
                            height: height,
                            segments: segments,
                            width: width,
                            color: color,
                            variation: Math.random()
                        });
                        
                        this.seaweeds.push(seaweed);
                        
                        // Stop if we've reached the desired count
                        if (positions.length >= this.config.count) {
                            break;
                        }
                    }
                }
            } else {
                // Generate random position within spawn radius
                const x = (Math.random() - 0.5) * this.config.spawnRadius * 2;
                const z = (Math.random() - 0.5) * this.config.spawnRadius * 2;
                
                // Check if position is too close to existing seaweeds
                let tooClose = false;
                for (const pos of positions) {
                    const dx = pos.x - x;
                    const dz = pos.z - z;
                    const distSquared = dx * dx + dz * dz;
                    if (distSquared < this.config.minDistance * this.config.minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (tooClose) continue;
                
                // Get terrain height at position
                let y = 0;
                try {
                    if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
                        y = this.landscape.getHeightAtPoint(x, z);
                    }
                } catch (e) {
                    console.warn("Could not get terrain height, using default");
                }
                
                // Only spawn if underwater (y < 0)
                if (y < 0) {
                    // Create position
                    const position = new BABYLON.Vector3(x, y, z);
                    positions.push(position);
                    
                    // Determine seaweed type
                    const type = this.getRandomSeaweedType();
                    
                    // Randomize seaweed properties
                    const height = this.config.minHeight + Math.random() * (this.config.maxHeight - this.config.minHeight);
                    const segments = Math.floor(this.config.minSegments + Math.random() * (this.config.maxSegments - this.config.minSegments + 1));
                    const width = this.config.minWidth + Math.random() * (this.config.maxWidth - this.config.minWidth);
                    const color = this.getRandomColorForType(type);
                    
                    // Create seaweed
                    const seaweed = new Seaweed(this.scene, position, {
                        type: type,
                        height: height,
                        segments: segments,
                        width: width,
                        color: color,
                        variation: Math.random()
                    });
                    
                    this.seaweeds.push(seaweed);
                }
            }
        }
    }
    
    update() {
        // No regular updates needed as animations are handled by Babylon
    }
    
    dispose() {
        // Dispose all seaweeds
        this.seaweeds.forEach(seaweed => {
            seaweed.dispose();
        });
        this.seaweeds = [];
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Seaweed, SeaweedManager };
} else if (typeof window !== 'undefined') {
    window.Seaweed = Seaweed;
    window.SeaweedManager = SeaweedManager;
}