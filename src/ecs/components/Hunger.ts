export class Hunger extends (window as any).ECSY.Component {
  value: number = 0;
  rate: number = 0.01;
  lastFed: number = 0;
}

(Hunger as any).schema = {
  value: { type: (window as any).ECSY.Types.Number, default: 0 },
  rate: { type: (window as any).ECSY.Types.Number, default: 0.01 },
  lastFed: { type: (window as any).ECSY.Types.Number, default: 0 }
};
