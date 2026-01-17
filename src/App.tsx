import React from "react";
import { GraphPlotter } from "./components/GraphPlotter.tsx";

const App: React.FC = () => {
    return (
        <div>
            <h1>関数グラフアプリ</h1>

            {/* コンポーネント呼び出し */}
            <GraphPlotter width={800} height={500} />
        </div>
    );
};

export default App;
