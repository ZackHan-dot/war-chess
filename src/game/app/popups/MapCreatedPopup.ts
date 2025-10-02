import { BlurFilter, Container, Sprite, Texture } from "pixi.js";
import gsap from "gsap";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { Graphics } from "pixi.js";
import { Input } from "@pixi/ui";
import { engine } from "../getEngine";

export class MapCreatedPopup extends Container {
    private bg: Sprite;
    private panel: Container;
    private panelBase: RoundedBox;
    private title: Label;
    private nameInput: Input;
    private doneButton: Button;
    private cancelButton: Button;

    constructor(onConfirm: (mapName: string) => void) {
        super();

        // 半透明背景
        this.bg = new Sprite(Texture.WHITE);
        this.bg.tint = 0x0;
        this.bg.interactive = true;
        this.addChild(this.bg);

        // 面板
        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ width: 400, height: 300, shadow: false });
        this.panel.addChild(this.panelBase);

        // 标题
        this.title = new Label({
            text: "地图已生成！请给地图起个名字",
            style: { fill: 0x000000, fontSize: 24, wordWrap: true, breakWords: true, wordWrapWidth: 380 },
        });
        this.title.y = -100;
        this.panel.addChild(this.title);

        // PixiUI 输入框
        const inputBg = new Graphics()
            .beginFill(0x333333)
            .lineStyle(3, 0x000000)
            .drawRoundedRect(0, 0, 250, 50, 10)
            .endFill();
        this.nameInput = new Input({
            bg: inputBg,
            textStyle: { fill: 0xffffff, fontSize: 20 },
            placeholder: "输入地图名字（英文）",
            align: "center",
            maxLength: 20,
            padding: [0, 10, 0, 10],
            cleanOnFocus: true,
        });
        this.nameInput.position.set(-125, -25); // 居中于 panel
        this.panel.addChild(this.nameInput);

        // 确认按钮
        this.doneButton = new Button({ text: "开始游戏", width: 120, height: 40, fontSize: 18 });
        this.doneButton.position.set(-80, 80);
        this.doneButton.onDown.connect(() => {
            const name = this.nameInput.value.trim();
            if (name) {
                onConfirm(name);
                engine().navigation.dismissPopup()
            } else {
                alert("请输入地图名字");
            }
        });
        this.panel.addChild(this.doneButton);

        // 取消按钮
        this.cancelButton = new Button({ text: "取消", width: 120, height: 40, fontSize: 18 });
        this.cancelButton.position.set(80, 80);
        this.cancelButton.onDown.connect(() => this.hide());
        this.panel.addChild(this.cancelButton);
    }

    public resize(width: number, height: number) {
        this.bg.width = width;
        this.bg.height = height;
        this.panel.x = width / 2;
        this.panel.y = height / 2;
    }

    public async show() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [
                new BlurFilter({ strength: 5 }),
            ];
        }
        this.bg.alpha = 0;
        this.panel.pivot.y = -400;
        gsap.to(this.bg, { alpha: 0.8, duration: 0.2, ease: 'linear' });
        await gsap.to(this.panel.pivot, {
            y: 0,
            duration: 0.3,
            ease: 'back.out',
        });
    }

    public async hide() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [];
        }
        gsap.to(this.bg, { alpha: 0, duration: 0.2, ease: 'linear' });
        await gsap.to(this.panel.pivot, {
            y: -500,
            duration: 0.3,
            ease: 'back.in',
        });
    }
}
