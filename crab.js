// Crab class extending Yuka's Vehicle
class Crab extends YUKA.Vehicle {
    constructor(navigationPlugin, landscape) {
        super();
        this.maxSpeed = 2;
        this.maxForce = 0.5;
        this.updateNeighborhood = true;
        this.neighborhoodRadius = 5;
        this.currentPath = null;
        this.pathIndex = 0;
        this.navigationPlugin = navigationPlugin;
        this.landscape = landscape;
        this.waitTime = 0;
        this.waitDuration = 3 + Math.random() * 2; // Random wait time between 3-5 seconds
    }

    update(delta) {
        if (this.waitTime > 0) {
            this.waitTime -= delta;
            if (this.waitTime <= 0) {
                this.setNewRandomDestination();
            }
            return super.update(delta);
        }

        if (this.currentPath && this.currentPath.length > 0) {
            const target = this.currentPath[this.pathIndex];
            const distance = this.position.distanceTo(target);

            if (distance < 0.5) {
                this.pathIndex++;
                if (this.pathIndex >= this.currentPath.length) {
                    // Path completed, wait before new destination
                    this.waitTime = this.waitDuration;
                    this.steering.clear();
                }
            } else {
                // Update steering to follow current path point
                this.steering.clear();
                const seekBehavior = new YUKA.SeekBehavior(target);
                this.steering.add(seekBehavior);
            }
        }

        // Ensure crab stays on terrain
        const groundY = this.landscape.getHeightAtPoint(this.position.x, this.position.z);
        this.position.y = groundY + 0.5; // Offset to keep crab above ground

        return super.update(delta);
    }

    setNewRandomDestination() {
        const destination = this.landscape.getRandomNavigablePosition();
        
        if (!destination) {
            console.warn('Could not find valid destination for crab');
            return;
        }

        const startPos = new BABYLON.Vector3(this.position.x, this.position.y, this.position.z);
        const endPos = destination;
        
        const path = this.navigationPlugin.computePath(startPos, endPos);
        
        if (path && path.length > 0) {
            this.currentPath = path.map(p => new YUKA.Vector3(p.x, p.y, p.z));
            this.pathIndex = 0;
            
            // Set seek behavior to first point
            this.steering.clear();
            const seekBehavior = new YUKA.SeekBehavior(this.currentPath[0]);
            seekBehavior.weight = 1;
            this.steering.add(seekBehavior);
        } else {
            // If no path found, try again after a short delay
            this.waitTime = 1;
        }
    }
}

// Crab mesh creator
class CrabMeshCreator {
    static createMesh(scene) {
        // Create crab body
        const body = BABYLON.MeshBuilder.CreateBox(
            'crabBody',
            { width: 1, height: 0.5, depth: 0.8 },
            scene
        );

        // Create claws
        const clawLeft = BABYLON.MeshBuilder.CreateBox(
            'clawLeft',
            { width: 0.4, height: 0.3, depth: 0.3 },
            scene
        );
        clawLeft.position.set(0.7, 0, 0.3);

        const clawRight = clawLeft.clone('clawRight');
        clawRight.position.x = -0.7;

        // Create legs (simplified)
        const legs = [];
        for (let i = 0; i < 6; i++) {
            const leg = BABYLON.MeshBuilder.CreateCylinder(
                `leg${i}`,
                { diameter: 0.1, height: 0.4 },
                scene
            );
            leg.rotation.z = Math.PI / 2;
            leg.position.y = -0.2;
            leg.position.x = (i < 3 ? 0.4 : -0.4);
            leg.position.z = (i % 3 - 1) * 0.3;
            legs.push(leg);
        }

        // Merge all parts
        const crab = BABYLON.Mesh.MergeMeshes(
            [body, clawLeft, clawRight, ...legs],
            true
        );

        // Create and apply material
        const crabMaterial = new BABYLON.StandardMaterial('crabMaterial', scene);
        crabMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.2);
        crab.material = crabMaterial;

        return crab;
    }
}

// Crab manager class
class CrabManager {
    constructor(scene, navigationPlugin, landscape) {
        this.scene = scene;
        this.navigationPlugin = navigationPlugin;
        this.landscape = landscape;
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();
        this.crabs = [];
    }

    createCrabs(numCrabs = 10) {
        for (let i = 0; i < numCrabs; i++) {
            const crab = new Crab(this.navigationPlugin, this.landscape);
            
            // Get random navigable spawn position
            const spawnPos = this.landscape.getRandomNavigablePosition();
            crab.position.set(spawnPos.x, spawnPos.y + 0.5, spawnPos.z);
            crab.rotation.fromEuler(0, Math.random() * Math.PI * 2, 0);

            const crabMesh = CrabMeshCreator.createMesh(this.scene);
            crabMesh.bakeCurrentTransformIntoVertices();
            crabMesh.freezeWorldMatrix();

            crab.setRenderComponent(crabMesh, (entity, renderComponent) => {
                BABYLON.Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent);
            });

            crab.setNewRandomDestination();
            this.entityManager.add(crab);
            this.crabs.push(crab);
        }
    }

    update() {
        const delta = this.time.update().getDelta();
        this.entityManager.update(delta);
    }
} 