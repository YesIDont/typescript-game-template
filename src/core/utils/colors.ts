export function lerpColor(startColor: string, endColor: string, alpha: number): string {
  const ah = parseInt(startColor.replace(/#/g, ''), 16),
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = parseInt(endColor.replace(/#/g, ''), 16),
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + alpha * (br - ar),
    rg = ag + alpha * (bg - ag),
    rb = ab + alpha * (bb - ab);

  return '#' + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1);
}
