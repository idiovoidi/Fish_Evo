// Simple GOAP Action System
class Action {
    constructor(name, preconditions, effects, cost) {
        this.name = name;
        this.preconditions = preconditions;
        this.effects = effects;
        this.cost = cost;
    }

    checkPreconditions(state) {
        return Object.entries(this.preconditions).every(([key, value]) => state[key] === value);
    }
}

// Custom Seek Food Behavior
class SeekFoodBehavior extends YUKA.SteeringBehavior {
    constructor() {
        super();
        this.weight = 3; // Higher priority than schooling
        this.target = null;
    }

    calculate(vehicle, force) {
        if (!this.target) return force;
        
        const direction = new YUKA.Vector3();
        direction.subVectors(this.target.position, vehicle.position);
        
        // If close enough to eat
        if (direction.length() < 1) {
            vehicle.eatFood(this.target);
            this.target = null;
            return force;
        }
        
        direction.normalize();
        direction.multiplyScalar(vehicle.maxSpeed);
        force.add(direction);
        return force;
    }
}

// Fish class extending Yuka's Vehicle
class Fish extends YUKA.Vehicle {
    constructor(scene, id) {
        super();
        this.scene = scene;
        this.id = id;  // Store the unique ID
        this.maxSpeed = 8;
        this.maxForce = 1;
        this.updateNeighborhood = true;
        this.neighborhoodRadius = 5;

        // State properties
        this.state = {
            isHungry: false,
            hasFood: false,
            isSafe: true
        };

        this.energy = 1.0;
        this.lastEnergyUpdate = performance.now();
        
        // Available actions
        this.actions = [
            new Action(
                'FindFood',
                { isHungry: true, hasFood: false },
                { hasFood: true },
                1
            ),
            new Action(
                'EatFood',
                { hasFood: true },
                { isHungry: false, hasFood: false },
                1
            )
        ];

        // Steering behaviors
        this.seekFoodBehavior = new SeekFoodBehavior();
        this.seekFoodBehavior.active = false;
    }

    update(delta) {
        // Update energy and hunger
        this.updateEnergy();
        
        // Update GOAP state
        this.updateState();
        
        // Execute current action if possible
        this.executeActions();

        // Add slight vertical oscillation for more natural fish movement
        this.position.y += Math.sin(performance.now() * 0.002) * 0.01;

        // Apply boundary constraints
        this.applyBoundaryConstraints();
        
        super.update(delta);
    }

    updateEnergy() {
        const now = performance.now();
        const dt = now - this.lastEnergyUpdate;
        
        if (dt > 1000) { // Update every second
            this.energy = Math.max(0, this.energy - 0.05);
            this.lastEnergyUpdate = now;
        }
    }

    updateState() {
        this.state.isHungry = this.energy < 0.5;
    }

    executeActions() {
        // Find valid actions based on current state
        const validActions = this.actions.filter(action => 
            action.checkPreconditions(this.state)
        ).sort((a, b) => a.cost - b.cost);

        if (validActions.length > 0) {
            const action = validActions[0];
            
            switch (action.name) {
                case 'FindFood':
                    this.findFood();
                    break;
                case 'EatFood':
                    // Handled by SeekFoodBehavior
                    break;
            }
        }
    }

    findFood() {
        if (this.seekFoodBehavior.target) return; // Already seeking food
        
        const foodParticles = this.scene.foodSpawner?.foodParticles || [];
        if (foodParticles.length === 0) return;

        // Find nearest food
        let nearestFood = null;
        let nearestDistance = Infinity;

        for (const food of foodParticles) {
            const distance = BABYLON.Vector3.Distance(
                this.position.toArray(),
                food.position
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFood = food;
            }
        }

        if (nearestFood) {
            this.seekFoodBehavior.target = nearestFood;
            this.seekFoodBehavior.active = true;
            this.state.hasFood = true;
            
            // Temporarily reduce other behavior weights
            this.steering.behaviors.forEach(behavior => {
                if (!(behavior instanceof SeekFoodBehavior)) {
                    behavior.weight *= 0.5;
                }
            });
        }
    }

    eatFood(food) {
        if (!food || !this.scene.foodSpawner) return;
        
        const index = this.scene.foodSpawner.foodParticles.indexOf(food);
        if (index === -1) return;

        // Remove food from scene
        this.scene.foodSpawner.foodParticles.splice(index, 1);
        food.dispose();

        // Reset food seeking
        this.seekFoodBehavior.active = false;
        this.state.hasFood = false;
        
        // Restore energy
        this.energy = Math.min(1.0, this.energy + 0.3);
        
        // Restore original behavior weights
        this.steering.behaviors.forEach(behavior => {
            if (!(behavior instanceof SeekFoodBehavior)) {
                behavior.weight *= 2;
            }
        });
    }

    applyBoundaryConstraints() {
        const bounds = {
            minX: -30, maxX: 30,
            minY: 1, maxY: 15,
            minZ: -30, maxZ: 30
        };

        const turnFactor = 0.2;

        // X boundaries
        if (this.position.x < bounds.minX) {
            this.velocity.x += turnFactor;
        } else if (this.position.x > bounds.maxX) {
            this.velocity.x -= turnFactor;
        }

        // Y boundaries
        if (this.position.y < bounds.minY) {
            this.velocity.y += turnFactor;
        } else if (this.position.y > bounds.maxY) {
            this.velocity.y -= turnFactor;
        }

        // Z boundaries
        if (this.position.z < bounds.minZ) {
            this.velocity.z += turnFactor;
        } else if (this.position.z > bounds.maxZ) {
            this.velocity.z -= turnFactor;
        }
    }
}

// Fish manager class
class FishManager {
    constructor(scene) {
        this.scene = scene;
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();
        this.fishes = [];
        this._nextFishId = 0;  // Counter for generating unique IDs
    }

    createFishSchool(numFish = 30) {
        const SPAWN_RANGE = 15;

        for (let i = 0; i < numFish; i++) {
            // Create fish entity with unique ID
            const fishId = `fish_${this._nextFishId++}`;
            const fish = new Fish(this.scene, fishId);
            
            // Set position and rotation
            fish.position.set(
                (Math.random() - 0.5) * SPAWN_RANGE,
                5 + (Math.random() - 0.5) * SPAWN_RANGE / 2,
                (Math.random() - 0.5) * SPAWN_RANGE
            );
            fish.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);

            // Create fish mesh and set its name to include the ID
            const fishMesh = this.createFishMesh(fishId);
            fishMesh.bakeCurrentTransformIntoVertices();
            fishMesh.freezeWorldMatrix();

            // Setup proper sync between Yuka entity and Babylon mesh
            fish.setRenderComponent(fishMesh, (entity, renderComponent) => {
                BABYLON.Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent);
            });

            // Add behaviors
            const alignmentBehavior = new YUKA.AlignmentBehavior();
            const cohesionBehavior = new YUKA.CohesionBehavior();
            const separationBehavior = new YUKA.SeparationBehavior();
            const wanderBehavior = new YUKA.WanderBehavior();

            // Set behavior weights
            alignmentBehavior.weight = 1;
            cohesionBehavior.weight = 1;
            separationBehavior.weight = 2;
            wanderBehavior.weight = 0.5;

            fish.steering.add(alignmentBehavior);
            fish.steering.add(cohesionBehavior);
            fish.steering.add(separationBehavior);
            fish.steering.add(wanderBehavior);
            fish.steering.add(fish.seekFoodBehavior);

            // Add to manager and array
            this.entityManager.add(fish);
            this.fishes.push(fish);
        }
    }

    createFishMesh(fishId) {
        // Create fish body with unique name
        const body = BABYLON.MeshBuilder.CreateCapsule(
            `${fishId}_body`,
            { radius: 0.2, height: 1 },
            this.scene
        );
        
        // Create tail with unique name
        const tail = BABYLON.MeshBuilder.CreateCylinder(
            `${fishId}_tail`,
            { diameterTop: 0.4, diameterBottom: 0, height: 0.5 },
            this.scene
        );
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -0.6;

        // Create fins with unique names
        const finLeft = BABYLON.MeshBuilder.CreateCylinder(
            `${fishId}_finLeft`,
            { diameterTop: 0.2, diameterBottom: 0, height: 0.3 },
            this.scene
        );
        finLeft.rotation.z = -Math.PI / 4;
        finLeft.position.set(0.3, 0, 0);

        const finRight = finLeft.clone(`${fishId}_finRight`);
        finRight.rotation.z = Math.PI / 4;
        finRight.position.x = -0.3;

        // Merge all parts with unique name
        const fish = BABYLON.Mesh.MergeMeshes(
            [body, tail, finLeft, finRight],
            true,
            undefined,
            undefined,
            undefined,
            true
        );
        fish.name = fishId;  // Set the merged mesh name
        
        // Create and apply material with unique name
        const fishMaterial = new BABYLON.StandardMaterial(`${fishId}_material`, this.scene);
        fishMaterial.diffuseColor = new BABYLON.Color3(
            0.4 + Math.random() * 0.3,
            0.7 + Math.random() * 0.3,
            0.9
        );
        fish.material = fishMaterial;

        return fish;
    }

    // Add method to get fish by ID
    getFishById(id) {
        return this.fishes.find(fish => fish.id === id);
    }

    update() {
        const delta = this.time.update().getDelta();
        this.entityManager.update(delta);
    }

    getFish() {
        return this.fishes;
    }
} 