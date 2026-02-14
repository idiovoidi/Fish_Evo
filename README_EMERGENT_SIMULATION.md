# Fish Evolution Simulation - Emergent Behavior Guide

## Quick Start

```bash
npm start
```

Open browser console (F12) to see population statistics.

## What's New

This simulation now features **true emergent behavior** where complex ecosystem dynamics arise from simple individual rules:

### 🐟 Intelligent Fish Behavior
- Fish actively hunt for food with desperation scaling
- Hungry fish break from schools to feed
- Well-fed fish breed and pass on genetics
- Starving fish die naturally

### 🎯 Natural Selection
- Only fit fish (healthy, well-fed) can reproduce
- Breeding costs energy
- Genetic mutations create diversity
- Faster, more efficient fish have survival advantage

### 📊 Population Dynamics
- Real-time population tracking (console logs every 10s)
- Boom-bust cycles emerge naturally
- Resource competition drives evolution
- Death and birth rates balance over time

### 🎨 Visual Feedback
- **Normal**: Natural fish colors
- **Hungry**: Yellow tint, active food seeking
- **Starving**: Red pulsing glow, desperate behavior
- **Breeding**: Courtship dance animation
- **Death**: Sinking, fading animation

## Key Systems

### 1. Food Consumption (`FoodConsumptionSystem`)
- 8-unit detection radius
- Desperation mechanics (hungrier = faster)
- Speed boost up to 1.5x when starving
- Visual eating animation

### 2. Breeding (`BreedingSystem`)
- Requires: 60+ health, <30% hunger, close proximity
- Energy cost: +15% hunger for both parents
- 8% mutation rate with ±15% variation
- Genetic traits: size, speed, metabolism, color

### 3. Hunger & Starvation (`HungerSystem`)
- Progressive damage starting at 70% hunger
- Exponential scaling (starving fish die faster)
- Metabolism affects hunger rate
- Death logging for tracking

### 4. Death & Cleanup (`DeathSystem`)
- 2-second fade-out animation
- Sinking, shrinking, rotating effects
- Automatic entity removal
- Clean simulation state

### 5. Population Stats (`PopulationStatsSystem`)
- Logs every 10 seconds
- Tracks: fish count, adults, starving, food, sharks
- Shows: average hunger, average health
- Formatted console output

### 6. Adaptive Schooling (`SchoolingSystem`)
- Hunger reduces schooling behavior
- Starving fish become individualistic
- Boids algorithm: cohesion, separation, alignment
- Dynamic social behavior

## Configuration

Edit `config/simulation_config.js` to adjust:

```javascript
food: {
    maxParticles: 25,      // Total food in scene
    spawnInterval: 2000,   // Spawn check frequency
    daySpawnRate: 10,      // Food per minute (day)
    nightSpawnRate: 3,     // Food per minute (night)
}
```

## Observing Emergent Behavior

### Phase 1: Competition (0-2 min)
- Initial fish compete for limited food
- Some fish begin to starve
- Faster fish gain advantage

### Phase 2: Selection (2-5 min)
- Weak fish die off
- Survivors breed
- Population stabilizes

### Phase 3: Evolution (5-10 min)
- Offspring mature
- Genetic traits shift
- Adapted fish dominate

### Phase 4: Cycles (10+ min)
- Population oscillates
- Boom-bust patterns emerge
- Ecosystem self-regulates

## Console Statistics

```
╔════════════════════════════════════════════════════════════╗
║ POPULATION STATS (5.2 min)                              
╠════════════════════════════════════════════════════════════╣
║ Fish:     18 (12 adults, 2 starving)
║ Food:     14
║ Sharks:   2
║ Avg Hunger: 52.3%
║ Avg Health: 85.7
╚════════════════════════════════════════════════════════════╝
```

**Healthy Ecosystem Indicators:**
- Fish count: 10-25 (fluctuating)
- Starving count: 0-3 (occasional)
- Avg hunger: 40-60% (balanced)
- Avg health: 70-90 (good condition)

## Experiments to Try

### 1. Survival of the Fittest
Run for 10 minutes and observe which genetic traits dominate.

### 2. Population Crash
Watch what happens when food becomes scarce.

### 3. Recovery Test
Let population drop to 3-5 fish, see if they recover.

### 4. Genetic Drift
Track how offspring traits change over generations.

## Files Modified

- `ecs/systems/FoodConsumptionSystem.js` - Enhanced food seeking
- `ecs/systems/BreedingSystem.js` - Stricter breeding requirements
- `ecs/systems/HungerSystem.js` - Gradual starvation
- `ecs/systems/DeathSystem.js` - NEW: Death animations
- `ecs/systems/PopulationStatsSystem.js` - NEW: Statistics tracking
- `ecs/systems/SchoolingSystem.js` - Hunger-adaptive behavior
- `ecs/systems/RenderSystem.js` - Visual hunger indicators
- `config/simulation_config.js` - Resource scarcity
- `core/Simulation.js` - System registration

## Documentation

- `EMERGENT_BEHAVIOR_IMPROVEMENTS.md` - Technical details
- `OBSERVATION_GUIDE.md` - Detailed observation instructions
- This file - Quick reference

## Troubleshooting

**All fish dying?**
- Increase `daySpawnRate` in config (try 15)

**No breeding?**
- Increase `maxParticles` (try 35)
- Fish need to be well-fed and healthy

**Population exploding?**
- Decrease `maxParticles` (try 20)
- Increase `breedCooldown` in `ecs/entities/FishFactory.js`

**No visual changes?**
- Check browser console for errors
- Ensure FPS counter is showing (top-left)

## Next Steps

Potential enhancements:
- Predator-prey dynamics with sharks
- Territory and hiding behaviors
- Seasonal food variations
- Genetic lineage tracking
- Population graphs in UI
- Save/load simulation states

---

**Enjoy watching evolution in action!** 🐟🧬
