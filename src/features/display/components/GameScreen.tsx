import { GameSlot, OpeningLogo } from '@/features/display';
import type { JSX } from 'react';

type Props = {
  rom?: JSX.Element;
}

function GameScreen({ rom }: Props) {
  return (
    <div className="display">
      <div id="app" className="screen">
        <OpeningLogo />
        <GameSlot game={rom} />
      </div>
      <small className="logo">GAMEPOY ADVANCE</small>
    </div>
  )
}

export default GameScreen;
