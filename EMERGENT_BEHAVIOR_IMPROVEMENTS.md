# Emergent Behavior Improvements

## Overview
Enhanced the fish evolution simulation to create more compelling emergent behaviors through improved feeding, breeding, and survival mechanics.

## Key Changes

### 1. Enhanced Food Consumption System
**File:** `ecs/systems/FoodConsumptionSystem.js`

- **Increased Detection Range**: Fish can now detect food from 8 units away (up from 3)
- **Desperation Mechanics**: Hungrier fish move faster and more aggressively toward food
  - Speed multiplier scales from 1x to 2.5x based on hunger level
  - Max speed increases up to 1.5x when starving
- **Stronger Seeking Force**: 3.5x multiplier (up from 2.0x) for more decisive food pursuit
- **Lower Hunger Threshold**: Fish start seeking food at 30% hunger (down from 40%)

### 2. Improved Breeding System
**File:** `ecs/systems/BreedingSystem.js`

- **Stricter Breeding Requirements**:
  - Must have at least 60 health (out of 100)
  - Hunger must be below 30% (well-fed)
  - Closer proximity required (4 units instead of 5)
- **Energy Cost**: Breeding now increases hunger by 15% for both parents
- **Higher Mutation Rate**: 8% chance (up from 5%) with ±15% variation (up from ±10%)
- **Better Logging**: Shows offspring traits when born

### 3. Gradual Starvation System
**File:** `ecs/systems/HungerSystem.js`

- **Progressive Damage**: Starvation damage starts at 70% hunger and scales exponentially
- **Earlier Hunger Response**: Fish become hungry at 40% (down from 50%)
- **Metabolism Impact**: High metabolism fish starve faster
- **Death Logging**: Console logs when fish die from starvation

### 4. Death and Cleanup System
**File:** `ecs/systems/DeathSystem.js` (NEW)

- **Visual Death Animation**: 2-second fade-out with sinking motion
- **Gradual Removal**: Dead fish sink, shrink, and rotate before being removed
- **Proper Cleanup**: Ensures dead entities don't clutter the simulation

### 5. Population Statistics Tracking
**File:** `ecs/systems/PopulationStatsSystem.js` (NEW)

- **Real-time Monitoring**: Logs population stats every 10 seconds
- **Key Metrics**:
  - Total fish count (adults vs juveniles)
  - Starving fish count (>80% hunger)
  - Food availability
  - Average hunger and health levels
- **Formatted Output**: Clean console display for easy monitoring

### 6. Resource Scarcity
**File:** `config/simulation_config.js`

- **Reduced Food Supply**:
  - Max food particles: 25 (down from 50)
  - Day spawn rate: 10/min (down from 15/min)
  - Night spawn rate: 3/min (down from 5/min)
  - Slower spawn checks: 2 seconds (up from 1 second)

**File:** `core/Simulation.js`

- **Smaller Initial Population**: 12 fish (3 schools of 4) instead of 20
- **Less Initial Food**: 8 food items instead of 15

## Emergent Behaviors to Observe

### 1. Competition for Resources
- Fish actively compete for limited food
- Faster fish with better genetics have survival advantage
- Starving fish become desperate and aggressive

### 2. Natural Selection
- Only well-fed, healthy fish can breed
- Breeding costs energy, creating trade-offs
- Mutations create genetic diversity
- Unfit fish die from starvation

### 3. Population Dynamics
- Population fluctuates based on food availability
- Boom-bust cycles may emerge
- Genetic traits evolve over generations

### 4. Behavioral Adaptation
- Fish balance schooling vs individual food seeking
- Hunger overrides social behaviors when desperate
- Energy management becomes critical for survival

## Testing the Simulation

1. **Start the simulation**: `npm start`
2. **Watch the console**: Population stats will log every 10 seconds
3. **Observe behaviors**:
   - Fish frantically chasing food when hungry
   - Breeding animations when conditions are met
   - Death animations when fish starve
   - Population changes over time

## Expected Outcomes

- **Early Phase**: Population may decline as fish compete for scarce food
- **Stabilization**: Survivors breed, creating adapted offspring
- **Evolution**: Faster, more efficient fish dominate over time
- **Cycles**: Population may oscillate with food availability

## Future Enhancements

- Add predator-prey pressure from sharks
- Implement territory/hiding behaviors
- Add seasonal food variations
- Track genetic lineages
- Visualize population graphs in UI
