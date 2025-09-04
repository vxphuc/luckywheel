export default function GeneralSettings({ settings, setSettings }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">⚙️ Cài đặt chung</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            ⏱️ Thời gian quay (ms)
          </label>
          <input
            type="number"
            value={settings.duration}
            onChange={(e) =>
              setSettings({ ...settings, duration: Number(e.target.value) || 4000 })
            }
            className="border p-1 w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            id="randomColors"
            type="checkbox"
            checked={settings.randomColors}
            onChange={(e) =>
              setSettings({ ...settings, randomColors: e.target.checked })
            }
            className="mr-2"
          />
          <label htmlFor="randomColors" className="text-sm">
            🎨 Sử dụng màu random
          </label>
        </div>
      </div>
    </div>
  );
}
