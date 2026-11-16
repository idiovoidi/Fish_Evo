export function createSharkModel(scene) {
    const BABYLON = window.BABYLON;
    const bodyLength = 4.0;
    const bodyHeight = 1.0;
    const bodyWidth = 1.2;
    const body = BABYLON.MeshBuilder.CreateSphere('sharkBody', {
        diameterX: bodyLength,
        diameterY: bodyHeight,
        diameterZ: bodyWidth,
        segments: 24,
    }, scene);
    const snout = BABYLON.MeshBuilder.CreateCylinder('sharkSnout', {
        diameterTop: 0.2,
        diameterBottom: 0.8,
        height: 1.0,
        tessellation: 16,
    }, scene);
    snout.rotation.z = Math.PI / 2;
    snout.position.x = bodyLength * 0.45;
    const jaw = BABYLON.MeshBuilder.CreateCylinder('sharkJaw', {
        diameterTop: 0.6,
        diameterBottom: 0.7,
        height: 0.4,
        tessellation: 12,
    }, scene);
    jaw.rotation.z = Math.PI / 2;
    jaw.position.set(bodyLength * 0.35, -0.15, 0);
    const dorsalFin = BABYLON.MeshBuilder.CreateCylinder('dorsalFin', {
        diameterTop: 0.05,
        diameterBottom: 0.7,
        height: 1.5,
        tessellation: 12,
    }, scene);
    dorsalFin.position.y = bodyHeight * 0.7;
    dorsalFin.position.x = -0.2;
    dorsalFin.rotation.z = -0.1;
    const dorsalFin2 = BABYLON.MeshBuilder.CreateCylinder('dorsalFin2', {
        diameterTop: 0.03,
        diameterBottom: 0.3,
        height: 0.6,
        tessellation: 8,
    }, scene);
    dorsalFin2.position.set(-1.3, 0.35, 0);
    const tailMain = BABYLON.MeshBuilder.CreateCylinder('tailMain', {
        diameterTop: 0.08,
        diameterBottom: 1.4,
        height: 1.8,
        tessellation: 16,
    }, scene);
    tailMain.rotation.z = Math.PI / 2;
    tailMain.position.x = -bodyLength * 0.5;
    const upperTail = BABYLON.MeshBuilder.CreateCylinder('upperTail', {
        diameterTop: 0.03,
        diameterBottom: 0.5,
        height: 1.0,
        tessellation: 12,
    }, scene);
    upperTail.rotation.z = -Math.PI / 3.5;
    upperTail.position.set(-bodyLength * 0.65, 0.5, 0);
    const lowerTail = BABYLON.MeshBuilder.CreateCylinder('lowerTail', {
        diameterTop: 0.02,
        diameterBottom: 0.3,
        height: 0.6,
        tessellation: 10,
    }, scene);
    lowerTail.rotation.z = Math.PI / 4;
    lowerTail.position.set(-bodyLength * 0.65, -0.3, 0);
    const pectoralFinL = BABYLON.MeshBuilder.CreateCylinder('pectoralFinL', {
        diameterTop: 0.08,
        diameterBottom: 0.7,
        height: 1.3,
        tessellation: 12,
    }, scene);
    pectoralFinL.rotation.x = Math.PI / 2;
    pectoralFinL.rotation.y = -Math.PI / 5;
    pectoralFinL.rotation.z = -Math.PI / 8;
    pectoralFinL.position.set(0.5, -0.15, 1.0);
    const pectoralFinR = pectoralFinL.clone('pectoralFinR');
    pectoralFinR.rotation.y = Math.PI / 5;
    pectoralFinR.rotation.z = Math.PI / 8;
    pectoralFinR.position.z = -1.0;
    const pelvicFinL = BABYLON.MeshBuilder.CreateCylinder('pelvicFinL', {
        diameterTop: 0.04,
        diameterBottom: 0.35,
        height: 0.7,
        tessellation: 10,
    }, scene);
    pelvicFinL.rotation.x = Math.PI / 2;
    pelvicFinL.rotation.z = Math.PI / 6;
    pelvicFinL.position.set(-0.6, -0.35, 0.45);
    const pelvicFinR = pelvicFinL.clone('pelvicFinR');
    pelvicFinR.rotation.z = -Math.PI / 6;
    pelvicFinR.position.z = -0.45;
    const analFin = BABYLON.MeshBuilder.CreateCylinder('analFin', {
        diameterTop: 0.03,
        diameterBottom: 0.3,
        height: 0.6,
        tessellation: 8,
    }, scene);
    analFin.position.set(-1.2, -0.35, 0);
    const eyeL = BABYLON.MeshBuilder.CreateSphere('eyeL', {
        diameter: 0.18,
        segments: 12,
    }, scene);
    eyeL.position.set(1.4, 0.2, 0.45);
    const eyeR = eyeL.clone('eyeR');
    eyeR.position.z = -0.45;
    const gills = [];
    for (let i = 0; i < 5; i++) {
        const gill = BABYLON.MeshBuilder.CreateBox(`gill${i}`, {
            width: 0.05,
            height: 0.3,
            depth: 0.02,
        }, scene);
        gill.position.set(0.8 - i * 0.15, -0.1, 0.55);
        gill.rotation.y = -Math.PI / 6;
        gills.push(gill);
        const gillR = gill.clone(`gill${i}R`);
        gillR.position.z = -0.55;
        gillR.rotation.y = Math.PI / 6;
        gills.push(gillR);
    }
    const sharkParts = [
        body, snout, jaw, dorsalFin, dorsalFin2, tailMain, upperTail, lowerTail,
        pectoralFinL, pectoralFinR, pelvicFinL, pelvicFinR, analFin, eyeL, eyeR, ...gills,
    ];
    const sharkMesh = BABYLON.Mesh.MergeMeshes(sharkParts, true, true, undefined, false, true);
    sharkMesh.name = 'sharkTemplate';
    const sharkMaterial = new BABYLON.PBRMaterial('sharkMaterial', scene);
    sharkMaterial.albedoColor = new BABYLON.Color3(0.18, 0.22, 0.28);
    sharkMaterial.metallic = 0.1;
    sharkMaterial.roughness = 0.6;
    const sharkTexture = new BABYLON.DynamicTexture('sharkTexture', { width: 512, height: 512 }, scene);
    const ctx = sharkTexture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a1f28');
    gradient.addColorStop(0.4, '#2a3540');
    gradient.addColorStop(0.7, '#4a5560');
    gradient.addColorStop(1, '#7a8590');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#0a0f18';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 300;
        const size = Math.random() * 25 + 10;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.fillStyle = '#5a6570';
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    sharkTexture.update();
    sharkMaterial.albedoTexture = sharkTexture;
    sharkMaterial.environmentIntensity = 0.4;
    sharkMesh.material = sharkMaterial;
    sharkMesh.setEnabled(false);
    console.log('Enhanced realistic shark template created successfully');
    return sharkMesh;
}
//# sourceMappingURL=shark.js.map