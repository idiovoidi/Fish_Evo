/**
 * TagComponent - Base class for tag components that mark entity types
 */
export class TagComponent extends window.ECSY.Component {}

/**
 * FishTag - Marks an entity as a fish
 */
export class FishTag extends TagComponent {}

/**
 * SharkTag - Marks an entity as a shark
 */
export class SharkTag extends TagComponent {}

/**
 * CrabTag - Marks an entity as a crab
 */
export class CrabTag extends TagComponent {}

/**
 * FoodTag - Marks an entity as food
 */
export class FoodTag extends TagComponent {}

/**
 * SeaweedTag - Marks an entity as seaweed
 */
export class SeaweedTag extends TagComponent {}

/**
 * CoralTag - Marks an entity as coral
 */
export class CoralTag extends TagComponent {}

/**
 * DebrisTag - Marks an entity as ocean debris
 */
export class DebrisTag extends TagComponent {} 