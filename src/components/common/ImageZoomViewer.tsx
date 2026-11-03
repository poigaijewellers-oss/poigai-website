import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { isCutoutImage } from "../../lib/productUtils";

type ImageZoomViewerProps = {
  images: string[];
  startIndex: number;
  alt: string;
  cutoutBackground?: string;
  onClose: (index: number) => void;
};

type View = { scale: number; x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const TAP_ZOOM = 2.5;
const RESET: View = { scale: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Full-screen photo viewer: pinch, double-tap, scroll wheel or the +/- buttons to zoom; drag to pan; swipe between photos.
export function ImageZoomViewer({ images, startIndex, alt, cutoutBackground, onClose }: ImageZoomViewerProps) {
  const [index, setIndex] = useState(startIndex);
  const [view, setView] = useState<View>(RESET);
  const [animate, setAnimate] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  // Gestures read the latest view straight away, without waiting for React to re-render between touch events.
  const viewRef = useRef(view);
  function commitView(next: View) {
    viewRef.current = next;
    setView(next);
  }

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startView: View;
    startX: number;
    startY: number;
    startDistance: number;
    startMid: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);

  const several = images.length > 1;
  const src = images[index];

  // Keep the photo from being dragged off the screen.
  function bounded(next: View): View {
    const stage = stageRef.current;
    if (!stage || next.scale <= 1) return { ...next, scale: Math.max(next.scale, MIN_SCALE), x: 0, y: 0 };
    const maxX = (stage.clientWidth * (next.scale - 1)) / 2;
    const maxY = (stage.clientHeight * (next.scale - 1)) / 2;
    return { scale: next.scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  }

  // Zoom to `scale` keeping the screen point (clientX, clientY) still under the finger or cursor.
  function zoomAt(scale: number, clientX: number, clientY: number, from: View = viewRef.current) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = clientX - rect.left - rect.width / 2;
    const py = clientY - rect.top - rect.height / 2;
    const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);
    const ratio = nextScale / from.scale;
    commitView(bounded({ scale: nextScale, x: px - (px - from.x) * ratio, y: py - (py - from.y) * ratio }));
  }

  function zoomBy(factor: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    setAnimate(true);
    zoomAt(viewRef.current.scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function go(direction: number) {
    if (!several) return;
    setAnimate(false);
    commitView(RESET);
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(index);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "+" || event.key === "=") zoomBy(1.5);
      if (event.key === "-") zoomBy(1 / 1.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety (keeps a drag going past the edge); the gesture works without it.
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    setAnimate(false);
    gesture.current = {
      startView: viewRef.current,
      startX: event.clientX,
      startY: event.clientY,
      startDistance: points.length === 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
      startMid: points.length === 2 ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 } : { x: 0, y: 0 },
      moved: points.length > 1,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const g = gesture.current;

    if (points.length === 2 && g.startDistance > 0) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const mid = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
      const scale = clamp(g.startView.scale * (distance / g.startDistance), MIN_SCALE, MAX_SCALE);
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const px = g.startMid.x - rect.left - rect.width / 2;
      const py = g.startMid.y - rect.top - rect.height / 2;
      const ratio = scale / g.startView.scale;
      commitView(
        bounded({
          scale,
          x: px - (px - g.startView.x) * ratio + (mid.x - g.startMid.x),
          y: py - (py - g.startView.y) * ratio + (mid.y - g.startMid.y),
        }),
      );
      return;
    }

    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
    if (g.startView.scale > 1) {
      commitView(bounded({ ...g.startView, x: g.startView.x + dx, y: g.startView.y + dy }));
    } else if (several) {
      // Not zoomed: the photo follows the finger sideways, ready to change photo on release.
      commitView({ scale: 1, x: dx, y: 0 });
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0) {
      // One finger of a pinch lifted: carry on panning from here with the other.
      const [rest] = [...pointers.current.values()];
      gesture.current = { startView: viewRef.current, startX: rest.x, startY: rest.y, startDistance: 0, startMid: rest, moved: true };
      return;
    }
    gesture.current = null;
    if (!g) return;
    setAnimate(true);

    const dx = event.clientX - g.startX;
    if (g.startView.scale <= 1 && several && Math.abs(dx) > 60) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (g.startView.scale <= 1) commitView(RESET);

    if (!g.moved) {
      const now = Date.now();
      const previous = lastTap.current;
      if (previous && now - previous.time < 300 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 30) {
        lastTap.current = null;
        if (viewRef.current.scale > 1) commitView(RESET);
        else zoomAt(TAP_ZOOM, event.clientX, event.clientY, RESET);
      } else {
        lastTap.current = { time: now, x: event.clientX, y: event.clientY };
      }
    }
  }

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    setAnimate(false);
    zoomAt(viewRef.current.scale * Math.exp(-event.deltaY * 0.0018), event.clientX, event.clientY);
  }

  const zoomed = view.scale > 1.01;

  return (
    <div className="zoom-viewer" role="dialog" aria-modal="true" aria-label={`${alt}, zoomed photo`}>
      <div className="zoom-toolbar">
        {several && (
          <span className="zoom-counter">
            {index + 1} / {images.length}
          </span>
        )}
        <div className="zoom-buttons">
          <button type="button" onClick={() => zoomBy(1 / 1.5)} disabled={!zoomed} aria-label="Zoom out">
            <ZoomOut size={18} />
          </button>
          <button type="button" onClick={() => zoomBy(1.5)} disabled={view.scale >= MAX_SCALE} aria-label="Zoom in">
            <ZoomIn size={18} />
          </button>
          <button type="button" onClick={() => onClose(index)} aria-label="Close zoomed photo">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`zoom-stage ${zoomed ? "is-zoomed" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          key={src}
          src={src}
          alt={several ? `${alt}, photo ${index + 1}` : alt}
          draggable={false}
          className={isCutoutImage(src) ? "is-cutout" : ""}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: animate ? "transform .3s cubic-bezier(.22,.9,.32,1)" : "none",
            background: isCutoutImage(src) ? cutoutBackground : undefined,
          }}
        />
      </div>

      {several && (
        <>
          <button type="button" className="zoom-arrow zoom-prev" onClick={() => go(-1)} aria-label="Previous photo">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="zoom-arrow zoom-next" onClick={() => go(1)} aria-label="Next photo">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <p className="zoom-hint">{zoomed ? "Drag to look around · double-tap to reset" : "Pinch, double-tap or scroll to zoom"}</p>
    </div>
  );
}
