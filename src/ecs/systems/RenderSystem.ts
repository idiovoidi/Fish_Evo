import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Hunger } from '../components/Hunger';
import { Health } from '../components/Health';
import { FishTag, SharkTag } from '../components/Tags';

export class RenderSystem extends (window as any).ECSY.System {
  execute(_delta: number, _time: number) {
    this.queries.renderables.results.forEach((entity: any) => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      
      if (!renderable.model || !renderable.visible) return;
      
      try {
        renderable.model.position.x = position.x;
        renderable.model.position.y = position.y;
        renderable.model.position.z = position.z;
        
        if (entity.hasComponent(Velocity) && (entity.hasComponent(FishTag) || entity.hasComponent(SharkTag))) {
          this.updateEntityOrientation(entity, renderable);
        }
        
        if (entity.hasComponent(FishTag)) {
          this.updateFishVisualState(entity, renderable);
        }
      } catch (err) {
        console.warn('Error updating renderable:', err);
      }
    });
  }
  
  updateEntityOrientation(entity: any, renderable: any) {
    const velocity = entity.getComponent(Velocity);
    
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    if (speed < 0.1) return;
    
    const direction = {
      x: velocity.x / speed,
      y: velocity.y / speed,
      z: velocity.z / speed
    };
    
    const yaw = Math.atan2(-direction.x, -direction.z);
    const pitch = Math.asin(direction.y) * 0.3;
    
    if (renderable.model.rotation) {
      const lerpFactor = 0.1;
      
      let targetYaw = yaw;
      let currentYaw = renderable.model.rotation.y;
      
      let angleDiff = targetYaw - currentYaw;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      renderable.model.rotation.y += angleDiff * lerpFactor;
      renderable.model.rotation.x += (pitch - renderable.model.rotation.x) * lerpFactor;
      
      if (entity.hasComponent(FishTag)) {
        const bankingAmount = Math.sin(angleDiff) * 0.2;
        renderable.model.rotation.z += (bankingAmount - renderable.model.rotation.z) * lerpFactor;
      }
    }
  }
  
  setEmissiveOnRenderable(renderable: any, r: number, g: number, b: number) {
    if (!renderable?.model) return;
    if (renderable.model.getChildMeshes && renderable.model.getChildMeshes().length > 0) {
      renderable.model.getChildMeshes().forEach((mesh: any) => {
        if (mesh.material?.emissiveColor) {
          mesh.material.emissiveColor.r = r;
          mesh.material.emissiveColor.g = g;
          mesh.material.emissiveColor.b = b;
        }
      });
    } else if (renderable.model.material?.emissiveColor) {
      renderable.model.material.emissiveColor.r = r;
      renderable.model.material.emissiveColor.g = g;
      renderable.model.material.emissiveColor.b = b;
    }
  }

  updateFishVisualState(entity: any, renderable: any) {
    const hunger = entity.getComponent(Hunger);
    if (!hunger || !renderable.model) return;

    if (hunger.value > 0.8) {
      const pulsePhase = (performance.now() / 500) % (Math.PI * 2);
      const pulseFactor = 0.85 + Math.sin(pulsePhase) * 0.15;
      this.setEmissiveOnRenderable(renderable, 0.3 * pulseFactor, 0, 0);
    } else if (hunger.value > 0.5) {
      this.setEmissiveOnRenderable(renderable, 0.1, 0.1, 0);
    } else {
      this.setEmissiveOnRenderable(renderable, 0, 0, 0);
    }
  }
}

(RenderSystem as any).queries = {
  renderables: { components: [Position, Renderable] }
};
