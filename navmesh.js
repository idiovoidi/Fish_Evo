// Initialize Babylon.js scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Create basic scene
const createScene = async () => {
    const scene = new BABYLON.Scene(engine);
    
    // Add camera
    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        0,
        Math.PI / 3,
        40,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 100;
    
    // Add lighting
    const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround(
        'ground',
        { width: 100, height: 100, subdivisions: 20 },
        scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 0.3);
    ground.material = groundMaterial;

    // Create some obstacles (hills and rocks)
    const obstacles = [];
    
    // Create hills
    for (let i = 0; i < 5; i++) {
        const hill = BABYLON.MeshBuilder.CreateSphere(
            'hill' + i,
            { 
                diameter: 10 + Math.random() * 10,
                segments: 8
            },
            scene
        );
        
        // Position hills randomly but not too close to center
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 25;
        hill.position.x = Math.cos(angle) * distance;
        hill.position.z = Math.sin(angle) * distance;
        hill.position.y = -2; // Partially buried
        hill.scaling.y = 0.5; // Make them more like hills than spheres
        
        const hillMaterial = new BABYLON.StandardMaterial('hillMaterial' + i, scene);
        hillMaterial.diffuseColor = new BABYLON.Color3(
            0.4 + Math.random() * 0.2,
            0.6 + Math.random() * 0.2,
            0.3 + Math.random() * 0.2
        );
        hill.material = hillMaterial;
        
        obstacles.push(hill);
    }

    // Create rocks
    for (let i = 0; i < 8; i++) {
        const rock = BABYLON.MeshBuilder.CreatePolyhedron(
            'rock' + i,
            { type: 2, size: 2 + Math.random() * 2 },
            scene
        );
        
        // Position rocks randomly
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 35;
        rock.position.x = Math.cos(angle) * distance;
        rock.position.z = Math.sin(angle) * distance;
        rock.position.y = 0;
        rock.rotation.y = Math.random() * Math.PI;
        
        const rockMaterial = new BABYLON.StandardMaterial('rockMaterial' + i, scene);
        rockMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        rock.material = rockMaterial;
        
        obstacles.push(rock);
    }

    try {
        // Create navigation mesh
        const navigationPlugin = new BABYLON.RecastJSPlugin();
        await navigationPlugin.createNavMesh(scene, {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 35,
            walkableHeight: 1,
            walkableRadius: 1,
            walkableClimb: 1,
            maxEdgeLen: 12,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1
        });

        // Build debug navigation mesh visualization
        const navmeshMesh = navigationPlugin.createDebugNavMesh(scene);
        const debugMaterial = new BABYLON.StandardMaterial('debugMaterial', scene);
        debugMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        debugMaterial.alpha = 0.3;
        navmeshMesh.material = debugMaterial;
        
        // Raise the debug visualization slightly to prevent z-fighting
        navmeshMesh.position.y += 0.01;

        // Store navigation plugin in scene for later use
        scene.navigationPlugin = navigationPlugin;
        
        // Add click-to-move functionality
        scene.onPointerDown = (evt, pickResult) => {
            if (evt.button === 0 && pickResult.hit) {
                // Get the clicked point
                const targetPoint = pickResult.pickedPoint;
                
                // Find nearest point on navmesh
                const nearestPoint = navigationPlugin.getClosestPoint(targetPoint);
                
                // Create a sphere to mark the target
                const marker = BABYLON.MeshBuilder.CreateSphere(
                    'marker',
                    { diameter: 0.5 },
                    scene
                );
                marker.position.copyFrom(nearestPoint);
                marker.material = new BABYLON.StandardMaterial('markerMaterial', scene);
                marker.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
                
                // Remove marker after 2 seconds
                setTimeout(() => marker.dispose(), 2000);
            }
        };
    } catch (error) {
        console.error('Error creating navigation mesh:', error);
    }
    
    return scene;
};

// Create and run the scene
createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });
}).catch(error => {
    console.error('Error creating scene:', error);
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
}); 