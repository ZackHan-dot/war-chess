import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import { engine } from "../getEngine";
import { CheckBox, RadioGroup, ScrollBox } from "@pixi/ui";
import { drawRadio } from "../utils/helper";
import { Label } from "../ui/Label";
import { Tilemap } from "@pixi/tilemap";
import { makeRectTileLayer } from "../core";
import { Viewport } from "pixi-viewport";
import { Button } from "../ui/Button";
import { storage } from "@/game/engine/utils/storage";
import { MapCreatedPopup } from "../popups/MapCreatedPopup";

const PanelConfig = {
    width: 500,
};

const RadioConfig = {
    width: 25,
    height: 25,
    padding: 3,
    radius: 25,
};

const EmptyTile = "forbidden.png";

const Objects = [
    EmptyTile,
    "021-dragon-x.png",
    "022-dragon-1-x.png",
    "023-demon-x.png",
    "024-cerberus-x.png",
    "025-werewolf-x.png",
    "026-werewolf-1-x.png",
    "027-hydra-x.png",
    "028-ninja-x.png",
    "029-ninja-1-x.png",
    "030-viking-x.png",
];

const Terrains = [EmptyTile, "mountain-x.png", "river-x.png", "forest-x.png"];

const TILE_SIZE = 62;

export class MapScreen extends Container {
    public static assetBundles = ["main"];

    public readonly camera: Viewport;
    public mainContainer: Container;
    public mapEditor: Container;
    public tileLayer: Tilemap;
    public terrainLayer: Container;
    public objectLayer: Container;

    public panel: Container;
    public scrollbox: ScrollBox;
    public config = {
        size: [10, 10],
        layer: {
            terrain: [] as (string | null)[][],
            object: [] as (string | null)[][],
        },
    };
    public selectingTile?: string;
    public currentLayer: "terrain" | "object" = "terrain";
    private isDrawing = false;
    private lastTileX: number | null = null;
    private lastTileY: number | null = null;
    private makingBtn: Button;

    constructor() {
        super();
        const appEngine = engine();

        this.mainContainer = new Container();
        this.mainContainer.sortableChildren = true;
        this.addChild(this.mainContainer);

        // ==================
        // 右侧 Panel
        // ==================
        this.panel = new Container();
        const mapAreaWidth = appEngine.screen.width - PanelConfig.width;
        this.panel.position.set(mapAreaWidth, 0); // 靠右
        this.panel.zIndex = 2;
        this.mainContainer.addChild(this.panel);

        const panelBg = new Sprite(Texture.WHITE);
        panelBg.tint = 0x000000;
        panelBg.width = PanelConfig.width;
        panelBg.height = appEngine.screen.height;
        this.panel.addChild(panelBg);

        // 地图大小设置
        const settingOfMapSizeText = new Label({
            text: "地图大小",
            style: { fill: 0xffffff, fontSize: 30 },
        });
        settingOfMapSizeText.position.set(80, 30);
        this.panel.addChild(settingOfMapSizeText);

        const settingOfMapSize = new RadioGroup({
            items: [
                new CheckBox({
                    text: "10 x 10",
                    style: {
                        text: { fill: 0xffffff, fontSize: 20 },
                        unchecked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0xffffff,
                            color: 0xffffff,
                        }),
                        checked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0x000000,
                            color: 0xffffff,
                        }),
                    },
                }),
                new CheckBox({
                    text: "25 x 25",
                    style: {
                        text: { fill: 0xffffff, fontSize: 20 },
                        unchecked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0xffffff,
                            color: 0xffffff,
                        }),
                        checked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0x000000,
                            color: 0xffffff,
                        }),
                    },
                }),
                new CheckBox({
                    text: "50 x 50",
                    style: {
                        text: { fill: 0xffffff, fontSize: 20 },
                        unchecked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0xffffff,
                            color: 0xffffff,
                        }),
                        checked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0x000000,
                            color: 0xffffff,
                        }),
                    },
                }),
            ],
            type: "vertical",
            elementsMargin: 10,
        });
        settingOfMapSize.position.set(50, 60);
        settingOfMapSize.onChange.connect(this.mapSizeChange.bind(this));
        this.panel.addChild(settingOfMapSize);

        // 地图图层设置
        const settingOfMapTerrainText = new Label({
            text: "地图图层设置",
            style: { fill: 0xffffff, fontSize: 30 },
        });
        settingOfMapTerrainText.position.set(110, 220);
        this.panel.addChild(settingOfMapTerrainText);

        const settingOfMapTerrain = new RadioGroup({
            items: [
                new CheckBox({
                    text: "地形层",
                    style: {
                        text: { fill: 0xffffff, fontSize: 20 },
                        unchecked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0xffffff,
                            color: 0xffffff,
                        }),
                        checked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0x000000,
                            color: 0xffffff,
                        }),
                    },
                }),
                new CheckBox({
                    text: "对象层",
                    style: {
                        text: { fill: 0xffffff, fontSize: 20 },
                        unchecked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0xffffff,
                            color: 0xffffff,
                        }),
                        checked: drawRadio({
                            ...RadioConfig,
                            fillColor: 0x000000,
                            color: 0xffffff,
                        }),
                    },
                }),
            ],
            type: "vertical",
            elementsMargin: 10,
        });
        settingOfMapTerrain.position.set(50, 250);
        settingOfMapTerrain.onChange.connect(this.layerChange.bind(this));

        this.panel.addChild(settingOfMapTerrain);

        // 瓷砖设置
        this.scrollbox = new ScrollBox({
            width: 380,
            height: 490,
            elementsMargin: 10,
            type: "vertical",
            disableEasing: false,
            globalScroll: false,
            shiftScroll: false,
        });
        this.scrollbox.position.set(50, 350);
        createItems(this.scrollbox, Terrains, this.onTileSelect.bind(this));
        this.panel.addChild(this.scrollbox);

        // ==================
        // 左侧 Camera + MapEditor
        // ==================

        const tileWorldW = this.config.size[0] * TILE_SIZE;
        const tileWorldH = this.config.size[1] * TILE_SIZE;

        // world 要至少 >= 可见区域，否则 viewport 可能会把内容居中（underflow）
        const worldW = Math.max(mapAreaWidth, tileWorldW);
        const worldH = Math.max(appEngine.screen.height, tileWorldH);

        this.camera = new Viewport({
            screenWidth: mapAreaWidth,
            screenHeight: appEngine.screen.height,
            worldWidth: worldW,
            worldHeight: worldH,
            events: appEngine.renderer.events,
        });

        this.camera.eventMode = "dynamic";
        this.camera.drag().decelerate();

        // 明确 clamp 的边界（如果 world 比 screen 大则限制拖动）
        this.camera.clamp({
            left: 0,
            top: 0,
            right: Math.max(0, worldW - mapAreaWidth),
            bottom: Math.max(0, worldH - appEngine.screen.height),
            direction: "all",
            underflow: "none", // 允许自由拖动（但我们已通过 world >= screen 防止自动居中）
        });

        this.zIndex = 1;
        this.mainContainer.addChild(this.camera);

        // 强制相机从左上角开始
        this.camera.moveCorner(0, 0);

        // MapEditor 占用 camera 的左侧区域（坐标系内 0,0 为左上角）
        this.mapEditor = new Container();
        this.mapEditor.pivot.set(0, 0);
        this.mapEditor.position.set(0, 0);
        this.mapEditor.width = mapAreaWidth;
        this.mapEditor.height = appEngine.screen.height;
        // 左侧 MapEditor 添加点击监听
        this.mapEditor.interactive = true;
        this.mapEditor
            .on("pointerdown", this.startDrawing.bind(this))
            .on("pointerup", this.stopDrawing.bind(this))
            .on("pointerupoutside", this.stopDrawing.bind(this))
            .on("pointermove", this.onTileMove.bind(this));
        this.camera.addChild(this.mapEditor);

        // TileLayer（确保 pivot/pos = 0）
        this.tileLayer = makeRectTileLayer(
            this.config.size[0],
            this.config.size[1]
        );
        this.tileLayer.pivot.set(0, 0);
        this.tileLayer.position.set(0, 0);
        this.mapEditor.addChild(this.tileLayer);

        this.terrainLayer = new Container();
        this.mapEditor.addChild(this.terrainLayer);

        this.objectLayer = new Container();
        this.mapEditor.addChild(this.objectLayer);


        this.makingBtn = new Button({
            view: 'box_white.png',
            width: 180,
            height: 60,
            text: '地图生成',
            textFill: 0x000000,
            onDown: this.handleMakingMap.bind(this)
        });
        this.makingBtn.position.set(500/2, appEngine.screen.height - 100);
        this.panel.addChild(this.makingBtn);
    }

    private handleMakingMap() {
        engine().navigation.presentPopup(MapCreatedPopup, (mapName: string) => {
            storage.setObject(`map/${mapName}`, this.config);
        });
    }

    private mapSizeChange(selectedItemID: number) {
        if (selectedItemID === 1) {
            this.config.size = [25, 25];
        } else if (selectedItemID === 2) {
            this.config.size = [50, 50];
        } else {
            this.config.size = [10, 10];
        }
        // 删除旧 layer，重建新的
        if (this.tileLayer && this.mapEditor.children.includes(this.tileLayer)) {
            this.mapEditor.removeChild(this.tileLayer);
        }
        this.tileLayer = makeRectTileLayer(
            this.config.size[0],
            this.config.size[1]
        );
        this.tileLayer.pivot.set(0, 0);
        this.tileLayer.position.set(0, 0);
        this.mapEditor.addChild(this.tileLayer);

        // 更新 viewport 的 world 大小（和 clamp）
        this.updateViewportSize();
        // 清空地图上已有的
        this.config.layer.object = [];
        this.config.layer.terrain = [];
        this.terrainLayer.removeChildren();
        this.objectLayer.removeChildren();
    }

    private layerChange(selectedItemID: number) {
        const isObject = selectedItemID === 1;
        this.currentLayer = isObject ? "object" : "terrain";
        createItems(
            this.scrollbox,
            selectedItemID === 1 ? Objects : Terrains,
            this.onTileSelect.bind(this)
        );
    }

    private updateViewportSize() {
        const appEngine = engine();
        const mapAreaWidth = appEngine.screen.width - PanelConfig.width;

        const tileWorldW = this.config.size[0] * TILE_SIZE;
        const tileWorldH = this.config.size[1] * TILE_SIZE;

        const worldW = Math.max(mapAreaWidth, tileWorldW);
        const worldH = Math.max(appEngine.screen.height, tileWorldH);

        // 调整 camera 的可见区域大小（有 api 的话用 resize）
        if (typeof (this.camera as any).resize === "function") {
            (this.camera as any).resize(mapAreaWidth, appEngine.screen.height);
        } else {
            // 如果没有 resize，尝试直接设置（多数 pixi-viewport 支持 resize）
            (this.camera as any).screenWidth = mapAreaWidth;
            (this.camera as any).screenHeight = appEngine.screen.height;
        }

        (this.camera as any).worldWidth = worldW;
        (this.camera as any).worldHeight = worldH;

        // clamp 边界
        this.camera.clamp({
            left: 0,
            top: 0,
            right: Math.max(0, worldW - mapAreaWidth),
            bottom: Math.max(0, worldH - appEngine.screen.height),
            direction: "all",
            underflow: "none",
        });

        // 把相机移回左上角（初始位）
        this.camera.moveCorner(0, 0);

        // 把 panel 固定到右侧（如果屏幕尺寸变了，panel 要跟随）
        this.panel.position.set(mapAreaWidth, 0);
    }

    // 开始绘制
    private startDrawing(event: FederatedPointerEvent) {
        this.isDrawing = true;
        this.lastTileX = null;
        this.lastTileY = null;
        this.drawTile(event);
    }

    // 停止绘制
    private stopDrawing() {
        this.isDrawing = false;
        this.lastTileX = null;
        this.lastTileY = null;
    }

    // 拖动绘制
    private onTileMove(event: FederatedPointerEvent) {
        if (!this.isDrawing) return;
        this.drawTile(event);
    }

    private onTileSelect(name: string) {
        const tileName = name?.replace("-x", "");
        this.selectingTile = tileName;
        console.log("当前选择的瓷砖：", this.selectingTile);
    }

    // 抽取绘制逻辑
    private drawTile(event: FederatedPointerEvent) {
        if (!this.selectingTile) return;

        const pos = event.data.getLocalPosition(this.tileLayer);
        const tileX = Math.floor(pos.x / TILE_SIZE);
        const tileY = Math.floor(pos.y / TILE_SIZE);

        if (
            tileX < 0 ||
            tileX >= this.config.size[0] ||
            tileY < 0 ||
            tileY >= this.config.size[1]
        )
            return;

        // 如果还是上一个格子，则不重复绘制
        if (tileX === this.lastTileX && tileY === this.lastTileY) return;
        this.lastTileX = tileX;
        this.lastTileY = tileY;

        // 获取当前 layer 对应的容器和 config
        const layerContainer =
            this.currentLayer === "terrain" ? this.terrainLayer : this.objectLayer;
        const layerArray = this.config.layer[this.currentLayer];

        if (!layerArray[tileY]) layerArray[tileY] = [];

        // 删除当前位置已有的精灵
        for (let i = layerContainer.children.length - 1; i >= 0; i--) {
            const child = layerContainer.children[i] as any;
            if (child.tileX === tileX && child.tileY === tileY) {
                layerContainer.removeChild(child);
            }
        }

        if (this.selectingTile === EmptyTile) {
            layerArray[tileY][tileX] = null;
            return;
        }

        // 正常绘制 tile
        layerArray[tileY][tileX] = this.selectingTile;

        const sprite = new Sprite(Texture.from(this.selectingTile));
        sprite.x = tileX * TILE_SIZE + 7; // 对齐
        sprite.y = tileY * TILE_SIZE + 7;
        (sprite as any).tileX = tileX;
        (sprite as any).tileY = tileY;
        layerContainer.addChild(sprite);
    }
}

function createItems(
    scrollbox: ScrollBox,
    items: string[],
    onSelect?: (name: string) => void
) {
    scrollbox.removeItems();

    const itemsPerRow = 3;
    const itemWidth = 100;
    const itemHeight = 100;
    const spacingX = 10; // 横向间距

    let currentRow = new Container(); // 提前创建，永不为 null
    let itemIndexInRow = 0;
    const spConArr: Container[] = [];

    for (let i = 0; i < items.length; i++) {
        const terrain = items[i];
        const spCon = new Container();
        spCon.label = terrain;
        spCon.interactive = true;

        // 👇 白色背景
        const bg = new Sprite(Texture.WHITE);
        bg.label = "bg";
        bg.width = itemWidth + 15;
        bg.height = itemHeight + 15;
        bg.tint = 0xffffff; // 确保是白色（Texture.WHITE 默认是白色，但 tint 可增强）
        spCon.addChild(bg);

        // 👇 精灵图
        const sp = new Sprite(Texture.from(terrain));
        sp.width = itemWidth;
        sp.height = itemHeight;

        // ✅ 关键：让 sp 居中于 bg
        sp.x = (bg.width - sp.width) / 2;
        sp.y = (bg.height - sp.height) / 2;
        spCon.addChild(sp);

        // ✅ 设置 spCon 在当前行的位置（横向排列）
        spCon.x = itemIndexInRow * (itemWidth + 15 + spacingX); // 注意：宽度是 bg.width
        spCon.y = 0;

        currentRow.addChild(spCon);
        itemIndexInRow++;

        // 如果当前行满了，就添加到 ScrollBox 并换行
        if (itemIndexInRow === itemsPerRow) {
            scrollbox.addItem(currentRow);
            currentRow = new Container();
            itemIndexInRow = 0;
        }

        spConArr.push(spCon);
        spCon.on("click", () => {
            const spBg = spCon.getChildByLabel("bg");
            if (spBg) {
                spBg.tint = spBg.tint === 0xffffff ? 0xfff000 : 0xffffff;
            }
            spConArr.forEach((item) => {
                if (item.label !== spCon.label) {
                    const itemSpBg = item.getChildByLabel("bg");
                    if (itemSpBg) {
                        itemSpBg.tint = 0xffffff;
                    }
                }
            });
            onSelect?.(spCon.label);
        });
    }

    // 添加最后一行（不满 3 个的情况）
    if (currentRow.children.length > 0) {
        scrollbox.addItem(currentRow);
    }
}
