import { useRef, useState, useEffect, useCallback } from "react";
import { toHMS } from "../utils";
import cn from "clsx";
import { useSelector } from "../..";
import { useAppStore } from "../AppStoreProvider";
import { useFakeTime } from "../hooks/useFakeTime";
import { useSeekTo } from "../hooks/useSeekTo";
import type { PointerEventHandler } from "react";

export function Progress() {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [hover, setHover] = useState(false);
  const [value, setValue] = useState(0);

  const duration = useSelector((facade) => facade.duration);
  const cuePoints = useSelector((facade) => facade.cuePoints);

  const setSeeking = useAppStore((state) => state.setSeeking);
  const seeking = useAppStore((state) => state.seeking);

  const seekTo = useSeekTo();
  const fakeTime = useFakeTime();

  const updateValue = useCallback(
    (event: PointerEvent | React.PointerEvent) => {
      const rect = ref.current!.getBoundingClientRect();
      let x = (event.pageX - (rect.left + window.scrollX)) / rect.width;
      x = Math.min(Math.max(x, 0), 1);
      x *= duration;

      setValue(x);

      return x;
    },
    [duration],
  );

  const onPointerDown: PointerEventHandler = (event) => {
    event.preventDefault();
    updateValue(event);
    setSeeking(true);
  };

  const onPointerEnter = () => {
    setHover(true);
  };

  const onPointerLeave = () => {
    setHover(false);
  };

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      updateValue(event);
    };

    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [updateValue]);

  useEffect(() => {
    if (!seeking) {
      return;
    }

    const onPointerUp = (event: PointerEvent) => {
      const time = updateValue(event);
      seekTo(time);
      setSeeking(false);
    };

    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [updateValue, seeking]);

  const active = seeking || hover;
  const progress = seeking ? value : fakeTime;

  return (
    <div
      ref={ref}
      className="relative grow flex items-center cursor-pointer h-1 after:absolute after:inset-0 after:h-14 after:-top-10"
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={tooltipRef}
        className={cn(
          "absolute bg-black/95 text-white rounded-md -translate-x-1/2 bottom-6 h-8 px-2 flex items-center opacity-0 transition-opacity pointer-events-none text-sm",
          active && "opacity-100",
        )}
        style={{
          left: calculateTooltipLeft(
            value,
            duration,
            ref.current,
            tooltipRef.current,
          ),
        }}
      >
        {toHMS(value)}
      </div>
      <div className="absolute h-1 w-full left-0 bg-white/50" />
      {active ? (
        <div
          className="absolute left-0 bg-white/50 h-1"
          style={{ width: `${(value / duration) * 100}%` }}
        />
      ) : null}
      <div
        className="absolute left-0 bg-white h-1"
        style={{
          width: `${(progress / duration) * 100}%`,
        }}
      />
      <div
        className={cn(
          "absolute bg-white h-4 w-4 rounded-full -translate-x-1/2 z-10 after:opacity-0 after:absolute after:inset-0 after:rounded-full after:bg-white/30 after:-z-10 after:transition-all",
          seeking && "after:opacity-100 after:scale-150",
        )}
        style={{ left: `${(progress / duration) * 100}%` }}
      />
      {cuePoints.map((cuePoint) => {
        if (cuePoint === 0) {
          // Do not show preroll.
          return null;
        }
        return (
          <div
            key={cuePoint}
            className="absolute w-3 h-3 bg-[#ffd32c] rounded-full border-2 border-black -translate-x-1/2"
            style={{ left: `${(cuePoint / duration) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

function calculateTooltipLeft(
  value: number,
  duration: number,
  element: HTMLDivElement | null,
  tooltipElement: HTMLDivElement | null,
) {
  let percentage = value / duration;

  if (element && tooltipElement) {
    const half = tooltipElement.clientWidth / 2;
    const bound = half / element.clientWidth;
    if (percentage < bound) {
      percentage = bound;
    } else if (percentage > 1 - bound) {
      percentage = 1 - bound;
    }
  }

  return `${percentage * 100}%`;
}
