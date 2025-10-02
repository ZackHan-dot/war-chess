import { Graphics } from "pixi.js";
import type { ColorSource } from "pixi.js";

interface Radio {
  color: ColorSource;
  fillColor: ColorSource;
  width: number;
  height: number;
  radius: number;
  padding: number;
}

export function drawRadio({
  color,
  fillColor,
  width,
  height,
  radius,
  padding,
}: Radio) {
  const graphics = new Graphics();
  const isCircle = width === height && (radius ?? 0) >= (width ?? 0) / 2;
  if (isCircle) {
    const w = width ?? 0;
    graphics.circle(w / 2, w / 2, w / 2);
  } else {
    graphics.roundRect(0, 0, width ?? 0, height ?? 0, radius ?? 0);
  }
  graphics.fill(color);
  if (fillColor !== undefined) {
    const center = (width ?? 0) / 2;
    if (isCircle) {
      graphics.circle(center, center, center - (padding ?? 0));
    } else {
      const p = padding ?? 0;
      graphics.roundRect(
        p,
        p,
        (width ?? 0) - p * 2,
        (height ?? 0) - p * 2,
        radius ?? 0
      );
    }
    graphics.fill(fillColor);
  }
  return graphics;
}
