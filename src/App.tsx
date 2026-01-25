import React, { useState } from "react";
import { GraphPlotter } from "./components/GraphPlotter.tsx";
import { GraphPlotter3D } from "./components/GraphPlotter3D.tsx";
import { GraphPlotterComplex } from "./components/GraphPlotterComplex.tsx";
import { GraphRiemannZeta } from "./components/GraphRiemannZeta.tsx";
import { MenuScreen } from "./components/MenuScreen.tsx";

const App: React.FC = () => {
    const [screen, setScreen] = useState<"menu" | "graph" | "graph3d" | "complex" | "riemann">("menu");

    if (screen === "menu") {
        return (
            <MenuScreen
                onOpenGraph={() => setScreen("graph")}
                onOpenGraph3D={() => setScreen("graph3d")}
                onOpenComplex={() => setScreen("complex")}
                onOpenRiemann={() => setScreen("riemann")}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setScreen("menu")}
                        className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white"
                    >
                        ← メニューへ戻る
                    </button>
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                        Graph Studio
                    </div>
                </div>
                {screen === "graph" ? (
                    <GraphPlotter />
                ) : screen === "graph3d" ? (
                    <GraphPlotter3D />
                ) : screen === "complex" ? (
                    <GraphPlotterComplex />
                ) : (
                    <GraphRiemannZeta />
                )}
            </div>
        </div>
    );
};

export default App;
