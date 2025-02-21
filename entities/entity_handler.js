// Entity handler class to manage all entities in the simulation
class EntityHandler {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.crabManager = null;
        this.fishManager = null;
        this.config = SimulationConfig;
    }

    async initialize() {
        try {
            console.log("Initializing entity handler...");
            
            // Initialize crab manager
            console.log(`Creating ${this.config.entities.crabs.count} crabs...`);
            this.crabManager = new CrabManager(
                this.scene,
                this.landscape.getNavigationPlugin(),
                this.landscape
            );
            this.crabManager.createCrabs(this.config.entities.crabs.count);
            
            // Initialize fish manager
            console.log(`Creating ${this.config.entities.fish.count} fish...`);
            this.fishManager = new FishManager(this.scene);
            this.fishManager.createFishSchool(this.config.entities.fish.count);
            
            console.log("Entity initialization complete");
            return true;
        } catch (error) {
            console.error("Failed to initialize entities:", error);
            return false;
        }
    }

    update() {
        if (this.crabManager) this.crabManager.update();
        if (this.fishManager) this.fishManager.update();
    }

    // Utility methods for runtime modifications
    setCrabCount(newCount) {
        if (!this.crabManager) return;
        const currentCount = this.crabManager.crabs.length;
        if (newCount > currentCount) {
            this.crabManager.createCrabs(newCount - currentCount);
        } else if (newCount < currentCount) {
            // Remove excess crabs
            for (let i = currentCount - 1; i >= newCount; i--) {
                const crab = this.crabManager.crabs[i];
                crab.renderComponent.dispose();
                this.crabManager.entityManager.remove(crab);
                this.crabManager.crabs.splice(i, 1);
            }
        }
        console.log(`Adjusted crab count to ${newCount}`);
    }

    setFishCount(newCount) {
        if (!this.fishManager) return;
        const currentCount = this.fishManager.fishes.length;
        if (newCount > currentCount) {
            this.fishManager.createFishSchool(newCount - currentCount);
        } else if (newCount < currentCount) {
            // Remove excess fish
            for (let i = currentCount - 1; i >= newCount; i--) {
                const fish = this.fishManager.fishes[i];
                fish.renderComponent.dispose();
                this.fishManager.entityManager.remove(fish);
                this.fishManager.fishes.splice(i, 1);
            }
        }
        console.log(`Adjusted fish count to ${newCount}`);
    }

    getEntityCounts() {
        return {
            crabs: this.crabManager ? this.crabManager.crabs.length : 0,
            fish: this.fishManager ? this.fishManager.fishes.length : 0
        };
    }

    createCrabs(numCrabs = SimulationConfig.entities.crabs.count) {
        const SPAWN_AREA_SIZE = 50; // Size of the spawn area
        const SPAWN_GRID_SIZE = Math.ceil(Math.sqrt(numCrabs));
        const CELL_SIZE = SPAWN_AREA_SIZE / SPAWN_GRID_SIZE;

        for (let i = 0; i < numCrabs; i++) {
            try {
                const crab = new Crab(this.navigationPlugin, this.landscape);
                
                // Try multiple positions until we find a valid one
                let validPosition = false;
                let attempts = 0;
                let spawnPos;

                while (!validPosition && attempts < 10) {
                    // Calculate base grid position
                    const row = Math.floor(i / SPAWN_GRID_SIZE);
                    const col = i % SPAWN_GRID_SIZE;
                    
                    // Calculate position with random offset within cell
                    const baseX = (col * CELL_SIZE) - (SPAWN_AREA_SIZE / 2) + (CELL_SIZE / 2);
                    const baseZ = (row * CELL_SIZE) - (SPAWN_AREA_SIZE / 2) + (CELL_SIZE / 2);
                    
                    // Add random offset within cell
                    const x = baseX + (Math.random() - 0.5) * (CELL_SIZE * 0.8);
                    const z = baseZ + (Math.random() - 0.5) * (CELL_SIZE * 0.8);
                    
                    // Get height at this position
                    const groundY = this.landscape.getHeightAtPoint(x, z);
                    
                    spawnPos = new BABYLON.Vector3(
                        x,
                        groundY + SimulationConfig.entities.crabs.spawnHeight, // Only add the small spawn height offset
                        z
                    );

                    // Validate position
                    if (this.isValidSpawnPosition(spawnPos)) {
                        validPosition = true;
                    }
                    
                    attempts++;
                }

                if (!validPosition) {
                    console.warn(`Could not find valid spawn position for crab ${i} after ${attempts} attempts`);
                    continue;
                }

                // Initialize crab at valid position
                crab.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
                crab.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);
                crab.velocity = new YUKA.Vector3(0, 0, 0);

                const crabMesh = CrabMeshCreator.createMesh(this.scene);
                crabMesh.position.set(spawnPos.x, spawnPos.y, spawnPos.z);

                crab.setRenderComponent(crabMesh, (entity, renderComponent) => {
                    BABYLON.Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent);
                });

                this.entityManager.add(crab);
                this.crabs.push(crab);

                if (SimulationConfig.debug.logSpawnPositions) {
                    console.log(`Spawned crab at (${spawnPos.x.toFixed(2)}, ${spawnPos.y.toFixed(2)}, ${spawnPos.z.toFixed(2)})`);
                }
            } catch (error) {
                console.error('Error creating crab:', error);
            }
        }
    }
} 