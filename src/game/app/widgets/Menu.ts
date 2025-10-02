import { Container, Point, Sprite, Texture } from "pixi.js";
import { List } from '@pixi/ui';
import { Label } from "../ui/Label";

export class MenuWidget extends Container {
    private bg!: Sprite;
    private panel!: Container;
    private layout!: List;

    private lookMenuItem!: Label;
    private moveMenuItem!: Label;
    private attackMenuItem!: Label;
    private endMenuItem!: Label;

    // 菜单项文本和回调
    private onLook: (payload: any) => void;
    private onMove: (payload: any) => void;
    private onAttack: (payload: any) => void;
    private onEnd: (payload: any) => void;

    private payload!: any;

    constructor(
        onLook: (payload: any) => void,
        onMove: (payload: any) => void,
        onAttack: (payload: any) => void,
        onEnd: (payload: any) => void
    ) {
        super();
        this.onLook = onLook
        this.onMove = onMove;
        this.onAttack = onAttack;
        this.onEnd = onEnd;

        this.createMenu();
    }

    private createMenu(): void {
        // === 创建菜单项 ===
        this.lookMenuItem = new Label({
            text: '查看',
            style: {
                fill: 0xffffff,
                fontSize: 20,
                fontWeight: 'bold',
            },
        });
        this.lookMenuItem.interactive = true;
        this.lookMenuItem.on('pointerdown', (e) => {
            e?.stopPropagation();
            this.onLook(this.payload);
            this.hide();
        });

        this.moveMenuItem = new Label({
            text: '移动',
            style: {
                fill: 0xffffff,
                fontSize: 20,
                fontWeight: 'bold',
            },
        });
        this.moveMenuItem.interactive = true;
        this.moveMenuItem.on('pointerdown', (e) => {
            e?.stopPropagation();
            this.onMove(this.payload);
            this.hide();

        });

        this.attackMenuItem = new Label({
            text: '攻击',
            style: {
                fill: 0xffffff,
                fontSize: 20,
                fontWeight: 'bold',
            },
        });
        this.attackMenuItem.interactive = true;
        this.attackMenuItem.on('pointerdown', (e) => {
            e?.stopPropagation();
            this.onAttack(this.payload);
            this.hide();

        });

        this.endMenuItem = new Label({
            text: '结束',
            style: {
                fill: 0xffffff,
                fontSize: 20,
                fontWeight: 'bold'
            },
        });
        this.endMenuItem.interactive = true;
        this.endMenuItem.on('pointerdown', (e) => {
            e?.stopPropagation();
            this.onEnd(this.payload);
            this.hide();
        });

        // === 创建布局容器 ===
        this.panel = new Container();
        this.addChild(this.panel);

        // 使用 List 垂直布局
        this.layout = new List({
            type: 'vertical',
            elementsMargin: 4, // 项间距
        });

        this.panel.addChild(this.layout);

        // 添加菜单项
        this.layout.addChild(this.lookMenuItem);
        this.layout.addChild(this.moveMenuItem);
        this.layout.addChild(this.attackMenuItem);
        this.layout.addChild(this.endMenuItem);

        // === 创建背景框 ===
        const padding = 10;
        const menuWidth = Math.max(
            this.moveMenuItem.width,
            this.attackMenuItem.width,
            this.endMenuItem.width
        ) + padding * 2;

        const menuHeight = this.layout.height + padding * 2;

        this.bg = new Sprite(Texture.WHITE);
        this.bg.tint = 0x000000;
        this.bg.alpha = 0.7;
        this.bg.width = menuWidth;
        this.bg.height = menuHeight;
        this.bg.x = -padding * 2;
        this.bg.y = -padding - 3;

        // 将背景插入到底层
        this.panel.addChildAt(this.bg, 0);

        // 居中布局（可选）
        this.layout.x = padding;
        this.layout.y = padding;

        // 设置锚点（方便定位到单位上方）
        this.pivot.set(this.bg.width / 2, this.bg.height); // 菜单底部居中，指向单位
    }

    // 设置菜单位置（调用时传入单位的位置）
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    // 显示菜单
    public show(payload: any): void {
        this.visible = true;
        this.payload = payload;
        console.log(payload);
    }

    // 隐藏菜单
    public hide(): void {
        this.visible = false;
        this.payload = null;
    }
}