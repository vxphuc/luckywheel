import { useState } from "react";
import PrizeManager from "./PrizeManager/PrizeManager";
import GeneralSettings from "./GeneralSettings/GeneralSettings";
import SpinViewer from "./SpinViewer/SpinViewer";

function WheelControl({ prizes, setPrizes, settings, setSettings }) {
  const [activeTab, setActiveTab] = useState("prizes"); // 'prizes' | 'settings' | 'spins'

  return (
    <div className="p-4 border-r h-full">
      {/* Tabbar */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("prizes")}
          className={`px-3 py-1 rounded ${
            activeTab === "prizes" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          🎁 Phần thưởng
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-3 py-1 rounded ${
            activeTab === "settings" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          ⚙️ Cài đặt chung
        </button>
        <button
          onClick={() => setActiveTab("spins")}
          className={`px-3 py-1 rounded ${
            activeTab === "spins" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          📜 Xem trúng giải
        </button>
      </div>

      {/* Nội dung theo tab */}
      {activeTab === "prizes" && (
        <PrizeManager prizes={prizes} setPrizes={setPrizes} />
      )}
      {activeTab === "settings" && (
        <GeneralSettings settings={settings} setSettings={setSettings} />
      )}
      {activeTab === "spins" && <SpinViewer />}
    </div>
  );
}

export default WheelControl;
