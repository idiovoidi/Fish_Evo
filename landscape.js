// Create underwater landscape
class UnderwaterLandscape {
    constructor(scene) {
        this.scene = scene;
        this.navigationPlugin = null;
        this.navMeshParameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 35,
            walkableHeight: 1.0,
            walkableClimb: 1.0,
            walkableRadius: 1.0,
            maxEdgeLen: 12.0,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };
    }

    async initializeNavigation() {
        // Initialize Recast plugin with proper await
        const recastInstance = await Recast();
        this.navigationPlugin = new BABYLON.RecastJSPlugin(recastInstance);
        console.log("Navigation plugin initialized");
    }

    async setup() {
        try {
            // Initialize navigation first
            await this.initializeNavigation();
            
            return new Promise((resolve) => {
                // Create underwater terrain
                this.terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
                    'terrain',
                    'https://playground.babylonjs.com/textures/heightMap.png',
                    {
                        width: 100,
                        height: 100,
                        subdivisions: 50,
                        minHeight: 0,
                        maxHeight: 10,
                        onReady: async (mesh) => {
                            // Create terrain material
                            const terrainMaterial = new BABYLON.StandardMaterial('terrainMaterial', this.scene);
                            terrainMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.5);
                            terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                            mesh.material = terrainMaterial;
                            mesh.position.y = -10;

                            // Create water environment (semi-transparent box)
                            this.waterBox = BABYLON.MeshBuilder.CreateBox(
                                'waterBox',
                                { width: 100, height: 40, depth: 100 },
                                this.scene
                            );
                            const waterMaterial = new BABYLON.StandardMaterial('waterMaterial', this.scene);
                            waterMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
                            waterMaterial.alpha = 0.3;
                            waterMaterial.backFaceCulling = false; // Show both sides of water
                            this.waterBox.material = waterMaterial;
                            this.waterBox.position.y = 10;

                            try {
                                // Create navigation mesh
                                await this.createNavigationMesh();
                                
                                // Debug visualization of navigation mesh
                                this.debugDrawNavMesh();

                                console.log("Landscape setup complete");
                                resolve();
                            } catch (error) {
                                console.error("Error creating navigation mesh:", error);
                                resolve(); // Resolve anyway to not block scene creation
                            }
                        }
                    },
                    this.scene
                );
            });
        } catch (error) {
            console.error("Error setting up landscape:", error);
            throw error;
        }
    }

    async createNavigationMesh() {
        try {
            // Create a temporary collision mesh for navigation
            const navmeshGround = this.terrain.clone("navmeshGround");
            navmeshGround.position = this.terrain.position;
            navmeshGround.scaling = this.terrain.scaling;
            navmeshGround.rotation = this.terrain.rotation;
            navmeshGround.computeWorldMatrix(true);

            // Create navigation mesh with adjusted parameters
            const navmeshParams = {
                cs: 0.2,
                ch: 0.2,
                walkableSlopeAngle: 35,
                walkableHeight: 1.0,
                walkableClimb: 1.0,
                walkableRadius: 1.0,
                maxEdgeLen: 12.0,
                maxSimplificationError: 1.3,
                minRegionArea: 8,
                mergeRegionArea: 20,
                maxVertsPerPoly: 6,
                detailSampleDist: 6,
                detailSampleMaxError: 1,
            };

            // Build navigation mesh
            await this.navigationPlugin.createNavMesh([navmeshGround], navmeshParams);
            
            // Build debug data
            this.navigationPlugin.createDebugNavMesh();
            
            navmeshGround.dispose(); // Clean up temporary mesh
            console.log("Navigation mesh created successfully");
        } catch (error) {
            console.error("Failed to create navigation mesh:", error);
            throw error;
        }
    }

    debugDrawNavMesh() {
        try {
            if (!this.navigationPlugin) {
                console.warn("No navigation plugin available for visualization");
                return;
            }

            // Get debug data directly from the navigation plugin
            const navmeshData = this.navigationPlugin.getDebugData();
            if (!navmeshData) {
                console.warn("No debug data available for navigation mesh");
                return;
            }

            // Create debug visualization mesh
            const debugMesh = new BABYLON.Mesh('navmeshDebug', this.scene);
            
            // Apply the debug data directly to the mesh
            navmeshData.applyToMesh(debugMesh);
            
            // Create debug material
            const debugMaterial = new BABYLON.StandardMaterial('navmeshDebugMat', this.scene);
            debugMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
            debugMaterial.alpha = 0.3;
            debugMaterial.wireframe = true;
            debugMesh.material = debugMaterial;
            
            // Raise slightly above terrain to prevent z-fighting
            debugMesh.position.y += 0.1;

            console.log("Navigation mesh visualization created");
        } catch (error) {
            console.error("Failed to create navigation mesh visualization:", error);
        }
    }

    getNavigationPlugin() {
        return this.navigationPlugin;
    }

    getTerrain() {
        return this.terrain;
    }

    getWaterBox() {
        return this.waterBox;
    }

    // Get height at specific point on terrain
    getHeightAtPoint(x, z) {
        if (!this.terrain) return -10;
        
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(x, 100, z),
            new BABYLON.Vector3(0, -1, 0),
            200
        );
        const pick = this.scene.pickWithRay(ray, mesh => mesh === this.terrain);
        return pick?.pickedPoint?.y || -10;
    }

    // Get nearest navigable point
    getNearestNavigablePoint(position) {
        if (!this.navigationPlugin) return position;
        try {
            return this.navigationPlugin.getClosestPoint(position);
        } catch (error) {
            console.warn("Failed to get nearest navigable point:", error);
            return position;
        }
    }

    // Check if point is navigable
    isPointNavigable(position) {
        if (!this.navigationPlugin) return false;
        try {
            const navPoint = this.navigationPlugin.getClosestPoint(position);
            return navPoint && BABYLON.Vector3.Distance(position, navPoint) < 0.5;
        } catch (error) {
            console.warn("Failed to check if point is navigable:", error);
            return false;
        }
    }

    // Get random navigable position
    getRandomNavigablePosition() {
        if (!this.navigationPlugin) return new BABYLON.Vector3(0, -10, 0);

        const margin = 5;
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const x = (Math.random() - 0.5) * (100 - 2 * margin);
                const z = (Math.random() - 0.5) * (100 - 2 * margin);
                const y = this.getHeightAtPoint(x, z);
                const position = new BABYLON.Vector3(x, y, z);

                // Get closest navigable point
                const navPoint = this.navigationPlugin.getClosestPoint(position);
                
                if (navPoint) {
                    // Ensure the point is actually on the terrain
                    navPoint.y = this.getHeightAtPoint(navPoint.x, navPoint.z) + 
                                SimulationConfig.entities.crabs.spawnHeight;
                    
                    if (SimulationConfig.debug.logSpawnPositions) {
                        console.log(`Found valid position at: ${navPoint.x.toFixed(2)}, ${navPoint.y.toFixed(2)}, ${navPoint.z.toFixed(2)}`);
                    }
                    return navPoint;
                }
            } catch (error) {
                console.warn("Error finding random position:", error);
            }
            attempts++;
        }

        console.warn("Could not find valid random position, using center");
        const center = new BABYLON.Vector3(0, this.getHeightAtPoint(0, 0) + 
                      SimulationConfig.entities.crabs.spawnHeight, 0);
        return this.navigationPlugin.getClosestPoint(center) || center;
    }
} 