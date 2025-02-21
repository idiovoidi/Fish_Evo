// Crab class extending Yuka's Vehicle
class Crab extends YUKA.Vehicle {
    constructor(navigationPlugin, landscape) {
        super();
        
        // Yuka vehicle properties
        this.maxSpeed = SimulationConfig.entities.crabs.maxSpeed;
        this.maxForce = SimulationConfig.entities.crabs.maxForce;
        this.updateNeighborhood = true;
        this.neighborhoodRadius = SimulationConfig.entities.crabs.neighborhoodRadius;
        
        // Environment references
        this.landscape = landscape;
        this.navigationPlugin = navigationPlugin;
        
        // Movement state
        this.waitTime = 0;
        this.waitDuration = SimulationConfig.entities.crabs.waitDurationRange.min + 
            Math.random() * (SimulationConfig.entities.crabs.waitDurationRange.max - SimulationConfig.entities.crabs.waitDurationRange.min);
        
        // Setup steering behaviors
        this.setupSteeringBehaviors();
    }

    setupSteeringBehaviors() {
        // Wander behavior for natural movement
        const wanderBehavior = new YUKA.WanderBehavior();
        wanderBehavior.weight = 1;
        wanderBehavior.radius = 2;
        wanderBehavior.distance = 4;
        wanderBehavior.jitter = 0.5;
        
        // Separation to avoid other crabs
        const separationBehavior = new YUKA.SeparationBehavior();
        separationBehavior.weight = 2;
        
        // Add behaviors
        this.steering.add(wanderBehavior);
        this.steering.add(separationBehavior);
    }

    update(delta) {
        if (this.waitTime > 0) {
            this.waitTime -= delta;
            if (this.waitTime <= 0) {
                this.steering.clear();
                this.setupSteeringBehaviors();
            }
            return super.update(delta);
        }

        // First do the standard YUKA update to get new x,z position
        super.update(delta);

        // Then adjust height to match terrain
        const groundY = this.landscape.getHeightAtPoint(this.position.x, this.position.z);
        this.position.y = groundY + SimulationConfig.entities.crabs.spawnHeight;

        // Check if we should wait
        const speed = this.velocity.length();
        if (speed < 0.1) {
            this.waitTime = this.waitDuration;
        }

        // Constrain to terrain bounds
        const BOUND_MARGIN = 5;
        const TERRAIN_SIZE = 100;
        const halfSize = TERRAIN_SIZE / 2 - BOUND_MARGIN;

        if (Math.abs(this.position.x) > halfSize || Math.abs(this.position.z) > halfSize) {
            // Create a seek behavior to return to center
            const centerSeek = new YUKA.SeekBehavior(new YUKA.Vector3(0, this.position.y, 0));
            centerSeek.weight = 3;
            this.steering.clear();
            this.steering.add(centerSeek);
            // Re-add standard behaviors with lower weights
            const wander = new YUKA.WanderBehavior();
            wander.weight = 0.5;
            this.steering.add(wander);
        }
    }
}

// Crab mesh creator
class CrabMeshCreator {
    static createMesh(scene) {
        // Create crab body
        const body = BABYLON.MeshBuilder.CreateBox(
            'crabBody',
            { width: 1, height: 0.5, depth: 0.8 },
            scene
        );

        // Create claws
        const clawLeft = BABYLON.MeshBuilder.CreateBox(
            'clawLeft',
            { width: 0.4, height: 0.3, depth: 0.3 },
            scene
        );
        clawLeft.position.set(0.7, 0, 0.3);

        const clawRight = clawLeft.clone('clawRight');
        clawRight.position.x = -0.7;

        // Create legs (simplified)
        const legs = [];
        for (let i = 0; i < 6; i++) {
            const leg = BABYLON.MeshBuilder.CreateCylinder(
                `leg${i}`,
                { diameter: 0.1, height: 0.4 },
                scene
            );
            leg.rotation.z = Math.PI / 2;
            leg.position.y = -0.2;
            leg.position.x = (i < 3 ? 0.4 : -0.4);
            leg.position.z = (i % 3 - 1) * 0.3;
            legs.push(leg);
        }

        // Merge all parts
        const crab = BABYLON.Mesh.MergeMeshes(
            [body, clawLeft, clawRight, ...legs],
            true
        );

        // Create and apply material
        const crabMaterial = new BABYLON.StandardMaterial('crabMaterial', scene);
        crabMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.2);
        crab.material = crabMaterial;

        return crab;
    }
}

// Crab manager class
class CrabManager {
    constructor(scene, navigationPlugin, landscape) {
        this.scene = scene;
        this.navigationPlugin = navigationPlugin;
        this.landscape = landscape;
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();
        this.crabs = [];
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
                        groundY + SimulationConfig.entities.crabs.spawnHeight, // Only add the configured spawn height
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

    isValidSpawnPosition(position) {
        try {
            // Check if position is within bounds
            if (Math.abs(position.x) > 100 || Math.abs(position.z) > 100) {
                return false;
            }

            // Check if position is navigable
            const navPoint = this.navigationPlugin.getClosestPoint(position);
            if (!navPoint) {
                return false;
            }

            // Check distance to other crabs
            const MIN_DISTANCE = 2;
            for (const existingCrab of this.crabs) {
                const distance = BABYLON.Vector3.Distance(
                    position,
                    new BABYLON.Vector3(
                        existingCrab.position.x,
                        existingCrab.position.y,
                        existingCrab.position.z
                    )
                );
                if (distance < MIN_DISTANCE) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.warn('Error checking spawn position validity:', error);
            return false;
        }
    }

    update() {
        const delta = this.time.update().getDelta();
        this.entityManager.update(delta);
    }
} 