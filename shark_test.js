// Simple test script to verify shark creation
console.log("Starting shark test...");

// Wait for page to load
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, testing shark creation");
    
    // Wait for libraries to load
    setTimeout(() => {
        try {
            console.log("Checking if YUKA is available:", typeof YUKA !== 'undefined');
            console.log("Checking if BABYLON is available:", typeof BABYLON !== 'undefined');
            
            if (typeof YUKA === 'undefined' || typeof BABYLON === 'undefined') {
                console.error("Required libraries not loaded!");
                return;
            }
            
            // Create a test scene
            const canvas = document.getElementById('renderCanvas');
            const engine = new BABYLON.Engine(canvas, true);
            const scene = new BABYLON.Scene(engine);
            
            // Create a camera
            const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 3, 30, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);
            
            // Add a light
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
            
            // Create a ground
            const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
            
            console.log("Test scene created, attempting to create shark");
            
            // Create a shark
            const shark = new Shark(scene);
            
            console.log("Shark created:", shark);
            console.log("Shark mesh:", shark.mesh);
            
            if (shark && shark.mesh) {
                console.log("Shark created successfully with mesh:", shark.mesh.name);
                
                // Make shark visible
                shark.mesh.position = new BABYLON.Vector3(0, 5, 0);
                shark.mesh.isVisible = true;
                
                // Start rendering
                engine.runRenderLoop(() => {
                    scene.render();
                });
                
                console.log("Test successful - shark should be visible in the scene");
            } else {
                console.error("Failed to create shark or shark mesh!");
            }
        } catch (error) {
            console.error("Error during shark test:", error);
        }
    }, 2000); // Wait 2 seconds for libraries to load
}); 