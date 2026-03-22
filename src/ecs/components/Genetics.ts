export class Genetics extends (window as any).ECSY.Component {
  size: number = 1;
  speed: number = 5;
  metabolism: number = 1;
  color: number[] = [100, 180, 255];
}

(Genetics as any).serializable = true;

(Genetics as any).schema = {
  size: { type: (window as any).ECSY.Types.Number, default: 1 },
  speed: { type: (window as any).ECSY.Types.Number, default: 5 },
  metabolism: { type: (window as any).ECSY.Types.Number, default: 1 },
  color: { type: (window as any).ECSY.Types.Ref, default: [100, 180, 255] }
};
