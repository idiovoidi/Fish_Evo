# Genetic Traits

This document outlines the heritable genetic traits for fish, which form the basis of the evolution simulation. During reproduction, offspring will inherit these traits from their parents, with a small chance of mutation.

## Core Genetic Traits

1.  **Size**
    *   **Description:** The physical size of the fish.
    *   **Effect:**
        *   Determines the `scale` of the visual model.
        *   May influence `Metabolism` (larger fish might consume more energy at rest).
    *   **Range:** e.g., `0.5` to `2.0` (multiplier on base size).

2.  **Speed**
    *   **Description:** The maximum movement speed of the fish.
    *   **Effect:**
        *   Determines the `maxSpeed` property in the `Velocity` component.
        *   Higher speeds will consume more energy during movement.
    *   **Range:** e.g., `2` to `10` units/second.

3.  **Metabolism**
    *   **Description:** The fish's base energy consumption rate.
    *   **Effect:**
        *   Determines how quickly the `Energy` stat depletes over time.
        *   A lower metabolism is more energy-efficient.
    *   **Range:** e.g., `0.5` to `1.5` (multiplier on base energy decay rate).

4.  **Coloration**
    *   **Description:** The visual color of the fish.
    *   **Effect:**
        *   Directly influences the color of the 3D model.
        *   Future potential: Could be used for mate selection or camouflage from predators.
    *   **Range:** Stored as RGB values, e.g., `(R, G, B)` where each is `0-255`.

## Inheritance & Mutation

*   **Inheritance:** An offspring's trait value will be the average of its parents' values for that trait.
*   **Mutation:** After inheritance, each trait has a small chance (e.g., `5%`) to mutate. If a mutation occurs, the value will be adjusted by a small random amount (e.g., `+/- 10%`).
