import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
  "https://luckywheel-backend-acgn.onrender.com";

export default function SpinViewer() {
  const [spins, setSpins] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [h, s] = await Promise.all([
        axios.get(`${API_BASE}/api/spins?limit=50`),
        axios.get(`${API_BASE}/api/spins/stats`),
      ]);
      setSpins(h.data || []);
      setStats(s.data || []);
    } catch (e) {
      console.error("❌ Load spins/stats error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">📜 Lịch sử trúng thưởng (50 gần nhất)</h2>
        <button onClick={loadAll} className="px-2 py-1 text-sm bg-gray-200 rounded">
          ⟳ Làm mới
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải…</p>
      ) : (
        <>
          <div className="mb-4 max-h-64 overflow-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-2 py-1">Thời gian</th>
                  <th className="text-left px-2 py-1">Giải thưởng</th>
                  <th className="text-left px-2 py-1">IP</th>
                  {/* <th className="text-left px-2 py-1">User-Agent</th> */}
                </tr>
              </thead>
              <tbody>
                {spins.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{new Date(s.at).toLocaleString()}</td>
                    <td className="px-2 py-1">{s.label}</td>
                    <td className="px-2 py-1">{s.ip || "-"}</td>
                    {/* <td className="px-2 py-1 truncate">{s.ua || "-"}</td> */}
                  </tr>
                ))}
                {spins.length === 0 && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={4}>
                      Chưa có lượt quay nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="text-md font-semibold mb-2">📊 Thống kê số lần trúng theo giải</h3>
          <div className="max-h-48 overflow-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-2 py-1">Giải</th>
                  <th className="text-left px-2 py-1">Số lần</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{row.label}</td>
                    <td className="px-2 py-1">{row.count}</td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={2}>
                      Chưa có dữ liệu thống kê.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
