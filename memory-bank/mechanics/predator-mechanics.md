# Predator Mechanics

This document specifies the rules and parameters governing shark behavior in the simulation.

## 1. Detection & Targeting

* **Detection Radius:** 25 units (sphere radius around shark).
* **Line-of-Sight Check:** Not required for now—radius alone triggers pursuit.
* **Target Priority:** Nearest living fish.
* **Memory:** If a targeted fish escapes beyond 35 units the shark abandons the chase.

## 2. Pursuit & Attack

| Parameter            | Value            | Notes                                    |
|----------------------|------------------|------------------------------------------|
| Base Swim Speed      | 10 units/s       | Multiplier applied to `Velocity.maxSpeed`|
| Sprint Speed         | 14 units/s       | Used while within 10 units of target     |
| Bite Range           | 1.5 units        | Distance at which an attack is executed  |
| Attack Cool-down     | 2 s              | Time between bites                       |
| Damage per Bite      | `Energy = 0`     | A successful bite immediately kills the fish |
| Energy Gain          | +40 Energy       | Restores shark energy after eating       |

## 3. Breeding (Future)

Shark breeding will be introduced after core fish evolution is stable:
* Sharks require Energy > 90.
* Cool-down between litters: 60 s.
* Litter size: 1–3 pups.

## 4. Tuning Knobs

All numeric values are centralised in `config/predator.json` for easy balancing.
