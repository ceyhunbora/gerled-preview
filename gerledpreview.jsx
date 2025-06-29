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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleOverlayUpload = (e) => {
    const file = e.target.files[0];
    if (file) setOverlay(URL.createObjectURL(file));
  };

  const handleMouseDown = (e) => {
    if (!photo || !overlay) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setDrawing(true);
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRect = {
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    };
    setRect(newRect);
    setDrawing(false);
  };

  const generatePreview = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const ovl = new Image();

    img.crossOrigin = 'anonymous';
    ovl.crossOrigin = 'anonymous';
    img.src = photo;
    ovl.src = overlay;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (rect) {
        ovl.onload = () => {
          ctx.globalAlpha = opacity;
          ctx.drawImage(ovl, rect.x, rect.y, rect.width, rect.height);
          ctx.globalAlpha = 1;
          setResult(canvas.toDataURL('image/jpeg'));
        };
      }
    };
  };

  useEffect(() => {
    if (photo && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = photo;
      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
        if (rect) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
      };
    }
  }, [photo, rect]);

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">GERLED 3D Tavan Önizleyici</h1>

      <div>
        <label className="block font-medium mb-1">1. Tavan Fotoğrafınızı Yükleyin:</label>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>

      <div>
        <label className="block font-medium mt-4 mb-1">2. Tavan Uygulama Görselini Yükleyin:</label>
        <input type="file" accept="image/*" onChange={handleOverlayUpload} />
      </div>

      {photo && overlay && (
        <div className="space-y-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Saydamlık: {opacity}</label>
            <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} />
          </div>

          <p className="text-sm text-gray-600">Tavan alanını belirlemek için fotoğraf üzerinde dikdörtgen çizin.</p>

          <canvas
            ref={canvasRef}
            className="border w-full"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          ></canvas>

          <Button className="mt-2" onClick={generatePreview}>
            Önizlemeyi Oluştur
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Sonuç:</h2>
          <img src={result} alt="Önizleme" className="w-full border rounded" />
          <a href={result} download="gerled-tavan.jpg" className="inline-block mt-2 underline text-blue-600">İndir</a>
        </div>
      )}
    </div>
  );
}
