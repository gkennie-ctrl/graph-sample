import React, { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";

function evaluateRadius(expr: string, theta: number): number {
    try {
        const scope = {
            theta,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            exp: Math.exp,
            log: Math.log,
            sqrt: Math.sqrt,
            abs: Math.abs,
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

interface GraphPlotterComplexProps {
    width?: number;
    height?: number;
}

export const GraphPlotterComplex: React.FC<GraphPlotterComplexProps> = (props) => {
    const width = props.width ?? 800;
    const height = props.height ?? 550;
    const [expression, setExpression] = useState("1");
    const [tmin, setTmin] = useState(0);
    const [tmax, setTmax] = useState(2 * Math.PI);
    const [steps, setSteps] = useState(600);

    const presets = [
        { label: "単位円 r = 1", value: "1" },
        { label: "バラ曲線 r = cos(4θ)", value: "cos(4*theta)" },
        { label: "渦巻き r = exp(0.15θ)", value: "exp(0.15*theta)" },
        { label: "レモン r = 2*sin(2θ)", value: "2*sin(2*theta)" },
        { label: "リマソン r = 1+0.5*cos(θ)", value: "1 + 0.5*cos(theta)" },
    ];

    const data = useMemo(() => {
        const points: { x: number; y: number; theta: number; r: number }[] = [];
        const step = (tmax - tmin) / steps;
        for (let i = 0; i <= steps; i++) {
            const theta = tmin + step * i;
            const r = evaluateRadius(expression, theta);
            if (!Number.isFinite(r)) continue;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            points.push({ x, y, theta, r });
        }
        return points;
    }, [expression, tmin, tmax, steps]);

    return (
        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-7xl mx-auto my-8 font-sans transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-rose-400">
                        複素関数プロッター
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">極座標 r = f(θ) を複素平面で表示します</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-mono text-slate-400 flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                    点数: {data.length}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">プリセット</label>
                            <select
                                onChange={(e) => setExpression(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-fuchsia-500 outline-none cursor-pointer"
                            >
                                <option value="">-- 関数を選択 --</option>
                                {presets.map((p) => (
                                    <option key={p.label} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">式 r = f(θ)</label>
                            <input
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 outline-none font-mono text-fuchsia-300"
                                placeholder="cos(4*theta)"
                            />
                            <p className="mt-2 text-[11px] text-slate-500">
                                例: <span className="font-mono">cos(4*theta)</span>, <span className="font-mono">1+0.5*cos(theta)</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">θ Min</label>
                                <input
                                    type="number"
                                    value={tmin}
                                    onChange={(e) => setTmin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">θ Max</label>
                                <input
                                    type="number"
                                    value={tmax}
                                    onChange={(e) => setTmax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">解像度</label>
                                <span className="text-[10px] font-mono text-fuchsia-400">{steps}</span>
                            </div>
                            <input
                                type="range"
                                min="120"
                                max="1200"
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 mb-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-8 space-y-4">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 h-100 md:h-150 shadow-inner flex items-center justify-center overflow-hidden relative">
                        <div
                            className="absolute inset-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: "radial-gradient(#475569 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                        />
                        <LineChart width={width} height={height} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                            <ReferenceLine x={0} stroke="#64748b" strokeWidth={2} label={{ value: "Im", position: "insideTopLeft", fill: "#94a3b8", fontSize: 10 }} />
                            <ReferenceLine y={0} stroke="#64748b" strokeWidth={2} label={{ value: "Re", position: "insideBottomRight", fill: "#94a3b8", fontSize: 10 }} />
                            <XAxis
                                dataKey="x"
                                type="number"
                                stroke="#475569"
                                fontSize={11}
                                tickLine={false}
                                domain={["dataMin", "dataMax"]}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={11}
                                tickLine={false}
                                domain={["dataMin", "dataMax"]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                }}
                                itemStyle={{ color: "#f472b6", fontWeight: "bold" }}
                                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                                formatter={(value: number | string | undefined, name: string | number | undefined) => {
                                    const v = typeof value === "number" ? value : Number(value);
                                    if (name === "theta") return [Number.isFinite(v) ? v.toFixed(4) : "-", "θ"];
                                    if (name === "r") return [Number.isFinite(v) ? v.toFixed(4) : "-", "r"];
                                    const label = name === "x" ? "Re" : "Im";
                                    return [Number.isFinite(v) ? v.toFixed(4) : "-", label];
                                }}
                                labelFormatter={() => "r = f(θ)"}
                            />
                            <Line
                                type="monotone"
                                dataKey="y"
                                stroke="#f472b6"
                                strokeWidth={3}
                                dot={false}
                                isAnimationActive={true}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-800/10 py-3 rounded-xl border border-slate-800/30">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                            f(z) の分布
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            Re / Im 平面で可視化
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
