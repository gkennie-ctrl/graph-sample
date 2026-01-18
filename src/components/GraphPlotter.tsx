import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ===== 数式評価（学習用・簡易） =====
function evaluateFunction(expr: string, x: number): number {
    try {
        const scope = {
            x,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            exp: Math.exp,
            log: Math.log,
            sqrt: Math.sqrt,
            abs: Math.abs,
            pow: Math.pow,
            PI: Math.PI,
            E: Math.E,
        };

        const fn = new Function(
            ...Object.keys(scope),
            `return ${expr};`
        ) as (...args: unknown[]) => number;

        return fn(...Object.values(scope));
    } catch {
        return NaN;
    }
}

function evaluateParametric(
    exprX: string,
    exprY: string,
    t: number
): { x: number; y: number } | null {
    try {
        const scope = {
            t,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            exp: Math.exp,
            sqrt: Math.sqrt,
            pow: Math.pow,
            PI: Math.PI,
        };

        const fx = new Function(
            ...Object.keys(scope),
            `return ${exprX};`
        ) as (...args: unknown[]) => number;

        const fy = new Function(
            ...Object.keys(scope),
            `return ${exprY};`
        ) as (...args: unknown[]) => number;

        const x = fx(...Object.values(scope));
        const y = fy(...Object.values(scope));

        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { x, y };
    } catch {
        return null;
    }
}

interface GraphPlotterProps {
    width?: number;
    height?: number;
}

export const GraphPlotter: React.FC<GraphPlotterProps> = ({ width = 600, height = 400 }) => {
    const [mode, setMode] = useState<"normal" | "parametric">("normal");

    // 通常関数
    const [expression, setExpression] = useState("x * x");
    const [xmin, setXmin] = useState(-10);
    const [xmax, setXmax] = useState(10);

    // パラメトリック
    const [exprX, setExprX] = useState("3 * cos(t)");
    const [exprY, setExprY] = useState("2 * sin(t)");
    const [tmin, setTmin] = useState(0);
    const [tmax, setTmax] = useState(2 * Math.PI);

    const [points, setPoints] = useState(400);

    const data: { x: number; y: number }[] = [];

    if (mode === "normal") {
        const step = (xmax - xmin) / points;
        for (let i = 0; i <= points; i++) {
            const x = parseFloat((xmin + step * i).toFixed(4));
            const y = evaluateFunction(expression, x);
            if (Number.isFinite(y)) {
                data.push({ x, y });
            }
        }
        // 通常モードではX軸でソート（RechartsのLine描画に必須）
        data.sort((a, b) => a.x - b.x);
    } else {
        const step = (tmax - tmin) / points;
        for (let i = 0; i <= points; i++) {
            const t = tmin + step * i;
            const p = evaluateParametric(exprX, exprY, t);
            if (p) {
                data.push({
                    x: parseFloat(p.x.toFixed(4)),
                    y: parseFloat(p.y.toFixed(4))
                });
            }
        }
    }

    return (
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-6xl mx-auto my-8 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Interactive Plotter
                </h2>
                <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Data Points: {data.length}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Mode</label>
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                            <button 
                                onClick={() => setMode("normal")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${mode === "normal" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                                Function
                            </button>
                            <button 
                                onClick={() => setMode("parametric")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${mode === "parametric" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                                Parametric
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        {mode === "normal" ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">f(x)</label>
                                    <input
                                        value={expression}
                                        onChange={(e) => setExpression(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-blue-400"
                                        placeholder="x * x"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">X Min</label>
                                        <input
                                            type="number"
                                            value={xmin}
                                            onChange={(e) => setXmin(Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">X Max</label>
                                        <input
                                            type="number"
                                            value={xmax}
                                            onChange={(e) => setXmax(Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">x(t)</label>
                                    <input
                                        value={exprX}
                                        onChange={(e) => setExprX(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">y(t)</label>
                                    <input
                                        value={exprY}
                                        onChange={(e) => setExprY(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-400"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">T Min</label>
                                        <input
                                            type="number"
                                            value={tmin}
                                            onChange={(e) => setTmin(Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">T Max</label>
                                        <input
                                            type="number"
                                            value={tmax}
                                            onChange={(e) => setTmax(Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Resolution</label>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                                <span>10 pts</span>
                                <span>{points} pts</span>
                                <span>1000 pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/3">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 h-[400px] md:h-[500px] shadow-inner flex items-center justify-center overflow-hidden">
                        {data.length > 0 ? (
                            <LineChart 
                                width={600} 
                                height={400} 
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="x" 
                                    type="number" 
                                    stroke="#475569" 
                                    domain={['dataMin', 'dataMax']}
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    domain={['dataMin', 'dataMax']}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="y"
                                    stroke="#38bdf8"
                                    strokeWidth={3}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        ) : (
                            <div className="text-slate-500 font-mono text-sm animate-pulse">
                                Calculating coordinates...
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 text-center font-mono">
                        Note: If the graph is not visible, please try resizing your browser window or refreshing.
                    </p>
                </div>
            </div>
        </div>
    );
};