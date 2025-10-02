import "./index.css";

const imgs = [
  "021-dragon.png",
  "022-dragon-1.png",
  "023-demon.png",
  "024-cerberus.png",
  "025-werewolf.png",
];
export default function Select() {
  return (
    <div className="select-wrapper">
      {imgs.map((item) => (
        <div className="select-item-card">
          <img src={`/assets/main/${item}`} />
        </div>
      ))}
    </div>
  );
}
