import { useState } from "react";
import clsx from "clsx";
import Game from "../game";
import Main from '../ui/screen/main';
import { GAME, MAP } from "@/constants";

import type { GameType } from '@/constants';

export default function App() {
  const [gameStart, setGameStart] = useState(false);
  const [type, setType] = useState<GameType>(GAME);
  const startGame = () => {
    setType(GAME);
    setGameStart(true);
  };

  const createMap = () => {
    setType(MAP);
    setGameStart(true);
  };
  return (
    <div
        className={clsx(
            'relative w-full h-full',
            gameStart ? 'flex flex-row items-center justify-center' : ''
        )}
    >
        {gameStart ? (
            <Game type={type} />
        ) : (
            <Main
              onStart={startGame}
              onCreateMap={createMap}
            />
        )}
    </div>
  );
}
