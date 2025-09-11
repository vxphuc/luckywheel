import { useEffect, useRef, useState } from "react";
import axios from "axios";
import logo from "./asset/logodt.png";
import "./LuckyWheel/LuckyWheel.css";
import bgImage from "./asset/unsplash1.png";

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "...").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}

function LuckyWheel({ prizes, settings, setPrizes }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const size = 420;                  // Kích thước canvas
  const center = size / 2;           // Tâm canvas (giữa)
  const radius = center - 15;        // Bán kính (chừa khoảng viền)
  const API_BASE = "http://localhost:5000";

  // Nếu chọn màu random thì tạo màu theo số lượng prizes
  const colors = settings.randomColors
    ? prizes.map(
        () => `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
      )
    : ["#beeabdff", "#D9D9D9"];

  // Vẽ vòng quay
  useEffect(() => {
    if (!prizes.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (2 * Math.PI) / prizes.length;
    for (let i = 0; i < prizes.length; i++) {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(
        center,
        center,
        radius,
        i * sliceAngle + angle,
        (i + 1) * sliceAngle + angle
      );
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // 🔹 Chỉ stroke mảnh cho đường chia lát
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#22B800";
      ctx.stroke();

      // Vẽ chữ
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(i * sliceAngle + sliceAngle / 2 + angle);
      ctx.textAlign = "right";
      ctx.fillStyle = i % 2 === 0 ? "#000000ff" : "#04de00ff";
      ctx.font = "bold 24px Serif";
      const maxTextWidth = 100; // 🔹 Giới hạn chiều rộng hiển thị
      const text = truncateText(ctx, prizes[i].label, maxTextWidth);
      ctx.fillText(text, radius - 10, 10);
      ctx.restore();
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, "#006C04");   // trên cùng
    gradient.addColorStop(1, "#7BFF89");   // dưới cùng

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;              // viền dày hơn chút để thấy gradient rõ
    ctx.strokeStyle = gradient;     // áp gradient vào viền
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - 13, 10);   // góc trái mũi tên
    ctx.lineTo(center + 13, 10);   // góc phải mũi tên
    ctx.lineTo(center, 40);        // đỉnh mũi tên (chỉ xuống)
    ctx.closePath();

    const arrowGradient = ctx.createLinearGradient(center - 15, 0, center + 15, 40);
    arrowGradient.addColorStop(0, "#FF0000");   // đỏ đậm
    arrowGradient.addColorStop(1, "#FF7B7B");   // đỏ sáng

    ctx.fillStyle = arrowGradient;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#900";
    ctx.stroke();
    
    // 🔹 Vẽ vòng tròn nền ở giữa
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, 2 * Math.PI); // bán kính = 40px
    ctx.fillStyle = "#fff"; // nền trắng
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#22B800"; // viền xanh lá
    ctx.stroke();

    // 🔹 Chèn logo vào giữa (kích thước nhỏ hơn)
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      const imgSize = 36; // nhỏ hơn 40 để lộ viền ngoài
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, imgSize / 2, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, center - imgSize / 2, center - imgSize / 2, imgSize, imgSize);
      ctx.restore();
    };

  }, [prizes, angle, settings]);

  // Chọn ngẫu nhiên phần thưởng
  const pickPrize = () => {
    const available = prizes.filter(p => p.quantity > 0);
    if (!available.length) return null;

    const expanded = available.flatMap((p) => Array(p.weight).fill(p.label));
    const index = Math.floor(Math.random() * expanded.length);
    return expanded[index];
  };

  // Ghi log lượt quay
  const logSpin = async (label) => {
    try {
      await axios.post(`${API_BASE}/api/spins`, { label });
      // Giảm quantity sau khi quay
      const updated = prizes.map(p =>
        p.label === label ? { ...p, quantity: p.quantity - 1 } : p
      );
      setPrizes(updated);
      await axios.post(`${API_BASE}/api/prizes`, updated);
    } catch (e) {
      console.error("❌ Error logging spin:", e.response?.data || e);
    }
  };

  // Hàm quay
  const spin = () => {
    if (spinning || !prizes.length) return;
    setSpinning(true);

    const selectedPrize = pickPrize();
    const prizeIndex = prizes.findIndex((p) => p.label === selectedPrize);

    const sliceAngle = 360 / prizes.length;
    const targetAngle = 360 * 5 - (prizeIndex * sliceAngle + sliceAngle / 2) - 90;

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
        setShowPopup(true);
        logSpin(selectedPrize);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
  <div className="main container">
    <h2 className="text-xl font-bold mb-2">🎡 Vòng quay may mắn</h2>
    <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
    <div className="mt-4">
      <button
        onClick={spin}
        disabled={spinning}
        className="start px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        {spinning ? "Đang quay..." : "Quay ngay!"}
      </button>
    </div>
    {/* Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>🎉 Chúc mừng!</h2>
            <p>Bạn đã trúng: <strong>{winner}</strong></p>
            <div className="fireworks"></div> {/* 🔹 container pháo hoa */}
            <button onClick={() => setShowPopup(false)}>Đóng</button>
          </div>
        </div>
      )}
  </div>
  );
}

export default LuckyWheel;
