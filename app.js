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
    
    // Initialize Yuka
    const entityManager = new YUKA.EntityManager();
    const time = new YUKA.Time();
    
    // Create Yuka vehicle
    const yukaVehicle = new YUKA.Vehicle();
    yukaVehicle.setRenderComponent(vehicle, sync);
    yukaVehicle.position.set(0, 0, 0);
    yukaVehicle.maxSpeed = 3;
    yukaVehicle.maxForce = 1;
    
    // Add vehicle to entity manager
    entityManager.add(yukaVehicle);
    
    // Sync Babylon.js mesh with Yuka entity
    function sync(entity, renderComponent) {
        renderComponent.position.x = entity.position.x;
        renderComponent.position.z = entity.position.z;
        renderComponent.rotation.y = entity.rotation.y;
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