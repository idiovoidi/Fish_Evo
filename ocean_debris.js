class OceanDebris {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.mesh = null;
        
        // Animation parameters
        this.bobHeight = 0.1 + Math.random() * 0.1;  // Random bob height between 0.1 and 0.2
        this.bobSpeed = 0.5 + Math.random() * 0.5;   // Random speed between 0.5 and 1.0
        this.timeOffset = Math.random() * Math.PI * 2; // Random phase offset
        this.originalY = position.y;
        
        this.createDebris();
        this.addBobAnimation();
    }

    createDebris() {
        // Randomly choose debris type
        const debrisTypes = ['clam', 'shell', 'starfish', 'rock', 'bone'];
        const type = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
        
        switch(type) {
            case 'clam':
                this.createClam();
                break;
            case 'shell':
                this.createShell();
                break;
            case 'starfish':
                this.createStarfish();
                break;
            case 'rock':
                this.createRock();
                break;
            case 'bone':
                this.createBone();
                break;
        }

        // Random rotation around Y axis
        if (this.mesh) {
            this.mesh.rotation.y = Math.random() * Math.PI * 2;
            // Slight random tilt
            this.mesh.rotation.x = (Math.random() - 0.5) * 0.3;
            this.mesh.rotation.z = (Math.random() - 0.5) * 0.3;
        }
    }

    createClam() {
        const size = 0.3 + Math.random() * 0.2;
        const isOpen = Math.random() > 0.7; // 30% chance to be open

        // Create bottom shell
        const bottomShell = BABYLON.MeshBuilder.CreateSphere("bottomShell", {
            diameter: size * 2,
            slice: 0.5, // Half sphere
            segments: 16
        }, this.scene);

        // Create top shell
        const topShell = BABYLON.MeshBuilder.CreateSphere("topShell", {
            diameter: size * 2,
            slice: 0.5,
            segments: 16
        }, this.scene);

        // Position and rotate shells
        bottomShell.position = this.position.clone();
        topShell.position = this.position.clone();
        topShell.rotation.x = Math.PI; // Flip top shell

        if (isOpen) {
            topShell.rotation.x += Math.PI * 0.3; // Open the clam
            topShell.position.y += size * 0.3;
        }

        // Create pearl for open clams
        let pearl = null;
        if (isOpen && Math.random() > 0.5) {
            pearl = BABYLON.MeshBuilder.CreateSphere("pearl", {
                diameter: size * 0.3
            }, this.scene);
            pearl.position = new BABYLON.Vector3(
                this.position.x,
                this.position.y + size * 0.2,
                this.position.z
            );
        }

        // Merge meshes
        const meshes = pearl ? [bottomShell, topShell, pearl] : [bottomShell, topShell];
        this.mesh = BABYLON.Mesh.MergeMeshes(meshes, true);
        this.applyDebrisMaterial('clam', isOpen);
    }

    createShell() {
        const size = 0.2 + Math.random() * 0.2;
        
        // Create main shell shape using custom vertices
        const points = [];
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI;
            const x = Math.sin(angle) * size;
            const y = Math.cos(angle) * size * 0.5;
            points.push(new BABYLON.Vector3(x, y, 0));
        }

        // Create shell spiral
        const shell = BABYLON.MeshBuilder.CreateLathe("shell", {
            shape: points,
            radius: size,
            tessellation: 24,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);

        // Add surface details
        const vertexData = BABYLON.VertexData.ExtractFromMesh(shell);
        const positions = vertexData.positions;
        
        for (let i = 0; i < positions.length; i += 3) {
            const angle = Math.atan2(positions[i], positions[i + 2]);
            const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
            
            // Add spiral ridges
            positions[i + 1] += Math.sin(angle * 8) * 0.02 * radius;
        }

        vertexData.applyToMesh(shell);
        shell.position = this.position.clone();
        this.mesh = shell;
        this.applyDebrisMaterial('shell');
    }

    createStarfish() {
        const size = 0.4 + Math.random() * 0.2;
        const arms = [];
        const NUM_ARMS = 5;

        for (let i = 0; i < NUM_ARMS; i++) {
            const angle = (i / NUM_ARMS) * Math.PI * 2;
            
            // Create arm
            const points = [];
            const segments = 10;
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const width = 0.15 * (1 - t * 0.7); // Taper the arm
                points.push(new BABYLON.Vector3(width * size, t * size, 0));
                points.push(new BABYLON.Vector3(-width * size, t * size, 0));
            }

            const arm = BABYLON.MeshBuilder.CreateRibbon("arm", {
                pathArray: [points],
                closePath: true
            }, this.scene);

            // Position and rotate arm
            arm.rotation.z = angle;
            arm.position = this.position.clone();
            arms.push(arm);
        }

        // Create center piece
        const center = BABYLON.MeshBuilder.CreateDisc("center", {
            radius: size * 0.2,
            tessellation: 20
        }, this.scene);
        center.position = this.position.clone();
        arms.push(center);

        // Add surface details
        arms.forEach(arm => {
            const vertexData = BABYLON.VertexData.ExtractFromMesh(arm);
            const positions = vertexData.positions;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(positions[i] * 10) * 0.02;
            }
            
            vertexData.applyToMesh(arm);
        });

        this.mesh = BABYLON.Mesh.MergeMeshes(arms, true);
        this.applyDebrisMaterial('starfish');
    }

    createRock() {
        const size = 0.3 + Math.random() * 0.4;
        
        // Create base rock shape
        const rock = BABYLON.MeshBuilder.CreateIcoSphere("rock", {
            radius: size,
            subdivisions: 1,
            flat: true
        }, this.scene);

        // Deform vertices for more natural look
        const vertexData = BABYLON.VertexData.ExtractFromMesh(rock);
        const positions = vertexData.positions;
        
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const length = vertex.length();
            
            // Add noise to vertex position
            positions[i] += (Math.random() - 0.5) * 0.2 * size;
            positions[i + 1] += (Math.random() - 0.5) * 0.2 * size;
            positions[i + 2] += (Math.random() - 0.5) * 0.2 * size;
        }

        vertexData.applyToMesh(rock);
        rock.position = this.position.clone();
        this.mesh = rock;
        this.applyDebrisMaterial('rock');
    }

    createBone() {
        const length = 0.5 + Math.random() * 0.3;
        const pieces = [];

        // Create main shaft
        const shaft = BABYLON.MeshBuilder.CreateCylinder("shaft", {
            height: length,
            diameter: 0.1,
            tessellation: 8
        }, this.scene);

        // Create ends
        const end1 = BABYLON.MeshBuilder.CreateSphere("end1", {
            diameter: 0.15,
            segments: 8
        }, this.scene);
        end1.position.y = length / 2;

        const end2 = end1.clone("end2");
        end2.position.y = -length / 2;

        pieces.push(shaft, end1, end2);

        // Merge and position
        this.mesh = BABYLON.Mesh.MergeMeshes(pieces, true);
        this.mesh.position = this.position.clone();
        this.applyDebrisMaterial('bone');
    }

    applyDebrisMaterial(type, isOpen = false) {
        const material = new BABYLON.StandardMaterial(`${type}-material`, this.scene);

        switch(type) {
            case 'clam':
                if (isOpen) {
                    // Pearl-like interior
                    material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
                    material.specularColor = new BABYLON.Color3(1, 1, 1);
                    material.specularPower = 128;
                    material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                } else {
                    // Rough exterior
                    material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.5);
                    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                }
                break;
            case 'shell':
                // Pearlescent
                material.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.6);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                break;
            case 'starfish':
                // Orange/red with rough texture
                material.diffuseColor = new BABYLON.Color3(
                    0.8 + Math.random() * 0.2,
                    0.3 + Math.random() * 0.2,
                    0.2
                );
                material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                break;
            case 'rock':
                // Dark and rough
                const greyTone = 0.3 + Math.random() * 0.2;
                material.diffuseColor = new BABYLON.Color3(greyTone, greyTone, greyTone);
                material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                break;
            case 'bone':
                // Weathered white
                material.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.8);
                material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                break;
        }

        this.mesh.material = material;
    }

    addBobAnimation() {
        // Add animation to the scene's render loop
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.mesh) {
                const time = performance.now() * 0.001; // Convert to seconds
                
                // Calculate bob offset based on debris type
                let bobOffset = Math.sin(time * this.bobSpeed + this.timeOffset) * this.bobHeight;
                
                // Adjust bobbing based on debris type
                if (this.mesh.name.includes('starfish')) {
                    bobOffset *= 0.5; // Reduced bobbing for starfish
                } else if (this.mesh.name.includes('rock')) {
                    bobOffset *= 0.3; // Minimal bobbing for rocks
                } else if (this.mesh.name.includes('shell')) {
                    // Add slight rotation to shells while bobbing
                    this.mesh.rotation.x += Math.sin(time * this.bobSpeed * 0.5) * 0.001;
                    this.mesh.rotation.z += Math.cos(time * this.bobSpeed * 0.5) * 0.001;
                }
                
                // Apply the bobbing motion
                this.mesh.position.y = this.originalY + bobOffset;
                
                // Add subtle rotation for lighter objects
                if (!this.mesh.name.includes('rock')) {
                    const rotationSpeed = 0.0005;
                    this.mesh.rotation.y += Math.sin(time * this.bobSpeed * 0.3) * rotationSpeed;
                }
            }
        });
    }

    dispose() {
        if (this.mesh) {
            // Remove the animation observable before disposing
            this.scene.onBeforeRenderObservable.clear();
            this.mesh.dispose();
        }
    }
}

class DebrisManager {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.debris = [];
        this.createDebrisField();
    }

    createDebrisField() {
        const TERRAIN_SIZE = 100;
        const DEBRIS_COUNT = 200;
        const MIN_DISTANCE = 2; // Minimum distance between debris items

        const placedPositions = [];

        for (let i = 0; i < DEBRIS_COUNT; i++) {
            let x, z, y;
            let validPosition = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 10;

            while (!validPosition && attempts < MAX_ATTEMPTS) {
                x = (Math.random() - 0.5) * TERRAIN_SIZE;
                z = (Math.random() - 0.5) * TERRAIN_SIZE;
                y = this.landscape.getHeightAtPoint(x, z);

                // Check distance from other debris
                validPosition = true;
                for (const pos of placedPositions) {
                    const distance = BABYLON.Vector3.Distance(
                        new BABYLON.Vector3(x, y, z),
                        pos
                    );
                    if (distance < MIN_DISTANCE) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }

            if (validPosition) {
                const position = new BABYLON.Vector3(x, y, z);
                placedPositions.push(position);
                const debris = new OceanDebris(this.scene, position);
                this.debris.push(debris);
            }
        }

        console.log(`Created ${this.debris.length} debris items`);
    }

    dispose() {
        this.debris.forEach(item => item.dispose());
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OceanDebris, DebrisManager };
} else if (typeof window !== 'undefined') {
    window.OceanDebris = OceanDebris;
    window.DebrisManager = DebrisManager;
} 