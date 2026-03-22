export class Age extends (window as any).ECSY.Component {
  value: number = 0;
  maturityAge: number = 60;
  maxAge: number = 300;
  isAdult: boolean = false;
}

(Age as any).schema = {
  value: { type: (window as any).ECSY.Types.Number, default: 0 },
  maturityAge: { type: (window as any).ECSY.Types.Number, default: 60 },
  maxAge: { type: (window as any).ECSY.Types.Number, default: 300 },
  isAdult: { type: (window as any).ECSY.Types.Boolean, default: false }
};
