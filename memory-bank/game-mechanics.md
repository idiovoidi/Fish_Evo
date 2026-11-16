# Game Mechanics

This document outlines the specific rules, numbers, and thresholds governing the simulation. It is a companion to the high-level `game-design-document.md`.

## 1. Core Stat: Energy

*   **Scale:** `0` to `100`.
*   **Function:** Serves as both the health and hunger resource.
*   **Depletion:**
    *   **Metabolism:** Energy decreases at a base rate over time, determined by the `Metabolism` genetic trait.
    *   **Movement:** Energy is consumed when moving. Faster speeds consume more energy.
*   **Replenishment:** Eating food restores energy.
*   **State Thresholds:**
    *   **Food-Seeking:** Fish will actively seek food when Energy drops below `50`.
    *   **Breeding:** Fish are only able to breed when Energy is above `80`.
    *   **Death:** Fish die when Energy reaches `0`.

## 2. Breeding Mechanics

An adult fish can reproduce if all the following conditions are met:
1.  **Energy Requirement:** Energy must be `> 80`.
2.  **Maturity:** The fish must have the `isAdult` flag set to `true`.
3.  **Proximity:** A suitable mate must be within a specific range.
4.  **Cooldown:** The fish cannot have reproduced within the last `30` seconds.

## 3. Entity Roles & Interactions

*   **Fish:** The primary evolving entity. Seeks food, breeds, and avoids predators.
*   **Sharks:**
    *   **Behavior:** Act as predators. They will hunt and eat fish that come within their detection range.
    *   **Effect:** When a shark eats a fish, the fish entity is removed from the simulation.
*   **Crabs:**
    *   **Behavior:** Currently decorative. They will move around the environment but have no direct interaction with other entities.

## 4. User Interaction

*   **Primary Role:** Passive observer.
*   **Direct Actions:**
    *   **Drop Food:** The user can click to create a food entity at a specific location.
    *   **Inspect Entity:** The user can select an entity to view its current stats (Energy, Age, and its specific genetic traits). 