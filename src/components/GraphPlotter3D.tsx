import React, { useEffect, useMemo, useRef, useState } from "react";

function evaluateSurface(expr: string, x: number, y: number): number {
    try {
        const scope = {
            x,
            y,
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

interface GraphPlotter3DProps {
    width?: number;
    height?: number;
}

type Point3D = { x: number; y: number; z: number };

export const GraphPlotter3D: React.FC<GraphPlotter3DProps> = (props) => {
    const width = props.width ?? 900;
    const height = props.height ?? 560;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [expression, setExpression] = useState("sin(x) * cos(y)");
    const [xmin, setXmin] = useState(-6);
    const [xmax, setXmax] = useState(6);
    const [ymin, setYmin] = useState(-6);
    const [ymax, setYmax] = useState(6);
    const [steps, setSteps] = useState(60);
    const [rotateX, setRotateX] = useState(25);
    const [rotateY, setRotateY] = useState(-35);
    const [zScale, setZScale] = useState(1.1);

    const presets = [
        { label: "波面 z = sin(x) * cos(y)", value: "sin(x) * cos(y)" },
        { label: "鞍点 z = x^2 - y^2", value: "x*x - y*y" },
        { label: "山 z = exp(-(x^2 + y^2))", value: "exp(-(x*x + y*y))" },
        { label: "リング z = sin(sqrt(x^2+y^2))", value: "sin(sqrt(x*x + y*y))" },
        { label: "円錐 z = sqrt(x^2 + y^2)", value: "sqrt(x*x + y*y)" },
    ];

    const data = useMemo(() => {
        const points: Point3D[][] = [];
        const xStep = (xmax - xmin) / steps;
        const yStep = (ymax - ymin) / steps;
        for (let i = 0; i <= steps; i++) {
            const row: Point3D[] = [];
            const x = xmin + xStep * i;
            for (let j = 0; j <= steps; j++) {
                const y = ymin + yStep * j;
                const z = evaluateSurface(expression, x, y);
                if (Number.isFinite(z)) {
                    row.push({ x, y, z });
                } else {
                    row.push({ x, y, z: NaN });
                }
            }
            points.push(row);
        }
        return points;
    }, [expression, xmin, xmax, ymin, ymax, steps]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const ax = (rotateX * Math.PI) / 180;
        const ay = (rotateY * Math.PI) / 180;
        const baseScale = 260 / Math.max(xmax - xmin, ymax - ymin);
        const fov = 4;

        const project = (p: Point3D) => {
            const x0 = p.x * baseScale;
            const y0 = p.y * baseScale;
            const z0 = p.z * baseScale * zScale;

            const y1 = y0 * Math.cos(ax) - z0 * Math.sin(ax);
            const z1 = y0 * Math.sin(ax) + z0 * Math.cos(ax);
            const x2 = x0 * Math.cos(ay) + z1 * Math.sin(ay);
            const z2 = -x0 * Math.sin(ay) + z1 * Math.cos(ay);

            const depth = fov / (fov + z2 / 200);
            return {
                x: cx + x2 * depth,
                y: cy + y1 * depth,
            };
        };

        const axisLen = Math.max(
            Math.abs(xmin),
            Math.abs(xmax),
            Math.abs(ymin),
            Math.abs(ymax)
        );
        const origin = project({ x: 0, y: 0, z: 0 });
        const axisX = project({ x: axisLen, y: 0, z: 0 });
        const axisY = project({ x: 0, y: axisLen, z: 0 });
        const axisZ = project({ x: 0, y: 0, z: axisLen });

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(axisX.x, axisX.y);
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(axisY.x, axisY.y);
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(axisZ.x, axisZ.y);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillText("O", origin.x + 6, origin.y + 6);
        ctx.fillText("X", axisX.x + 6, axisX.y + 6);
        ctx.fillText("Y", axisY.x + 6, axisY.y + 6);
        ctx.fillText("Z", axisZ.x + 6, axisZ.y + 6);

        ctx.strokeStyle = "#1d4ed8";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;

        for (let i = 0; i < data.length; i++) {
            ctx.beginPath();
            let started = false;
            for (let j = 0; j < data[i].length; j++) {
                const p = data[i][j];
                if (!Number.isFinite(p.z)) {
                    started = false;
                    continue;
                }
                const pt = project(p);
                if (!started) {
                    ctx.moveTo(pt.x, pt.y);
                    started = true;
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.stroke();
        }

        ctx.strokeStyle = "#0ea5e9";
        ctx.globalAlpha = 0.6;
        for (let j = 0; j <= steps; j++) {
            ctx.beginPath();
            let started = false;
            for (let i = 0; i <= steps; i++) {
                const p = data[i][j];
                if (!Number.isFinite(p.z)) {
                    started = false;
                    continue;
                }
                const pt = project(p);
                if (!started) {
                    ctx.moveTo(pt.x, pt.y);
                    started = true;
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }, [data, rotateX, rotateY, zScale, width, height, xmax, xmin, ymax, ymin, steps]);

    return (
        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-7xl mx-auto my-8 font-sans transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-400">
                        3D サーフェス・プロッター
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">z = f(x, y) を簡易投影で可視化します</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-mono text-slate-400 flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
                    グリッド: {steps + 1} x {steps + 1}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">プリセット</label>
                            <select
                                onChange={(e) => setExpression(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
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
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">数式 z = f(x, y)</label>
                            <input
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none font-mono text-sky-300"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">X Min</label>
                                <input
                                    type="number"
                                    value={xmin}
                                    onChange={(e) => setXmin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">X Max</label>
                                <input
                                    type="number"
                                    value={xmax}
                                    onChange={(e) => setXmax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Y Min</label>
                                <input
                                    type="number"
                                    value={ymin}
                                    onChange={(e) => setYmin(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Y Max</label>
                                <input
                                    type="number"
                                    value={ymax}
                                    onChange={(e) => setYmax(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">解像度</label>
                                <span className="text-[10px] font-mono text-sky-400">{steps}</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="120"
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-1"
                            />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">回転 X</label>
                                    <span className="text-[10px] font-mono text-sky-400">{rotateX}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-90"
                                    max="90"
                                    value={rotateX}
                                    onChange={(e) => setRotateX(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">回転 Y</label>
                                    <span className="text-[10px] font-mono text-sky-400">{rotateY}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={rotateY}
                                    onChange={(e) => setRotateY(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Z スケール</label>
                                    <span className="text-[10px] font-mono text-sky-400">{zScale.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.4"
                                    max="2.4"
                                    step="0.05"
                                    value={zScale}
                                    onChange={(e) => setZScale(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-8 space-y-4">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 h-100 md:h-150 shadow-inner flex items-center justify-center overflow-hidden relative">
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)", backgroundSize: "22px 22px" }}
                        />
                        <canvas ref={canvasRef} width={width} height={height} className="relative" />
                    </div>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-800/10 py-3 rounded-xl border border-slate-800/30">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                            z = f(x, y)
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            回転で立体感を確認
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
