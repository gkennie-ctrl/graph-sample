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

export const GraphPlotter: React.FC<GraphPlotterProps> = ({ width = 600, height = 400 }) => {
    const [mode, setMode] = useState<"normal" | "parametric">("normal");

    // 通常関数
    const [expression, setExpression] = useState("1 / x");
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
            const x = xmin + step * i;
            const y = evaluateFunction(expression, x);
            if (Number.isFinite(y)) data.push({ x, y });
        }
    } else {
        const step = (tmax - tmin) / points;
        for (let i = 0; i <= points; i++) {
            const t = tmin + step * i;
            const p = evaluateParametric(exprX, exprY, t);
            if (p) data.push(p);
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>2次元グラフ描画（拡張版）</h2>

            <label>
                モード切替:
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "normal" | "parametric")}
                >
                    <option value="normal">y = f(x)</option>
                    <option value="parametric">パラメトリック</option>
                </select>
            </label>

            {mode === "normal" ? (
                <div>
                    <div>
                        f(x):
                        <input value={expression} onChange={(e) => setExpression(e.target.value)} />
                    </div>
                    <div>
                        xmin:
                        <input type="number" value={xmin} onChange={(e) => setXmin(Number(e.target.value))} />
                        xmax:
                        <input type="number" value={xmax} onChange={(e) => setXmax(Number(e.target.value))} />
                    </div>
                </div>
            ) : (
                <div>
                    <div>
                        x(t):
                        <input value={exprX} onChange={(e) => setExprX(e.target.value)} />
                    </div>
                    <div>
                        y(t):
                        <input value={exprY} onChange={(e) => setExprY(e.target.value)} />
                    </div>
                    <div>
                        tmin:
                        <input type="number" value={tmin} onChange={(e) => setTmin(Number(e.target.value))} />
                        tmax:
                        <input type="number" value={tmax} onChange={(e) => setTmax(Number(e.target.value))} />
                    </div>
                </div>
            )}

            <div>
                点の数:
                <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            </div>

            <LineChart width={width} height={height} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="y" dot={false} />
            </LineChart>
        </div>
    );
};