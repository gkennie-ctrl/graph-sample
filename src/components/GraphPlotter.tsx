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
        <div className="bg-slate-900/80 backdrop-blur-xl text-white p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(56,189,248,0.3)] border border-slate-700/50 max-w-5xl mx-auto my-8 font-sans transition-all duration-500 hover:shadow-[0_0_60px_-10px_rgba(56,189,248,0.4)]">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-emerald-400 to-cyan-400">
                    Interactive Plotter
                </h2>
                <div className="px-4 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-mono text-slate-400 animate-pulse">
                    Live Preview
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <div className="lg:col-span-4 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">モード切替</label>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as "normal" | "parametric")}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="normal">y = f(x)</option>
                            <option value="parametric">パラメトリック</option>
                        </select>
                    </div>

                    {mode === "normal" ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-1">f(x):</label>
                                <input
                                    value={expression}
                                    onChange={(e) => setExpression(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                    placeholder="例: x * x"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-1">xmin:</label>
                                    <input
                                        type="number"
                                        value={xmin}
                                        onChange={(e) => setXmin(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-1">xmax:</label>
                                    <input
                                        type="number"
                                        value={xmax}
                                        onChange={(e) => setXmax(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-1">x(t):</label>
                                <input
                                    value={exprX}
                                    onChange={(e) => setExprX(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-1">y(t):</label>
                                <input
                                    value={exprY}
                                    onChange={(e) => setExprY(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-1">tmin:</label>
                                    <input
                                        type="number"
                                        value={tmin}
                                        onChange={(e) => setTmin(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-1">tmax:</label>
                                    <input
                                        type="number"
                                        value={tmax}
                                        onChange={(e) => setTmax(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">点の数:</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="lg:col-span-8 bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 h-[500px] shadow-inner relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-3xl pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                stroke="#94a3b8"
                                fontSize={12}
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12}
                                domain={['dataMin', 'dataMax']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#f8fafc",
                                }}
                                itemStyle={{ color: "#38bdf8" }}
                                formatter={(value: number) => [value.toFixed(4), "y"]}
                                labelFormatter={(label: number) => `x: ${label.toFixed(4)}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="y"
                                stroke="url(#lineGradient)"
                                strokeWidth={4}
                                dot={false}
                                animationDuration={1500}
                                isAnimationActive={true}
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};