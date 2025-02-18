// Entity handler class to manage all entities in the simulation
class EntityHandler {
    constructor(scene, landscape) {
        this.scene = scene;
        this.landscape = landscape;
        this.crabManager = null;
        this.fishManager = null;
        this.config = SimulationConfig;
    }

    async initialize() {
        try {
            console.log("Initializing entity handler...");
            
            // Initialize crab manager
            console.log(`Creating ${this.config.entities.crabs.count} crabs...`);
            this.crabManager = new CrabManager(
                this.scene,
                this.landscape.getNavigationPlugin(),
                this.landscape
            );
            this.crabManager.createCrabs(this.config.entities.crabs.count);
            
            // Initialize fish manager
            console.log(`Creating ${this.config.entities.fish.count} fish...`);
            this.fishManager = new FishManager(this.scene);
            this.fishManager.createFishSchool(this.config.entities.fish.count);
            
            console.log("Entity initialization complete");
            return true;
        } catch (error) {
            console.error("Failed to initialize entities:", error);
            return false;
        }
    }

    update() {
        if (this.crabManager) this.crabManager.update();
        if (this.fishManager) this.fishManager.update();
    }

    // Utility methods for runtime modifications
    setCrabCount(newCount) {
        if (!this.crabManager) return;
        const currentCount = this.crabManager.crabs.length;
        if (newCount > currentCount) {
            this.crabManager.createCrabs(newCount - currentCount);
        } else if (newCount < currentCount) {
            // Remove excess crabs
            for (let i = currentCount - 1; i >= newCount; i--) {
                const crab = this.crabManager.crabs[i];
                crab.renderComponent.dispose();
                this.crabManager.entityManager.remove(crab);
                this.crabManager.crabs.splice(i, 1);
            }
        }
        console.log(`Adjusted crab count to ${newCount}`);
    }

    setFishCount(newCount) {
        if (!this.fishManager) return;
        const currentCount = this.fishManager.fishes.length;
        if (newCount > currentCount) {
            this.fishManager.createFishSchool(newCount - currentCount);
        } else if (newCount < currentCount) {
            // Remove excess fish
            for (let i = currentCount - 1; i >= newCount; i--) {
                const fish = this.fishManager.fishes[i];
                fish.renderComponent.dispose();
                this.fishManager.entityManager.remove(fish);
                this.fishManager.fishes.splice(i, 1);
            }
        }
        console.log(`Adjusted fish count to ${newCount}`);
    }

    getEntityCounts() {
        return {
            crabs: this.crabManager ? this.crabManager.crabs.length : 0,
            fish: this.fishManager ? this.fishManager.fishes.length : 0
        };
    }
} 