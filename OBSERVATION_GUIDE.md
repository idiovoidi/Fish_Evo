# Emergent Behavior Observation Guide

## How to Run the Simulation

```bash
npm start
```

The simulation will open in your browser. Open the browser console (F12) to see population statistics.

## Visual Indicators

### Fish Hunger States

Fish change appearance based on hunger level:

- **Well-Fed (0-50% hunger)**: Normal appearance, natural colors
- **Hungry (50-80% hunger)**: Slight yellow tint, more aggressive food seeking
- **Starving (80-100% hunger)**: Red pulsing glow, desperate behavior, taking damage

### Animations

- **Eating**: Fish briefly pulse/scale up when consuming food
- **Breeding**: Mating fish perform a courtship dance (spinning, pulsing)
- **Death**: Dead fish sink slowly, fade out, and rotate before removal

## Behaviors to Watch For

### 1. Food Competition

- **Early Game**: Watch fish race toward food particles
- **Desperation**: Starving fish (red glow) move much faster than well-fed fish
- **Schooling vs Hunger**: Hungry fish break from schools to chase food

### 2. Natural Selection

- **Survival of the Fittest**: Faster fish with better genetics catch more food
- **Starvation Deaths**: Watch the console for death messages
- **Population Decline**: Initial population may drop as weak fish starve

### 3. Breeding Dynamics

- **Selective Breeding**: Only healthy, well-fed fish can breed
- **Energy Cost**: Parents become hungrier after breeding
- **Genetic Variation**: Offspring have mutated traits (check console logs)

### 4. Population Cycles

Watch the console stats (every 10 seconds) for:

```
╔════════════════════════════════════════════════════════════╗
║ POPULATION STATS (X.X min)                              
╠════════════════════════════════════════════════════════════╣
║ Fish:     12 (8 adults, 3 starving)
║ Food:     15
║ Sharks:   2
║ Avg Hunger: 65.3%
║ Avg Health: 78.2
╚════════════════════════════════════════════════════════════╝
```

### Key Metrics to Track

- **Fish Count**: Should fluctuate based on food availability
- **Adult Count**: Indicates breeding potential
- **Starving Count**: High numbers = population crash incoming
- **Avg Hunger**: >60% = food scarcity, <40% = abundant resources
- **Avg Health**: Declining = population under stress

## Experiment Ideas

### 1. Food Scarcity Test
**Goal**: Observe natural selection under pressure

1. Let simulation run for 5 minutes
2. Watch which fish survive longest
3. Note genetic traits of survivors (check console when they breed)

### 2. Population Recovery
**Goal**: See if population can recover from near-extinction

1. Wait for population to drop to 3-5 fish
2. Observe if they can breed and recover
3. Note how long recovery takes

### 3. Genetic Drift
**Goal**: Track how traits change over generations

1. Note initial fish speeds (4-8 range)
2. Run for 10+ minutes
3. Check offspring traits in console logs
4. See if faster fish dominate

### 4. Boom-Bust Cycles
**Goal**: Observe population oscillations

1. Watch population stats over 15+ minutes
2. Look for patterns:
   - High food → breeding → population boom
   - Low food → starvation → population crash
   - Repeat cycle

## Console Commands

Open browser console and try:

```javascript
// Get current simulation stats
window.uiManager.simulation.world.entityManager.count()

// Manually spawn food (for testing)
window.uiManager.simulation.foodSpawnerSystem.spawnFood()
```

## Expected Timeline

- **0-2 min**: Initial competition, some fish may starve
- **2-5 min**: Survivors breed, population stabilizes
- **5-10 min**: First generation offspring mature
- **10+ min**: Genetic traits begin to shift noticeably

## Signs of Healthy Emergent Behavior

✅ Population fluctuates (not static)
✅ Fish actively compete for food
✅ Breeding happens but not constantly
✅ Some fish die, some thrive
✅ Genetic diversity in offspring
✅ Behavioral variety (some fish school, some hunt alone)

## Troubleshooting

**All fish dying?**
- Food spawn rate may be too low
- Increase `daySpawnRate` in `config/simulation_config.js`

**No breeding?**
- Fish may be too hungry
- Increase food availability temporarily

**Population exploding?**
- Too much food available
- Decrease `maxParticles` in config

**No visible changes?**
- Check browser console for stats
- Ensure simulation is running (check FPS counter)
