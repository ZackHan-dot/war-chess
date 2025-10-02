import gsap from 'gsap';
import { BlurFilter, Container, Sprite, Texture } from 'pixi.js';

import { engine } from '../getEngine';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { RoundedBox } from '../ui/RoundedBox';
import { Entity } from '../core/Entity';
import { EntityMap } from '../core/constants';

export class DetailPopup extends Container {
    /** The dark semi-transparent background covering current screen */
    private bg: Sprite;
    /** Container for the popup UI components */
    private panel: Container;
    /** The popup title label */
    private title: Label;
    /** Button that closes the popup */
    private doneButton: Button;
    /** The panel background */
    private panelBase: RoundedBox;

    private imgBg!: Sprite;
    private amtText!: Label;
    private hpText!: Label;
    private descText!: Label;

    constructor(entity: Entity) {
        super();

        const entityConfig = EntityMap[entity?.name];

        this.bg = new Sprite(Texture.WHITE);
        this.bg.tint = 0x0;
        this.bg.interactive = true;
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ width: 350, height: 500, shadow: false });
        this.panel.addChild(this.panelBase);

        this.title = new Label({
            text: entityConfig?.name || '单位详情',
            style: { fill: 0x000000, fontSize: 30 },
        });
        this.title.y = -220;
        this.panel.addChild(this.title);

        this.doneButton = new Button({ text: '关闭', height: 35, width: 65, fontSize: 20 });
        this.doneButton.y = 225;
        this.doneButton.x = 135;
        this.doneButton.onPress.connect(() =>
            engine().navigation.dismissPopup()
        );
        this.panel.addChild(this.doneButton);
        if (entityConfig) {
            this.imgBg = new Sprite(Texture.from(`${entityConfig.coverImg}`));
            this.imgBg.anchor.set(0.5);
            this.imgBg.position.set(0, -50);
            this.imgBg.scale.set(0.5);
            this.panel.addChild(this.imgBg);

            this.hpText = new Label({
                text: `生命值：${entity.hp}/${entity.maxHp}` || '',
                style: { fill: 0x000000, fontSize: 20 },
            });
            this.hpText.y = 110;
            this.panel.addChild(this.hpText);

            this.amtText = new Label({
                text: `攻击力：${entityConfig?.atk}` || '',
                style: { fill: 0x000000, fontSize: 20 },
            });
            this.amtText.y = 140;
            this.panel.addChild(this.amtText);

            this.descText = new Label({
                text: `${entityConfig?.description}` || '',
                style: {
                    fill: 0xcccccc,
                    fontSize: 14,
                    wordWrap: true,
                    breakWords: true,
                    wordWrapWidth: 250
                },
            });
            this.descText.y = 180;
            this.panel.addChild(this.descText);
        }
    }

    public resize(width: number, height: number) {
        this.bg.width = width;
        this.bg.height = height;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;
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