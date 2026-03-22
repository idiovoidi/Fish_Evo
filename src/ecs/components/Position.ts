export class Position extends (window as any).ECSY.Component {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

(Position as any).schema = {
  x: { type: (window as any).ECSY.Types.Number, default: 0 },
  y: { type: (window as any).ECSY.Types.Number, default: 0 },
  z: { type: (window as any).ECSY.Types.Number, default: 0 }
};
