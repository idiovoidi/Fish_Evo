export function createCrabModel(scene) {
    const BABYLON = window.BABYLON;
    const body = BABYLON.MeshBuilder.CreateBox("crabBody", { width: 1.2, height: 0.4, depth: 0.8 }, scene);
    const clawLeft = BABYLON.MeshBuilder.CreateBox("clawLeft", { width: 0.4, height: 0.3, depth: 0.3 }, scene);
    clawLeft.position.set(0.8, 0, 0.3);
    const clawRight = clawLeft.clone("clawRight");
    clawRight.position.set(0.8, 0, -0.3);
    const legs = [];
    for (let i = 0; i < 6; i++) {
        const leg = BABYLON.MeshBuilder.CreateCylinder(`leg${i}`, { diameter: 0.08, height: 0.4 }, scene);
        leg.rotation.z = Math.PI / 2;
        leg.position.y = -0.15;
        const side = i < 3 ? 1 : -1;
        const legIndex = i % 3;
        leg.position.x = (legIndex - 1) * 0.3;
        leg.position.z = side * 0.5;
        legs.push(leg);
    }
    const eyeStalkL = BABYLON.MeshBuilder.CreateCylinder("eyeStalkL", { diameter: 0.06, height: 0.15 }, scene);
    eyeStalkL.position.set(0.4, 0.25, 0.2);
    const eyeStalkR = eyeStalkL.clone("eyeStalkR");
    eyeStalkR.position.z = -0.2;
    const eyeL = BABYLON.MeshBuilder.CreateSphere("eyeL", { diameter: 0.08 }, scene);
    eyeL.position.set(0.4, 0.32, 0.2);
    const eyeR = eyeL.clone("eyeR");
    eyeR.position.z = -0.2;
    const crabParts = [body, clawLeft, clawRight, ...legs, eyeStalkL, eyeStalkR, eyeL, eyeR];
    const crabMesh = BABYLON.Mesh.MergeMeshes(crabParts, true, true, undefined, false, true);
    crabMesh.name = "crabTemplate";
    const crabMaterial = new BABYLON.StandardMaterial("crabMaterial", scene);
    crabMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.3, 0.2);
    crabMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    crabMesh.material = crabMaterial;
    crabMesh.setEnabled(false);
    console.log("Crab template created successfully");
    return crabMesh;
}
//# sourceMappingURL=crab_model.js.map