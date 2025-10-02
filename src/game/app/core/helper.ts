import { Entity } from "./Entity";
import { GridMap } from "./GridMap";

export type Point = [number, number];

export type Shape = 
  | 'round'        // 原始的方形/圆形扩散
  | 'square'
  | 'cross'        // 十字形（+）
  | 'plus'         // 同 cross
  | 'diamond'      // 菱形（曼哈顿距离）
  | 'line'         // 直线（水平）
  | 'column'       // 竖直线
  | 'ray'          // 射线（45度角可选）
  | 'cone'         // 扇形（圆锥）
  | 'rectangle';   // 矩形区域

export function getAttackRange(
  gx: number,
  gy: number,
  predicate: (point: Point) => boolean,
  step: number,
  shape: Shape = 'round'  // 默认保持原行为
): Point[] {
  const basePoints: Point[] = [];

  switch (shape) {
    case 'round':
    case 'square':
      // 原始的 3x3 基础，向外扩展
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue; // 可选：是否包含中心点
          basePoints.push([dx, dy]);
        }
      }
      break;

    case 'cross':
    case 'plus':
      // 十字形：上下左右
      basePoints.push([0, -1], [1, 0], [0, 1], [-1, 0]);
      break;

    case 'diamond':
      // 菱形：基于曼哈顿距离 = 1 的点
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            basePoints.push([dx, dy]);
          }
        }
      }
      break;

    case 'line':
      // 水平直线
      basePoints.push([-1, 0], [1, 0]);
      break;

    case 'column':
      // 垂直直线
      basePoints.push([0, -1], [0, 1]);
      break;

    case 'ray':
      // 45度射线（对角线）
      basePoints.push([-1, -1], [1, 1], [-1, 1], [1, -1]);
      break;

    case 'cone':
      // 扇形（简化：前、前左、前右）—— 可根据方向扩展
      basePoints.push([0, -1], [-1, -1], [1, -1]);
      break;

    case 'rectangle':
      // 矩形：向前 1x3 区域
      basePoints.push([-1, -1], [0, -1], [1, -1]);
      break;

    default:
      throw new Error(`Unsupported shape: ${shape}`);
  }

  const target: Point[] = [];

  // 扩展 step 层
  for (let i = 0; i < step; i++) {
    const multiplier = i + 1;
    for (const [dx, dy] of basePoints) {
      target.push([dx * multiplier, dy * multiplier]);
    }
  }

  // 偏移中心点 + 过滤
  return target
    .map(([x, y]): Point => [gx + x, gy + y])
    .filter(predicate)
    .filter(([x, y]) => x !== gx || y !== gy); // 可选：排除中心点
}

export function getMoveRange(
  gx: number,
  gy: number,
  maxRange: number,
  gridMap: GridMap,
  forEntity?: Entity
): [number, number][] {
  const queue: [number, number, number][] = [[gx, gy, 0]]; // [x, y, steps]
  const visited = new Set<string>();
  const result: [number, number][] = [];
  const directions = [
    [0, -1], // 上
    [1, 0], // 右
    [0, 1], // 下
    [-1, 0], // 左
  ];

  visited.add(`${gx},${gy}`);
  result.push([gx, gy]);

  while (queue.length > 0) {
    const [x, y, steps] = queue.shift()!;

    if (steps >= maxRange) continue;

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 &&
        nx < GridMap.WIDTH &&
        ny >= 0 &&
        ny < GridMap.HEIGHT &&
        !visited.has(key) &&
        gridMap.isWalkable(nx, ny, forEntity)
      ) {
        visited.add(key);
        result.push([nx, ny]);
        queue.push([nx, ny, steps + 1]);
      }
    }
  }

  return result;
}