/**
 * Custom exception hierarchy for the simulation
 */

/**
 * Base simulation error
 */
export class SimulationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SimulationError';
  }
}

/**
 * Error thrown when a component doesn't exist on an entity
 */
export class ComponentMissingError extends SimulationError {
  constructor(entityId, componentName) {
    super(`Component "${componentName}" missing on entity with ID: ${entityId}`);
    this.name = 'ComponentMissingError';
    this.entityId = entityId;
    this.componentName = componentName;
  }
}

/**
 * Error thrown when an entity cannot be found
 */
export class EntityNotFoundError extends SimulationError {
  constructor(entityId) {
    super(`Entity with ID: ${entityId} not found`);
    this.name = 'EntityNotFoundError';
    this.entityId = entityId;
  }
}

/**
 * Error thrown when a system operation fails
 */
export class SystemOperationError extends SimulationError {
  constructor(systemName, operation, details) {
    super(`System "${systemName}" failed during "${operation}": ${details}`);
    this.name = 'SystemOperationError';
    this.systemName = systemName;
    this.operation = operation;
    this.details = details;
  }
}

/**
 * Error thrown when an entity is in an invalid state for an operation
 */
export class InvalidStateError extends SimulationError {
  constructor(entityId, currentState, requiredState) {
    super(`Entity with ID: ${entityId} is in state "${currentState}" but requires "${requiredState}"`);
    this.name = 'InvalidStateError';
    this.entityId = entityId;
    this.currentState = currentState;
    this.requiredState = requiredState;
  }
} 