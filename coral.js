class Coral {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.mesh = null;
        this.createCoral();
    }

    createCoral() {
        // Randomly choose coral type
        const coralTypes = ['branch', 'brain', 'fan', 'tube'];
        const type = coralTypes[Math.floor(Math.random() * coralTypes.length)];
        
        switch(type) {
            case 'branch':
                this.createBranchingCoral();
                break;
            case 'brain':
                this.createBrainCoral();
                break;
            case 'fan':
                this.createFanCoral();
                break;
            case 'tube':
                this.createTubeCoral();
                break;
        }
    }

    createBranchingCoral() {
        const NUM_BRANCHES = 5 + Math.floor(Math.random() * 4);
        const branches = [];

        // Create base
        const base = BABYLON.MeshBuilder.CreateCylinder("base", {
            height: 0.5,
            diameterTop: 1.2,
            diameterBottom: 1.5,
            tessellation: 16
        }, this.scene);
        base.position = this.position.clone();
        branches.push(base);

        // Create main trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            height: 2.5 + Math.random() * 2,
            diameterTop: 0.4,
            diameterBottom: 0.8,
            tessellation: 12
        }, this.scene);
        
        trunk.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y + trunk.height/2,
            this.position.z
        );
        branches.push(trunk);

        // Create branches in layers
        const LAYERS = 3;
        for (let layer = 0; layer < LAYERS; layer++) {
            const layerHeight = (layer + 1) / LAYERS;
            const numBranchesInLayer = Math.floor(NUM_BRANCHES / LAYERS) + (layer === 0 ? 2 : 0);
            
            for (let i = 0; i < numBranchesInLayer; i++) {
                const height = 1 + Math.random() * (2 - layerHeight);
                const branch = BABYLON.MeshBuilder.CreateCylinder(`branch${layer}_${i}`, {
                    height: height,
                    diameterTop: 0.15,
                    diameterBottom: 0.3 + Math.random() * 0.2,
                    tessellation: 8
                }, this.scene);

                // Position branch
                const angle = ((i / numBranchesInLayer) * Math.PI * 2) + (layer * 0.5);
                const radius = 0.4 + Math.random() * 0.3;
                const yOffset = trunk.height * layerHeight;
                
                branch.position = new BABYLON.Vector3(
                    this.position.x + Math.cos(angle) * radius,
                    this.position.y + yOffset,
                    this.position.z + Math.sin(angle) * radius
                );

                // Rotate branch outward and upward
                const outwardAngle = Math.PI * (0.2 + layerHeight * 0.2);
                branch.rotation.x = Math.cos(angle) * outwardAngle;
                branch.rotation.z = Math.sin(angle) * outwardAngle;
                branches.push(branch);

                // Add small branches to each main branch
                if (Math.random() < 0.7) {
                    const subBranch = BABYLON.MeshBuilder.CreateCylinder(`subbranch${layer}_${i}`, {
                        height: height * 0.7,
                        diameterTop: 0.1,
                        diameterBottom: 0.2,
                        tessellation: 8
                    }, this.scene);

                    subBranch.position = new BABYLON.Vector3(
                        branch.position.x + Math.cos(angle + Math.PI/4) * 0.3,
                        branch.position.y + height * 0.3,
                        branch.position.z + Math.sin(angle + Math.PI/4) * 0.3
                    );

                    subBranch.rotation = branch.rotation.clone();
                    subBranch.rotation.y += Math.PI/4;
                    branches.push(subBranch);
                }
            }
        }

        // Merge branches
        this.mesh = BABYLON.Mesh.MergeMeshes(branches, true);
        this.applyCoralMaterial('branching');
    }

    createBrainCoral() {
        // Create base
        const base = BABYLON.MeshBuilder.CreateCylinder("base", {
            height: 0.5,
            diameterTop: 2.0,
            diameterBottom: 2.3,
            tessellation: 16
        }, this.scene);

        // Create main sphere
        const sphere = BABYLON.MeshBuilder.CreateSphere("brainBase", {
            diameter: 2.0 + Math.random() * 0.5,
            segments: 32
        }, this.scene);

        // Create wrinkle texture using noise
        const vertexData = BABYLON.VertexData.CreateSphere({ segments: 32, diameter: 1 });
        const positions = vertexData.positions;
        const normals = vertexData.normals;

        // Apply more detailed wrinkles
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const normal = new BABYLON.Vector3(normals[i], normals[i + 1], normals[i + 2]);
            
            // Combine multiple frequencies of noise
            const noise = 
                Math.sin(vertex.x * 8) * Math.cos(vertex.z * 8) * 0.1 +
                Math.sin(vertex.x * 16) * Math.cos(vertex.z * 16) * 0.05 +
                Math.sin(vertex.x * 4) * Math.cos(vertex.z * 4) * 0.15;
            
            vertex.addInPlace(normal.scale(noise));
            
            positions[i] = vertex.x;
            positions[i + 1] = vertex.y;
            positions[i + 2] = vertex.z;
        }

        vertexData.applyToMesh(sphere);
        
        // Position parts
        base.position = this.position.clone();
        sphere.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y + 0.5,
            this.position.z
        );

        // Merge parts
        this.mesh = BABYLON.Mesh.MergeMeshes([base, sphere], true);
        this.applyCoralMaterial('brain');
    }

    createFanCoral() {
        // Create base
        const base = BABYLON.MeshBuilder.CreateCylinder("base", {
            height: 0.5,
            diameterTop: 0.8,
            diameterBottom: 1.0,
            tessellation: 12
        }, this.scene);

        // Create main fan
        const fanWidth = 2.5 + Math.random();
        const fanHeight = 2.0 + Math.random();
        const fan = BABYLON.MeshBuilder.CreatePlane("fan", {
            width: fanWidth,
            height: fanHeight,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            subdivisions: 20  // Increase subdivisions for smoother deformation
        }, this.scene);

        // Create more complex wave deformation
        const vertexData = BABYLON.VertexData.ExtractFromMesh(fan);
        const positions = vertexData.positions;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i] / fanWidth;
            const y = positions[i + 1] / fanHeight;
            
            // Combine multiple wave frequencies
            positions[i + 2] = 
                Math.sin(x * 4) * Math.cos(y * 4) * 0.2 +
                Math.sin(x * 8) * Math.cos(y * 8) * 0.1 +
                Math.sin(x * 2) * Math.cos(y * 2) * 0.3;

            // Add edge curling
            const edgeFactor = Math.pow(Math.abs(x), 2);
            positions[i + 2] += edgeFactor * 0.3;
        }

        vertexData.applyToMesh(fan);

        // Position parts
        base.position = this.position.clone();
        fan.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y + fanHeight/2 + 0.3,
            this.position.z
        );
        
        // Random rotation around Y axis
        fan.rotation.y = Math.random() * Math.PI * 2;
        // Slight backward tilt
        fan.rotation.x = -Math.PI * 0.1;

        this.mesh = BABYLON.Mesh.MergeMeshes([base, fan], true);
        this.applyCoralMaterial('fan');
    }

    createTubeCoral() {
        const NUM_TUBES = 7 + Math.floor(Math.random() * 5);
        const meshes = [];

        // Create base
        const base = BABYLON.MeshBuilder.CreateCylinder("base", {
            height: 0.5,
            diameterTop: 1.5,
            diameterBottom: 1.8,
            tessellation: 16
        }, this.scene);
        base.position = this.position.clone();
        meshes.push(base);

        // Create tubes in concentric circles
        const LAYERS = 3;
        for (let layer = 0; layer < LAYERS; layer++) {
            const layerRadius = 0.3 + layer * 0.3;
            const tubesInLayer = Math.floor(NUM_TUBES / LAYERS) + (layer === 0 ? 1 : 0);
            
            for (let i = 0; i < tubesInLayer; i++) {
                const height = 1.5 + Math.random() * (1.5 - layer * 0.3);
                const tube = BABYLON.MeshBuilder.CreateCylinder(`tube${layer}_${i}`, {
                    height: height,
                    diameterTop: 0.3 - layer * 0.05,
                    diameterBottom: 0.4 - layer * 0.05,
                    tessellation: 12
                }, this.scene);

                // Position tube
                const angle = (i / tubesInLayer) * Math.PI * 2 + (layer * 0.5);
                tube.position = new BABYLON.Vector3(
                    this.position.x + Math.cos(angle) * layerRadius,
                    this.position.y + height/2,
                    this.position.z + Math.sin(angle) * layerRadius
                );

                // Slight outward tilt
                const tiltAngle = 0.2 + layer * 0.1;
                tube.rotation.x = Math.cos(angle) * tiltAngle;
                tube.rotation.z = Math.sin(angle) * tiltAngle;
                meshes.push(tube);

                // Add smaller tubes around main tubes
                if (layer < 2 && Math.random() < 0.6) {
                    const smallTube = BABYLON.MeshBuilder.CreateCylinder(`smallTube${layer}_${i}`, {
                        height: height * 0.7,
                        diameterTop: 0.15,
                        diameterBottom: 0.2,
                        tessellation: 8
                    }, this.scene);

                    smallTube.position = new BABYLON.Vector3(
                        tube.position.x + Math.cos(angle + Math.PI/4) * 0.2,
                        this.position.y + height * 0.3,
                        tube.position.z + Math.sin(angle + Math.PI/4) * 0.2
                    );

                    smallTube.rotation = tube.rotation.clone();
                    meshes.push(smallTube);
                }
            }
        }

        this.mesh = BABYLON.Mesh.MergeMeshes(meshes, true);
        this.applyCoralMaterial('tube');
    }

    applyCoralMaterial(type) {
        // Create standard material for better performance and glow control
        const material = new BABYLON.StandardMaterial(`coral-material-${type}`, this.scene);

        // Base color based on coral type with more saturated colors
        let baseColor;
        switch(type) {
            case 'branching':
                baseColor = new BABYLON.Color3(
                    0.9 + Math.random() * 0.1, // Stronger pink/purple
                    0.2 + Math.random() * 0.2,
                    0.6 + Math.random() * 0.2
                );
                break;
            case 'brain':
                baseColor = new BABYLON.Color3(
                    0.8 + Math.random() * 0.2, // Stronger orange/red
                    0.2 + Math.random() * 0.2,
                    0.2 + Math.random() * 0.1
                );
                break;
            case 'fan':
                baseColor = new BABYLON.Color3(
                    0.2 + Math.random() * 0.2, // Deeper purple/blue
                    0.1 + Math.random() * 0.2,
                    0.7 + Math.random() * 0.3
                );
                break;
            case 'tube':
                baseColor = new BABYLON.Color3(
                    0.1 + Math.random() * 0.2, // Richer green/yellow
                    0.7 + Math.random() * 0.3,
                    0.2 + Math.random() * 0.2
                );
                break;
        }

        // Material properties
        material.diffuseColor = baseColor;
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.emissiveColor = baseColor.scale(0.2); // Reduced glow
        material.ambientColor = baseColor.scale(0.5);
        
        // Add slight transparency for depth
        material.alpha = 0.95;
        
        // Apply material
        this.mesh.material = material;

        // Add glow layer if not exists with reduced intensity
        let glowLayer = this.scene.getGlowLayerByName("coralGlow");
        if (!glowLayer) {
            glowLayer = new BABYLON.GlowLayer("coralGlow", this.scene, {
                mainTextureFixedSize: 1024,
                blurKernelSize: 64,
                mainTextureRatio: 0.5
            });
            glowLayer.intensity = 0.3;
        }
        glowLayer.addIncludedOnlyMesh(this.mesh);
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
}

class CoralManager {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.corals = [];
        this.createCoralReef();
    }

    createCoralReef() {
        const TERRAIN_SIZE = 100;
        const EDGE_DENSITY = 0.8;  // Increased edge density
        const CENTER_DENSITY = 0.3; // Increased center density
        const TOTAL_CORAL = 60;    // Reduced count but each coral is larger and more detailed

        for (let i = 0; i < TOTAL_CORAL; i++) {
            // Generate position with higher probability near edges
            let x, z;
            const edgeSpawn = Math.random() < 0.7; // Increased edge spawn chance

            if (edgeSpawn) {
                if (Math.random() < 0.5) {
                    x = (Math.random() < 0.5 ? -1 : 1) * (TERRAIN_SIZE/2 - Math.random() * 20);
                    z = (Math.random() - 0.5) * TERRAIN_SIZE;
                } else {
                    x = (Math.random() - 0.5) * TERRAIN_SIZE;
                    z = (Math.random() < 0.5 ? -1 : 1) * (TERRAIN_SIZE/2 - Math.random() * 20);
                }
            } else {
                x = (Math.random() - 0.5) * TERRAIN_SIZE;
                z = (Math.random() - 0.5) * TERRAIN_SIZE;
            }

            // Get height at this position
            const y = this.landscape.getHeightAtPoint(x, z);
            
            // Calculate spawn probability based on height
            const heightFactor = Math.max(0, 1 - (y + 10) / 10);
            const edgeFactor = edgeSpawn ? EDGE_DENSITY : CENTER_DENSITY;
            
            if (Math.random() < heightFactor * edgeFactor) {
                const position = new BABYLON.Vector3(x, y, z);
                const coral = new Coral(this.scene, position);
                this.corals.push(coral);
            }
        }

        console.log(`Created ${this.corals.length} coral formations`);
    }

    dispose() {
        this.corals.forEach(coral => coral.dispose());
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Coral, CoralManager };
} else if (typeof window !== 'undefined') {
    window.Coral = Coral;
    window.CoralManager = CoralManager;
}