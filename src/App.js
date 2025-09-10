// App.js
import { useState, useEffect } from "react";
import axios from "axios";
import LuckyWheel from "./compoment/LuckyWheel";
import WheelControl from "./compoment/WheelControl";
import "./App.css";
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
  "http://localhost:5000";

function App() {
  const [prizes, setPrizes] = useState([]);
  const [settings, setSettings] = useState({ duration: 4000, randomColors: false });

  const reloadPrizes = async () => {
    const res = await axios.get(`${API_BASE}/api/prizes`);
    setPrizes(res.data || []);
  };

  useEffect(() => { reloadPrizes(); }, []);

  return (
    <div className="container">
      <div className="control">
        <WheelControl
          prizes={prizes}
          setPrizes={setPrizes}
          settings={settings}
          setSettings={setSettings}
        />
      </div>
      <div className="wheel">
        <LuckyWheel
          prizes={prizes}
          settings={settings}
          setPrizes={setPrizes}
          onStockChanged={reloadPrizes}
        />
      </div>
    </div>
  );
}

export default App;
