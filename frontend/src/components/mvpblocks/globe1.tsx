import Earth from '@/components/ui/globe';

export default function Globe1() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-rose-950/20 to-black">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Normalized RGB values i.e (RGB or color / 255) */}
        <Earth
          baseColor={[1, 0, 0.3]}
          markerColor={[1, 0, 0.33]}
          glowColor={[1, 0, 0.3]}
        />
      </div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-7xl leading-[100%] font-semibold tracking-tighter bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent">
          Welcome to Akiora
        </h1>
        <p className="mt-4 text-xl text-rose-300/80">
          Find your perfect League of Legends teammate
        </p>
      </div>
    </div>
  );
}
