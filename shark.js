class Shark extends YUKA.Vehicle {
    constructor(scene) {
        super();
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
        this.createShark();
        this.setupBehaviors();
    }

    createShark() {
        // Create main body
        const body = BABYLON.MeshBuilder.CreateCapsule("sharkBody", {
            radius: 1,
            height: 8,
            tessellation: 24,
            capSubdivisions: 12
        }, this.scene);

        // Create head
        const head = BABYLON.MeshBuilder.CreateCapsule("sharkHead", {
            radius: 1.2,
            height: 3,
            tessellation: 24,
            capSubdivisions: 12
        }, this.scene);
        head.position.z = 4;
        head.rotation.x = Math.PI / 2;

        // Create tail
        const tailBase = BABYLON.MeshBuilder.CreateCapsule("sharkTailBase", {
            radius: 0.8,
            height: 3,
            tessellation: 16,
            capSubdivisions: 8
        }, this.scene);
        tailBase.position.z = -4;

        const tailFin = this.createFin(2.5, 1.5, "tailFin");
        tailFin.position.z = -5.5;
        tailFin.rotation.x = Math.PI / 2;

        // Create dorsal fin
        const dorsalFin = this.createFin(2, 1.2, "dorsalFin");
        dorsalFin.position.y = 1.5;
        dorsalFin.rotation.x = Math.PI;

        // Create pectoral fins
        const leftPectoral = this.createFin(1.5, 0.8, "leftPectoral");
        leftPectoral.position.set(1.5, -0.2, 0);
        leftPectoral.rotation.set(0, 0, -Math.PI / 4);

        const rightPectoral = this.createFin(1.5, 0.8, "rightPectoral");
        rightPectoral.position.set(-1.5, -0.2, 0);
        rightPectoral.rotation.set(0, 0, Math.PI / 4);

        // Create eyes
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", {
            diameter: 0.3,
            segments: 16
        }, this.scene);
        leftEye.position.set(0.8, 0.5, 4.5);

        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", {
            diameter: 0.3,
            segments: 16
        }, this.scene);
        rightEye.position.set(-0.8, 0.5, 4.5);

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

        // Merge all parts
        const parts = [body, head, tailBase, tailFin, dorsalFin, leftPectoral, rightPectoral, leftEye, rightEye, ...gills];
        this.mesh = BABYLON.Mesh.MergeMeshes(parts, true);

        // Create skeleton and attach to mesh
        this.createSkeleton();
        this.mesh.skeleton = this.skeleton;
        
        // Apply materials
        this.applySharkMaterials();
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
        super.update(delta);

        // Update mesh position and rotation
        if (this.mesh) {
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
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.skeleton) {
            this.skeleton.dispose();
        }
    }
}

class SharkManager {
    constructor(scene) {
        this.scene = scene;
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();
        this.sharks = [];
        this.createSharks();
    }

    createSharks(count = 1) {
        for (let i = 0; i < count; i++) {
            const shark = new Shark(this.scene);
            
            // Set initial position
            shark.position.set(
                (Math.random() - 0.5) * 80,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 80
            );
            
            shark.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);
            
            // Add to managers
            this.entityManager.add(shark);
            this.sharks.push(shark);
        }
    }

    update() {
        const delta = this.time.update().getDelta();
        this.entityManager.update(delta);
    }

    dispose() {
        this.sharks.forEach(shark => shark.dispose());
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Shark, SharkManager };
} else if (typeof window !== 'undefined') {
    window.Shark = Shark;
    window.SharkManager = SharkManager;
} 