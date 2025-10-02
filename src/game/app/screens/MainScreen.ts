import { Container, FederatedPointerEvent, Graphics, Point } from "pixi.js";
import {
  makeEntityLayer,
  makeRectTileLayer,
  makeTerrainTileLayer,
} from "../core";
import { CompositeTilemap, Tilemap } from "@pixi/tilemap";
import { Viewport } from "pixi-viewport";
import { AStarFinder } from "pathfinding";
import gsap from "gsap";
import { engine } from "../getEngine";
import { GridMap } from "../core/GridMap";
import { MenuWidget } from "../widgets/Menu";
import { getAttackRange, getMoveRange } from "../core/helper";
import { Entity } from "../core/Entity";
import { DetailPopup } from "../popups/DetailPopup";

// 地图配置常量（集中管理，方便修改）
export const MAP_CONFIG = {
  width: 50, // 格子数量（宽）
  height: 50, // 格子数量（高）
  tileSize: 62, // 每个格子像素大小
  worldWidth: 50 * 62, // 3100
  worldHeight: 50 * 62,
  offsetX: 7,
  offsetY: 7,
} as const;

export class MainScreen extends Container {
  public static assetBundles = ["main"] as const;

  public readonly viewport: Viewport;

  private readonly mainContainer: Container;
  private readonly rectTileLayer: Tilemap;
  private readonly terrainTileLayer: CompositeTilemap;
  private readonly entityLayer: Container;

  private readonly menuWidget: MenuWidget;

  // 可选：用于高亮点击的格子
  private readonly highlightGraphics: Graphics;

  constructor() {
    super();

    const appEngine = engine();

    // 创建 viewport
    this.viewport = new Viewport({
      screenWidth: appEngine.screen.width,
      screenHeight: appEngine.screen.height,
      worldWidth: MAP_CONFIG.worldWidth,
      worldHeight: MAP_CONFIG.worldHeight,
      events: appEngine.renderer.events,
    });

    // 启用交互（pixi v7+ 必须）
    this.viewport.eventMode = "dynamic";

    // 设置 viewport 行为
    this.viewport.drag().decelerate().clamp({
      direction: "all",
      underflow: "none", // 允许自由拖动
    });

    this.addChild(this.viewport);

    // 创建主容器
    this.mainContainer = new Container();
    this.viewport.addChild(this.mainContainer);

    // 创建图层
    this.rectTileLayer = makeRectTileLayer();
    this.terrainTileLayer = makeTerrainTileLayer();
    this.entityLayer = makeEntityLayer();

    this.mainContainer.addChild(this.terrainTileLayer);
    this.mainContainer.addChild(this.rectTileLayer);
    this.mainContainer.addChild(this.entityLayer);

    // 创建高亮图形（可选）
    this.highlightGraphics = new Graphics();
    this.viewport.addChild(this.highlightGraphics);

    // 创建点击菜单
    this.menuWidget = new MenuWidget(
      this.onMenuLookClick.bind(this),
      this.onMenuMoveClick.bind(this),
      this.onMenuAttackClick.bind(this),
      this.onMenuEndClick.bind(this)
    );
    this.viewport.addChild(this.menuWidget);

    // 绑定事件
    this.setupInteraction();
  }

  /**
   * 设置交互事件
   */
  private setupInteraction(): void {
    this.viewport.on("pointerdown", (event) => {
      // 将屏幕坐标转换为世界坐标
      const worldPoint = this.viewport.toWorld(event.data.global);

      // 转换为格子坐标
      const gridX = Math.floor(worldPoint.x / MAP_CONFIG.tileSize);
      const gridY = Math.floor(worldPoint.y / MAP_CONFIG.tileSize);

      // 边界检查
      if (this.isValidGrid(gridX, gridY)) {
        this.onTileClick(gridX, gridY);
        this.highlightTile(gridX, gridY);
      }
    });
  }

  private onMenuLookClick(payload: {
    entity: Entity;
  }): void {
    engine().navigation.presentPopup(DetailPopup, payload.entity);
  }

  private onMenuMoveClick(payload: {
    x: number;
    y: number;
    entity: Entity;
  }): void {
    const points = getMoveRange(payload.x, payload.y, 3, GridMap.Instance);
    this.highlightRangeTiles(points, payload.x, payload.y, (e) => {
      // 获取点击的世界坐标
      const [tileX, tileY] = this.worldToUnit(e.data.global);

      // 检查该格子是否在当前移动范围内
      const isInRange = points.some(([x, y]) => x === tileX && y === tileY);

      if (isInRange) {
        // 处理逻辑
        this.handleTileClick(
          tileX,
          tileY,
          payload.x,
          payload.y,
          payload.entity
        ); // 传入起点和目标
      }
    });
  }

  private onMenuAttackClick(payload: { x: number; y: number; entity: Entity }): void {
    const points = getAttackRange(payload.x, payload.y, () => true, 1, "cross");
    this.highlightRangeTiles(
      points,
      payload.x,
      payload.y,
      (e) => {
        this.highlightGraphics.clear();
        // 获取点击的世界坐标
        const [tileX, tileY] = this.worldToUnit(e.data.global);
        const targetEntity = GridMap.Instance.getGridInfoByPos(tileX, tileY)?.entity;
        if (targetEntity) {
          targetEntity.takeDamage(payload.entity?.atk);
        }
      },
      0xfa812f
    );
  }

  private onMenuEndClick(): void {}

  private worldToUnit(point: Point) {
    const size = MAP_CONFIG.tileSize;
    const worldPoint = this.viewport.toWorld(point);
    const tileX = Math.floor(worldPoint.x / size);
    const tileY = Math.floor(worldPoint.y / size);
    return [tileX, tileY];
  }

  /**
   * 检查格子坐标是否在地图范围内
   */
  private isValidGrid(x: number, y: number): boolean {
    return x >= 0 && x < MAP_CONFIG.width && y >= 0 && y < MAP_CONFIG.height;
  }

  /**
   * 处理格子点击
   */
  private onTileClick(gx: number, gy: number): void {
    // TODO: 添加业务逻辑（如选中单位、放置建筑等）
    this.menuWidget.hide();
    const gridItem = GridMap.Instance.getGridInfoByPos(gx, gy);
    if (gridItem?.entity) {
      const x = (gx + 0.5) * MAP_CONFIG.tileSize;
      const y = (gy + 0.5) * MAP_CONFIG.tileSize;
      this.menuWidget.position.set(x + 85, y + 80);
      this.menuWidget.show({ x: gx, y: gy, entity: gridItem.entity });
    }
  }

  /**
   * 高亮指定格子（可视化反馈）
   */
  private highlightTile(gx: number, gy: number): void {
    const size = MAP_CONFIG.tileSize;
    const x = gx * size;
    const y = gy * size;
    const offset = 1;

    this.highlightGraphics
      .clear()
      .setStrokeStyle({ width: 1, color: 0xdd0303 })
      .rect(x + offset, y + offset, size, size)
      .stroke();
  }

  private highlightRangeTiles(
    points: number[][],
    gx: number,
    gy: number,
    onClick?: (e: FederatedPointerEvent) => void,
    color: number = 0x78c841
  ): void {
    const size = MAP_CONFIG.tileSize;
    this.highlightGraphics.clear();

    this.highlightGraphics.eventMode = "static"; // 或 'dynamic'
    this.highlightGraphics.cursor = "pointer";

    this.highlightGraphics
      .setFillStyle({ color, alpha: 0.3 }) // 绿色填充，30%透明度
      .setStrokeStyle({ width: 1, color }); // 深绿边框

    for (const [px, py] of points) {
      if (px === gx && py === gy) {
        continue;
      }
      const wx = px * size;
      const wy = py * size;

      // 对于每个矩形，首先设置其路径
      this.highlightGraphics
        .beginPath() // 开始一个新的路径
        .rect(wx, wy, size, size); // 添加一个矩形路径

      // 应用填充
      this.highlightGraphics.fill();

      // 应用边框
      this.highlightGraphics.stroke();

      // 结束路径
      this.highlightGraphics.closePath();

      this.highlightGraphics.off("pointerdown"); // 先解绑旧的
      this.highlightGraphics.on("pointerdown", (e) => {
        e?.stopPropagation();
        onClick?.(e);
      });
    }
  }

  private async handleTileClick(
    tX: number,
    tY: number,
    sX: number,
    sY: number,
    entity: Entity
  ) {
    const finder = new AStarFinder();
    const paths = finder.findPath(
      sX,
      sY,
      tX,
      tY,
      GridMap.Instance.getGridData()
    );
    GridMap.Instance.setGridEntity(sX, sY, null);
    GridMap.Instance.setGridEntity(tX, tY, entity);
    this.highlightGraphics.clear();
    for (let i = 0; i < paths.length; i++) {
      const [gx, gy] = paths[i];
      const { x, y } = GridMap.Instance.gridToWorldCenter(gx, gy);
      await gsap.to(entity.sp.position, {
        x,
        y,
        duration: 0.1,
        ease: "linear",
      });
    }
  }

  /**
   * 清除高亮
   */
  public clearHighlight(): void {
    this.highlightGraphics.clear();
  }

  /**
   * 销毁资源时调用
   */
  override destroy(options?: Parameters<Container["destroy"]>[0]): void {
    this.viewport.off("pointerdown"); // 移除事件监听
    super.destroy(options);
  }
}
