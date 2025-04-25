# Fish Evolution Simulation - Game Design

## Core Concept

The goal is to create a fish tank simulation where fish exhibit basic life behaviors, allowing for the observation of emergent ecosystem dynamics and potentially evolutionary processes.

Key simulated behaviors include:

*   **Hunger:** Fish have a simulated hunger drive.
*   **Eating:** Fish can consume food to satiate hunger.
*   **Breeding:** Fish have the ability to reproduce.

These mechanics will allow for the simulation of a basic ecosystem.

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
