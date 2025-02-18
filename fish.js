// Initialize Babylon.js scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Create basic scene
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    
    // Add camera
    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        0,
        Math.PI / 3,
        30,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    
    // Add lighting
    const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    
    // Create water environment (semi-transparent box)
    const waterBox = BABYLON.MeshBuilder.CreateBox(
        'waterBox',
        { width: 40, height: 20, depth: 40 },
        scene
    );
    const waterMaterial = new BABYLON.StandardMaterial('waterMaterial', scene);
    waterMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    waterMaterial.alpha = 0.3;
    waterBox.material = waterMaterial;

    // Initialize Yuka
    const entityManager = new YUKA.EntityManager();
    const time = new YUKA.Time();

    // Fish class extending Yuka's Vehicle
    class Fish extends YUKA.Vehicle {
        constructor() {
            super();
            this.maxSpeed = 8;
            this.maxForce = 1;
            this.updateNeighborhood = true; // Enable neighborhood updates for flocking
            this.neighborhoodRadius = 5;
        }

        update(delta) {
            // Add slight vertical oscillation for more natural fish movement
            this.position.y += Math.sin(time.getElapsed() * 2) * 0.01;

            // Contain fish within boundaries
            const margin = 2;
            const turnFactor = 0.2;

            if (this.position.x < -19) this.velocity.x += turnFactor;
            if (this.position.x > 19) this.velocity.x -= turnFactor;
            if (this.position.y < -9) this.velocity.y += turnFactor;
            if (this.position.y > 9) this.velocity.y -= turnFactor;
            if (this.position.z < -19) this.velocity.z += turnFactor;
            if (this.position.z > 19) this.velocity.z -= turnFactor;

            super.update(delta);
        }
    }

    // Create fish mesh prototype
    const createFishMesh = () => {
        // Create fish body
        const body = BABYLON.MeshBuilder.CreateCapsule(
            'fishBody',
            { radius: 0.2, height: 1 },
            scene
        );
        
        // Create tail
        const tail = BABYLON.MeshBuilder.CreateCylinder(
            'fishTail',
            { diameterTop: 0.4, diameterBottom: 0, height: 0.5 },
            scene
        );
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -0.6;

        // Create fins
        const finLeft = BABYLON.MeshBuilder.CreateCylinder(
            'finLeft',
            { diameterTop: 0.2, diameterBottom: 0, height: 0.3 },
            scene
        );
        finLeft.rotation.z = -Math.PI / 4;
        finLeft.position.set(0.3, 0, 0);

        const finRight = finLeft.clone('finRight');
        finRight.rotation.z = Math.PI / 4;
        finRight.position.x = -0.3;

        // Merge all parts into one mesh
        const fish = BABYLON.Mesh.MergeMeshes(
            [body, tail, finLeft, finRight],
            true
        );
        
        // Create and apply material
        const fishMaterial = new BABYLON.StandardMaterial('fishMaterial', scene);
        fishMaterial.diffuseColor = new BABYLON.Color3(
            0.4 + Math.random() * 0.3,
            0.7 + Math.random() * 0.3,
            0.9
        );
        fish.material = fishMaterial;

        return fish;
    };

    // Create school of fish
    const NUM_FISH = 50;
    const SPAWN_RANGE = 15;
    const fishes = [];

    for (let i = 0; i < NUM_FISH; i++) {
        // Create fish entity
        const fish = new Fish();
        fish.position.set(
            (Math.random() - 0.5) * SPAWN_RANGE,
            (Math.random() - 0.5) * SPAWN_RANGE / 2,
            (Math.random() - 0.5) * SPAWN_RANGE
        );
        fish.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);

        // Create fish mesh
        const fishMesh = createFishMesh();
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
        entityManager.add(fish);
        fishes.push(fish);
    }

    // Animation loop
    scene.onBeforeRenderObservable.add(() => {
        const delta = time.update().getDelta();
        entityManager.update(delta);
    });
    
    return scene;
};

// Create and run the scene
const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
}); 