interface MainProps {
  onStart?: () => void;
  onCreateMap?: () => void;
}

export default function Main(props: MainProps) {
  const { onStart, onCreateMap } = props;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold text-black mb-20 tracking-wider">
          模拟战棋
        </h1>
        <div className="flex flex-row items-center justify-center gap-6">
          <button
            className="w-32 h-12 cursor-pointer border border-black text-black font-medium text-sm hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            onClick={onStart}
          >
            开始游戏
          </button>

          <button
            className="w-32 h-12 cursor-pointer border border-black text-black font-medium text-sm hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            onClick={onCreateMap}
          >
            创建地图
          </button>
        </div>
      </div>
    </>
  );
}
