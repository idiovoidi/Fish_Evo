class Shark extends YUKA.Vehicle {
    constructor(scene) {
        console.log("Shark: Creating new shark instance...");
        super();
        if (!scene) {
            console.error("Shark: Scene is required but was not provided!");
            return;
        }
        this.scene = scene;
        this.mesh = null;
        this.skeleton = null;
        this.animations = {};
        
        // Swimming parameters
        this.maxSpeed = 12;
        this.maxForce = 2;
        this.swimSpeed = 1;
        this.turnSpeed = 0.05;
        
        // Behavior state
        this.currentBehavior = 'patrol';
        this.patrolTimer = 0;
        this.patrolDuration = 10 + Math.random() * 10;
        
        // Create shark mesh and animations
        console.log("Shark: Setting up mesh and animations...");
        try {
            this.createShark();
            this.setupBehaviors();
            console.log("Shark: Initialization complete");
        } catch (error) {
            console.error("Shark: Error during initialization:", error);
        }
    }

    createShark() {
        try {
            console.log("Shark: Starting mesh creation process");
            
            // Create main body
            const body = BABYLON.MeshBuilder.CreateCapsule("sharkBody", {
                radius: 1,
                height: 8,
                tessellation: 24,
                capSubdivisions: 12
            }, this.scene);
            console.log("Shark: Created body mesh");

            // Create head
            const head = BABYLON.MeshBuilder.CreateCapsule("sharkHead", {
                radius: 1.2,
                height: 3,
                tessellation: 24,
                capSubdivisions: 12
            }, this.scene);
            head.position.z = 4;
            head.rotation.x = Math.PI / 2;
            console.log("Shark: Created head mesh");

            // Create tail
            const tailBase = BABYLON.MeshBuilder.CreateCapsule("sharkTailBase", {
                radius: 0.8,
                height: 3,
                tessellation: 16,
                capSubdivisions: 8
            }, this.scene);
            tailBase.position.z = -4;
            console.log("Shark: Created tail base mesh");

            const tailFin = this.createFin(2.5, 1.5, "tailFin");
            tailFin.position.z = -5.5;
            tailFin.rotation.x = Math.PI / 2;
            console.log("Shark: Created tail fin mesh");

            // Create dorsal fin
            const dorsalFin = this.createFin(2, 1.2, "dorsalFin");
            dorsalFin.position.y = 1.5;
            dorsalFin.rotation.x = Math.PI;
            console.log("Shark: Created dorsal fin mesh");

            // Create pectoral fins
            const leftPectoral = this.createFin(1.5, 0.8, "leftPectoral");
            leftPectoral.position.set(1.5, -0.2, 0);
            leftPectoral.rotation.set(0, 0, -Math.PI / 4);
            console.log("Shark: Created left pectoral fin mesh");

            const rightPectoral = this.createFin(1.5, 0.8, "rightPectoral");
            rightPectoral.position.set(-1.5, -0.2, 0);
            rightPectoral.rotation.set(0, 0, Math.PI / 4);
            console.log("Shark: Created right pectoral fin mesh");

            // Create eyes
            const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", {
                diameter: 0.3,
                segments: 16
            }, this.scene);
            leftEye.position.set(0.8, 0.5, 4.5);
            console.log("Shark: Created left eye mesh");

            const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", {
                diameter: 0.3,
                segments: 16
            }, this.scene);
            rightEye.position.set(-0.8, 0.5, 4.5);
            console.log("Shark: Created right eye mesh");

            // Create gills (simple lines)
            const gillMaterial = new BABYLON.StandardMaterial("gillMaterial", this.scene);
            gillMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

            const gills = [];
            for (let i = 0; i < 3; i++) {
                for (let side of [-1, 1]) {
                    const gill = BABYLON.MeshBuilder.CreateBox("gill", {
                        height: 0.8,
                        width: 0.05,
                        depth: 0.1
                    }, this.scene);
                    gill.position.set(side * 1, 0, 3 - i * 0.4);
                    gill.rotation.z = side * Math.PI / 6;
                    gill.material = gillMaterial;
                    gills.push(gill);
                }
            }
            console.log("Shark: Created gill meshes");

            // Check if all parts are valid before merging
            const parts = [body, head, tailBase, tailFin, dorsalFin, leftPectoral, rightPectoral, leftEye, rightEye, ...gills];
            const validParts = parts.filter(part => part && !part.isDisposed());
            
            if (validParts.length !== parts.length) {
                console.error(`Shark: Some parts are invalid! Expected ${parts.length} but got ${validParts.length} valid parts`);
            }
            
            console.log("Shark: Attempting to merge meshes");
            
            // Try alternative mesh creation if MergeMeshes fails
            try {
                this.mesh = BABYLON.Mesh.MergeMeshes(validParts, true, true, undefined, false, true);
                
                if (!this.mesh) {
                    throw new Error("MergeMeshes returned null");
                }
            } catch (mergeError) {
                console.error("Shark: Error merging meshes:", mergeError);
                console.log("Shark: Trying alternative approach - creating parent mesh");
                
                // Create a parent mesh and parent all parts to it
                this.mesh = new BABYLON.Mesh("shark_parent", this.scene);
                validParts.forEach(part => {
                    part.parent = this.mesh;
                });
            }
            
            this.mesh.name = "shark_" + Math.floor(Math.random() * 1000);
            console.log("Shark: Created mesh with name:", this.mesh.name);
            
            // Ensure mesh is visible
            this.mesh.isVisible = true;
            this.mesh.visibility = 1.0;
            
            // Create skeleton and attach to mesh
            this.createSkeleton();
            this.mesh.skeleton = this.skeleton;
            
            // Apply materials
            this.applySharkMaterials();
            
            console.log("Shark: Mesh created successfully:", this.mesh.name);
            return this.mesh;
        } catch (error) {
            console.error("Shark: Error creating shark mesh:", error);
            throw error;
        }
    }

    createFin(height, width, name) {
        const points = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(width/2, height/3, 0),
            new BABYLON.Vector3(width/4, height*2/3, 0),
            new BABYLON.Vector3(0, height, 0),
            new BABYLON.Vector3(-width/4, height*2/3, 0),
            new BABYLON.Vector3(-width/2, height/3, 0),
            new BABYLON.Vector3(0, 0, 0)
        ];

        return BABYLON.MeshBuilder.CreateRibbon(name, {
            pathArray: [points],
            closePath: true,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);
    }

    createSkeleton() {
        // Create skeleton first
        this.skeleton = new BABYLON.Skeleton("sharkSkeleton", "sharkSkeleton", this.scene);
        
        // Create bones array
        const bones = [];
        
        // Root bone at center of body
        const rootBone = new BABYLON.Bone("root", this.skeleton, null, BABYLON.Matrix.Identity());
        bones.push(rootBone);

        // Spine bones for body undulation
        let parentBone = rootBone;
        const numSpineSegments = 8;
        for (let i = 0; i < numSpineSegments; i++) {
            const bone = new BABYLON.Bone(`spine${i}`, this.skeleton, parentBone, 
                BABYLON.Matrix.Translation(0, 0, -i * (8/numSpineSegments)));
            bones.push(bone);
            parentBone = bone;
        }

        // Fin bones
        const dorsalBone = new BABYLON.Bone("dorsal", this.skeleton, rootBone,
            BABYLON.Matrix.Translation(0, 1.5, 0));
        bones.push(dorsalBone);

        const leftPectoralBone = new BABYLON.Bone("leftPectoral", this.skeleton, rootBone,
            BABYLON.Matrix.Translation(1.5, -0.2, 0));
        bones.push(leftPectoralBone);

        const rightPectoralBone = new BABYLON.Bone("rightPectoral", this.skeleton, rootBone,
            BABYLON.Matrix.Translation(-1.5, -0.2, 0));
        bones.push(rightPectoralBone);

        // Assign bones to skeleton
        this.skeleton.bones = bones;

        // Create swimming animation
        this.createSwimmingAnimation();
    }

    createSwimmingAnimation() {
        // Create animation for body undulation
        const swimAnim = new BABYLON.Animation(
            "swimAnim",
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const swimKeys = [];
        for (let i = 0; i < this.skeleton.bones.length; i++) {
            if (i > 0) { // Skip root bone
                const bone = this.skeleton.bones[i];
                const anim = swimAnim.clone();
                anim.name = `swim_${bone.name}`;

                // Create undulating motion with phase offset based on bone position
                const phaseOffset = i * Math.PI / 8;
                const keys = [];
                for (let frame = 0; frame <= 30; frame++) {
                    const amplitude = 0.15 * (i / this.skeleton.bones.length); // Increasing amplitude towards tail
                    keys.push({
                        frame: frame,
                        value: Math.sin(frame * Math.PI / 15 + phaseOffset) * amplitude
                    });
                }
                anim.setKeys(keys);
                bone.animations.push(anim);
            }
        }

        // Create fin animations
        this.createFinAnimation("dorsal", 0.1);
        this.createFinAnimation("leftPectoral", 0.2);
        this.createFinAnimation("rightPectoral", 0.2);

        // Start animations
        this.scene.beginAnimation(this.skeleton, 0, 30, true, 1.0);
    }

    createFinAnimation(boneName, amplitude) {
        const bone = this.skeleton.bones.find(b => b.name === boneName);
        if (bone) {
            const anim = new BABYLON.Animation(
                `${boneName}Anim`,
                "rotation.x",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            const keys = [];
            for (let frame = 0; frame <= 30; frame++) {
                keys.push({
                    frame: frame,
                    value: Math.sin(frame * Math.PI / 15) * amplitude
                });
            }
            anim.setKeys(keys);
            bone.animations.push(anim);
        }
    }

    applySharkMaterials() {
        const sharkMaterial = new BABYLON.StandardMaterial("sharkMaterial", this.scene);
        
        // Create gradient texture for shark body
        const texture = new BABYLON.DynamicTexture("sharkTexture", {
            width: 512,
            height: 512
        }, this.scene);
        
        const ctx = texture.getContext();
        const grd = ctx.createLinearGradient(0, 0, 0, 512);
        
        // Dark grey on top transitioning to light grey on bottom
        grd.addColorStop(0, "#2C3539");  // Dark grey
        grd.addColorStop(0.5, "#46586A"); // Medium grey
        grd.addColorStop(1, "#7C8B96");   // Light grey
        
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 512, 512);
        texture.update();
        
        // Apply material properties
        sharkMaterial.diffuseTexture = texture;
        sharkMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        sharkMaterial.specularPower = 32;
        sharkMaterial.bumpTexture = texture;
        sharkMaterial.useSpecularOverAlpha = true;
        
        this.mesh.material = sharkMaterial;

        // Apply eye material
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        eyeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        eyeMaterial.specularPower = 128;

        // Find and apply eye material to eye meshes
        this.mesh.getChildMeshes().forEach(mesh => {
            if (mesh.name.includes("Eye")) {
                mesh.material = eyeMaterial;
            }
        });
    }

    setupBehaviors() {
        // Add steering behaviors
        const wanderBehavior = new YUKA.WanderBehavior();
        wanderBehavior.weight = 1;
        wanderBehavior.radius = 10;
        wanderBehavior.distance = 20;
        wanderBehavior.jitter = 0.5;
        this.steering.add(wanderBehavior);

        // Add seek behavior (will be enabled/disabled as needed)
        this.seekBehavior = new YUKA.SeekBehavior();
        this.seekBehavior.weight = 2;
        this.seekBehavior.active = false;  // Start with seek disabled
        this.steering.add(this.seekBehavior);

        // Add obstacle avoidance
        const obstacleAvoidance = new YUKA.ObstacleAvoidanceBehavior();
        obstacleAvoidance.weight = 2;
        this.steering.add(obstacleAvoidance);

        // Add custom containment behavior
        const containmentBehavior = new YUKA.SteeringBehavior();
        containmentBehavior.weight = 3;
        containmentBehavior.calculate = (vehicle, force) => {
            const center = new YUKA.Vector3(0, 0, 0);
            const radius = 40;
            const distance = vehicle.position.distanceTo(center);
            
            if (distance > radius * 0.8) {  // Start turning back at 80% of radius
                const direction = center.clone().sub(vehicle.position).normalize();
                force.add(direction.multiplyScalar((distance - radius * 0.8) * 2));
            }
            
            return force;
        };
        this.steering.add(containmentBehavior);
    }

    update(delta) {
        try {
            super.update(delta);

            // Update mesh position and rotation
            if (this.mesh && !this.mesh.isDisposed()) {
                this.mesh.position.copyFrom(this.position);
                this.mesh.rotation.y = this.rotation.y;

                // Add slight pitch based on velocity
                const velocityY = this.velocity.y;
                this.mesh.rotation.x = BABYLON.Scalar.Clamp(velocityY * 0.1, -Math.PI/6, Math.PI/6);

                // Update skeleton
                if (this.skeleton) {
                    this.skeleton.prepare();
                    
                    // Update bone positions based on mesh movement
                    for (let i = 0; i < this.skeleton.bones.length; i++) {
                        const bone = this.skeleton.bones[i];
                        if (bone.animations && bone.animations.length > 0) {
                            bone.animations.forEach(animation => {
                                const currentFrame = (performance.now() * 0.03) % 30;
                                const value = animation.evaluate(currentFrame);
                                bone.rotation[animation.targetProperty.split('.')[1]] = value;
                            });
                        }
                    }
                }
            } else {
                console.warn("Shark: Mesh is disposed or not created, cannot update position");
            }

            // Update patrol behavior
            this.patrolTimer += delta;
            if (this.patrolTimer >= this.patrolDuration) {
                this.patrolTimer = 0;
                this.patrolDuration = 10 + Math.random() * 10;
                
                // Change direction by updating seek target
                const randomPoint = new YUKA.Vector3(
                    (Math.random() - 0.5) * 80,
                    5 + Math.random() * 10,
                    (Math.random() - 0.5) * 80
                );

                // Update seek behavior
                this.seekBehavior.target = randomPoint;
                this.seekBehavior.active = true;  // Enable seeking

                // Disable seek after reaching close to target
                setTimeout(() => {
                    this.seekBehavior.active = false;
                }, 5000);  // Disable after 5 seconds
            }
        } catch (error) {
            console.error("Shark: Error in update method:", error);
        }
    }

    dispose() {
        try {
            console.log("Shark: Disposing shark instance");
            
            // Clear any timeouts
            if (this._timeouts) {
                this._timeouts.forEach(clearTimeout);
                this._timeouts = [];
            }
            
            // Dispose mesh
            if (this.mesh && !this.mesh.isDisposed()) {
                console.log("Shark: Disposing mesh:", this.mesh.name);
                this.mesh.dispose();
                this.mesh = null;
            }
            
            // Dispose skeleton
            if (this.skeleton) {
                console.log("Shark: Disposing skeleton");
                this.skeleton.dispose();
                this.skeleton = null;
            }
            
            // Clear animations
            this.animations = {};
            
            console.log("Shark: Disposal complete");
        } catch (error) {
            console.error("Shark: Error during disposal:", error);
        }
    }
}

class SharkHandler {
    constructor(scene, landscape) {
        console.log("SharkHandler: Initializing...");
        if (!scene) {
            console.error("SharkHandler: Scene is required but was not provided!");
            return;
        }
        
        // Store references
        this.scene = scene;
        this.landscape = landscape;
        this.sharks = [];
        
        // Initialize YUKA components
        try {
            console.log("SharkHandler: Setting up YUKA components");
            this.entityManager = new YUKA.EntityManager();
            this.time = new YUKA.Time();
            console.log("SharkHandler: YUKA components initialized successfully");
        } catch (error) {
            console.error("SharkHandler: Error initializing YUKA components:", error);
            return;
        }
        
        // Create initial shark with retry mechanism
        this.createSharkWithRetry(3);
        
        // Log completion
        console.log("SharkHandler: Initialization complete with", this.sharks.length, "sharks");
        
        // Setup debug visualization if needed
        if (this.scene.debugLayer && this.scene.debugLayer.isVisible()) {
            this.setupDebugVisualization();
        }
    }

    createSharkWithRetry(maxRetries = 3) {
        console.log(`SharkHandler: Creating shark with ${maxRetries} retries`);
        let retries = 0;
        let success = false;
        
        while (!success && retries < maxRetries) {
            try {
                const shark = this.createShark();
                if (shark && shark.mesh) {
                    success = true;
                    console.log(`SharkHandler: Successfully created shark on attempt ${retries + 1}`);
                } else {
                    retries++;
                    console.warn(`SharkHandler: Failed to create shark, attempt ${retries}/${maxRetries}`);
                }
            } catch (error) {
                retries++;
                console.error(`SharkHandler: Error creating shark on attempt ${retries}/${maxRetries}:`, error);
            }
        }
        
        if (!success) {
            console.error("SharkHandler: Failed to create shark after maximum retries");
        }
        
        return success;
    }

    createShark() {
        console.log("SharkHandler: Creating new shark");
        try {
            // Create the shark entity
            const shark = new Shark(this.scene);
            
            // Verify shark was created properly
            if (!shark) {
                console.error("SharkHandler: Shark constructor returned null or undefined");
                return null;
            }
            
            if (!shark.mesh) {
                console.error("SharkHandler: Shark created but has no mesh");
                return null;
            }
            
            // Set initial position above the terrain
            const spawnPosition = this.getSpawnPosition();
            shark.position.copy(spawnPosition);
            shark.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);
            
            // Update mesh position immediately
            shark.mesh.position.copyFrom(shark.position);
            shark.mesh.rotation.y = shark.rotation.y;
            
            // Add to managers
            this.entityManager.add(shark);
            this.sharks.push(shark);
            
            console.log("SharkHandler: Shark created successfully with mesh:", shark.mesh.name);
            return shark;
        } catch (error) {
            console.error("SharkHandler: Error creating shark:", error);
            return null;
        }
    }

    getSpawnPosition() {
        // Get a random position above the terrain
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        let y = 5; // Default height

        // If landscape exists, position above terrain
        if (this.landscape && this.landscape.getHeightAtPoint) {
            try {
                const terrainHeight = this.landscape.getHeightAtPoint(x, z);
                y = terrainHeight + 5 + Math.random() * 5;
            } catch (e) {
                console.warn("SharkHandler: Could not get terrain height, using default");
            }
        }

        return new YUKA.Vector3(x, y, z);
    }

    update() {
        if (!this.entityManager || !this.time) {
            console.error("SharkHandler: Required components not initialized!");
            return;
        }

        const delta = this.time.update().getDelta();
        
        // Update all sharks
        this.sharks.forEach((shark, index) => {
            if (!shark || !shark.mesh || shark.mesh.isDisposed()) {
                console.log(`SharkHandler: Shark ${index} needs recreation`);
                this.removeShark(shark);
                this.createSharkWithRetry(3);
            }
        });
        
        // Create a shark if none exist
        if (this.sharks.length === 0) {
            console.log("SharkHandler: No sharks exist, creating one");
            this.createSharkWithRetry(3);
        }
        
        // Update YUKA entity manager
        this.entityManager.update(delta);
    }

    setupDebugVisualization() {
        // Create a debug sphere to visualize shark positions
        this.sharks.forEach((shark, index) => {
            const debugSphere = BABYLON.MeshBuilder.CreateSphere(
                `shark_debug_${index}`, 
                { diameter: 2 }, 
                this.scene
            );
            
            const debugMaterial = new BABYLON.StandardMaterial(`shark_debug_material_${index}`, this.scene);
            debugMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
            debugMaterial.alpha = 0.5;
            debugSphere.material = debugMaterial;
            
            // Update debug sphere position in render loop
            this.scene.onBeforeRenderObservable.add(() => {
                if (shark && shark.position) {
                    debugSphere.position.copyFrom(shark.position);
                }
            });
        });
    }

    removeShark(shark) {
        if (!shark) return;
        
        const index = this.sharks.indexOf(shark);
        if (index > -1) {
            console.log(`SharkHandler: Removing shark at index ${index}`);
            this.sharks.splice(index, 1);
            this.entityManager.remove(shark);
            shark.dispose();
        }
    }

    dispose() {
        console.log("SharkHandler: Disposing all sharks");
        this.sharks.forEach(shark => {
            if (shark) {
                shark.dispose();
            }
        });
        this.sharks = [];
        this.entityManager = null;
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Shark, SharkHandler };
} else if (typeof window !== 'undefined') {
    window.Shark = Shark;
    window.SharkHandler = SharkHandler;
} 