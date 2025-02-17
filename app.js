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
        10,
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
    
    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround(
        'ground',
        { width: 20, height: 20 },
        scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ground.material = groundMaterial;
    
    // Create vehicle (represented as a box for now)
    const vehicle = BABYLON.MeshBuilder.CreateBox(
        'vehicle',
        { size: 1 },
        scene
    );
    vehicle.position.y = 0.5;
    const vehicleMaterial = new BABYLON.StandardMaterial('vehicleMaterial', scene);
    vehicleMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0.8);
    vehicle.material = vehicleMaterial;

    // Bake transformations and freeze world matrix before registering with Yuka
    vehicle.bakeCurrentTransformIntoVertices();
    vehicle.freezeWorldMatrix();
    
    // Initialize Yuka
    const entityManager = new YUKA.EntityManager();
    const time = new YUKA.Time();
    
    // Create Yuka vehicle
    const yukaVehicle = new YUKA.Vehicle();
    
    // Sync function that properly handles matrix transformation
    function sync(entity, renderComponent) {
        BABYLON.Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent);
    }
    
    // Set render component with proper sync function
    yukaVehicle.setRenderComponent(vehicle, sync);
    yukaVehicle.position.set(0, 0.5, 0); // Match the Y position we set for the mesh
    yukaVehicle.maxSpeed = 3;
    yukaVehicle.maxForce = 1;
    
    // Add vehicle to entity manager
    entityManager.add(yukaVehicle);
    
    // Add some basic steering behavior (wander)
    const wanderBehavior = new YUKA.WanderBehavior();
    yukaVehicle.steering.add(wanderBehavior);
    
    // Animation loop using Babylon's onBeforeRenderObservable
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