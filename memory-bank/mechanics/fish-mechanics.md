# Fish Mechanics

Detailed rules that apply specifically to fish entities.

## 1. Life Stages

| Stage  | Age Range (s) | Notes                          |
|--------|---------------|--------------------------------|
| Fry    | 0–59          | Cannot breed, vulnerable       |
| Adult  | 60–299        | Eligible for breeding          |
| Elder  | 300+          | Energy decay +20% (frailty)    |

Fish die automatically when Age > 480 s.

## 2. Energy Decay

`EnergyLossPerSecond = BaseRate × MetabolismTrait`
* **BaseRate:** 0.1
* **Movement Cost:** +0.02 × `SpeedTrait` when swimming.

## 3. Decision Logic

Priority order evaluated each update:
1. If Energy < 50 → Seek Food.
2. Else if Predator within 10 units → Flee.
3. Else if Energy > 80 and mate nearby → Breed.
4. Else → Schooling / Wander.

## 4. Breeding Cool-Down

After successful breeding both parents enter a 30-second cool-down.

## 5. Visual Scaling

`Mesh.scale = SizeTrait` for quick visual feedback.
