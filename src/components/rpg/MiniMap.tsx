import { useState } from "react";

const MAP_SIZE = 7;

const MiniMap = () => {
  const [playerPos] = useState({ x: 3, y: 3 });
  const [visited] = useState<Set<string>>(
    new Set(["3,3", "3,2", "2,3", "3,4", "4,3", "2,2"])
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: MAP_SIZE }, (_, y) => (
        <div key={y} className="flex gap-0.5">
          {Array.from({ length: MAP_SIZE }, (_, x) => {
            const isPlayer = x === playerPos.x && y === playerPos.y;
            const isVisited = visited.has(`${x},${y}`);
            return (
              <div
                key={x}
                className={`minimap-cell ${
                  isPlayer
                    ? "minimap-cell-active"
                    : isVisited
                    ? "minimap-cell-visited"
                    : ""
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MiniMap;
