import { Grid } from "pathfinding";
import { MAP_CONFIG } from "../screens/MainScreen";
import type { Entity, EntityType } from "./Entity";

export type Terrain = "road" | "forest" | "river" | "mountain";
export type GridData = number[][];

export interface GridMapItem {
  x: number;
  y: number;
  terrain: Terrain;
  entity: Entity | null;
}

export class GridMap {
  static readonly WIDTH = 50;
  static readonly HEIGHT = 50;
  static readonly Instance = new GridMap();

  // 使用一维数组，性能更好：O(1) 索引，内存连续
  private grid: (GridMapItem | null)[] = [];

  private constructor() {
    this.initializeGrid();
  }

  private initializeGrid() {
    const size = GridMap.WIDTH * GridMap.HEIGHT;
    this.grid = new Array(size).fill(null);
  }

  private getIndex(x: number, y: number): number {
    return y * GridMap.WIDTH + x;
  }

  private isValidPos(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < GridMap.WIDTH && y < GridMap.HEIGHT;
  }

  public getGrid() {
    return this.grid;
  }

  setGridEntity(x: number, y: number, entity: Entity | null) {
    if (!this.isValidPos(x, y)) {
      console.warn(`Invalid position set: ${x},${y}`);
      return;
    }
    const index = this.getIndex(x, y);
    if (this.grid[index]) {
      this.grid[index].entity = entity;
    }
  }

  setGridMapping(
    x: number,
    y: number,
    terrain: Terrain,
    entity: Entity | null
  ) {
    if (!this.isValidPos(x, y)) {
      console.warn(`Invalid position set: ${x},${y}`);
      return;
    }

    const index = this.getIndex(x, y);
    this.grid[index] = {
      x,
      y,
      terrain,
      entity,
    };
  }

  isOccupied(x: number, y: number): boolean {
    const tile = this.getGridInfoByPos(x, y);
    return !!tile?.entity;
  }

  getGridInfoByPos(x: number, y: number): GridMapItem | null {
    if (!this.isValidPos(x, y)) return null;

    const item = this.grid[this.getIndex(x, y)];
    return item ?? null; // 确保 undefined 返回 null
  }

  /**
   * 判断某格子是否可行走
   * @param x X坐标
   * @param y Y坐标
   * @param entity 可选：用于特殊单位判断（如飞行单位）
   */
  isWalkable(x: number, y: number, entity?: Entity): boolean {
    if (!this.isValidPos(x, y)) return false;

    const grid = this.getGridInfoByPos(x, y);
    if (!grid) return false;

    // 格子本身被实体占据（且不是自己），也不可走
    if (grid.entity !== null && !this.isSameEntity(grid.entity, entity)) {
      return false;
    }

    return this.canUnitTraverse(grid.terrain, entity?.type);
  }

  // 私有方法：判断单位能否通过地形
  private canUnitTraverse(terrain: Terrain, entityType?: EntityType): boolean {
    // 默认规则：river 和 mountain 不可走
    if (terrain === "river" || terrain === "mountain") {
      // 特例：如果是飞行单位（假设用 'character' 表示飞行单位），可以飞过去
      // 这里你可以根据 entityType 扩展规则
      if (entityType === "character") {
        // 假设只有角色能飞（或某些单位）
        return terrain !== "mountain"; // 河上能飞，山上不能？
      }
      return false; // 其他单位不能过河或上山
    }

    // road 和 forest 都可以走
    return true;
  }

  /**
   * 获取占据该格子的实体（原 unit）
   */
  getOccupiedEntity(x: number, y: number): Entity | null {
    return this.getGridInfoByPos(x, y)?.entity ?? null;
  }

  // 辅助：判断是否是同一类实体（可按需扩展）
  private isSameEntity(a: Entity, b?: Entity): boolean {
    return a === b;
  }

  // 可选：清空某个格子
  clearGrid(x: number, y: number) {
    if (this.isValidPos(x, y)) {
      const index = this.getIndex(x, y);
      if (this.grid[index]) {
        this.grid[index]!.entity = null;
      }
    }
  }

  // 可选：批量初始化地图
  bulkInit(
    data: {
      x: number;
      y: number;
      terrain: Terrain;
      entity: Entity | null;
    }[]
  ) {
    data.forEach((d) => this.setGridMapping(d.x, d.y, d.terrain, d.entity));
  }

  /**
   * 获取用于寻路的二维网格数据（0 = 可走, 1 = 障碍）
   * 会考虑地形和实体占据情况
   */
  getGridData() {
    const { WIDTH, HEIGHT } = GridMap;

    // 创建二维数组
    const gridData = Array(HEIGHT)
      .fill(null)
      .map(() => Array(WIDTH).fill(0));

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const index = this.getIndex(x, y);
        const item = this.grid[index];

        // 如果格子不存在或地形本身不可走（如 mountain/river）
        if (!item) {
          gridData[y][x] = 1;
          continue;
        }

        // 使用 isWalkable 判断是否可走（但不传 entity，只看地形 + 是否被占）
        // 注意：这里我们不传 entity，意味着默认按“普通单位”判断
        if (!this.isWalkable(x, y)) {
          gridData[y][x] = 1;
        } else {
          gridData[y][x] = 0;
        }
      }
    }

    return new Grid(gridData);
  }

  /**
   * 将格子坐标 (gx, gy) 转换为世界坐标（格子中心）
   */
  gridToWorldCenter(gx: number, gy: number): { x: number; y: number } {
    if (!this.isValidPos(gx, gy)) {
      console.warn(`Invalid grid position: ${gx}, ${gy}`);
      return { x: 0, y: 0 };
    }
    const size = MAP_CONFIG.tileSize;
    return {
      x: gx * size + MAP_CONFIG.offsetX,
      y: gy * size + MAP_CONFIG.offsetY,
    };
  }
}
