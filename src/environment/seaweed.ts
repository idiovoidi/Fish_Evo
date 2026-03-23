interface SeaweedOptions {
  type?: 'kelp' | 'seagrass' | 'algae';
  height?: number;
  segments?: number;
  width?: number;
  color?: any;
  variation?: number;
}

export class Seaweed {
  scene: any;
  position: any;
  options: Required<SeaweedOptions>;
  mesh: any = null;
  skeleton: any = null;
  animationGroups: any[] = [];

  constructor(scene: any, position: any, options: SeaweedOptions = {}) {
    this.scene = scene;
    this.position = position;
    
    const BABYLON = (window as any).BABYLON;
    this.options = Object.assign({
      type: 'kelp',
      height: 5,
      segments: 8,
      width: 0.5,
      color: new BABYLON.Color3(0.1, 0.5, 0.1),
      variation: Math.random()
    }, options) as Required<SeaweedOptions>;
    
    this.mesh = null;
    this.skeleton = null;
    this.animationGroups = [];
    
    this.createSeaweed();
  }
  
  createSeaweed() {
    try {
      switch (this.options.type) {
        case 'kelp':
          this.createKelp();
          break;
        case 'seagrass':
          this.createSeagrass();
          break;
        case 'algae':
          this.createAlgae();
          break;
        default:
          this.createKelp();
      }
      
      if (this.mesh) {
        this.mesh.position = this.position;
      }
      
      return this.mesh;
    } catch (error) {
      console.error("Error creating seaweed:", error);
      return null;
    }
  }
  
  createKelp() {
    const BABYLON = (window as any).BABYLON;
    const points: any[] = [];
    const segmentHeight = this.options.height / this.options.segments;
    
    for (let i = 0; i <= this.options.segments; i++) {
      const xOffset = (i / this.options.segments) * Math.sin(i + this.options.variation * 10) * 0.3;
      points.push(new BABYLON.Vector3(xOffset, i * segmentHeight, 0));
    }
    
    const path: any[][] = [];
    const pathCount = 5;
    const pathStep = this.options.width / (pathCount - 1);
    
    for (let i = 0; i < pathCount; i++) {
      const offset = (i * pathStep) - (this.options.width / 2);
      const pathPoints = points.map(p => new BABYLON.Vector3(offset + p.x, p.y, p.z));
      path.push(pathPoints);
    }
    
    this.mesh = BABYLON.MeshBuilder.CreateRibbon("kelp", {
      pathArray: path,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      updatable: true
    }, this.scene);
    
    const material = new BABYLON.StandardMaterial("kelpMaterial", this.scene);
    material.diffuseColor = this.options.color;
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material.alpha = 0.9;
    this.mesh.material = material;
    
    this.createSkeleton();
    this.createKelpAnimation();
  }
  
  createSeagrass() {
    const BABYLON = (window as any).BABYLON;
    const bladeCount = 3 + Math.floor(this.options.variation * 4);
    const bladeWidth = this.options.width / bladeCount;
    
    this.mesh = new BABYLON.Mesh("seagrass", this.scene);
    
    for (let b = 0; b < bladeCount; b++) {
      const points: any[] = [];
      const segmentHeight = this.options.height / this.options.segments;
      const bladeHeight = this.options.height * (0.7 + this.options.variation * 0.6);
      
      for (let i = 0; i <= this.options.segments; i++) {
        const t = i / this.options.segments;
        const xOffset = Math.sin(t * Math.PI) * (0.5 + this.options.variation * 0.5);
        points.push(new BABYLON.Vector3(xOffset, i * segmentHeight * (bladeHeight / this.options.height), 0));
      }
      
      const blade = BABYLON.MeshBuilder.CreateLines(`seagrassBlade${b}`, {
        points: points,
        updatable: true
      }, this.scene);
      
      const bladeOffset = (b - (bladeCount - 1) / 2) * bladeWidth * 1.5;
      blade.position = new BABYLON.Vector3(bladeOffset, 0, 0);
      blade.rotation.y = (Math.random() - 0.5) * Math.PI * 0.25;
      
      const material = new BABYLON.StandardMaterial(`seagrassMaterial${b}`, this.scene);
      material.diffuseColor = new BABYLON.Color3(
        this.options.color.r * (0.8 + Math.random() * 0.4),
        this.options.color.g * (0.8 + Math.random() * 0.4),
        this.options.color.b * (0.8 + Math.random() * 0.4)
      );
      material.emissiveColor = material.diffuseColor.scale(0.5);
      blade.color = material.diffuseColor;
      
      blade.parent = this.mesh;
      
      this.createGrassBladeAnimation(blade, b);
    }
  }
  
  createAlgae() {
    const BABYLON = (window as any).BABYLON;
    const frondCount = 5 + Math.floor(this.options.variation * 7);
    
    this.mesh = new BABYLON.Mesh("algae", this.scene);
    
    for (let f = 0; f < frondCount; f++) {
      const frondHeight = this.options.height * (0.4 + Math.random() * 0.6);
      const frondWidth = this.options.width * (0.3 + Math.random() * 0.7);
      const frondSegments = Math.max(3, Math.floor(this.options.segments * (0.5 + Math.random() * 0.5)));
      
      const points: any[] = [];
      const segmentHeight = frondHeight / frondSegments;
      
      for (let i = 0; i <= frondSegments; i++) {
        const t = i / frondSegments;
        const xOffset = Math.sin(t * Math.PI) * (0.3 + Math.random() * 0.3);
        points.push(new BABYLON.Vector3(xOffset, i * segmentHeight, 0));
      }
      
      const path: any[][] = [];
      const pathCount = 3;
      const pathStep = frondWidth / (pathCount - 1);
      
      for (let i = 0; i < pathCount; i++) {
        const offset = (i * pathStep) - (frondWidth / 2);
        const pathPoints = points.map(p => new BABYLON.Vector3(offset + p.x, p.y, p.z));
        path.push(pathPoints);
      }
      
      const frond = BABYLON.MeshBuilder.CreateRibbon(`algaeFrond${f}`, {
        pathArray: path,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable: true
      }, this.scene);
      
      const radius = this.options.width * 1.5;
      const angle = (f / frondCount) * Math.PI * 2 + this.options.variation * Math.PI;
      frond.position = new BABYLON.Vector3(
        Math.cos(angle) * radius * Math.random(),
        0,
        Math.sin(angle) * radius * Math.random()
      );
      
      frond.rotation.y = Math.random() * Math.PI * 2;
      
      const material = new BABYLON.StandardMaterial(`algaeMaterial${f}`, this.scene);
      material.diffuseColor = new BABYLON.Color3(
        this.options.color.r * (0.7 + Math.random() * 0.6),
        this.options.color.g * (0.7 + Math.random() * 0.6),
        this.options.color.b * (0.7 + Math.random() * 0.6)
      );
      material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      material.alpha = 0.9;
      frond.material = material;
      
      frond.parent = this.mesh;
      
      this.createAlgaeFrondAnimation(frond, f);
    }
  }
  
  createSkeleton() {
    const BABYLON = (window as any).BABYLON;
    this.skeleton = new BABYLON.Skeleton("seaweedSkeleton", "seaweedSkeleton", this.scene);
    
    const bones: any[] = [];
    let parentBone: any = null;
    
    for (let i = 0; i <= this.options.segments; i++) {
      const bone: any = new BABYLON.Bone(
        `seaweedBone${i}`, 
        this.skeleton, 
        parentBone, 
        i === 0 
          ? BABYLON.Matrix.Identity() 
          : BABYLON.Matrix.Translation(0, this.options.height / this.options.segments, 0)
      );
      bones.push(bone);
      parentBone = bone;
    }
    
    this.skeleton.bones = bones;
    this.mesh.skeleton = this.skeleton;
  }
  
  createKelpAnimation() {
    const BABYLON = (window as any).BABYLON;
    const animationGroup = new BABYLON.AnimationGroup("kelpAnimation");
    
    for (let i = 1; i <= this.options.segments; i++) {
      const bone = this.skeleton.bones[i];
      
      const rotationAnimation = new BABYLON.Animation(
        `kelpRotation${i}`,
        "rotation",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      
      const amplitude = 0.05 * i;
      const phaseOffset = i * 0.2 + this.options.variation * 5;
      const speed = 2 + this.options.variation * 1.5;
      
      const keyFrames = [];
      for (let frame = 0; frame <= 60; frame++) {
        const value = new BABYLON.Vector3(
          Math.sin(frame / speed + phaseOffset) * amplitude,
          0,
          Math.cos(frame / speed + phaseOffset * 0.7) * amplitude * 0.5
        );
        
        keyFrames.push({ frame, value });
      }
      
      rotationAnimation.setKeys(keyFrames);
      animationGroup.addTargetedAnimation(rotationAnimation, bone);
    }
    
    animationGroup.play(true);
    this.animationGroups.push(animationGroup);
  }
  
  createGrassBladeAnimation(blade: any, index: number) {
    const BABYLON = (window as any).BABYLON;
    const animationGroup = new BABYLON.AnimationGroup(`seagrassAnimation${index}`);
    
    const rotationAnimation = new BABYLON.Animation(
      `seagrassRotation${index}`,
      "rotation",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    const phaseOffset = index * 0.7 + this.options.variation * 10;
    const speed = 3 + this.options.variation * 2;
    
    const keyFrames = [];
    for (let frame = 0; frame <= 60; frame++) {
      const value = new BABYLON.Vector3(
        Math.sin(frame / speed + phaseOffset) * 0.1,
        Math.sin(frame / speed + phaseOffset * 1.3) * 0.05,
        Math.cos(frame / speed + phaseOffset * 0.7) * 0.15
      );
      
      keyFrames.push({ frame, value });
    }
    
    rotationAnimation.setKeys(keyFrames);
    animationGroup.addTargetedAnimation(rotationAnimation, blade);
    animationGroup.play(true);
    this.animationGroups.push(animationGroup);
  }
  
  createAlgaeFrondAnimation(frond: any, index: number) {
    const BABYLON = (window as any).BABYLON;
    const animationGroup = new BABYLON.AnimationGroup(`algaeAnimation${index}`);
    
    const rotationAnimation = new BABYLON.Animation(
      `algaeRotation${index}`,
      "rotation",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    const phaseOffset = index * 0.5 + this.options.variation * 8;
    const speed = 4 + this.options.variation * 3;
    
    const keyFrames = [];
    for (let frame = 0; frame <= 60; frame++) {
      const value = new BABYLON.Vector3(
        Math.sin(frame / speed + phaseOffset) * 0.08,
        frond.rotation.y + Math.sin(frame / speed + phaseOffset * 1.1) * 0.03,
        Math.cos(frame / speed + phaseOffset * 0.9) * 0.08
      );
      
      keyFrames.push({ frame, value });
    }
    
    rotationAnimation.setKeys(keyFrames);
    animationGroup.addTargetedAnimation(rotationAnimation, frond);
    animationGroup.play(true);
    this.animationGroups.push(animationGroup);
  }
  
  dispose() {
    this.animationGroups.forEach(group => {
      group.stop();
      group.dispose();
    });
    this.animationGroups = [];
    
    if (this.skeleton) {
      this.skeleton.dispose();
      this.skeleton = null;
    }
    
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
  }
}

interface SeaweedManagerConfig {
  count: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  minSegments: number;
  maxSegments: number;
  spawnRadius: number;
  minDistance: number;
  types: string[];
  typeDistribution: Record<string, number>;
  colors: Record<string, any[]>;
  clusterProbability: number;
  clusterSize: { min: number; max: number };
  clusterRadius: { min: number; max: number };
}

export class SeaweedManager {
  scene: any;
  landscape: any;
  seaweeds: Seaweed[] = [];
  config: SeaweedManagerConfig;

  constructor(scene: any, landscape: any) {
    this.scene = scene;
    this.landscape = landscape;
    this.seaweeds = [];
    
    const BABYLON = (window as any).BABYLON;
    this.config = {
      count: 150,
      minHeight: 3,
      maxHeight: 8,
      minWidth: 0.3,
      maxWidth: 0.8,
      minSegments: 5,
      maxSegments: 10,
      spawnRadius: 80,
      minDistance: 5,
      types: ['kelp', 'seagrass', 'algae'],
      typeDistribution: {
        kelp: 0.4,
        seagrass: 0.4,
        algae: 0.2
      },
      colors: {
        kelp: [
          new BABYLON.Color3(0.1, 0.5, 0.1),
          new BABYLON.Color3(0.15, 0.4, 0.1),
          new BABYLON.Color3(0.2, 0.5, 0.2)
        ],
        seagrass: [
          new BABYLON.Color3(0.2, 0.6, 0.2),
          new BABYLON.Color3(0.3, 0.6, 0.3),
          new BABYLON.Color3(0.15, 0.45, 0.15)
        ],
        algae: [
          new BABYLON.Color3(0.1, 0.4, 0.3),
          new BABYLON.Color3(0.2, 0.3, 0.1),
          new BABYLON.Color3(0.3, 0.5, 0.2)
        ]
      },
      clusterProbability: 0.6,
      clusterSize: { min: 3, max: 8 },
      clusterRadius: { min: 1, max: 3 }
    };
  }
  
  initialize() {
    console.log("Initializing seaweed...");
    this.spawnSeaweed();
    console.log(`Created ${this.seaweeds.length} seaweed plants`);
  }
  
  getRandomSeaweedType(): string {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const type of this.config.types) {
      cumulativeProbability += this.config.typeDistribution[type];
      if (rand <= cumulativeProbability) {
        return type;
      }
    }
    
    return this.config.types[0];
  }
  
  getRandomColorForType(type: string): any {
    const colors = this.config.colors[type];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  spawnSeaweed() {
    const attempts = this.config.count * 2;
    const positions: any[] = [];
    const BABYLON = (window as any).BABYLON;
    
    for (let i = 0; i < attempts && positions.length < this.config.count; i++) {
      const createCluster = Math.random() < this.config.clusterProbability;
      
      if (createCluster) {
        const centerX = (Math.random() - 0.5) * this.config.spawnRadius * 2;
        const centerZ = (Math.random() - 0.5) * this.config.spawnRadius * 2;
        
        let centerY = 0;
        try {
          if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
            centerY = this.landscape.getHeightAtPoint(centerX, centerZ);
          }
        } catch (e) {
          console.warn("Could not get terrain height, using default");
        }
        
        if (centerY < 0) {
          const clusterSize = Math.floor(
            this.config.clusterSize.min + 
            Math.random() * (this.config.clusterSize.max - this.config.clusterSize.min + 1)
          );
          
          const clusterRadius = 
            this.config.clusterRadius.min + 
            Math.random() * (this.config.clusterRadius.max - this.config.clusterRadius.min);
          
          const primaryType = this.getRandomSeaweedType();
          
          for (let j = 0; j < clusterSize; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * clusterRadius;
            const x = centerX + Math.cos(angle) * distance;
            const z = centerZ + Math.sin(angle) * distance;
            
            let y = centerY;
            try {
              if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
                y = this.landscape.getHeightAtPoint(x, z);
              }
            } catch (e) {}
            
            const position = new BABYLON.Vector3(x, y, z);
            positions.push(position);
            
            const type = Math.random() < 0.9 ? primaryType : this.getRandomSeaweedType();
            const height = this.config.minHeight + Math.random() * (this.config.maxHeight - this.config.minHeight);
            const segments = Math.floor(this.config.minSegments + Math.random() * (this.config.maxSegments - this.config.minSegments + 1));
            const width = this.config.minWidth + Math.random() * (this.config.maxWidth - this.config.minWidth);
            const color = this.getRandomColorForType(type);
            
            const seaweed = new Seaweed(this.scene, position, {
              type: type as 'kelp' | 'seagrass' | 'algae',
              height,
              segments,
              width,
              color,
              variation: Math.random()
            });
            
            this.seaweeds.push(seaweed);
            
            if (positions.length >= this.config.count) break;
          }
        }
      } else {
        const x = (Math.random() - 0.5) * this.config.spawnRadius * 2;
        const z = (Math.random() - 0.5) * this.config.spawnRadius * 2;
        
        let tooClose = false;
        for (const pos of positions) {
          const dx = pos.x - x;
          const dz = pos.z - z;
          const distSquared = dx * dx + dz * dz;
          if (distSquared < this.config.minDistance * this.config.minDistance) {
            tooClose = true;
            break;
          }
        }
        
        if (tooClose) continue;
        
        let y = 0;
        try {
          if (this.landscape && typeof this.landscape.getHeightAtPoint === 'function') {
            y = this.landscape.getHeightAtPoint(x, z);
          }
        } catch (e) {
          console.warn("Could not get terrain height, using default");
        }
        
        if (y < 0) {
          const position = new BABYLON.Vector3(x, y, z);
          positions.push(position);
          
          const type = this.getRandomSeaweedType();
          const height = this.config.minHeight + Math.random() * (this.config.maxHeight - this.config.minHeight);
          const segments = Math.floor(this.config.minSegments + Math.random() * (this.config.maxSegments - this.config.minSegments + 1));
          const width = this.config.minWidth + Math.random() * (this.config.maxWidth - this.config.minWidth);
          const color = this.getRandomColorForType(type);
          
          const seaweed = new Seaweed(this.scene, position, {
            type: type as 'kelp' | 'seagrass' | 'algae',
            height,
            segments,
            width,
            color,
            variation: Math.random()
          });
          
          this.seaweeds.push(seaweed);
        }
      }
    }
  }
  
  update() {}
  
  dispose() {
    this.seaweeds.forEach(seaweed => seaweed.dispose());
    this.seaweeds = [];
  }
}
