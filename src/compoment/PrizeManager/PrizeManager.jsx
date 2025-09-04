import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
  "http://localhost:5000";

export default function PrizeManager({ prizes, setPrizes }) {
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tải danh sách (GET)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/prizes`);
        setPrizes(res.data || []);
      } catch (err) {
        console.error("❌ Error loading prizes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addPrize = () => {
    if (!label.trim()) return;
    setPrizes([...prizes, { label: label.trim(), weight: Number(weight) || 1 }]);
    setLabel("");
    setWeight(1);
    setDirty(true);
  };

  const removePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index));
    setDirty(true);
  };

  const savePrizes = async () => {
    try {
      await axios.post(`${API_BASE}/api/prizes`, prizes);
      setDirty(false);
    } catch (e) {
      console.error("❌ Error saving prizes:", e.response?.data || e);
      alert("Lưu thất bại: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Đang tải danh sách…</p>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">🎁 Phần thưởng</h2>

      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tên phần thưởng"
          className="border p-1 flex-1"
        />
        <input
          type="number"
          value={weight}
          min={1}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Tỷ lệ"
          className="border p-1 w-24"
        />
        <button onClick={addPrize} className="px-3 bg-blue-600 text-white rounded">
          ➕ Thêm
        </button>
      </div>

      <div className="mb-3">
        <button
          onClick={savePrizes}
          disabled={!dirty}
          className={`px-3 py-1 rounded ${
            dirty ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
          }`}
        >
          💾 Lưu thay đổi
        </button>
      </div>

      <ul className="max-h-80 overflow-auto pr-1">
        {prizes.map((p, i) => (
          <li
            key={`${p.label}-${i}`}
            className="flex justify-between items-center mb-1 bg-gray-50 px-2 py-1 rounded"
          >
            <span>
              {p.label} <span className="text-gray-500">(x{p.weight})</span>
            </span>
            <button onClick={() => removePrize(i)} className="text-red-500 hover:underline">
              Xóa
            </button>
          </li>
        ))}
        {prizes.length === 0 && (
          <li className="text-sm text-gray-500">Chưa có phần thưởng nào.</li>
        )}
      </ul>
    </div>
  );
}
