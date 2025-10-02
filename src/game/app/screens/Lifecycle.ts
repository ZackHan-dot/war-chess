import { Container } from 'pixi.js';
import type { Ticker } from 'pixi.js';

/** The screen that holds the app */
export class MainScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['main'];

    public mainContainer: Container;

    constructor() {
        super();

        this.mainContainer = new Container();
        this.addChild(this.mainContainer);
    }

    /** Prepare the screen just before showing */
    public prepare() {}

    /** Update the screen */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(_time: Ticker) {}

    /** Pause gameplay - automatically fired when a popup is presented */
    public async pause() {}

    /** Resume gameplay */
    public async resume() {}

    /** Fully reset */
    public reset() {}

    /** Resize the screen, fired whenever window size changes */
    public resize(width: number, height: number) {}

    /** Show screen with animations */
    public async show(): Promise<void> {}

    /** Hide screen with animations */
    public async hide() {}

    /** Auto pause the app when window go out of focus */
    public blur() {}
}
