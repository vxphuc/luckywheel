import { useState } from "react";

function RandomNumber({ onBack }) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState(null);

  const generate = () => {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    setResult(random);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2">🔢 Quay số ngẫu nhiên</h2>
      <div className="flex justify-center space-x-2 mb-4">
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          className="border p-1 w-20 text-center"
        />
        <span>-</span>
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="border p-1 w-20 text-center"
        />
      </div>
      <button
        onClick={generate}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg"
      >
        Quay số!
      </button>
      {result && <p className="mt-4 text-lg">Kết quả: {result}</p>}
      <button onClick={onBack} className="mt-4 underline text-sm">
        ⬅ Quay lại
      </button>
    </div>
  );
}

export default RandomNumber;
