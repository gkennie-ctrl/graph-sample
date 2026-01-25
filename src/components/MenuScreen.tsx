import React from "react";

interface MenuScreenProps {
    onOpenGraph: () => void;
    onOpenGraph3D: () => void;
    onOpenComplex: () => void;
    onOpenRiemann: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = (props) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b,transparent_60%)] opacity-70" />
            <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16">
                <header className="mb-10 text-center space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        Graph Studio
                    </p>
                    <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                        メニュー
                    </h1>
                </header>

                <div className="flex w-full flex-1 flex-col justify-evenly">
                    <button
                        type="button"
                        onClick={props.onOpenGraph}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4v16h16" />
                                <path d="M6 16c3-6 6-6 10-10" />
                            </svg>
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-semibold text-white">2次元グラフ</div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Open
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={props.onOpenComplex}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-300">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19h16" />
                                <path d="M5 17V5h12" />
                                <path d="M8 15c2-4 6-4 8-8" />
                            </svg>
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-semibold text-white">複素関数</div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Open
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={props.onOpenGraph3D}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 7l7-4 7 4v10l-7 4-7-4V7z" />
                                <path d="M12 3v18" />
                                <path d="M5 7l7 4 7-4" />
                            </svg>
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-semibold text-white">3次元グラフ</div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Open
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={props.onOpenRiemann}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
                            <span className="text-xl font-bold leading-none translate-y-[1px]">ζ</span>
                        </span>
                        <div className="flex-1">
                            <div className="text-base font-semibold text-white">リーマンゼータ関数</div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Open
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
