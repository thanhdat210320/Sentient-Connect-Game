import dynamic from 'next/dynamic';

// Dynamically import the game component with no SSR
const JigsawGame = dynamic(() => import('./JigsawGame'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex flex-col items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading game...</p>
      </div>
    </div>
  )
});

export default function GameWrapper() {
  return <JigsawGame />;
}

