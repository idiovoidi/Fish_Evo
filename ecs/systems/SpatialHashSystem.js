const CELL_SIZE = 10;

function cellKey(ix,iy,iz){return `${ix},${iy},${iz}`;}

export class SpatialHashSystem extends window.ECSY.System{
  init(){
    this.grid=new Map();
  }
  execute(){
    this.grid.clear();
    this.queries.movable.results.forEach(ent=>{
      const pos = ent.getComponent(Position);
      const ix = Math.floor(pos.x/CELL_SIZE);
      const iy = Math.floor(pos.y/CELL_SIZE);
      const iz = Math.floor(pos.z/CELL_SIZE);
      const key = cellKey(ix,iy,iz);
      let arr=this.grid.get(key);
      if(!arr){arr=[];this.grid.set(key,arr);} arr.push(ent);
    });
  }

  getEntitiesNear(pos, radius, componentClass){
    const r = radius;
    const minX = Math.floor((pos.x - r)/CELL_SIZE);
    const maxX = Math.floor((pos.x + r)/CELL_SIZE);
    const minY = Math.floor((pos.y - r)/CELL_SIZE);
    const maxY = Math.floor((pos.y + r)/CELL_SIZE);
    const minZ = Math.floor((pos.z - r)/CELL_SIZE);
    const maxZ = Math.floor((pos.z + r)/CELL_SIZE);
    const radiusSq = r*r;
    const results=[];
    for(let ix=minX; ix<=maxX; ix++){
      for(let iy=minY; iy<=maxY; iy++){
        for(let iz=minZ; iz<=maxZ; iz++){
          const arr=this.grid.get(cellKey(ix,iy,iz));
          if(!arr) continue;
          for(let i=0;i<arr.length;i++){
            const e=arr[i];
            if(componentClass && !e.hasComponent(componentClass)) continue;
            const p=e.getComponent(Position);
            const dx=pos.x-p.x, dy=pos.y-p.y, dz=pos.z-p.z;
            if(dx*dx+dy*dy+dz*dz<=radiusSq) results.push(e);
          }
        }
      }
    }
    return results;
  }
}

import { Position } from '../components/Position.js';
SpatialHashSystem.queries={
  movable:{components:[Position]}
}; 