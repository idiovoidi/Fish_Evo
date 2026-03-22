import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { PredatorState } from '../components/PredatorState';
import { Behavior } from '../components/Behavior';
import { Genetics } from '../components/Genetics';
import { SharkTag, FishTag } from '../components/Tags';
import { Health } from '../components/Health';

export class SharkSystem extends (window as any).ECSY.System {
  spatial: any;

  init() {
    this.spatial = this.world.getSystem('SpatialHashSystem');
  }

  execute(delta: number, time: number) {
    const deltaTime = delta / 1000;
    
    this.queries.sharks.results.forEach((shark: any) => {
      const position = shark.getComponent(Position);
      const velocity = shark.getMutableComponent(Velocity);
      const predState = shark.getMutableComponent(PredatorState);
      const behavior = shark.getComponent(Behavior);
      const genetics = shark.getComponent(Genetics);
      
      const huntRadius = behavior?.huntingRadius || 20;
      const aggression = behavior?.aggressionLevel || 0.8;
      const baseSpeed = genetics?.speed || velocity.maxSpeed;
      const chaseSpeed = predState.chaseSpeed || baseSpeed * 1.3;
      
      const nearbyFish = this.spatial.getEntitiesNear(position, huntRadius, FishTag);
      
      if (nearbyFish.length === 0) {
        this.patrolBehavior(shark, velocity, deltaTime, baseSpeed);
        predState.isChasing = false;
        predState.huntingTarget = null;
        return;
      }
      
      let targetFish = this.selectBestTarget(shark, nearbyFish, position);
      
      if (!targetFish) {
        this.patrolBehavior(shark, velocity, deltaTime, baseSpeed);
        predState.isChasing = false;
        predState.huntingTarget = null;
        return;
      }
      
      const targetPos = targetFish.getComponent(Position);
      const dist = this.getDistance(position, targetPos);
      
      predState.huntingTarget = targetFish;
      
      if (dist < 2.0) {
        this.attackBehavior(shark, targetFish, predState, time);
      } else if (dist < 8.0) {
        predState.isChasing = true;
        this.chaseBehavior(shark, targetPos, velocity, chaseSpeed, deltaTime);
      } else {
        predState.isChasing = false;
        this.stalkBehavior(shark, targetPos, velocity, baseSpeed * 0.8, deltaTime);
      }
      
      this.clampVelocity(velocity);
    });
  }
  
  patrolBehavior(shark: any, velocity: any, deltaTime: number, baseSpeed: number) {
    const position = shark.getComponent(Position);
    
    const turnRate = 0.8 * deltaTime;
    velocity.x += (Math.random() - 0.5) * turnRate * baseSpeed;
    velocity.y += (Math.random() - 0.5) * turnRate * baseSpeed * 0.3;
    velocity.z += (Math.random() - 0.5) * turnRate * baseSpeed;
    
    const currentSpeed = Math.sqrt(velocity.x*velocity.x + velocity.y*velocity.y + velocity.z*velocity.z);
    const targetSpeed = baseSpeed * 0.6;
    
    if (currentSpeed > 0) {
      const speedAdjust = targetSpeed / currentSpeed;
      velocity.x *= speedAdjust;
      velocity.y *= speedAdjust;
      velocity.z *= speedAdjust;
    }
    
    if (position.y > 20) velocity.y -= 1.5 * deltaTime;
    if (position.y < 8) velocity.y += 1.5 * deltaTime;
  }
  
  stalkBehavior(shark: any, targetPos: any, velocity: any, speed: number, deltaTime: number) {
    const position = shark.getComponent(Position);
    
    const dx = targetPos.x - position.x;
    const dy = targetPos.y - position.y;
    const dz = targetPos.z - position.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (distance > 0) {
      const approach = 0.7;
      const random = 0.3;
      
      velocity.x = velocity.x * 0.9 + (dx/distance * speed * approach + (Math.random()-0.5) * speed * random) * 0.1;
      velocity.y = velocity.y * 0.9 + (dy/distance * speed * approach * 0.5 + (Math.random()-0.5) * speed * random * 0.3) * 0.1;
      velocity.z = velocity.z * 0.9 + (dz/distance * speed * approach + (Math.random()-0.5) * speed * random) * 0.1;
    }
  }
  
  chaseBehavior(shark: any, targetPos: any, velocity: any, chaseSpeed: number, deltaTime: number) {
    const position = shark.getComponent(Position);
    
    const dx = targetPos.x - position.x;
    const dy = targetPos.y - position.y;
    const dz = targetPos.z - position.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (distance > 0) {
      const steerStrength = 4.0 * deltaTime;
      velocity.x += (dx/distance * chaseSpeed - velocity.x) * steerStrength;
      velocity.y += (dy/distance * chaseSpeed * 0.6 - velocity.y) * steerStrength;
      velocity.z += (dz/distance * chaseSpeed - velocity.z) * steerStrength;
    }
  }
  
  attackBehavior(shark: any, targetFish: any, predState: any, time: number) {
    if (time - predState.lastBiteTime >= predState.biteCooldown) {
      const targetHealth = targetFish.getMutableComponent(Health);
      
      if (targetHealth && !targetHealth.isDead) {
        const genetics = shark.getComponent(Genetics);
        const damage = 80 + (genetics?.size || 1) * 20;
        
        targetHealth.current = Math.max(0, targetHealth.current - damage);
        
        if (targetHealth.current <= 0) {
          targetHealth.isDead = true;
          
          if (targetFish.hasComponent(Velocity)) {
            const fishVel = targetFish.getMutableComponent(Velocity);
            fishVel.x = 0;
            fishVel.y = -1;
            fishVel.z = 0;
          }
        }
        
        predState.lastBiteTime = time;
        predState.lastAttackTime = time;
        
        console.log(`Shark attacked ${targetHealth.isDead ? 'and killed' : 'but damaged'} fish!`);
      }
    }
  }
  
  selectBestTarget(shark: any, fishList: any[], sharkPos: any) {
    let bestTarget: any = null;
    let bestScore = -1;
    
    fishList.forEach((fish: any) => {
      const fishHealth = fish.getComponent(Health);
      if (fishHealth && fishHealth.isDead) return;
      
      const fishPos = fish.getComponent(Position);
      if (!fishPos) return;
      
      const distance = this.getDistance(sharkPos, fishPos);
      
      const healthFactor = fishHealth ? (fishHealth.current / fishHealth.max) : 1.0;
      const distanceFactor = 1.0 / (1.0 + distance * 0.1);
      const score = healthFactor * distanceFactor;
      
      if (score > bestScore) {
        bestScore = score;
        bestTarget = fish;
      }
    });
    
    return bestTarget;
  }
  
  getDistance(pos1: any, pos2: any) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }
  
  clampVelocity(velocity: any) {
    const speedSq = velocity.x*velocity.x + velocity.y*velocity.y + velocity.z*velocity.z;
    const maxSq = velocity.maxSpeed * velocity.maxSpeed;
    
    if (speedSq > maxSq) {
      const scale = velocity.maxSpeed / Math.sqrt(speedSq);
      velocity.x *= scale;
      velocity.y *= scale;
      velocity.z *= scale;
    }
  }
}

(SharkSystem as any).queries = {
  sharks: { components: [SharkTag, Position, Velocity, PredatorState] }
};
