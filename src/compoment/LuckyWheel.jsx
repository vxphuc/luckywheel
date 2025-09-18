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

  const size = window.innerWidth < 768 ? 350 : 520;// Kích thước canvas
  const center = size / 2;           // Tâm canvas (giữa)
  const radius = center - 35;        // Bán kính (chừa khoảng viền)
  const API_BASE = "http://localhost:5000";
  
  // Nếu chọn màu random thì tạo màu theo số lượng prizes
  const colors = settings.randomColors
    ? prizes.map(
        () => `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
      )
    : ["#FF0000", "#ffffffff"];

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
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (prizes[i].image) {
        const img = new Image();
        img.src = prizes[i].image.startsWith("http")
          ? prizes[i].image
          : `${API_BASE}${prizes[i].image}`;
        img.onload = () => {
          const scale = size / 520;
          const imgW = 90 * scale;
          const imgH = 40 * scale;

          ctx.save();
          ctx.translate(center, center);
          // Xoay tới lát cắt
          ctx.rotate(i * sliceAngle + sliceAngle / 2 + angle);
          // Đẩy ra ngoài rìa lát
          ctx.translate(radius - imgW + 35, 0);
          // Xoay ngang lại hình ảnh 90 độ
          ctx.rotate(Math.PI / 2);

          // Vẽ ảnh, gốc là giữa chiều cao
          ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);

          ctx.restore();
        };
      }

      const aa = ctx.createRadialGradient(center, center, radius, center, center, radius - 30);
      aa.addColorStop(0, "#FFF8DC");   // highlight sáng
      aa.addColorStop(0.3, "#FFD700"); // vàng sáng
      aa.addColorStop(0.7, "#FFF8DC"); // cam vàng
      aa.addColorStop(1, "#FFA500");   // nâu vàng đậm
      // 🔹 Chỉ stroke mảnh cho đường chia lát
      ctx.lineWidth = 3;
      ctx.strokeStyle = aa;
      ctx.stroke();

      // Vẽ chữ
      // ctx.save();
      // ctx.translate(center, center);
      // ctx.rotate(i * sliceAngle + sliceAngle / 2 + angle);
      // ctx.textAlign = "right";
      // ctx.fillStyle = i % 2 === 0 ? "#ffffffff" : "#FF0000";
      // ctx.font = "bold 24px Serif";
      // const maxTextWidth = 100; // 🔹 Giới hạn chiều rộng hiển thị
      // const text = truncateText(ctx, prizes[i].label, maxTextWidth);
      // ctx.fillText(text, radius - 10, 10);
      // ctx.restore();
    }
    const redGradient = ctx.createRadialGradient(center, center, radius - 30, center, center, radius + 20);
    redGradient.addColorStop(0, "#FF4D4D");  // đỏ sáng (gần highlight)
    redGradient.addColorStop(0.5, "#CC0000"); // đỏ chuẩn
    redGradient.addColorStop(1, "#660000");
    
    const goldGradient = ctx.createLinearGradient(0, 0, 0, size);
    goldGradient.addColorStop(0, "#FFF8DC");   // highlight sáng
    goldGradient.addColorStop(0.3, "#FFD700"); // vàng sáng
    goldGradient.addColorStop(0.7, "#FFF8DC"); // cam vàng
    goldGradient.addColorStop(1, "#FFA500");   // nâu vàng đậm
    
    ctx.beginPath();
    ctx.arc(center, center, radius + 10, 0, 2 * Math.PI);
    ctx.lineWidth = 20;              // viền dày hơn chút để thấy gradient rõ
    ctx.strokeStyle = redGradient;     // áp gradient vào viền
    ctx.stroke();

    const dotCount = prizes.length * 2; // số chấm (gấp đôi số lát cho đều)
    for (let i = 0; i < dotCount; i++) {
      const angleDot = (2 * Math.PI / dotCount) * i + angle;
      const dotRadius = radius + 10; // vị trí trên viền đỏ
      const x = center + dotRadius * Math.cos(angleDot);
      const y = center + dotRadius * Math.sin(angleDot);

      // Gradient highlight cho từng chấm
      const dotGradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 6);
      dotGradient.addColorStop(0, "#FFFFFF");   // highlight sáng
      dotGradient.addColorStop(0.3, "#FFD700"); // vàng nhạt bóng
      dotGradient.addColorStop(1, "#B22222");   // đỏ đậm hòa vào viền

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI); // bán kính chấm = 6px
      ctx.fillStyle = dotGradient;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(center, center, radius , 0, 2 * Math.PI); // nhỏ hơn bán kính của viền đỏ
    ctx.lineWidth = 6;
    ctx.strokeStyle = goldGradient; // vàng sáng hoặc có thể dùng gradient sáng
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 24, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = goldGradient;
    ctx.stroke();
    
    // 🔹 Viền trắng mỏng ngoài cùng (phản chiếu ánh sáng)
    ctx.beginPath();
    ctx.arc(center, center, radius + 29.5, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#9e8600ff";
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
  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const handleClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Tính khoảng cách từ điểm click tới tâm
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Logo nằm trong vòng tròn bán kính ~30px (giống lúc vẽ logo)
    if (distance <= 30) {
      spin(); // gọi hàm quay
    }
  };

  canvas.addEventListener("click", handleClick);
  return () => canvas.removeEventListener("click", handleClick);
}, [center, spin]);
  return (
  <div className="main container">
    <h2 className="text-xl font-bold mb-2">🎡 Vòng quay may mắn</h2>
    <div className="wheel-border">
      <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
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
