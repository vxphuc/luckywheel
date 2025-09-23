import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  (import.meta.env?.VITE_API_BASE) ||
  (process.env?.REACT_APP_API_BASE) ||
  "https://luckywheel-backend-acgn.onrender.com";

export default function SpinLimitControl() {
  const [limit, setLimit] = useState(1);

  useEffect(() => {
    axios.get(`${API_BASE}/api/settings`).then(res => {
      setLimit(res.data.maxSpinsPerUser || 1);
    });
  }, []);

  const saveLimit = async () => {
    try {
      await axios.post(`${API_BASE}/api/settings`, { maxSpinsPerUser: limit });
      alert("✅ Đã lưu số lượt quay");
    } catch (e) {
      console.error("❌ Error saving limit:", e);
      alert("Lỗi khi lưu!");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">🎯 Giới hạn lượt quay</h2>
      <div className="flex space-x-2">
        <input
          type="number"
          value={limit}
          min={1}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border p-1 w-24"
        />
        <button onClick={saveLimit} className="px-3 bg-green-600 text-white rounded">
          💾 Lưu
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">Mỗi người chơi chỉ được quay tối đa {limit} lần.</p>
    </div>
  );
}
