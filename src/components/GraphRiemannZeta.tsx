import React, { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";

type Complex = { re: number; im: number };

const C = (re: number, im: number): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => C(a.re + b.re, a.im + b.im);
const sub = (a: Complex, b: Complex): Complex => C(a.re - b.re, a.im - b.im);
const div = (a: Complex, b: Complex): Complex => {
    const d = b.re * b.re + b.im * b.im;
    if (d === 0) return C(NaN, NaN);
    return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const abs = (a: Complex): number => Math.hypot(a.re, a.im);
const complexExp = (re: number, im: number): Complex => {
    const ea = Math.exp(re);
    return C(ea * Math.cos(im), ea * Math.sin(im));
};

const invPowReal = (n: number, s: Complex): Complex => {
    const ln = Math.log(n);
    const scale = Math.exp(-s.re * ln);
    const angle = -s.im * ln;
    return C(scale * Math.cos(angle), scale * Math.sin(angle));
};

const zetaApprox = (s: Complex, terms: number): Complex | null => {
    if (terms < 2) return null;
    let eta = C(0, 0);
    for (let n = 1; n <= terms; n++) {
        const term = invPowReal(n, s);
        eta = n % 2 === 1 ? add(eta, term) : sub(eta, term);
    }
    const oneMinusS = C(1 - s.re, -s.im);
    const twoPow = complexExp(oneMinusS.re * Math.log(2), oneMinusS.im * Math.log(2));
    const denom = sub(C(1, 0), twoPow);
    const zeta = div(eta, denom);
    if (!Number.isFinite(zeta.re) || !Number.isFinite(zeta.im)) return null;
    return zeta;
};

interface GraphRiemannZetaProps {
    width?: number;
    height?: number;
}

export const GraphRiemannZeta: React.FC<GraphRiemannZetaProps> = (props) => {
    const width = props.width ?? 800;
    const height = props.height ?? 520;
    const [tmin, setTmin] = useState(0);
    const [tmax, setTmax] = useState(40);
    const [steps, setSteps] = useState(240);
    const [terms, setTerms] = useState(70);
    const [gridReMin, setGridReMin] = useState(-1);
    const [gridReMax, setGridReMax] = useState(2);
    const [gridImMin, setGridImMin] = useState(-8);
    const [gridImMax, setGridImMax] = useState(8);
    const [gridSteps, setGridSteps] = useState(18);

    const criticalLine = useMemo(() => {
        const data: { t: number; mag: number; re: number; im: number }[] = [];
        const step = (tmax - tmin) / steps;
        for (let i = 0; i <= steps; i++) {
            const t = tmin + step * i;
            const s = C(0.5, t);
            const z = zetaApprox(s, terms);
            if (!z) continue;
            data.push({ t, mag: abs(z), re: z.re, im: z.im });
        }
        return data;
    }, [tmin, tmax, steps, terms]);

    const criticalMap = useMemo(() => {
        return criticalLine.map((p) => ({ x: p.re, y: p.im }));
    }, [criticalLine]);

    const gridMap = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        const reStep = (gridReMax - gridReMin) / gridSteps;
        const imStep = (gridImMax - gridImMin) / gridSteps;
        for (let i = 0; i <= gridSteps; i++) {
            const re = gridReMin + reStep * i;
            for (let j = 0; j <= gridSteps; j++) {
                const im = gridImMin + imStep * j;
                const z = zetaApprox(C(re, im), Math.max(40, Math.floor(terms * 0.7)));
                if (!z) continue;
                points.push({ x: z.re, y: z.im });
            }
        }
        return points;
    }, [gridReMin, gridReMax, gridImMin, gridImMax, gridSteps, terms]);

    return (
        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-7xl mx-auto my-8 font-sans transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-rose-400">
                        リーマンゼータ関数
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        代表的な写像表現（臨界線・像の軌跡・写像グリッド）を可視化します
                    </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-mono text-slate-400 flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                    近似項数: {terms}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">t Min</label>
                                <input
                                    type="number"
                                    value={tmin}
                                    onChange={(e) => setTmin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">t Max</label>
                                <input
                                    type="number"
                                    value={tmax}
                                    onChange={(e) => setTmax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">分割数</label>
                                <span className="text-[10px] font-mono text-amber-400">{steps}</span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="600"
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-1"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">近似項数</label>
                                <span className="text-[10px] font-mono text-amber-400">{terms}</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="160"
                                value={terms}
                                onChange={(e) => setTerms(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-1"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Re Min</label>
                                <input
                                    type="number"
                                    value={gridReMin}
                                    onChange={(e) => setGridReMin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Re Max</label>
                                <input
                                    type="number"
                                    value={gridReMax}
                                    onChange={(e) => setGridReMax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Im Min</label>
                                <input
                                    type="number"
                                    value={gridImMin}
                                    onChange={(e) => setGridImMin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Im Max</label>
                                <input
                                    type="number"
                                    value={gridImMax}
                                    onChange={(e) => setGridImMax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">グリッド密度</label>
                                <span className="text-[10px] font-mono text-amber-400">{gridSteps}</span>
                            </div>
                            <input
                                type="range"
                                min="8"
                                max="30"
                                value={gridSteps}
                                onChange={(e) => setGridSteps(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">臨界線 s = 1/2 + it の |ζ(s)|</h3>
                        <LineChart width={width} height={height} data={criticalLine} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="t" stroke="#475569" fontSize={11} tickLine={false} />
                            <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={["dataMin", "dataMax"]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                }}
                                itemStyle={{ color: "#fbbf24", fontWeight: "bold" }}
                                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                                formatter={(value: number | string | undefined) => {
                                    const v = typeof value === "number" ? value : Number(value);
                                    return [Number.isFinite(v) ? v.toFixed(4) : "-", "|ζ|"];
                                }}
                                labelFormatter={(label: number | string | undefined) => {
                                    const v = typeof label === "number" ? label : Number(label);
                                    return `t: ${Number.isFinite(v) ? v.toFixed(2) : "-"}`;
                                }}
                            />
                            <Line type="monotone" dataKey="mag" stroke="#fbbf24" strokeWidth={3} dot={false} />
                        </LineChart>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">臨界線の像 ζ(1/2+it)</h3>
                            <ScatterChart width={width / 2 - 24} height={height / 1.25} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                                <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />
                                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                                <XAxis dataKey="x" type="number" stroke="#475569" fontSize={11} tickLine={false} domain={["dataMin", "dataMax"]} />
                                <YAxis dataKey="y" type="number" stroke="#475569" fontSize={11} tickLine={false} domain={["dataMin", "dataMax"]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#0f172a",
                                        border: "1px solid #334155",
                                        borderRadius: "12px",
                                    }}
                                    itemStyle={{ color: "#fbbf24", fontWeight: "bold" }}
                                    formatter={(value: number | string | undefined, name: string | number | undefined) => {
                                        const v = typeof value === "number" ? value : Number(value);
                                        const label = name === "x" ? "Re" : "Im";
                                        return [Number.isFinite(v) ? v.toFixed(4) : "-", label];
                                    }}
                                    labelFormatter={() => "ζ(1/2+it)"}
                                />
                                <Scatter data={criticalMap} fill="#fbbf24" opacity={0.6} line />
                            </ScatterChart>
                        </div>

                        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">写像グリッド ζ(s)</h3>
                            <ScatterChart width={width / 2 - 24} height={height / 1.25} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                                <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />
                                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                                <XAxis dataKey="x" type="number" stroke="#475569" fontSize={11} tickLine={false} domain={["dataMin", "dataMax"]} />
                                <YAxis dataKey="y" type="number" stroke="#475569" fontSize={11} tickLine={false} domain={["dataMin", "dataMax"]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#0f172a",
                                        border: "1px solid #334155",
                                        borderRadius: "12px",
                                    }}
                                    itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
                                    formatter={(value: number | string | undefined, name: string | number | undefined) => {
                                        const v = typeof value === "number" ? value : Number(value);
                                        const label = name === "x" ? "Re" : "Im";
                                        return [Number.isFinite(v) ? v.toFixed(4) : "-", label];
                                    }}
                                    labelFormatter={() => "ζ(s) マップ"}
                                />
                                <Scatter data={gridMap} fill="#f59e0b" opacity={0.5} />
                            </ScatterChart>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
