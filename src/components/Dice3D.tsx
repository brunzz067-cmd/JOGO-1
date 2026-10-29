import React from 'react';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  diceId: string;
  rotationOffset?: { x: number; y: number };
}

const BASE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: -180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  diceId,
  rotationOffset = { x: 0, y: 0 },
}) => {
  const base = BASE_ROTATIONS[value] || BASE_ROTATIONS[1];
  const rotX = base.x + rotationOffset.x;
  const rotY = base.y + rotationOffset.y;

  return (
    <div className="dice-perspective-container flex items-center justify-center p-2">
      <div
        id={diceId}
        className={`dice-cube ${isRolling ? 'is-rolling' : ''}`}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Face 1: Center dot (Red) */}
        <div className="dice-face face-1">
          <span className="dice-dot dot-red col-start-2 row-start-2" />
        </div>

        {/* Face 2: Top-Left, Bottom-Right */}
        <div className="dice-face face-2">
          <span className="dice-dot col-start-1 row-start-1" />
          <span className="dice-dot col-start-3 row-start-3" />
        </div>

        {/* Face 3: Diagonal (1,1), (2,2), (3,3) */}
        <div className="dice-face face-3">
          <span className="dice-dot col-start-1 row-start-1" />
          <span className="dice-dot col-start-2 row-start-2" />
          <span className="dice-dot col-start-3 row-start-3" />
        </div>

        {/* Face 4: Four corners */}
        <div className="dice-face face-4">
          <span className="dice-dot col-start-1 row-start-1" />
          <span className="dice-dot col-start-3 row-start-1" />
          <span className="dice-dot col-start-1 row-start-3" />
          <span className="dice-dot col-start-3 row-start-3" />
        </div>

        {/* Face 5: Four corners + center */}
        <div className="dice-face face-5">
          <span className="dice-dot col-start-1 row-start-1" />
          <span className="dice-dot col-start-3 row-start-1" />
          <span className="dice-dot col-start-2 row-start-2" />
          <span className="dice-dot col-start-1 row-start-3" />
          <span className="dice-dot col-start-3 row-start-3" />
        </div>

        {/* Face 6: Two columns of three */}
        <div className="dice-face face-6">
          <span className="dice-dot col-start-1 row-start-1" />
          <span className="dice-dot col-start-3 row-start-1" />
          <span className="dice-dot col-start-1 row-start-2" />
          <span className="dice-dot col-start-3 row-start-2" />
          <span className="dice-dot col-start-1 row-start-3" />
          <span className="dice-dot col-start-3 row-start-3" />
        </div>
      </div>
    </div>
  );
};
