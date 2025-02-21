// Day-Night Cycle class for managing time and lighting
class DayNightCycle {
    constructor(scene) {
        this.scene = scene;
        this.ORBIT_RADIUS = 1000;
        this.ORBIT_HEIGHT_MAX = 800;
        this.ORBIT_HEIGHT_MIN = -200;
        this.SUNRISE_HOUR = 6;
        this.SUNSET_HOUR = 18;
        
        // Time management
        this.timeScale = 1200; // 1 real second = 20 game minutes
        this.gameTime = 8 * 60; // Start at 8:00 AM
        
        this.createSkybox();
        this.createLights();
        this.createCelestialBodies();
        this.createStars();
        this.createAtmosphericEffects();
        
        // Initialize update loop
        this.scene.onBeforeRenderObservable.add(() => {
            const deltaTime = this.scene.getEngine().getDeltaTime() * 0.001;
            this.update(deltaTime);
        });

        // Add performance optimization properties
        this.frameCount = 0;
        this._lastTimeState = '';
        this._shadowQualityNight = 1024; // Reduced shadow quality at night
        this._shadowQualityDay = 2048;   // Higher shadow quality during day
        this._lastLightUpdate = 0;
        this._lightUpdateInterval = 100;  // Update lighting every 100ms
        
        // Cache frequently used calculations
        this._cachedSunHeight = 0;
        this._cachedNormalizedHeight = 0;
        this._lastShadowUpdate = 0;
        this._shadowUpdateInterval = 500; // Update shadows every 500ms
    }

    update(delta) {
        this.frameCount++;
        
        // Update game time
        this.gameTime += delta * this.timeScale / 60;
        if (this.gameTime >= 24 * 60) {
            this.gameTime = 0;
        }
        
        // Cache sun height calculations
        const hours = this.gameTime / 60;
        const sunAngle = ((hours - this.SUNRISE_HOUR) / 24) * Math.PI * 2;
        this._cachedSunHeight = this.calculateCelestialHeight(hours, this.SUNRISE_HOUR, this.SUNSET_HOUR);
        this._cachedNormalizedHeight = (this._cachedSunHeight - this.ORBIT_HEIGHT_MIN) / 
                                     (this.ORBIT_HEIGHT_MAX - this.ORBIT_HEIGHT_MIN);
        
        // Update components with different frequencies
        this.updateCelestialPositions(hours);
        
        const now = performance.now();
        
        // Update lighting less frequently
        if (now - this._lastLightUpdate > this._lightUpdateInterval) {
            this.updateLighting(hours);
            this._lastLightUpdate = now;
        }
        
        // Update shadows less frequently and with dynamic quality
        if (now - this._lastShadowUpdate > this._shadowUpdateInterval) {
            this.updateShadowQuality(this._cachedSunHeight < 0);
            this._lastShadowUpdate = now;
        }
        
        // Update sky colors and atmospheric effects
        this.updateSkyColors(hours);
        this.updateAtmosphericEffects(hours);
    }

    // Get current game time in minutes
    getGameTime() {
        return this.gameTime;
    }

    // Get current hour (0-23)
    getCurrentHour() {
        return Math.floor(this.gameTime / 60);
    }

    // Set time scale (minutes per real second)
    setTimeScale(scale) {
        this.timeScale = scale;
    }

    // Set specific time (in minutes)
    setTime(timeInMinutes) {
        this.gameTime = timeInMinutes % (24 * 60);
    }

    createLights() {
        // Main directional light (sun)
        this.sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(0, -1, 0), this.scene);
        this.sunLight.intensity = 0.8;
        this.sunLight.shadowEnabled = true;
        this.sunLight.shadowMinZ = 1;
        this.sunLight.shadowMaxZ = 1000;

        // Create shadow generator with safe defaults
        try {
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sunLight);
            this.shadowGenerator.useExponentialShadowMap = true;
            this.shadowGenerator.blurScale = 1; // Reduced blur
            this.shadowGenerator.setDarkness(0.5);
            this.shadowGenerator.bias = 0.001;
            this.shadowGenerator.normalBias = 0.02;
            
            // Only enable advanced features if supported
            if (this.scene.getEngine().getCaps().standardDerivatives) {
                this.shadowGenerator.useContactHardeningShadow = true;
                this.shadowGenerator.contactHardeningLightSizeUVRatio = 0.03;
                this.shadowGenerator.usePercentageCloserFiltering = false; // Disabled PCF for sharper shadows
            }
        } catch (error) {
            console.warn("Failed to initialize advanced shadow features:", error);
            // Fallback to basic shadows
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sunLight, true);
            this.shadowGenerator.useExponentialShadowMap = true;
        }
        
        // Create ambient light for better performance
        this.ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        this.ambientLight.intensity = 0.3;
        this.ambientLight.groundColor = new BABYLON.Color3(0.05, 0.1, 0.15);
        this.ambientLight.specular = new BABYLON.Color3(0.1, 0.1, 0.1);

        // Initialize volumetric light after scene is ready
        this.volumetricLight = null;
        this.scene.executeWhenReady(() => {
            this._initializeVolumetricLight();
        });
    }

    _initializeVolumetricLight() {
        try {
            // Ensure we have a camera
            if (!this.scene.activeCamera) {
                console.warn("No active camera found for volumetric light");
                return;
            }

            // Create a mesh to emit the volumetric light from
            const emitter = BABYLON.MeshBuilder.CreateBox("volumetricLightEmitter", { size: 0.1 }, this.scene);
            emitter.position = new BABYLON.Vector3(0, 100, 0);
            emitter.isVisible = false;

            // Create volumetric light post-process
            this.volumetricLight = new BABYLON.VolumetricLightScatteringPostProcess(
                'volumetric',
                1.0,
                this.scene.activeCamera,
                emitter,
                50,
                BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                this.scene.getEngine(),
                false
            );

            // Configure volumetric light
            this.volumetricLight.exposure = 0.15;
            this.volumetricLight.decay = 0.95;
            this.volumetricLight.weight = 0.2;
            this.volumetricLight.density = 0.5;

            // Add safety check for mesh updates
            this.volumetricLight.onActivate = () => {
                if (emitter.position && this.scene.activeCamera) {
                    emitter.position.copyFrom(this.scene.activeCamera.position);
                    emitter.position.y += 50;
                }
            };

            // Store emitter for updates
            this.volumetricLightEmitter = emitter;

            console.log("Volumetric light initialized successfully");
        } catch (error) {
            console.warn("Failed to initialize volumetric light:", error);
            this.volumetricLight = null;
        }
    }

    // Add method to register meshes for shadows
    addShadowCaster(mesh) {
        if (this.shadowGenerator && mesh) {
            this.shadowGenerator.addShadowCaster(mesh);
            mesh.receiveShadows = true;
        }
    }

    // Add method to register multiple meshes for shadows
    addShadowCasters(meshes) {
        meshes.forEach(mesh => this.addShadowCaster(mesh));
    }

    createSkybox() {
        // Create skybox
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        this.skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skyboxMaterial.disableLighting = true;
        this.skybox.material = this.skyboxMaterial;

        // Create sky gradient
        const skyTexture = new BABYLON.DynamicTexture("skyTexture", {width: 512, height: 512}, this.scene);
        this.skyboxMaterial.emissiveTexture = skyTexture;
        this.skyTexture = skyTexture;
    }

    createCelestialBodies() {
        // Create sun
        this.sun = BABYLON.MeshBuilder.CreateDisc("sun", { radius: 50 }, this.scene);
        const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", this.scene);
        sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.3);
        sunMaterial.disableLighting = true;
        this.sun.material = sunMaterial;
        this.sun.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // Create sun glow
        this.sunGlow = new BABYLON.GlowLayer("sunGlow", this.scene, {
            mainTextureFixedSize: 512,
            blurKernelSize: 64
        });
        this.sunGlow.intensity = 0.5;
        this.sunGlow.addIncludedOnlyMesh(this.sun);

        // Create moon
        this.moon = BABYLON.MeshBuilder.CreateDisc("moon", { radius: 30 }, this.scene);
        const moonMaterial = new BABYLON.StandardMaterial("moonMaterial", this.scene);
        moonMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.9);
        moonMaterial.disableLighting = true;
        this.moon.material = moonMaterial;
        this.moon.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // Create moon glow
        this.moonGlow = new BABYLON.GlowLayer("moonGlow", this.scene, {
            mainTextureFixedSize: 512,
            blurKernelSize: 64
        });
        this.moonGlow.intensity = 0.3;
        this.moonGlow.addIncludedOnlyMesh(this.moon);
    }

    createStars() {
        // Create stars with instancing for better performance
        const starCount = 300; // Reduced from 1000
        const baseStarMesh = BABYLON.MeshBuilder.CreateBox("starBase", { size: 0.5 }, this.scene);
        
        // Create instance buffer for better performance
        this.starInstances = [];
        this.starInstanceBuffer = new BABYLON.InstancedMesh("star", baseStarMesh);
        
        const starColors = [
            new BABYLON.Color3(1, 1, 1),    // White
            new BABYLON.Color3(0.9, 0.9, 1), // Bluish white
            new BABYLON.Color3(1, 0.9, 0.7), // Yellowish
            new BABYLON.Color3(1, 0.8, 0.8)  // Reddish
        ];

        // Create star material once
        const starMaterial = new BABYLON.StandardMaterial("starMat", this.scene);
        starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        starMaterial.disableLighting = true;
        this.starInstanceBuffer.material = starMaterial;

        for (let i = 0; i < starCount; i++) {
            // Create more realistic star distribution
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.acos(2 * Math.random() - 1);
            const radius = 400 + Math.random() * 200;
            
            const instance = this.starInstanceBuffer.createInstance("star_" + i);
            instance.position = new BABYLON.Vector3(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(theta)
            );
            
            // Scale randomly for variety
            const scale = 0.2 + Math.random() * 0.4;
            instance.scaling = new BABYLON.Vector3(scale, scale, scale);
            
            // Store instance data for updates
            this.starInstances.push({
                instance,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinkleAmount: 0.3 + Math.random() * 0.7,
                baseColor: starColors[Math.floor(Math.random() * starColors.length)]
            });
        }

        // Hide base mesh
        baseStarMesh.isVisible = false;
        
        // Create buffer for batch updates
        this.starUpdateBuffer = new Float32Array(this.starInstances.length * 4); // position + alpha
    }

    createAtmosphericEffects() {
        // Create fog
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.001;
        this.scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    }

    updateCelestialPositions(hours) {
        // Calculate sun position
        const sunAngle = ((hours - this.SUNRISE_HOUR) / 24) * Math.PI * 2;
        const sunHeight = this.calculateCelestialHeight(hours, this.SUNRISE_HOUR, this.SUNSET_HOUR);
        
        this.sun.position = new BABYLON.Vector3(
            Math.cos(sunAngle) * this.ORBIT_RADIUS,
            sunHeight,
            Math.sin(sunAngle) * this.ORBIT_RADIUS
        );

        // Calculate moon position (opposite to sun)
        const moonAngle = sunAngle + Math.PI;
        const moonHeight = this.calculateCelestialHeight(hours, this.SUNSET_HOUR, this.SUNRISE_HOUR + 24);
        
        this.moon.position = new BABYLON.Vector3(
            Math.cos(moonAngle) * this.ORBIT_RADIUS,
            moonHeight,
            Math.sin(moonAngle) * this.ORBIT_RADIUS
        );

        // Update directional light to match sun position and adjust shadow properties
        this.sunLight.direction = this.sun.position.scale(-1).normalize();
        
        // Adjust shadow darkness based on time of day
        const isNight = sunHeight < 0;
        const twilightZone = Math.abs(sunHeight) < 100;
        
        if (isNight) {
            this.shadowGenerator.darkness = 0.7;
            this.shadowGenerator.bias = 0.002;
            this.shadowGenerator.blurScale = 1;
        } else if (twilightZone) {
            this.shadowGenerator.darkness = 0.5;
            this.shadowGenerator.bias = 0.001;
            this.shadowGenerator.blurScale = 1;
        } else {
            this.shadowGenerator.darkness = 0.3;
            this.shadowGenerator.bias = 0.0005;
            this.shadowGenerator.blurScale = 1;
        }

        // Remove blur box offset adjustment
        this.shadowGenerator.blurBoxOffset = 1;
    }

    calculateCelestialHeight(currentHour, riseHour, setHour) {
        let hour = currentHour % 24;
        let transitHour = (riseHour + ((setHour - riseHour) / 2)) % 24;
        let adjustedSetHour = setHour;
        
        // Normalize hours to handle day/night cycle
        if (hour < riseHour) hour += 24;
        if (transitHour < riseHour) transitHour += 24;
        if (adjustedSetHour < riseHour) adjustedSetHour += 24;

        // Calculate progress through celestial arc
        if (hour >= riseHour && hour <= adjustedSetHour) {
            const progress = (hour - riseHour) / (adjustedSetHour - riseHour);
            // Use sine curve for smooth movement
            return this.ORBIT_HEIGHT_MIN + (this.ORBIT_HEIGHT_MAX - this.ORBIT_HEIGHT_MIN) * 
                   Math.sin(progress * Math.PI);
        }
        
        return this.ORBIT_HEIGHT_MIN;
    }

    updateShadowQuality(isNight) {
        if (!this.shadowGenerator || !this.shadowGenerator.getShadowMap()) return;
        
        try {
            // Adjust shadow quality based on time of day
            const targetQuality = isNight ? this._shadowQualityNight : this._shadowQualityDay;
            
            if (this.shadowGenerator.getShadowMap().getRenderSize() !== targetQuality) {
                this.shadowGenerator.getShadowMap().resize(targetQuality);
                
                // Adjust other shadow properties for night
                if (isNight) {
                    this.shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW;
                    this.shadowGenerator.blurScale = 1;
                    this.shadowGenerator.usePercentageCloserFiltering = false;
                    this.shadowGenerator.bias = 0.002;
                    this.shadowGenerator.normalBias = 0.02;
                } else {
                    this.shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM;
                    this.shadowGenerator.blurScale = 1;
                    this.shadowGenerator.usePercentageCloserFiltering = false;
                    this.shadowGenerator.bias = 0.001;
                    this.shadowGenerator.normalBias = 0.01;
                }
            }
        } catch (error) {
            console.warn("Failed to update shadow quality:", error);
        }
    }

    updateLighting(hours) {
        const sunHeight = this._cachedSunHeight;
        const normalizedHeight = this._cachedNormalizedHeight;
        
        // Update sun light intensity with smoother transition
        const baseSunIntensity = Math.max(0, normalizedHeight) * 0.8;
        this.sunLight.intensity = baseSunIntensity * 0.5;

        // Update sun color based on height
        const sunsetProgress = Math.max(0, Math.min(1, 1 - Math.abs(normalizedHeight)));
        const targetColor = BABYLON.Color3.Lerp(
            new BABYLON.Color3(0.4, 0.6, 0.8),
            new BABYLON.Color3(0.6, 0.3, 0.2),
            sunsetProgress
        );
        
        // Smooth color transition
        BABYLON.Color3.LerpToRef(
            this.sunLight.diffuse,
            targetColor,
            0.1,
            this.sunLight.diffuse
        );

        // Update ambient light with less frequency
        const isNight = sunHeight < 0;
        const twilightZone = Math.abs(sunHeight) < 100;
        
        if (isNight) {
            this.ambientLight.intensity = twilightZone ? 0.15 : 0.1;
            this.ambientLight.diffuse.set(0.05, 0.1, 0.15);
            this.moonGlow.intensity = 0.2;
            this.sunGlow.intensity = 0;
        } else {
            this.ambientLight.intensity = twilightZone ? 0.2 : 0.3;
            this.ambientLight.diffuse.set(0.2, 0.4, 0.5);
            this.moonGlow.intensity = 0;
            this.sunGlow.intensity = 0.3;
        }

        // Update volumetric light position if it exists
        if (this.volumetricLight && this.volumetricLightEmitter && this.scene.activeCamera) {
            try {
                // Update emitter position relative to camera
                this.volumetricLightEmitter.position.copyFrom(this.scene.activeCamera.position);
                this.volumetricLightEmitter.position.y += 50;

                // Update volumetric light settings
                if (this.frameCount % 30 === 0) {  // Reduce update frequency
                    const isNight = this._cachedSunHeight < 0;
                    const twilightZone = Math.abs(this._cachedSunHeight) < 100;
                    
                    this.volumetricLight.exposure = isNight ? 0.1 : 0.15;
                    this.volumetricLight.decay = isNight ? 0.97 : 0.95;
                    this.volumetricLight.weight = twilightZone ? 0.2 : 0.15;
                }
            } catch (error) {
                console.warn("Error updating volumetric light:", error);
            }
        }

        // Update star visibility and twinkling
        const starVisibility = Math.max(0, Math.min(1, (100 - sunHeight) / 200));
        this.starInstances.forEach(star => {
            if (star.instance.material) {
                const time = performance.now() * 0.001;
                const twinkle = Math.sin(time * star.twinkleSpeed) * star.twinkleAmount;
                star.instance.material.alpha = starVisibility * (0.7 + twinkle * 0.3);
                star.instance.material.emissiveColor = star.baseColor.scale(0.8 + twinkle * 0.2);
            }
        });
    }

    updateSkyColors(hours) {
        const ctx = this.skyTexture.getContext();
        const grd = ctx.createLinearGradient(0, 0, 0, 512);

        const sunHeight = this.sun.position.y;
        const isSunrise = hours >= this.SUNRISE_HOUR - 1 && hours <= this.SUNRISE_HOUR + 1;
        const isSunset = hours >= this.SUNSET_HOUR - 1 && hours <= this.SUNSET_HOUR + 1;
        
        if (sunHeight > 0) {
            if (isSunrise || isSunset) {
                // Dawn/Dusk colors with more dramatic gradient
                grd.addColorStop(0, "#FF6B4A");    // Deep orange
                grd.addColorStop(0.2, "#FF9E8F");  // Soft pink
                grd.addColorStop(0.4, "#FFB6C1");  // Light pink
                grd.addColorStop(0.6, "#87CEEB");  // Sky blue
                grd.addColorStop(0.8, "#4169E1");  // Royal blue
                grd.addColorStop(1, "#191970");    // Midnight blue
            } else {
                // Daytime colors with more depth
                grd.addColorStop(0, "#00BFFF");    // Deep sky blue
                grd.addColorStop(0.5, "#87CEEB");  // Sky blue
                grd.addColorStop(1, "#E0FFFF");    // Light cyan
            }
        } else {
            // Nighttime colors with more stars visible
            grd.addColorStop(0, "#000033");    // Dark blue
            grd.addColorStop(0.5, "#0000FF");  // Deep blue
            grd.addColorStop(1, "#191970");    // Midnight blue
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 512, 512);
        this.skyTexture.update();
    }

    updateAtmosphericEffects(hours) {
        const sunHeight = this.sun.position.y;
        const normalizedHeight = (sunHeight - this.ORBIT_HEIGHT_MIN) / 
                               (this.ORBIT_HEIGHT_MAX - this.ORBIT_HEIGHT_MIN);
        
        // Update fog based on time of day
        const isSunrise = hours >= this.SUNRISE_HOUR - 1 && hours <= this.SUNRISE_HOUR + 1;
        const isSunset = hours >= this.SUNSET_HOUR - 1 && hours <= this.SUNSET_HOUR + 1;
        const isNight = sunHeight < 0;

        // Batch update fog properties
        if (this._lastTimeState !== (isNight ? 'night' : isSunrise || isSunset ? 'twilight' : 'day')) {
            this._lastTimeState = isNight ? 'night' : isSunrise || isSunset ? 'twilight' : 'day';
            
            if (isSunrise || isSunset) {
                this.scene.fogDensity = 0.005;
                this.scene.fogColor.set(0.9, 0.6, 0.4);
            } else if (isNight) {
                this.scene.fogDensity = 0.003;
                this.scene.fogColor.set(0.05, 0.05, 0.15);
            } else {
                this.scene.fogDensity = 0.001;
                this.scene.fogColor.set(0.7, 0.8, 1.0);
            }
        }

        // Batch update stars visibility and twinkling
        if (this.starInstances && this.frameCount % 2 === 0) {
            const starVisibility = Math.max(0, Math.min(1, (100 - sunHeight) / 200));
            const time = performance.now() * 0.001;
            
            // Update all stars in a batch
            for (let i = 0; i < this.starInstances.length; i++) {
                const star = this.starInstances[i];
                const twinkle = Math.sin(time * star.twinkleSpeed) * star.twinkleAmount;
                const alpha = starVisibility * (0.7 + twinkle * 0.3);
                
                // Update instance visibility and color
                if (alpha > 0.01) {
                    star.instance.isVisible = true;
                    const scale = 0.8 + twinkle * 0.2;
                    star.instance.scaling.setAll(scale * (0.2 + Math.random() * 0.4));
                } else {
                    star.instance.isVisible = false;
                }
            }
        }
    }

    dispose() {
        this.sunLight.dispose();
        this.ambientLight.dispose();
        this.skybox.dispose();
        this.skyboxMaterial.dispose();
        this.skyTexture.dispose();
        this.sun.dispose();
        this.moon.dispose();
        this.sunGlow.dispose();
        this.moonGlow.dispose();
        this.starInstances.forEach(star => star.instance.dispose());
        if (this.volumetricLight) {
            this.volumetricLight.dispose();
        }
        if (this.shadowGenerator) {
            this.shadowGenerator.dispose();
        }
        if (this.volumetricLightEmitter) {
            this.volumetricLightEmitter.dispose();
        }
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayNightCycle;
} else if (typeof window !== 'undefined') {
    window.DayNightCycle = DayNightCycle;
} 