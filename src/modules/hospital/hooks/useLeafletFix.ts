"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function useLeafletFix() {
  const map = useMap();

  useEffect(() => {
    let frameId = 0;
    let timeoutId = 0;
    let scheduled = false;

    const invalidate = () => {
      map.invalidateSize({ pan: false, animate: false });
    };

    const scheduleInvalidate = () => {
      if (scheduled) {
        return;
      }

      scheduled = true;
      frameId = window.requestAnimationFrame(() => {
        scheduled = false;
        invalidate();
      });
    };

    // Handle first paint + async layout changes.
    frameId = window.requestAnimationFrame(() => {
      scheduleInvalidate();
      timeoutId = window.setTimeout(scheduleInvalidate, 80);
    });

    const container = map.getContainer();
    const observedElement = container.parentElement || container;

    const resizeObserver = new ResizeObserver(() => {
      scheduleInvalidate();
    });
    resizeObserver.observe(container);
    resizeObserver.observe(observedElement);

    const onWindowResize = () => scheduleInvalidate();
    const onVisibilityChange = () => {
      if (!document.hidden) {
        scheduleInvalidate();
      }
    };

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [map]);
}
