// Fish class extending Yuka's Vehicle
class Fish extends YUKA.Vehicle {
    constructor() {
        super();
        this.maxSpeed = 8;
        this.maxForce = 1;
        this.updateNeighborhood = true;
        this.neighborhoodRadius = 5;
    }

    update(delta) {
        // Add slight vertical oscillation for more natural fish movement
        this.position.y += Math.sin(performance.now() * 0.002) * 0.01;
        super.update(delta);
    }
}

// Fish manager class
class FishManager {
    constructor(scene) {
        this.scene = scene;
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();
        this.fishes = [];
    }

    createFishSchool(numFish = 50) {
        const SPAWN_RANGE = 15;

        for (let i = 0; i < numFish; i++) {
            // Create fish entity
            const fish = new Fish();
            fish.position.set(
                (Math.random() - 0.5) * SPAWN_RANGE,
                5 + (Math.random() - 0.5) * SPAWN_RANGE / 2,
                (Math.random() - 0.5) * SPAWN_RANGE
            );
            fish.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);

            // Create fish mesh
            const fishMesh = this.createFishMesh();
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

            // Add to manager and array
            this.entityManager.add(fish);
            this.fishes.push(fish);
        }
    }

    createFishMesh() {
        // Create fish body
        const body = BABYLON.MeshBuilder.CreateCapsule(
            'fishBody',
            { radius: 0.2, height: 1 },
            this.scene
        );
        
        // Create tail
        const tail = BABYLON.MeshBuilder.CreateCylinder(
            'fishTail',
            { diameterTop: 0.4, diameterBottom: 0, height: 0.5 },
            this.scene
        );
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -0.6;

        // Create fins
        const finLeft = BABYLON.MeshBuilder.CreateCylinder(
            'finLeft',
            { diameterTop: 0.2, diameterBottom: 0, height: 0.3 },
            this.scene
        );
        finLeft.rotation.z = -Math.PI / 4;
        finLeft.position.set(0.3, 0, 0);

        const finRight = finLeft.clone('finRight');
        finRight.rotation.z = Math.PI / 4;
        finRight.position.x = -0.3;

        // Merge all parts
        const fish = BABYLON.Mesh.MergeMeshes(
            [body, tail, finLeft, finRight],
            true
        );
        
        // Create and apply material
        const fishMaterial = new BABYLON.StandardMaterial('fishMaterial', this.scene);
        fishMaterial.diffuseColor = new BABYLON.Color3(
            0.4 + Math.random() * 0.3,
            0.7 + Math.random() * 0.3,
            0.9
        );
        fish.material = fishMaterial;

        return fish;
    }

    update() {
        const delta = this.time.update().getDelta();
        this.entityManager.update(delta);
    }
} 