// Crab class extending Yuka's Vehicle
class Crab extends YUKA.Vehicle {
    constructor(navigationPlugin, landscape) {
        super();
        this.maxSpeed = SimulationConfig.entities.crabs.maxSpeed;
        this.maxForce = SimulationConfig.entities.crabs.maxForce;
        this.updateNeighborhood = true;
        this.neighborhoodRadius = SimulationConfig.entities.crabs.neighborhoodRadius;
        this.currentPath = null;
        this.pathIndex = 0;
        this.navigationPlugin = navigationPlugin;
        this.landscape = landscape;
        this.waitTime = 0;
        this.waitDuration = SimulationConfig.entities.crabs.waitDurationRange.min + 
            Math.random() * (SimulationConfig.entities.crabs.waitDurationRange.max - SimulationConfig.entities.crabs.waitDurationRange.min);
        
        // Physics properties
        this.velocity = new YUKA.Vector3();
        this.acceleration = new YUKA.Vector3();
        this.gravity = -9.81;
        this.isGrounded = false;
        this.groundCheckDistance = 0.1;
        this.jumpForce = 5;
    }

    update(delta) {
        // Apply physics
        this.applyPhysics(delta);

        if (this.waitTime > 0) {
            this.waitTime -= delta;
            if (this.waitTime <= 0) {
                this.setNewRandomDestination();
            }
            return super.update(delta);
        }

        if (this.currentPath && this.currentPath.length > 0 && this.isGrounded) {
            const target = this.currentPath[this.pathIndex];
            const distance = this.position.distanceTo(target);

            if (distance < 0.5) {
                this.pathIndex++;
                if (this.pathIndex >= this.currentPath.length) {
                    this.waitTime = this.waitDuration;
                    this.steering.clear();
                }
            } else {
                // Update steering to follow current path point
                this.steering.clear();
                const seekBehavior = new YUKA.SeekBehavior(target);
                seekBehavior.weight = 1;
                this.steering.add(seekBehavior);

                // Add obstacle avoidance if needed
                if (this.checkForObstacles()) {
                    const avoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior();
                    avoidanceBehavior.weight = 2;
                    this.steering.add(avoidanceBehavior);
                }
            }
        }

        return super.update(delta);
    }

    applyPhysics(delta) {
        // Apply gravity
        this.acceleration.y += this.gravity * delta;

        // Update velocity
        this.velocity.add(this.acceleration.multiplyScalar(delta));

        // Check ground collision
        const groundY = this.landscape.getHeightAtPoint(this.position.x, this.position.z);
        const heightAboveGround = this.position.y - groundY;

        if (heightAboveGround <= SimulationConfig.entities.crabs.spawnHeight + this.groundCheckDistance) {
            // Ground collision
            this.position.y = groundY + SimulationConfig.entities.crabs.spawnHeight;
            this.velocity.y = 0;
            this.acceleration.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Apply velocity to position
        this.position.add(this.velocity.multiplyScalar(delta));

        // Reset acceleration
        this.acceleration.set(0, 0, 0);
    }

    checkForObstacles() {
        // Implement obstacle detection using raycasts
        const forward = new BABYLON.Vector3(
            Math.sin(this.rotation.y),
            0,
            Math.cos(this.rotation.y)
        );
        
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(this.position.x, this.position.y, this.position.z),
            forward,
            2 // Detection range
        );

        const hit = this.landscape.scene.pickWithRay(ray);
        return hit && hit.hit;
    }

    setNewRandomDestination() {
        if (!this.isGrounded) {
            this.waitTime = 0.5; // Wait until grounded
            return;
        }

        try {
            const destination = this.landscape.getRandomNavigablePosition();
            
            if (!destination) {
                console.warn('Could not find valid destination for crab');
                this.waitTime = 1;
                return;
            }

            const startPos = new BABYLON.Vector3(
                this.position.x,
                this.position.y,
                this.position.z
            );
            
            // Ensure destination is above terrain
            const groundY = this.landscape.getHeightAtPoint(destination.x, destination.z);
            destination.y = groundY + SimulationConfig.entities.crabs.spawnHeight;

            // Compute path using navigation plugin
            const path = this.navigationPlugin.computePath(startPos, destination);
            
            if (path && path.length > 0) {
                // Convert path points to Yuka vectors and ensure they're above terrain
                this.currentPath = path.map(p => {
                    const groundY = this.landscape.getHeightAtPoint(p.x, p.z);
                    return new YUKA.Vector3(
                        p.x,
                        groundY + SimulationConfig.entities.crabs.spawnHeight,
                        p.z
                    );
                });
                this.pathIndex = 0;
                
                // Set seek behavior to first point
                this.steering.clear();
                const seekBehavior = new YUKA.SeekBehavior(this.currentPath[0]);
                seekBehavior.weight = 1;
                this.steering.add(seekBehavior);

                if (SimulationConfig.debug.logSpawnPositions) {
                    console.log(`Crab path set from (${startPos.x.toFixed(2)}, ${startPos.y.toFixed(2)}, ${startPos.z.toFixed(2)}) to (${destination.x.toFixed(2)}, ${destination.y.toFixed(2)}, ${destination.z.toFixed(2)})`);
                }
            } else {
                console.warn('No valid path found for crab');
                this.waitTime = 1;
            }
        } catch (error) {
            console.error('Error setting new destination for crab:', error);
            this.waitTime = 1;
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
                        groundY + SimulationConfig.entities.crabs.spawnHeight + 2, // Start higher for physics
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
                crab.isGrounded = false;

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