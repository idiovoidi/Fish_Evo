export interface Series {
  data: number[];
  color: string;
  fill?: boolean;
}

interface Options {
  legend?: [string, string][];
  /** Anchor the bottom of the chart at zero. */
  zeroBased?: boolean;
}

/** Minimal HiDPI-friendly line chart for the HUD. */
export function drawSparkline(canvas: HTMLCanvasElement | undefined, series: Series[], options: Options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  const pad = 6;
  const longest = Math.max(...series.map((s) => s.data.length));
  if (longest < 2) {
    ctx.fillStyle = 'rgba(126,167,186,0.5)';
    ctx.font = '20px ui-monospace, monospace';
    ctx.fillText('collecting data…', pad, h / 2 + 6);
    return;
  }

  let min = Infinity;
  let max = -Infinity;
  for (const s of series) for (const v of s.data) { min = Math.min(min, v); max = Math.max(max, v); }
  if (options.zeroBased) min = 0;
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;

  // baseline grid
  ctx.strokeStyle = 'rgba(150,225,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const y = pad + ((h - pad * 2) * i) / 3;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  for (const s of series) {
    const n = s.data.length;
    const x = (i: number) => pad + ((w - pad * 2) * i) / Math.max(1, n - 1);
    const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);

    ctx.beginPath();
    s.data.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (s.fill) {
      ctx.lineTo(x(n - 1), h - pad);
      ctx.lineTo(x(0), h - pad);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `${s.color}55`);
      g.addColorStop(1, `${s.color}00`);
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x(n - 1), y(s.data[n - 1]), 4, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
  }

  if (options.legend) {
    ctx.font = '18px ui-sans-serif, system-ui, sans-serif';
    let lx = pad + 4;
    for (const [label, color] of options.legend) {
      ctx.fillStyle = color;
      ctx.fillRect(lx, 8, 10, 10);
      ctx.fillStyle = 'rgba(217,240,250,0.65)';
      ctx.fillText(label, lx + 16, 18);
      lx += 22 + ctx.measureText(label).width + 12;
    }
  }
}
