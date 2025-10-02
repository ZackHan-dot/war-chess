import { CompositeTilemap, Tilemap } from "@pixi/tilemap";
import { Container, Sprite, Texture } from "pixi.js";
import { GridMap, Terrain } from "./GridMap";
import { Entity } from "./Entity";

export const UNIT = 'unit.png';
export const Tree = 'forest.png';
export const Waves = 'river.png';
export const Mountain = 'mountain.png';

export const TerrainMap = new Map([
    [1, Tree],
    [2, Waves],
    [3, Mountain],
]);

export function makeRectTileLayer(width = 50, height = 50) {
    const tilemap = new Tilemap([Texture.from(UNIT).baseTexture]);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            tilemap.tile(UNIT, x * 62, y * 62);
        }
    }
    return tilemap;
}

export function makeTerrainTileLayer(width = 50, height = 50) {
    const tilemap = new CompositeTilemap();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const r = Math.random();
            if (r > 0.1 && r < 0.7) {
                GridMap.Instance.setGridMapping(x, y, 'road', null);
                continue;
            }
            // 假设 TerrainMap.get(...) 返回的是 Texture 或纹理名称
            const textureKey = Math.ceil(Math.random() * 3);
            const texture = TerrainMap.get(textureKey) as string; // 确保返回的是 Texture 实例

            // 计算居中位置
            const posX = x * 62 + 7;
            const posY = y * 62 + 7;

            // 使用 tile 方法绘制
            tilemap.tile(texture, posX, posY);
            GridMap.Instance.setGridMapping(x, y, texture?.split('.')?.[0] as Terrain, null);
        }
    }
    return tilemap;
}

const imgs = ['021-dragon.png', '022-dragon-1.png', '023-demon.png', '024-cerberus.png', '025-werewolf.png', '026-werewolf-1.png', '027-hydra.png', '028-ninja.png', '029-ninja-1.png', '030-viking.png'];
export function makeEntityLayer(width = 50, height = 50) {
    const entityLayer = new Container();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const grid = GridMap.Instance.getGridInfoByPos(x, y);
            const r = Math.random();
            if (grid?.terrain !== 'road' || r > 0.1) {
                continue;
            }
            const textureKey = Math.floor(Math.random() * imgs.length);
            const textureRes = imgs[textureKey];
            const texture = Texture.from(textureRes);
            const posX = x * 62 + 7;
            const posY = y * 62 + 7;
            const spContainer = new Container();
            const e = new Sprite(texture);
            spContainer.addChild(e);
            spContainer.x = posX;
            spContainer.y = posY;
            entityLayer.addChild(spContainer);

            const entity = new Entity('character', textureRes, spContainer);
            GridMap.Instance.setGridEntity(x, y, entity);
        }
    }
    return entityLayer;
}