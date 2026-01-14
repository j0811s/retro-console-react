import DpadButton from "./DpadButton";

type Props = {
  onPressUp: () => void;
  onPressRight: () => void;
  onPressDown: () => void;
  onPressLeft: () => void;
}

function Dpad(props: Props) {
  return (
    <div className="dpad">
      <DpadButton direction="up" onPress={props.onPressUp} />
      <DpadButton direction="right" onPress={props.onPressRight} />
      <DpadButton direction="down" onPress={props.onPressDown} />
      <DpadButton direction="left" onPress={props.onPressLeft } />
    </div>
  )
}

export default Dpad;
