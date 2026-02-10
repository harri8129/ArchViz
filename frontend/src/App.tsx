import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import './App.css';

function App() {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans antialiased selection:bg-indigo-500/30">
      {/* Navigation & Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />

        <GraphCanvas />
      </main>
    </div>
  );
}

export default App;

