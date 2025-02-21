class BasicFish {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            bodyColor: options.bodyColor || new BABYLON.Color3(
                0.4 + Math.random() * 0.3,
                0.7 + Math.random() * 0.3,
                0.9
            ),
            scale: options.scale || 1.0,
            bodyLength: options.bodyLength || 1.0,
            bodyWidth: options.bodyWidth || 0.2,
            tailSize: options.tailSize || 0.4,
            finSize: options.finSize || 0.3
        };
    }

    create() {
        // Create fish body
        const body = this._createBody();
        const tail = this._createTail();
        const [finLeft, finRight] = this._createFins();
        
        // Merge all parts
        const fish = BABYLON.Mesh.MergeMeshes(
            [body, tail, finLeft, finRight],
            true,
            undefined,
            undefined,
            undefined,
            true
        );

        // Apply material
        const material = this._createMaterial();
        fish.material = material;

        // Apply transformations
        fish.scaling.scaleInPlace(this.options.scale);
        
        return fish;
    }

    _createBody() {
        const body = BABYLON.MeshBuilder.CreateCapsule(
            'fishBody',
            {
                radius: this.options.bodyWidth,
                height: this.options.bodyLength
            },
            this.scene
        );
        return body;
    }

    _createTail() {
        const tail = BABYLON.MeshBuilder.CreateCylinder(
            'fishTail',
            {
                diameterTop: this.options.tailSize,
                diameterBottom: 0,
                height: this.options.tailSize * 1.25
            },
            this.scene
        );
        
        // Position and rotate tail
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -(this.options.bodyLength / 2 + this.options.tailSize / 2);
        
        return tail;
    }

    _createFins() {
        // Create left fin
        const finLeft = BABYLON.MeshBuilder.CreateCylinder(
            'finLeft',
            {
                diameterTop: this.options.finSize,
                diameterBottom: 0,
                height: this.options.finSize
            },
            this.scene
        );
        finLeft.rotation.z = -Math.PI / 4;
        finLeft.position.set(
            this.options.bodyWidth * 1.5,
            0,
            0
        );

        // Create right fin (clone of left)
        const finRight = finLeft.clone('finRight');
        finRight.rotation.z = Math.PI / 4;
        finRight.position.x = -this.options.bodyWidth * 1.5;

        return [finLeft, finRight];
    }

    _createMaterial() {
        const material = new BABYLON.StandardMaterial('fishMaterial', this.scene);
        
        // Base color
        material.diffuseColor = this.options.bodyColor;
        
        // Add slight specularity for wet look
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.specularPower = 32;
        
        // Add slight emissive for underwater glow
        material.emissiveColor = this.options.bodyColor.scale(0.1);
        
        // Slight transparency
        material.alpha = 0.9;

        return material;
    }

    static createRandom(scene) {
        // Create fish with random variations
        const options = {
            bodyColor: new BABYLON.Color3(
                0.4 + Math.random() * 0.3,
                0.7 + Math.random() * 0.3,
                0.9
            ),
            scale: 0.9 + Math.random() * 0.2,
            bodyLength: 0.9 + Math.random() * 0.2,
            bodyWidth: 0.18 + Math.random() * 0.04,
            tailSize: 0.35 + Math.random() * 0.1,
            finSize: 0.25 + Math.random() * 0.1
        };

        return new BasicFish(scene, options).create();
    }
} 