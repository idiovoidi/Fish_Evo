import { Position } from '../components/Position.js';
import { Genetics } from '../components/Genetics.js';
import { Age } from '../components/Age.js';
import { Behavior } from '../components/Behavior.js';
import { Hunger } from '../components/Hunger.js';
import { FishFactory } from '../entities/FishFactory.js';

const BREED_DISTANCE = 5;
const MUTATION_RATE = 0.05; // 5%
const MUTATION_VARIATION = 0.1; // ±10%
const BREED_DISTANCE_SQ = BREED_DISTANCE*BREED_DISTANCE;

export class BreedingSystem extends window.ECSY.System {
  execute(delta, time) {
    const candidates = this.queries.fish.results;
    const n=candidates.length;
    for (let i=0;i<n;i++){const e1=candidates[i];
      const age1=e1.getComponent(Age);
      const beh1=e1.getMutableComponent(Behavior);
      if(!age1.isAdult||time-beh1.lastBreedTime<beh1.breedCooldown||e1.getComponent(Hunger).value>0.2)continue;
      const pos1=e1.getComponent(Position);
      for(let j=i+1;j<n;j++){const e2=candidates[j];
        const age2=e2.getComponent(Age);
        const beh2=e2.getMutableComponent(Behavior);
        if(!age2.isAdult||time-beh2.lastBreedTime<beh2.breedCooldown||e2.getComponent(Hunger).value>0.2)continue;
        const pos2=e2.getComponent(Position);
        const dx=pos1.x-pos2.x,dy=pos1.y-pos2.y,dz=pos1.z-pos2.z;
        const distSq=dx*dx+dy*dy+dz*dz;
        if(distSq>BREED_DISTANCE_SQ)continue;
        this.createOffspring(e1,e2);
        beh1.lastBreedTime=beh2.lastBreedTime=time;
        break;
      }}
  }

  createOffspring(parentA, parentB) {
    const gA = parentA.getComponent(Genetics);
    const gB = parentB.getComponent(Genetics);
    const childTraits = {};
    ['size','speed','metabolism'].forEach(trait=>{
      const avg = (gA[trait]+gB[trait])/2;
      childTraits[trait] = this.mutateValue(avg);
    });
    // color mutate per channel
    const colorAvg = [0,1,2].map(i=>Math.round((gA.color[i]+gB.color[i])/2));
    const colorMut = colorAvg.map(c=>this.mutateValue(c/255)*255).map(v=>Math.min(255,Math.max(0,Math.round(v))));
    childTraits.color = colorMut;
    // position at parents midpoint
    const posA = parentA.getComponent(Position);
    const posB = parentB.getComponent(Position);
    const childPos = {x:(posA.x+posB.x)/2,y:(posA.y+posB.y)/2,z:(posA.z+posB.z)/2};
    FishFactory.create(this.world,{position:childPos,genetics:childTraits});
  }

  mutateValue(val){
    if (Math.random()<MUTATION_RATE){
      const change = 1+ (Math.random()*2-1)*MUTATION_VARIATION;
      return val*change;
    }
    return val;
  }
}

BreedingSystem.queries={
  fish:{components:[Genetics,Age,Behavior,Position,Hunger]}
}; 