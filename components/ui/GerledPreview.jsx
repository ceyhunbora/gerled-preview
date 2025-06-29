import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function GerledPreview() {
  const [photo, setPhoto] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [result, setResult] = useState(null);
  const [opacity, setOpacity] = useState(0.6);
  const canvasRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);

  // Fotoğraf yükleme
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setRect(null);
      setResult(null);
    }
  };

  // Overlay görsel yükleme
  const handleOverlayUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOverlay(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Mouse basıldığında dikdörtgen başlangıç koordinatlarını al
  const handleMouseDown = (e) => {
    if (!photo || !overlay) return;
    const rectCanvas = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;
    setStartPos({ x, y });
    setDrawing(true);
  };

  // Mouse bırakıldığında dikdörtgen son koordinatlarını al ve rect state'i güncelle
  const handleMouseUp = (e) => {
    if (!drawing) return;
    const rectCanvas = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;

    const newRect = {
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    };

    setRect(newRect);
    setDrawing(false);
  };

  // Önizleme resmi oluşturma fonksiyonu
  const generatePreview = () => {
    if (!photo || !overlay || !rect) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const ovl = new Image();

    img.crossOrigin = 'anonymous';
    ovl.crossOrigin = 'anonymous';

    img.src = photo;
    ovl.src = overlay;

    img.onload = () => {
      // Canvas boyutlarını fotoğraf boyutuna ayarla
      canvas.width = img.width;
      canvas.height = img.height;

      // Fotoğrafı çiz
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      ovl.onload = () => {
        // Overlay'i seçilen dikdörtgen alana saydamlıkla çiz
        ctx.globalAlpha = opacity;
        ctx.drawImage(ovl, rect.x, rect.y, rect.width, rect.height);
        ctx.globalAlpha = 1;

        // Sonucu base64 string olarak al ve state'e kaydet
        const dataUrl = canvas.toDataURL('image/jpeg');
        setResult(dataUrl);
      };
    };
  };

  // Fotoğraf veya dikdörtgen değiştiğinde canvas üzerine fotoğrafı ve dikdörtgeni çiz
  useEffect(() => {
    if (!photo || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photo;

    img.onload = () => {
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);

      if (rect) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }
    };
  }, [photo, rect]);

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">GERLED 3D Tavan Önizleyici</h1>

      <div>
        <label className="block font-medium mb-1" htmlFor="photoUpload">1. Tavan Fotoğrafınızı Yükleyin:</label>
        <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>

      <div>
        <label className="block font-medium mt-4 mb-1" htmlFor="overlayUpload">2. Tavan Uygulama Görselini Yükleyin:</label>
        <input id="overlayUpload" type="file" accept="image/*" onChange={handleOverlayUpload} />
      </div>

      {photo && overlay && (
        <div className="space-y-4 mt-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="opacityRange">Saydamlık: {opacity}</label>
            <input
              id="opacityRange"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
          </div>

          <p className="text-sm text-gray-600">
            Tavan alanını belirlemek için fotoğraf üzerinde dikdörtgen çizin.
          </p>

          <canvas
            ref={canvasRef}
            className="border w-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{ userSelect: 'none' }}
          />

          <Button className="mt-2" onClick={generatePreview}>
            Önizlemeyi Oluştur
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Sonuç:</h2>
          <img src={result} alt="Önizleme" className="w-full border rounded" />
          <a
            href={result}
            download="gerled-tavan.jpg"
            className="inline-block mt-2 underline text-blue-600"
          >
            İndir
          </a>
        </div>
      )}
    </div>
  );
}
