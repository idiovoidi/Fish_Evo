# Fish Evolution Simulation - Game Design

## Core Concept

The goal is to create a fish tank simulation focused on **evolutionary processes**. We will observe how fish with heritable genetic traits adapt and survive in a simulated aquatic ecosystem.

Key simulated behaviors include:
*   **Survival:** Fish must manage their **Energy** by consuming food.
*   **Breeding:** Fish reproduce, passing their genetic traits to offspring with a chance of mutation.
*   **Interaction:** Fish will interact with food, other fish, and predators.

This document covers the high-level vision. For specific numbers, thresholds, and rules, see the **[Game Mechanics](mdc:memory-bank/game-mechanics.md)** document. For a detailed breakdown of heritable traits, see the **[Genetic Traits](mdc:memory-bank/genetic-traits.md)** document.

## Core Gameplay Loop & Features

### 1. Evolution and Genetics (Core Feature)
*   Fish possess a set of genetic traits (e.g., size, speed, metabolism) that dictate their abilities and attributes.
*   These traits are passed from parent to offspring via breeding, with a small chance of random mutation.
*   The simulation allows the user to observe how natural selection unfolds as certain traits prove more or less advantageous for survival and reproduction.

### 2. Ecosystem Dynamics
*   **Population Tracking:** The simulation will track population dynamics, observing how different genetic lineages succeed or fail over time.
*   **Food Chain:** A simple food chain exists: food is generated, fish consume food, and predators (sharks) consume fish.
*   **Emergent Behavior:** The goal is to observe complex ecosystem patterns that emerge from the simple rules governing individual entities.

### 3. User Interaction
*   **Observer Role:** The user primarily acts as an observer, watching the ecosystem evolve.
*   **Limited Influence:** The user can influence the simulation by manually dropping food and can inspect individual entities to see their stats and genetic makeup.

## Entities Overview

*   **Fish:** The central evolving organism.
*   **Food:** The primary energy resource.
*   **Shark:** A predator that creates selective pressure on the fish population.
*   **Crab:** An ambient creature that adds life to the environment.
*   **Flora (Seaweed/Coral):** Environmental set-dressing.

## Initial Mechanics (Prototyping Phase)

*   **Food Spawning:** Food currently spawns from the top of the simulation area and floats downwards.

## Detailed Mechanics

### Hunger and Eating
*   **Hunger:** Fish possess an internal hunger value that increases over time.
*   **Behavior:** As hunger increases, fish will prioritize searching for and moving towards food sources. High hunger might affect other behaviors (e.g., reducing willingness to breed).
*   **Satiation:** Consuming food reduces the hunger value. Different food types could offer varying levels of satiation.
*   **Starvation:** If hunger reaches a critical level, fish may perish.

### Breeding
*   **Conditions:** Fish may attempt to breed when certain conditions are met (e.g., sufficient energy/low hunger, maturity level, proximity to a suitable mate).
*   **Reproduction:** Successful breeding produces offspring (new fish entities).
*   **Genetics (Future):** Offspring could inherit traits from parents, potentially with slight variations (mutation), forming the basis for evolution.

### Food
*   **Source:** Initially, food pellets spawn periodically from the top edge of the simulation environment.
*   **Movement:** Food items drift downwards, potentially influenced by simple physics or water currents (if implemented).
*   **Properties:** Food items have a nutritional value. They might despawn or decay if not consumed within a certain timeframe.

## Simulation Goals & Ecosystem Dynamics

*   **Observation:** Allow the user to observe the interactions between fish and their environment.
*   **Population Dynamics:** Track population fluctuations based on birth rates, death rates (starvation), and potentially resource availability.
*   **Emergent Behavior:** Observe how simple rules for individual fish lead to complex group behaviors and ecosystem patterns.

## Future Considerations & Evolution

*   **Evolutionary Mechanics:** Introduce genetic traits (e.g., size, speed, metabolism, breeding efficiency, coloration) that are passed down and subject to mutation. Simulate natural selection based on survival (finding food, avoiding threats) and reproduction.
*   **Predation:** Introduce predators (like sharks, based on existing files) with hunting behaviors. Fish might develop defensive traits or behaviors.
*   **Environmental Factors:** Add elements like water temperature, quality, or hiding spots (plants, corals) that affect fish survival and behavior.
*   **Energy:** Expand hunger into a more general "energy" concept, used for movement, breeding, and basic survival.
*   **More Complex Food Chain:** Introduce producers (like algae/seaweed) that grow and are consumed by some fish, adding another layer to the ecosystem.
