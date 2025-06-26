import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { PredatorState } from '../components/PredatorState.js';
import { SharkTag, FishTag } from '../components/Tags.js';
import { Health } from '../components/Health.js';
import { SpatialHashSystem } from '../systems/SpatialHashSystem.js';

const DETECT_RADIUS = 25;
const SPRINT_RADIUS = 10;
const BITE_RANGE = 1.5;
const BASE_SPEED = 10;
const SPRINT_SPEED = 14;
const ENERGY_GAIN = 40; // not used yet

const DETECT_RADIUS_SQ = DETECT_RADIUS*DETECT_RADIUS;
const SPRINT_RADIUS_SQ = SPRINT_RADIUS*SPRINT_RADIUS;
const BITE_RANGE_SQ = BITE_RANGE*BITE_RANGE;

export class SharkSystem extends window.ECSY.System {
  init(){
    this.spatial = this.world.getSystem(SpatialHashSystem);
  }

  execute(delta, time){
    this.queries.sharks.results.forEach(shark=>{
      const posS = shark.getComponent(Position);
      const vel = shark.getMutableComponent(Velocity);
      const pred = shark.getMutableComponent(PredatorState);

      // Nearby fish lookup via spatial grid
      const nearby = this.spatial.getEntitiesNear(posS, DETECT_RADIUS, FishTag);
      if(!nearby.length){
        // simple damping wander
        vel.x*=0.95; vel.y*=0.95; vel.z*=0.95;
        return;
      }
      // find nearest fish among nearby list
      let nearest=null; let nearestDistSq=Infinity;
      for(let i=0;i<nearby.length;i++){
        const fish=nearby[i];
        const p=fish.getComponent(Position);
        const dx=posS.x-p.x, dy=posS.y-p.y, dz=posS.z-p.z;
        const d2=dx*dx+dy*dy+dz*dz;
        if(d2<nearestDistSq){nearest=fish;nearestDistSq=d2;}
      }
      if(!nearest) return; // should not happen

      const dist=Math.sqrt(nearestDistSq);
      const dirX=(nearest.getComponent(Position).x-posS.x)/dist;
      const dirY=(nearest.getComponent(Position).y-posS.y)/dist;
      const dirZ=(nearest.getComponent(Position).z-posS.z)/dist;
      const speed = nearestDistSq<SPRINT_RADIUS_SQ?SPRINT_SPEED:BASE_SPEED;
      vel.x = dirX*speed; vel.y = dirY*speed; vel.z = dirZ*speed;

      // bite check
      if(nearestDistSq < BITE_RANGE_SQ && time - pred.lastBiteTime > pred.biteCooldown){
        const h = nearest.getMutableComponent(Health);
        h.current = 0; h.isDead = true;
        nearest.remove();
        pred.lastBiteTime = time;
      }
    });
  }
}

SharkSystem.queries = {
  sharks:{components:[SharkTag,Position,Velocity,PredatorState]},
  // fish query left for other uses but not needed for logic now
}; 