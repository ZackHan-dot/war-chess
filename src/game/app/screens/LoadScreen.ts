import { ProgressBar } from '@pixi/ui';
import { Container } from 'pixi.js';
import gsap from 'gsap';

/** Screen shown while loading assets */
export class LoadScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['preload'];
    /** Progress Bar */
    private progressBar: ProgressBar;

    constructor() {
        super();

        this.progressBar = new ProgressBar({
            bg: "bg.png",
            fill: "bar.png",
            fillPaddings: {
                top: 20,
                left: 20,
            },
            progress: 0,
        });

        this.progressBar.x = screen.width * 0.5 - this.progressBar.width * 0.5;
        this.progressBar.y = screen.height * 0.5 - this.progressBar.height * 0.5;

        this.addChild(this.progressBar);
    }

    public onLoad(progress: number) {
        this.progressBar.progress = progress;
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        const barWidth = this.progressBar.width;
        const barHeight = this.progressBar.height;
        this.progressBar.position.set(width * 0.5 - barWidth * 0.5, height * 0.5 - barHeight * 0.5);
    }

    /** Show screen with animations */
    public async show() {
        this.alpha = 1;
    }

    /** Hide screen with animations */
    public async hide() {
        await gsap.to(this, {
            alpha: 0,
            duration: 0.3,
            ease: 'linear',
            delay: 1,
        });
    }
}
