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
        this.weight = 5; // Increased from 3 to 5 to make food seeking higher priority
        this.target = null;
        this._lastSearchTime = 0;
        this._searchInterval = 500; // Search for food every 500ms
    }

    calculate(vehicle, force) {
        try {
            // Periodically search for food if we don't have a target
            const now = performance.now();
            if (!this.target && now - this._lastSearchTime > this._searchInterval) {
                this._lastSearchTime = now;
                vehicle.findFood();
            }
            
            if (!this.target) return force;
            
            // Check if target still exists or is disposed
            if ((typeof this.target.isDisposed === 'function' && this.target.isDisposed()) || 
                !vehicle.scene.foodSpawner?.foodParticles.includes(this.target)) {
                this.target = null;
                vehicle.state.hasFood = false;
                return force;
            }
            
            // Make sure target has a valid position
            if (!this.target.position || 
                typeof this.target.position.x !== 'number' || 
                typeof this.target.position.y !== 'number' || 
                typeof this.target.position.z !== 'number') {
                console.warn('Food target has invalid position');
                this.target = null;
                vehicle.state.hasFood = false;
                return force;
            }
            
            const direction = new YUKA.Vector3();
            const targetPosition = new YUKA.Vector3(
                this.target.position.x,
                this.target.position.y,
                this.target.position.z
            );
            direction.subVectors(targetPosition, vehicle.position);
            
            // If close enough to eat
            if (direction.length() < 1.5) { // Increased from 1 to 1.5 for easier eating
                vehicle.eatFood(this.target);
                this.target = null;
                return force;
            }
            
            direction.normalize();
            direction.multiplyScalar(vehicle.maxSpeed * 1.2); // Boost speed when seeking food
            force.add(direction);
            return force;
        } catch (e) {
            // If there's any error, reset the target and log the error
            console.warn(`Error in SeekFoodBehavior: ${e.message}`);
            this.target = null;
            vehicle.state.hasFood = false;
            return force;
        }
    }
}

// Component Classes
class HealthComponent {
    constructor() {
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.regenRate = 0.1; // Health regeneration per second
    }
}

class AgeComponent {
    constructor() {
        this.age = 0;
        this.maxAge = 300; // 5 minutes in seconds
        this.maturityAge = 60; // 1 minute to reach maturity
        this.isAdult = false;
    }
}

class SocialComponent {
    constructor() {
        this.schoolingPreference = 0.8 + Math.random() * 0.4; // How much this fish prefers to school (0.8-1.2)
        this.personalSpace = 1 + Math.random() * 0.5; // Minimum distance from other fish
        this.friendliness = Math.random(); // Affects interaction with other fish
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

        // Add new components
        this.health = new HealthComponent();
        this.age = new AgeComponent();
        this.social = new SocialComponent();

        // State properties
        this.state = {
            isHungry: false,
            hasFood: false,
            isSafe: true,
            isResting: false,
            isFleeing: false,
            isSchooling: true,
            isMating: false,
            isDead: false
        };

        this.energy = 1.0;
        this.lastEnergyUpdate = performance.now();
        this.lastStateUpdate = performance.now();
        this.stateUpdateInterval = 1000; // Update state every second
        
        // Available actions with costs and conditions
        this.actions = [
            new Action(
                'FindFood',
                { isHungry: true, hasFood: false, isFleeing: false },
                { hasFood: true },
                (fish) => this.energy < 0.5 ? 1 : 2 // Lower cost when very hungry
            ),
            new Action(
                'EatFood',
                { hasFood: true, isFleeing: false },
                { isHungry: false, hasFood: false },
                1
            ),
            new Action(
                'Rest',
                { isHungry: false, isFleeing: false, energy: (fish) => fish.energy < 0.3 },
                { isResting: true },
                1
            ),
            new Action(
                'School',
                { isFleeing: false, isResting: false },
                { isSchooling: true },
                (fish) => 2 - fish.social.schoolingPreference // Lower cost for social fish
            ),
            new Action(
                'Flee',
                { isSafe: false },
                { isFleeing: true, isSchooling: false, isResting: false },
                0 // Zero cost - highest priority
            )
        ];

        // Enhanced steering behaviors
        this.setupSteeringBehaviors();
    }

    setupSteeringBehaviors() {
        // Existing behaviors
        this.seekFoodBehavior = new SeekFoodBehavior();
        this.seekFoodBehavior.active = false;

        // New avoidance behavior
        this.obstacleBehavior = new YUKA.ObstacleAvoidanceBehavior([]);
        this.obstacleBehavior.weight = 5;
        this.obstacleBehavior.active = true;

        // Enhanced schooling behaviors with social preferences
        const alignmentBehavior = new YUKA.AlignmentBehavior();
        alignmentBehavior.weight = 1 * this.social.schoolingPreference;

        const cohesionBehavior = new YUKA.CohesionBehavior();
        cohesionBehavior.weight = 1 * this.social.schoolingPreference;

        const separationBehavior = new YUKA.SeparationBehavior();
        separationBehavior.weight = 2 * (2 - this.social.schoolingPreference);
        separationBehavior.distance = this.social.personalSpace;

        const wanderBehavior = new YUKA.WanderBehavior();
        wanderBehavior.weight = 0.5;

        // Add all behaviors
        this.steering.add(alignmentBehavior);
        this.steering.add(cohesionBehavior);
        this.steering.add(separationBehavior);
        this.steering.add(wanderBehavior);
        this.steering.add(this.seekFoodBehavior);
        this.steering.add(this.obstacleBehavior);
    }

    update(delta) {
        // If fish is dead, handle floating behavior
        if (this.state.isDead) {
            this.handleDeadBehavior(delta);
            super.update(delta);
            return;
        }

        // Update age
        this.age.age += delta;
        if (this.age.age >= this.age.maturityAge && !this.age.isAdult) {
            this.age.isAdult = true;
            this.scale = 1; // Grow to full size
        }

        // Update energy and state
        this.updateEnergy();
        this.updateState();
        
        // Execute current action if possible
        this.executeActions();

        // Natural health regeneration when not hungry
        if (!this.state.isHungry && this.health.currentHealth < this.health.maxHealth) {
            this.health.currentHealth = Math.min(
                this.health.maxHealth,
                this.health.currentHealth + this.health.regenRate * delta
            );
        }

        // Add slight vertical oscillation for more natural fish movement
        this.position.y += Math.sin(performance.now() * 0.002) * 0.01;

        // Apply boundary constraints
        this.applyBoundaryConstraints();
        
        // Update steering behaviors based on state
        this.updateBehaviors();

        super.update(delta);
    }

    updateEnergy() {
        const now = performance.now();
        const dt = now - this.lastEnergyUpdate;
        
        if (dt > 1000) { // Update every second
            // Reduced energy consumption rate from 0.05 to 0.02
            this.energy = Math.max(0, this.energy - 0.02);
            this.lastEnergyUpdate = now;
            
            // Check for death by starvation
            if (this.energy <= 0 && !this.state.isDead) {
                this.die();
            }
        }
    }

    updateState() {
        const now = performance.now();
        if (now - this.lastStateUpdate < this.stateUpdateInterval) return;

        // Changed hunger threshold from 0.5 to 0.7 to make fish look for food sooner
        this.state.isHungry = this.energy < 0.7;
        // Changed resting threshold from 0.2 to 0.3
        this.state.isResting = this.energy < 0.3;
        
        // Check for nearby threats (can be expanded)
        this.state.isSafe = true; // Implement threat detection logic
        
        // Update schooling state based on social preference and conditions
        this.state.isSchooling = !this.state.isFleeing && 
                                !this.state.isResting && 
                                Math.random() < this.social.schoolingPreference;

        this.lastStateUpdate = now;
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
                case 'Rest':
                    this.rest();
                    break;
                case 'School':
                    this.school();
                    break;
                case 'Flee':
                    this.flee();
                    break;
            }
        }
    }

    findFood() {
        // If already seeking food or not hungry, don't look for more food
        if (this.seekFoodBehavior.target || !this.state.isHungry) return;
        
        const foodParticles = this.scene.foodSpawner?.foodParticles || [];
        if (foodParticles.length === 0) {
            console.log(`Fish ${this.id} couldn't find any food (no food available)`);
            return;
        }

        // Find nearest food
        let nearestFood = null;
        let nearestDistance = Infinity;
        
        // Increased search radius from infinity to 30 units
        const MAX_SEARCH_DISTANCE = 30;
        
        // Get fish position as array for distance calculation
        const fishPosition = [this.position.x, this.position.y, this.position.z];

        for (const food of foodParticles) {
            // Skip disposed food
            if (food.isDisposed()) continue;
            
            try {
                const distance = BABYLON.Vector3.Distance(
                    fishPosition,
                    food.position
                );
                
                // Only consider food within reasonable distance
                if (distance < nearestDistance && distance < MAX_SEARCH_DISTANCE) {
                    nearestDistance = distance;
                    nearestFood = food;
                }
            } catch (e) {
                console.warn(`Error calculating distance to food: ${e.message}`);
                continue;
            }
        }

        if (nearestFood) {
            console.log(`Fish ${this.id} found food at distance ${nearestDistance.toFixed(2)}`);
            this.seekFoodBehavior.target = nearestFood;
            this.seekFoodBehavior.active = true;
            this.state.hasFood = true;
            
            // Temporarily reduce other behavior weights more significantly
            this.steering.behaviors.forEach(behavior => {
                if (!(behavior instanceof SeekFoodBehavior)) {
                    behavior.weight *= 0.3; // Reduced from 0.5 to 0.3
                }
            });
        } else if (this.energy < 0.4) {
            // If very hungry and no food found, increase wander behavior to look harder
            console.log(`Fish ${this.id} is very hungry (${(this.energy * 100).toFixed(0)}%) but couldn't find food`);
            this.steering.behaviors.forEach(behavior => {
                if (behavior instanceof YUKA.WanderBehavior) {
                    behavior.weight *= 2;
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
        if (!food.isDisposed()) {
            food.dispose();
        }

        // Reset food seeking
        this.seekFoodBehavior.active = false;
        this.state.hasFood = false;
        
        // Calculate energy restoration based on fish ID
        const previousEnergy = this.energy;
        const idNumber = parseInt(this.id.split('_')[1]); // Extract number from "fish_X"
        
        // Create unique energy restoration value between 0.4 and 0.7
        // Using a seeded random based on fish ID for consistency
        const baseEnergy = 0.4;
        const energyVariation = 0.3;
        const uniqueEnergyMultiplier = (Math.sin(idNumber * 12345) + 1) / 2; // Creates value between 0 and 1
        const energyRestoration = baseEnergy + (uniqueEnergyMultiplier * energyVariation);
        
        // Apply energy restoration with unique value
        this.energy = Math.min(1.0, this.energy + energyRestoration);
        
        // Visual feedback color based on energy restoration amount
        const renderComponent = this.renderComponent;
        if (renderComponent && renderComponent.material) {
            // Store original color
            const originalColor = renderComponent.material.diffuseColor.clone();
            
            // Color intensity based on energy restoration (more green for higher restoration)
            const greenIntensity = 0.3 + (energyRestoration - baseEnergy) / energyVariation;
            renderComponent.material.diffuseColor = new BABYLON.Color3(0.2, greenIntensity, 0.2);
            renderComponent.material.emissiveColor = new BABYLON.Color3(0, greenIntensity * 0.5, 0);
            
            // Show energy gain value as text
            if (this.scene) {
                try {
                    const gainText = new BABYLON.GUI.TextBlock();
                    gainText.text = `+${Math.round(energyRestoration * 100)}%`;
                    gainText.color = "white";
                    gainText.fontSize = 14;
                    gainText.alpha = 1;
                    
                    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    advancedTexture.addControl(gainText);
                    
                    // Position text above fish
                    const screenPos = BABYLON.Vector3.Project(
                        this.position.toArray(),
                        BABYLON.Matrix.Identity(),
                        this.scene.getTransformMatrix(),
                        this.scene.activeCamera.viewport.toGlobal(
                            this.scene.getEngine().getRenderWidth(),
                            this.scene.getEngine().getRenderHeight()
                        )
                    );
                    
                    gainText.left = screenPos.x - 20;
                    gainText.top = screenPos.y - 40;
                    
                    // Animate and remove text
                    let alpha = 1;
                    const fadeInterval = setInterval(() => {
                        alpha -= 0.05;
                        gainText.alpha = alpha;
                        gainText.top -= 1; // Float upward
                        
                        if (alpha <= 0) {
                            clearInterval(fadeInterval);
                            advancedTexture.removeControl(gainText);
                            advancedTexture.dispose();
                        }
                    }, 50);
                } catch (e) {
                    console.log("Error showing energy gain text:", e);
                }
            }
            
            // Restore original color after 300ms
            setTimeout(() => {
                renderComponent.material.diffuseColor = originalColor;
                renderComponent.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }, 300);
        }
        
        // Speed boost based on energy gain
        if (previousEnergy < 0.2 && this.energy > 0.5) {
            const originalSpeed = this.maxSpeed;
            const speedBoost = 1.3 + (uniqueEnergyMultiplier * 0.4); // Speed boost varies between 1.3x and 1.7x
            this.maxSpeed *= speedBoost;
            
            setTimeout(() => {
                this.maxSpeed = originalSpeed;
            }, 1000);
        }
        
        // Restore behavior weights with unique transition
        const transitionTime = 800 + (uniqueEnergyMultiplier * 400); // Between 800ms and 1200ms
        this.steering.behaviors.forEach(behavior => {
            if (!(behavior instanceof SeekFoodBehavior)) {
                behavior.weight *= 1.5;
                setTimeout(() => {
                    behavior.weight = behavior.weight / 1.5;
                }, transitionTime);
            }
        });
        
        // Log energy gain for debugging
        console.log(`Fish ${this.id} restored ${Math.round(energyRestoration * 100)}% energy`);
    }

    rest() {
        // Implement rest behavior
        console.log(`Fish ${this.id} is resting`);
    }

    school() {
        // Implement school behavior
        console.log(`Fish ${this.id} is schooling`);
    }

    flee() {
        // Implement flee behavior
        console.log(`Fish ${this.id} is fleeing`);
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

    updateBehaviors() {
        // Adjust behavior weights based on state
        if (this.state.isFleeing) {
            this.maxSpeed = 12; // Faster when fleeing
            this.steering.behaviors.forEach(behavior => {
                if (behavior instanceof SeekFoodBehavior) {
                    behavior.active = false;
                }
            });
        } else {
            this.maxSpeed = 8;
        }

        if (this.state.isResting) {
            this.maxSpeed = 2; // Slower when resting
            this.steering.behaviors.forEach(behavior => {
                behavior.weight *= 0.5; // Reduce all behavior weights
            });
        }

        // Adjust schooling behavior based on social preferences and state
        if (this.state.isSchooling && !this.state.isFleeing) {
            this.steering.behaviors.forEach(behavior => {
                if (behavior instanceof YUKA.AlignmentBehavior ||
                    behavior instanceof YUKA.CohesionBehavior) {
                    behavior.weight = this.social.schoolingPreference;
                }
            });
        }
    }

    takeDamage(amount) {
        this.health.currentHealth = Math.max(0, this.health.currentHealth - amount);
        if (this.health.currentHealth === 0) {
            // Handle death
            this.die();
        }
    }

    die() {
        // Set dead state
        this.state.isDead = true;
        
        // Disable all behaviors
        this.steering.behaviors.forEach(behavior => {
            behavior.active = false;
        });
        
        // Add slight random rotation for more natural look
        this.rotation.x = (Math.random() - 0.5) * Math.PI * 0.5; // Random tilt
        this.rotation.z = (Math.random() - 0.5) * Math.PI * 0.3; // Random roll
        
        // Change material to indicate death
        const renderComponent = this.renderComponent;
        if (renderComponent && renderComponent.material) {
            renderComponent.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Greyish color
            renderComponent.material.alpha = 0.8; // Slightly transparent
        }
        
        // Fish will naturally float up due to handleDeadBehavior
        console.log(`Fish ${this.id} has died and is floating`);
        
        // After 30 seconds, remove the fish
        setTimeout(() => {
            if (this.scene.entityHandler?.fishManager) {
                this.scene.entityHandler.fishManager.removeFish(this);
            }
        }, 30000);
    }

    handleDeadBehavior(delta) {
        // Slowly float upward
        this.velocity.y = 0.5;
        
        // Add slight random movement for more realistic floating
        this.velocity.x += (Math.random() - 0.5) * 0.1;
        this.velocity.z += (Math.random() - 0.5) * 0.1;
        
        // Slow down horizontal movement
        this.velocity.x *= 0.98;
        this.velocity.z *= 0.98;
        
        // Add slight wobble
        this.rotation.x += Math.sin(performance.now() * 0.001) * 0.01;
        this.rotation.z += Math.cos(performance.now() * 0.001) * 0.01;
        
        // Modified boundary constraints for dead fish
        const bounds = {
            minX: -40, maxX: 40,
            minY: 1, maxY: 20,  // Allow floating higher
            minZ: -40, maxZ: 40
        };
        
        // Bounce off boundaries very slowly
        if (this.position.x < bounds.minX || this.position.x > bounds.maxX) {
            this.velocity.x *= -0.5;
        }
        if (this.position.y < bounds.minY || this.position.y > bounds.maxY) {
            this.velocity.y *= -0.5;
        }
        if (this.position.z < bounds.minZ || this.position.z > bounds.maxZ) {
            this.velocity.z *= -0.5;
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

    removeFish(fish) {
        // Implement removal logic
        console.log(`Fish ${fish.id} is being removed from the manager`);
        // Remove from entity manager
        this.entityManager.remove(fish);
        // Remove from local array
        this.fishes = this.fishes.filter(f => f.id !== fish.id);
    }
} 