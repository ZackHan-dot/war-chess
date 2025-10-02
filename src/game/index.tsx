import { MAP } from '@/constants';
import { setEngine } from '@/game/app/getEngine';
import { LoadScreen } from '@/game/app/screens/LoadScreen';
import { MainScreen } from '@/game/app/screens/MainScreen';
import { userSettings } from '@/game/app/utils/userSettings';
import { CreationEngine } from '@/game/engine/engine';

import type { GameType } from '@/constants';

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import '@pixi/sound';
import { useEffect, useRef } from 'react';
import { MapScreen } from './app/screens/MapScreen';
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

interface GameProps {
    type: GameType;
}

export default function Game(props: GameProps) {
    const { type } = props;
    const pixiContainerRef = useRef<HTMLDivElement | null>(null);
    const initialized = useRef(false);
    const initFinished = useRef(false);

    useEffect(() => {
        if (pixiContainerRef.current && !initialized.current) {
            initialized.current = true;
            const initEngine = async () => {
                // Initialize the creation engine instance
                await engine.init({
                    background: '#ffffff',
                    resizeOptions: {
                        minWidth: 768,
                        minHeight: 1024,
                        letterbox: false,
                    },
                    dom: pixiContainerRef.current!,
                });

                // Initialize the user settings
                userSettings.init();

                // Show the load screen
                await engine.navigation.showScreen(LoadScreen);
                if (type === MAP) {
                    await engine.navigation.showScreen(MapScreen);
                } else {
                    await engine.navigation.showScreen(MainScreen);
                }
                initFinished.current = true;
            };
            initEngine();
        }
        return () => {
            if (initialized.current && initFinished.current) {
                engine.destroy(true, true);
            }
        };
    }, []);
    return <div ref={pixiContainerRef}></div>;
}
