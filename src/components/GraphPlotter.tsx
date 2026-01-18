import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
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

export const GraphPlotter: React.FC<GraphPlotterProps> = ({ width: initialWidth = 600, height: initialHeight = 400 }) => {
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

    // プリセット関数
    const presets = [
        { label: "二次関数 (x²)", value: "x * x" },
        { label: "サイン波 (sin x)", value: "sin(x)" },
        { label: "正規分布", value: "exp(-x*x/2) / sqrt(2*PI)" },
        { label: "シグモイド関数", value: "1 / (1 + exp(-x))" },
        { label: "減衰振動", value: "exp(-0.2*x) * cos(2*x)" },
    ];

    const parametricPresets = [
        { label: "円", x: "3 * cos(t)", y: "3 * sin(t)" },
        { label: "リサジュー図形", x: "3 * sin(3*t)", y: "2 * sin(2*t)" },
        { label: "心臓形 (カージオイド)", x: "2 * cos(t) * (1 - cos(t))", y: "2 * sin(t) * (1 - cos(t))" },
        { label: "螺旋", x: "0.5 * t * cos(t)", y: "0.5 * t * sin(t)" },
    ];

    return (
        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-7xl mx-auto my-8 font-sans transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                        インタラクティブ・プロッター
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">数式を入力してグラフをリアルタイムに描画します</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-mono text-slate-400 flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    プロット数: {data.length} 点
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-4 space-y-8">
                    {/* モード切り替え */}
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">描画モード</label>
                        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                            <button 
                                onClick={() => setMode("normal")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "normal" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                            >
                                関数 y = f(x)
                            </button>
                            <button 
                                onClick={() => setMode("parametric")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "parametric" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                            >
                                媒介変数表示
                            </button>
                        </div>
                    </div>

                    {/* 設定パネル */}
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 space-y-6">
                        {mode === "normal" ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">プリセット</label>
                                    <select 
                                        onChange={(e) => setExpression(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="">-- 関数を選択 --</option>
                                        {presets.map((p) => (
                                            <option key={p.label} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">数式 f(x)</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-mono">y =</span>
                                        <input
                                            value={expression}
                                            onChange={(e) => setExpression(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-blue-400 text-lg"
                                            placeholder="x * x"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">最小値 (X Min)</label>
                                        <input
                                            type="number"
                                            value={xmin}
                                            onChange={(e) => setXmin(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">最大値 (X Max)</label>
                                        <input
                                            type="number"
                                            value={xmax}
                                            onChange={(e) => setXmax(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">プリセット</label>
                                    <select 
                                        onChange={(e) => {
                                            const p = parametricPresets.find(pr => pr.label === e.target.value);
                                            if (p) {
                                                setExprX(p.x);
                                                setExprY(p.y);
                                            }
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="">-- 図形を選択 --</option>
                                        {parametricPresets.map((p) => (
                                            <option key={p.label} value={p.label}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">x(t)</label>
                                        <input
                                            value={exprX}
                                            onChange={(e) => setExprX(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">y(t)</label>
                                        <input
                                            value={exprY}
                                            onChange={(e) => setExprY(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">開始 (T Min)</label>
                                        <input
                                            type="number"
                                            value={tmin}
                                            onChange={(e) => setTmin(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">終了 (T Max)</label>
                                        <input
                                            type="number"
                                            value={tmax}
                                            onChange={(e) => setTmax(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">解像度</label>
                                <span className="text-[10px] font-mono text-blue-500">{points} 点</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-1"
                            />
                        </div>
                    </div>
                </div>

                {/* グラフ表示エリア */}
                <div className="xl:col-span-8 space-y-4">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 h-100 md:h-150 shadow-inner flex items-center justify-center overflow-hidden relative">
                        {/* グリッド風の背景装飾 */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        
                        {data.length > 0 ? (
                            <LineChart 
                                width={800} 
                                height={550} 
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="x" 
                                    type="number" 
                                    stroke="#475569" 
                                    fontSize={11}
                                    tickLine={false}
                                    domain={['dataMin', 'dataMax']}
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={11}
                                    tickLine={false}
                                    domain={['dataMin', 'dataMax']}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: "#0f172a", 
                                        border: "1px solid #334155",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                                    }}
                                    itemStyle={{ color: "#38bdf8", fontWeight: "bold" }}
                                    labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                                    formatter={(value: number) => [value.toFixed(4), "y"]}
                                    labelFormatter={(label: number) => `x: ${label.toFixed(4)}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="y"
                                    stroke="#38bdf8"
                                    strokeWidth={4}
                                    dot={false}
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                />
                            </LineChart>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-600">
                                <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="font-mono text-sm">計算中...</div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-800/10 py-3 rounded-xl border border-slate-800/30">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            y = f(x) 軌跡
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            マウスオーバーで詳細表示
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};