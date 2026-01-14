import type { JSX } from "react";

type Props = {
  game?: JSX.Element;
}

function GameSlot({ game }: Props) {
  return (
    <div id="rom-slot">{game}</div>
  );
}

export default GameSlot;
