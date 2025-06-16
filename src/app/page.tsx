import { MatchListScreen } from './screens/cricket/MatchListScreen';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Enhanced Features Showcase */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">🏏 CricInfo Enhanced Analytics</h1>
            <p className="text-lg opacity-90">Experience comprehensive cricket analysis with our new enhanced components</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Enhanced Analytics</h3>
              <p className="text-sm opacity-80">5 tabs of detailed match analysis</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold mb-1">Visual Components</h3>
              <p className="text-sm opacity-80">Manhattan charts, player cards & more</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎙️</div>
              <h3 className="font-semibold mb-1">Live Commentary</h3>
              <p className="text-sm opacity-80">Ball-by-ball match analysis</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/analytics/1448347"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <span>🚀</span>
              <span>Try Enhanced Analytics Demo</span>
            </Link>
            <p className="text-sm opacity-75 mt-2">Click any match below for enhanced analysis</p>
          </div>
        </div>
      </div>
      
      <MatchListScreen />
    </main>
  );
}
