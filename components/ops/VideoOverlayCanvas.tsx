'use client';

import React, { useRef, useEffect } from 'react';
import { useOpsStore } from '../../stores/opsStore';

export function VideoOverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { boxes, activeFeed, layers, riskLevel } = useOpsStore();

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0D0E15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural aerial road/chokepoint scene
      ctx.strokeStyle = 'rgba(236, 232, 223, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Main Corridor Banks
      ctx.fillStyle = 'rgba(46, 31, 115, 0.16)';
      ctx.fillRect(100, 80, canvas.width - 200, canvas.height - 160);

      // Render Tracked Detection Bounding Boxes
      if (layers.boxes) {
        for (const box of boxes) {
          const bx = box.x * canvas.width;
          const by = box.y * canvas.height;
          const bw = box.width * canvas.width;
          const bh = box.height * canvas.height;

          const isCritical = riskLevel === 'critical' && by > canvas.height * 0.55;
          const boxColor = isCritical ? '#FF4B1F' : box.confidence > 0.85 ? '#3DDC97' : '#ECE8DF';

          // Box Rectangle
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner brackets
          const tick = 3;
          ctx.fillStyle = boxColor;
          ctx.fillRect(bx - 1, by - 1, tick, 1);
          ctx.fillRect(bx - 1, by - 1, 1, tick);

          // Box ID & Confidence Tag
          ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
          ctx.fillRect(bx, by - 12, 54, 11);
          ctx.fillStyle = boxColor;
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(`ID:${box.id} ${(box.confidence * 100).toFixed(0)}%`, bx + 2, by - 3);

          // Flow Vector Arrow
          if (layers.flowVectors && box.vx !== undefined && box.vy !== undefined) {
            const arrowLen = 18;
            const endX = bx + bw / 2 + box.vx * arrowLen * 100;
            const endY = by + bh / 2 + box.vy * arrowLen * 100;

            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx + bw / 2, by + bh / 2);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
      }

      // HUD Telemetry Overlays
      ctx.fillStyle = 'rgba(236, 232, 223, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`RAW FEED 2D CV MONITOR // ${activeFeed.id} [${activeFeed.resolution}]`, 16, 24);
      ctx.fillText(`PROCESSED: ${boxes.length} PERSON DETECTIONS // 60 FPS INTERPOLATED`, 16, 40);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [boxes, layers, activeFeed, riskLevel]);

  return (
    <div className="relative w-full h-full bg-[#0A0A0F] flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={960}
        height={600}
        className="w-full h-full object-contain border border-hairline shadow-lg"
      />
    </div>
  );
}
