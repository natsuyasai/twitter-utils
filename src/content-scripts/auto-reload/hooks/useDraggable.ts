import { useState, useCallback, useEffect, useRef } from "react";
import type { Position } from "../storage";
import { getStoredPosition, savePosition } from "../storage";

export const useDraggable = () => {
  const [position, setPosition] = useState<Position>(getStoredPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // ドラッグ開始
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    event.preventDefault();
    event.stopPropagation();
  }, [position.x, position.y]);

  // ドラッグ中
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const newPosition = {
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      };

      setPosition(newPosition);
    },
    [isDragging]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      savePosition(position);
    }
  }, [isDragging, position]);

  // ドラッグイベントリスナーの登録
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp);

      return () => {
        window.removeEventListener("pointermove", handleMouseMove);
        window.removeEventListener("pointerup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
};
