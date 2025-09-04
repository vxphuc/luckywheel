import { useEffect, useRef, useState } from "react";
import axios from "axios";
function LuckyWheel({ prizes, settings }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [winner, setWinner] = useState(null);

  const size = 350;
  const radius = size / 2;
  const API_BASE = "http://localhost:5000";

  // Nếu chọn màu random thì tạo màu theo số lượng prizes
  const colors = settings.randomColors
    ? prizes.map(
        () =>
          `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
      )
    : ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

  // Vẽ vòng quay
  useEffect(() => {
    if (!prizes.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (2 * Math.PI) / prizes.length;
    for (let i = 0; i < prizes.length; i++) {
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(
        radius,
        radius,
        radius,
        i * sliceAngle + angle,
        (i + 1) * sliceAngle + angle
      );
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(i * sliceAngle + sliceAngle / 2 + angle);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(prizes[i].label, radius - 10, 10);
      ctx.restore();
    }
  }, [prizes, angle, settings]);

  const pickPrize = () => {
    const expanded = prizes.flatMap((p) => Array(p.weight).fill(p.label));
    const index = Math.floor(Math.random() * expanded.length);
    return expanded[index];
  };

  const logSpin = async (label) => {
    try {
      await axios.post(`${API_BASE}/api/spins`, { label });
    } catch (e) {
      console.error("❌ Error logging spin:", e.response?.data || e);
    }
  };

  const spin = () => {
    if (spinning || !prizes.length) return;
    setSpinning(true);

    const selectedPrize = pickPrize();
    const prizeIndex = prizes.findIndex((p) => p.label === selectedPrize);

    const sliceAngle = 360 / prizes.length;
    const targetAngle = 360 * 5 + (360 - prizeIndex * sliceAngle - sliceAngle / 2);

    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / settings.duration;
      const easing = 1 - Math.pow(1 - progress, 3);
      const currentAngle = targetAngle * easing;

      setAngle((currentAngle * Math.PI) / 180);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(selectedPrize);
        logSpin(selectedPrize);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2">🎡 Vòng quay may mắn</h2>
      <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
      <div className="mt-4">
        <button
          onClick={spin}
          disabled={spinning}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          {spinning ? "Đang quay..." : "Quay ngay!"}
        </button>
      </div>
      {winner && <p className="mt-4 text-lg">🎉 Bạn trúng: {winner}!</p>}
    </div>
  );
}

export default LuckyWheel;
