import React from "react";
import { GraphPlotter } from "./components/GraphPlotter.tsx";

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GraphPlotter />
        </div>
    );
};

export default App;
