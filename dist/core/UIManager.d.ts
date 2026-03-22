export declare class UIManager {
    scene: any;
    simulation: any;
    PositionComponent: any;
    RenderableComponent: any;
    selectedEntity: any;
    isTrackingEntity: boolean;
    highlightMesh: any;
    highlightAnimation: any;
    updateInterval: any;
    hudElement: HTMLDivElement | null;
    inspectorElement: HTMLDivElement | null;
    inspectorContent: HTMLDivElement | null;
    inspectorControls: HTMLDivElement | null;
    constructor(scene: any, simulation: any, components?: any);
    _getPositionComponent(): any;
    initStyles(): void;
    initDOM(): void;
    initObservers(): void;
    updateHUD(): void;
    selectEntity(entity: any): void;
    deselectEntity(): void;
    updateInspector(): void;
    startContinuousUpdates(): void;
    stopContinuousUpdates(): void;
    createHighlight(): void;
    clearHighlight(): void;
    toggleTracking(): void;
    startTracking(): void;
    stopTracking(): void;
    focusOnEntity(): void;
    updateCameraTracking(): void;
    cleanup(): void;
}
//# sourceMappingURL=UIManager.d.ts.map