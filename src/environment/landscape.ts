interface NavMeshParams {
  cs: number;
  ch: number;
  walkableSlopeAngle: number;
  walkableHeight: number;
  walkableClimb: number;
  walkableRadius: number;
  maxEdgeLen: number;
  maxSimplificationError: number;
  minRegionArea: number;
  mergeRegionArea: number;
  maxVertsPerPoly: number;
  detailSampleDist: number;
  detailSampleMaxError: number;
}

export class UnderwaterLandscape {
  scene: any;
  navigationPlugin: any = null;
  navMeshParameters: NavMeshParams;
  terrain: any = null;
  waterBox: any = null;

  constructor(scene: any) {
    this.scene = scene;
    this.navigationPlugin = null;
    this.navMeshParameters = {
      cs: 0.2,
      ch: 0.2,
      walkableSlopeAngle: 35,
      walkableHeight: 1.0,
      walkableClimb: 1.0,
      walkableRadius: 1.0,
      maxEdgeLen: 12.0,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 20,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
    };
  }

  async initializeNavigation() {
    const recastInstance = await (window as any).Recast();
    this.navigationPlugin = new (window as any).BABYLON.RecastJSPlugin(recastInstance);
    console.log("Navigation plugin initialized");
  }

  async setup() {
    try {
      await this.initializeNavigation();

      return new Promise<void>((resolve) => {
        const BABYLON = (window as any).BABYLON;
        
        this.terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
          'terrain',
          'https://playground.babylonjs.com/textures/heightMap.png',
          {
            width: 100,
            height: 100,
            subdivisions: 50,
            minHeight: 0,
            maxHeight: 10,
            onReady: async (mesh: any) => {
              const terrainMaterial = new BABYLON.StandardMaterial('terrainMaterial', this.scene);
              terrainMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.5);
              terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
              terrainMaterial.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.2);
              terrainMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
              mesh.material = terrainMaterial;
              mesh.position.y = -10;

              this.waterBox = BABYLON.MeshBuilder.CreateBox(
                'waterBox',
                { width: 100, height: 40, depth: 100 },
                this.scene
              );
              const waterMaterial = new BABYLON.StandardMaterial('waterMaterial', this.scene);
              waterMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
              waterMaterial.specularColor = new BABYLON.Color3(0.3, 0.4, 0.5);
              waterMaterial.ambientColor = new BABYLON.Color3(0.2, 0.3, 0.4);
              waterMaterial.alpha = 0.3;
              waterMaterial.backFaceCulling = false;
              waterMaterial.useSpecularOverAlpha = true;
              waterMaterial.useReflectionOverAlpha = true;
              waterMaterial.useReflectionFresnelFromSpecular = true;
              this.waterBox.material = waterMaterial;
              this.waterBox.position.y = 10;

              try {
                await this.createNavigationMesh();
                
                const SimulationConfig = (window as any).SimulationConfig;
                if (SimulationConfig?.debug?.showNavMesh) {
                  this.debugDrawNavMesh();
                }

                console.log("Landscape setup complete");
                resolve();
              } catch (error) {
                console.error("Error creating navigation mesh:", error);
                resolve();
              }
            }
          },
          this.scene
        );
      });
    } catch (error) {
      console.error("Error setting up landscape:", error);
      throw error;
    }
  }

  async createNavigationMesh() {
    try {
      const navmeshGround = this.terrain.clone("navmeshGround");
      
      navmeshGround.position = this.terrain.position.clone();
      navmeshGround.scaling = this.terrain.scaling.clone();
      navmeshGround.rotation = this.terrain.rotation.clone();
      navmeshGround.computeWorldMatrix(true);
      
      navmeshGround.isVisible = false;
      navmeshGround.isPickable = false;

      const navmeshParams = { ...this.navMeshParameters };

      await this.navigationPlugin.createNavMesh([navmeshGround], navmeshParams);
      this.navigationPlugin.createDebugNavMesh();
      
      navmeshGround.dispose();
      console.log("Navigation mesh created successfully");
    } catch (error) {
      console.error("Failed to create navigation mesh:", error);
      throw error;
    }
  }

  debugDrawNavMesh() {
    try {
      if (!this.navigationPlugin) {
        console.warn("No navigation plugin available for visualization");
        return;
      }

      const BABYLON = (window as any).BABYLON;
      const debugMesh = new BABYLON.Mesh('navmeshDebug', this.scene);
      
      const navmeshVertexData = new BABYLON.VertexData();
      const navmeshData = this.navigationPlugin.getNavMeshData();
      
      if (!navmeshData) {
        console.warn("No navigation mesh data available");
        return;
      }

      navmeshVertexData.positions = navmeshData.positions;
      navmeshVertexData.indices = navmeshData.indices;
      
      navmeshVertexData.applyToMesh(debugMesh);
      
      const debugMaterial = new BABYLON.StandardMaterial('navmeshDebugMat', this.scene);
      debugMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
      debugMaterial.alpha = 0.3;
      debugMaterial.wireframe = true;
      debugMesh.material = debugMaterial;
      
      debugMesh.position.y = this.terrain.position.y + 0.1;
      debugMesh.renderingGroupId = 1;

      console.log("Navigation mesh visualization created");
    } catch (error) {
      console.error("Failed to create navigation mesh visualization:", error);
    }
  }

  getNavigationPlugin() {
    return this.navigationPlugin;
  }

  getTerrain() {
    return this.terrain;
  }

  getWaterBox() {
    return this.waterBox;
  }

  getHeightAtPoint(x: number, z: number): number {
    if (!this.terrain) return -10;
    
    const BABYLON = (window as any).BABYLON;
    const ray = new BABYLON.Ray(
      new BABYLON.Vector3(x, 100, z),
      new BABYLON.Vector3(0, -1, 0),
      200
    );
    const pick = this.scene.pickWithRay(ray, (mesh: any) => mesh === this.terrain);
    return pick?.pickedPoint?.y || this.terrain.position.y;
  }

  getNearestNavigablePoint(position: any): any {
    if (!this.navigationPlugin) return position;
    try {
      return this.navigationPlugin.getClosestPoint(position);
    } catch (error) {
      console.warn("Failed to get nearest navigable point:", error);
      return position;
    }
  }

  isPointNavigable(position: any): boolean {
    if (!this.navigationPlugin) return false;
    try {
      const navPoint = this.navigationPlugin.getClosestPoint(position);
      const BABYLON = (window as any).BABYLON;
      return navPoint && BABYLON.Vector3.Distance(position, navPoint) < 0.5;
    } catch (error) {
      console.warn("Failed to check if point is navigable:", error);
      return false;
    }
  }

  getRandomNavigablePosition(): any {
    const BABYLON = (window as any).BABYLON;
    if (!this.navigationPlugin) return new BABYLON.Vector3(0, -10, 0);

    const margin = 5;
    const maxAttempts = 50;
    let attempts = 0;
    const SimulationConfig = (window as any).SimulationConfig;

    while (attempts < maxAttempts) {
      try {
        const x = (Math.random() - 0.5) * (100 - 2 * margin);
        const z = (Math.random() - 0.5) * (100 - 2 * margin);
        const y = this.getHeightAtPoint(x, z);
        const position = new BABYLON.Vector3(x, y, z);

        const navPoint = this.navigationPlugin.getClosestPoint(position);
        
        if (navPoint) {
          navPoint.y = this.getHeightAtPoint(navPoint.x, navPoint.z) + 
                      (SimulationConfig?.entities?.crabs?.spawnHeight || 0.1);
          
          if (SimulationConfig?.debug?.logSpawnPositions) {
            console.log(`Found valid position at: ${navPoint.x.toFixed(2)}, ${navPoint.y.toFixed(2)}, ${navPoint.z.toFixed(2)}`);
          }
          return navPoint;
        }
      } catch (error) {
        console.warn("Error finding random position:", error);
      }
      attempts++;
    }

    console.warn("Could not find valid random position, using center");
    const center = new BABYLON.Vector3(0, this.getHeightAtPoint(0, 0) + 
                  (SimulationConfig?.entities?.crabs?.spawnHeight || 0.1), 0);
    return this.navigationPlugin.getClosestPoint(center) || center;
  }
}
