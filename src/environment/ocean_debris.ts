export class OceanDebris {
  scene: any;
  position: any;
  mesh: any = null;
  bobHeight: number;
  bobSpeed: number;
  timeOffset: number;
  originalY: number;

  constructor(scene: any, position: any) {
    this.scene = scene;
    this.position = position;
    this.mesh = null;
    this.bobHeight = 0.1 + Math.random() * 0.1;
    this.bobSpeed = 0.5 + Math.random() * 0.5;
    this.timeOffset = Math.random() * Math.PI * 2;
    this.originalY = position.y;
    
    this.createDebris();
    this.addBobAnimation();
  }

  createDebris() {
    const debrisTypes = ['clam', 'shell', 'starfish', 'rock', 'bone'];
    const type = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
    
    switch(type) {
      case 'clam':
        this.createClam();
        break;
      case 'shell':
        this.createShell();
        break;
      case 'starfish':
        this.createStarfish();
        break;
      case 'rock':
        this.createRock();
        break;
      case 'bone':
        this.createBone();
        break;
    }

    if (this.mesh) {
      this.mesh.rotation.y = Math.random() * Math.PI * 2;
      this.mesh.rotation.x = (Math.random() - 0.5) * 0.3;
      this.mesh.rotation.z = (Math.random() - 0.5) * 0.3;
    }
  }

  createClam() {
    const BABYLON = (window as any).BABYLON;
    const size = 0.3 + Math.random() * 0.2;
    const isOpen = Math.random() > 0.7;

    const bottomShell = BABYLON.MeshBuilder.CreateSphere("bottomShell", {
      diameter: size * 2,
      slice: 0.5,
      segments: 16
    }, this.scene);

    const topShell = BABYLON.MeshBuilder.CreateSphere("topShell", {
      diameter: size * 2,
      slice: 0.5,
      segments: 16
    }, this.scene);

    bottomShell.position = this.position.clone();
    topShell.position = this.position.clone();
    topShell.rotation.x = Math.PI;

    if (isOpen) {
      topShell.rotation.x += Math.PI * 0.3;
      topShell.position.y += size * 0.3;
    }

    let pearl = null;
    if (isOpen && Math.random() > 0.5) {
      pearl = BABYLON.MeshBuilder.CreateSphere("pearl", {
        diameter: size * 0.3
      }, this.scene);
      pearl.position = new BABYLON.Vector3(
        this.position.x,
        this.position.y + size * 0.2,
        this.position.z
      );
    }

    const meshes = pearl ? [bottomShell, topShell, pearl] : [bottomShell, topShell];
    this.mesh = BABYLON.Mesh.MergeMeshes(meshes, true);
    this.applyDebrisMaterial('clam', isOpen);
  }

  createShell() {
    const BABYLON = (window as any).BABYLON;
    const size = 0.2 + Math.random() * 0.2;
    
    const points = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI;
      const x = Math.sin(angle) * size;
      const y = Math.cos(angle) * size * 0.5;
      points.push(new BABYLON.Vector3(x, y, 0));
    }

    const shell = BABYLON.MeshBuilder.CreateLathe("shell", {
      shape: points,
      radius: size,
      tessellation: 24,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, this.scene);

    const vertexData = BABYLON.VertexData.ExtractFromMesh(shell);
    const positions = vertexData.positions;
    
    for (let i = 0; i < positions.length; i += 3) {
      const angle = Math.atan2(positions[i], positions[i + 2]);
      const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
      positions[i + 1] += Math.sin(angle * 8) * 0.02 * radius;
    }

    vertexData.applyToMesh(shell);
    shell.position = this.position.clone();
    this.mesh = shell;
    this.applyDebrisMaterial('shell');
  }

  createStarfish() {
    const BABYLON = (window as any).BABYLON;
    const size = 0.4 + Math.random() * 0.2;
    const arms: any[] = [];
    const NUM_ARMS = 5;

    for (let i = 0; i < NUM_ARMS; i++) {
      const angle = (i / NUM_ARMS) * Math.PI * 2;
      
      const points = [];
      const segments = 10;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const width = 0.15 * (1 - t * 0.7);
        points.push(new BABYLON.Vector3(width * size, t * size, 0));
        points.push(new BABYLON.Vector3(-width * size, t * size, 0));
      }

      const arm = BABYLON.MeshBuilder.CreateRibbon("arm", {
        pathArray: [points],
        closePath: true
      }, this.scene);

      arm.rotation.z = angle;
      arm.position = this.position.clone();
      arms.push(arm);
    }

    const center = BABYLON.MeshBuilder.CreateDisc("center", {
      radius: size * 0.2,
      tessellation: 20
    }, this.scene);
    center.position = this.position.clone();
    arms.push(center);

    arms.forEach(arm => {
      const vertexData = BABYLON.VertexData.ExtractFromMesh(arm);
      const positions = vertexData.positions;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(positions[i] * 10) * 0.02;
      }
      
      vertexData.applyToMesh(arm);
    });

    this.mesh = BABYLON.Mesh.MergeMeshes(arms, true);
    this.applyDebrisMaterial('starfish');
  }

  createRock() {
    const BABYLON = (window as any).BABYLON;
    const size = 0.3 + Math.random() * 0.4;
    
    const rock = BABYLON.MeshBuilder.CreateIcoSphere("rock", {
      radius: size,
      subdivisions: 1,
      flat: true
    }, this.scene);

    const vertexData = BABYLON.VertexData.ExtractFromMesh(rock);
    const positions = vertexData.positions;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.2 * size;
      positions[i + 1] += (Math.random() - 0.5) * 0.2 * size;
      positions[i + 2] += (Math.random() - 0.5) * 0.2 * size;
    }

    vertexData.applyToMesh(rock);
    rock.position = this.position.clone();
    this.mesh = rock;
    this.applyDebrisMaterial('rock');
  }

  createBone() {
    const BABYLON = (window as any).BABYLON;
    const length = 0.5 + Math.random() * 0.3;
    const pieces: any[] = [];

    const shaft = BABYLON.MeshBuilder.CreateCylinder("shaft", {
      height: length,
      diameter: 0.1,
      tessellation: 8
    }, this.scene);

    const end1 = BABYLON.MeshBuilder.CreateSphere("end1", {
      diameter: 0.15,
      segments: 8
    }, this.scene);
    end1.position.y = length / 2;

    const end2 = end1.clone("end2");
    end2.position.y = -length / 2;

    pieces.push(shaft, end1, end2);

    this.mesh = BABYLON.Mesh.MergeMeshes(pieces, true);
    this.mesh.position = this.position.clone();
    this.applyDebrisMaterial('bone');
  }

  applyDebrisMaterial(type: string, isOpen: boolean = false) {
    const BABYLON = (window as any).BABYLON;
    const material = new BABYLON.StandardMaterial(`${type}-material`, this.scene);

    switch(type) {
      case 'clam':
        if (isOpen) {
          material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
          material.specularColor = new BABYLON.Color3(1, 1, 1);
          material.specularPower = 128;
          material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        } else {
          material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.5);
          material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        }
        break;
      case 'shell':
        material.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.6);
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        break;
      case 'starfish':
        material.diffuseColor = new BABYLON.Color3(
          0.8 + Math.random() * 0.2,
          0.3 + Math.random() * 0.2,
          0.2
        );
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        break;
      case 'rock':
        const greyTone = 0.3 + Math.random() * 0.2;
        material.diffuseColor = new BABYLON.Color3(greyTone, greyTone, greyTone);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        break;
      case 'bone':
        material.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.8);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        break;
    }

    this.mesh.material = material;
  }

  addBobAnimation() {
    this.scene.onBeforeRenderObservable.add(() => {
      if (this.mesh) {
        const time = performance.now() * 0.001;
        
        let bobOffset = Math.sin(time * this.bobSpeed + this.timeOffset) * this.bobHeight;
        
        if (this.mesh.name.includes('starfish')) {
          bobOffset *= 0.5;
        } else if (this.mesh.name.includes('rock')) {
          bobOffset *= 0.3;
        } else if (this.mesh.name.includes('shell')) {
          this.mesh.rotation.x += Math.sin(time * this.bobSpeed * 0.5) * 0.001;
          this.mesh.rotation.z += Math.cos(time * this.bobSpeed * 0.5) * 0.001;
        }
        
        this.mesh.position.y = this.originalY + bobOffset;
        
        if (!this.mesh.name.includes('rock')) {
          const rotationSpeed = 0.0005;
          this.mesh.rotation.y += Math.sin(time * this.bobSpeed * 0.3) * rotationSpeed;
        }
      }
    });
  }

  dispose() {
    if (this.mesh) {
      this.scene.onBeforeRenderObservable.clear();
      this.mesh.dispose();
    }
  }
}

export class DebrisManager {
  scene: any;
  landscape: any;
  debris: OceanDebris[] = [];

  constructor(scene: any, landscape: any) {
    this.scene = scene;
    this.landscape = landscape;
    this.debris = [];
    this.createDebrisField();
  }

  createDebrisField() {
    const TERRAIN_SIZE = 100;
    const DEBRIS_COUNT = 200;
    const MIN_DISTANCE = 2;

    const placedPositions: any[] = [];

    for (let i = 0; i < DEBRIS_COUNT; i++) {
      let x: number = 0, z: number = 0, y: number = 0;
      let validPosition = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      while (!validPosition && attempts < MAX_ATTEMPTS) {
        x = (Math.random() - 0.5) * TERRAIN_SIZE;
        z = (Math.random() - 0.5) * TERRAIN_SIZE;
        y = this.landscape.getHeightAtPoint(x, z);

        validPosition = true;
        const BABYLON = (window as any).BABYLON;
        for (const pos of placedPositions) {
          const distance = BABYLON.Vector3.Distance(
            new BABYLON.Vector3(x, y, z),
            pos
          );
          if (distance < MIN_DISTANCE) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }

      if (validPosition) {
        const BABYLON = (window as any).BABYLON;
        const position = new BABYLON.Vector3(x, y, z);
        placedPositions.push(position);
        const debris = new OceanDebris(this.scene, position);
        this.debris.push(debris);
      }
    }

    console.log(`Created ${this.debris.length} debris items`);
  }

  dispose() {
    this.debris.forEach(item => item.dispose());
  }
}
