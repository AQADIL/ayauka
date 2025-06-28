import React, { useState, useRef } from 'react';
import styles from '../styles/LeafGame.module.css';

// Описание веток как кривых (для более реалистичного размещения листьев)
const TREE_BRANCHES = {
  sakura: [
    // [startX, startY, ctrlX, ctrlY, endX, endY]
    [200, 550, 150, 400, 120, 260],
    [200, 550, 250, 400, 290, 250],
    [200, 470, 180, 330, 170, 210],
    [220, 470, 240, 330, 230, 180],
    [200, 400, 220, 360, 320, 340],
    [220, 410, 210, 350, 220, 320],
  ],
  birch: [
    [200, 550, 200, 300, 200, 120],
    [200, 150, 180, 180, 150, 180],
    [210, 180, 240, 180, 250, 180],
    [200, 250, 170, 300, 170, 300],
    [210, 250, 240, 300, 230, 300],
    [200, 350, 200, 380, 200, 380],
  ],
  oak: [
    [200, 550, 180, 400, 130, 260],
    [220, 550, 240, 400, 270, 260],
    [200, 480, 170, 400, 110, 340],
    [220, 480, 250, 400, 290, 340],
    [200, 400, 200, 400, 200, 400],
  ],
};

// SVG-функции для красивых листьев
function SakuraLeaf({ x, y, angle, dragging }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
      <ellipse cx="0" cy="0" rx="12" ry="22" fill="#fbe4ee" stroke="#e7adc4" strokeWidth="2" />
      <ellipse cx="0" cy="-7" rx="7" ry="12" fill="#f8c3d8" opacity="0.7" />
      <path d="M0 0 Q0 18 0 24" stroke="#e7adc4" strokeWidth="1.5" fill="none" />
    </g>
  );
}
function BirchLeaf({ x, y, angle, dragging }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
      <ellipse cx="0" cy="0" rx="10" ry="18" fill="#d3f9d8" stroke="#7abf7a" strokeWidth="2" />
      <path d="M0 0 Q0 12 0 18" stroke="#7abf7a" strokeWidth="1.5" fill="none" />
    </g>
  );
}
function OakLeaf({ x, y, angle, dragging }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
      <path d="M0 0 Q-7 -10 0 -18 Q7 -10 0 0 Q10 8 0 18 Q-10 8 0 0" fill="#e6e1b3" stroke="#bca16a" strokeWidth="2" />
      <path d="M0 0 Q0 8 0 18" stroke="#bca16a" strokeWidth="1.5" fill="none" />
    </g>
  );
}

// Генерация точек для листьев вдоль кривой ветки
function getLeafPointsOnCurve(branch, count) {
  const [x1, y1, cx, cy, x2, y2] = branch;
  const points = [];
  for (let i = 1; i <= count; ++i) {
    const t = i / (count + 1); // не на концах!
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    const angle = Math.atan2(
      2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy),
      2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx)
    ) * 180 / Math.PI + (Math.random() * 24 - 12);
    points.push({ x, y, angle });
  }
  return points;
}


export default function SvgTreeGame({ tree, round, onComplete }) {
  // Сколько листьев на каждой ветке (можно увеличить для сложности)
  const leavesPerBranch = 3;
  // Сгенерировать все листья для всех веток (вдоль кривых)
  const allLeaves = TREE_BRANCHES[tree].flatMap((branch, branchIdx) =>
    getLeafPointsOnCurve(branch, leavesPerBranch).map((pt, i) => ({
      ...pt,
      id: `${branchIdx}-${i}`,
      branchIdx,
      torn: false,
      offsetY: 0,
      dragging: false
    }))
  );
  const [leaves, setLeaves] = useState(allLeaves);
  const [tornCount, setTornCount] = useState(0);
  const [dragId, setDragId] = useState(null);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animationRefs = useRef({});

  // Drag & Drop
  const handleDragStart = (e, id) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragId(id);
    setStartDrag({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });
    setLeaves(ls => ls.map(l => l.id === id ? { ...l, dragging: true } : l));
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMoveWrap, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  // Отключаем скролл при drag листа
  const handleDragMoveWrap = (e) => {
    if (dragId !== null) {
      e.preventDefault();
      handleDragMove(e);
    }
  };


  const handleDragMove = e => {
    if (dragId === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startDrag.x;
    const dy = clientY - startDrag.y;
    setDragOffset({ x: dx, y: dy });
    setLeaves(ls => ls.map(l => l.id === dragId ? {
      ...l,
      offsetX: dx,
      offsetY: dy,
      dragging: true
    } : l));
  };


  const animateFall = (id, vx, vy, angleV) => {
    let last = performance.now();
    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.04); // сек
      last = now;
      setLeaves(ls => ls.map(l => {
        if (l.id === id) {
          // Гравитация и затухание
          const newVy = l.fallVy + 300 * dt;
          const newVx = l.fallVx * 0.99;
          const newAngleV = l.fallAngleV * 0.98;
          return {
            ...l,
            offsetX: l.offsetX + l.fallVx * dt,
            offsetY: l.offsetY + l.fallVy * dt,
            angle: l.angle + l.fallAngleV * dt,
            fallVx: newVx,
            fallVy: newVy,
            fallAngleV: newAngleV,
            falling: true
          };
        }
        return l;
      }));
      const leaf = leaves.find(l => l.id === id);
      if (leaf && leaf.offsetY < 800) {
        animationRefs.current[id] = requestAnimationFrame(step);
      } else {
        setTornCount(c => c + 1);
        setLeaves(ls => ls.map(l => l.id === id ? { ...l, torn: true, falling: false } : l));
      }
    }
    animationRefs.current[id] = requestAnimationFrame(step);
  };

  const handleDragEnd = e => {
    if (dragId === null) return;
    const minDist = 50;
    const leaf = leaves.find(l => l.id === dragId);
    // "Бросок" — по последнему смещению
    const vx = dragOffset.x * 3; // усилить эффект броска
    const vy = dragOffset.y * 3 + 80;
    const angleV = (Math.random() - 0.5) * 180;
    if (Math.abs(dragOffset.x) > minDist || Math.abs(dragOffset.y) > minDist) {
      setLeaves(ls => ls.map(l => l.id === dragId ? {
        ...l,
        falling: true,
        dragging: false,
        fallVx: vx,
        fallVy: vy,
        fallAngleV: angleV
      } : l));
      animateFall(dragId, vx, vy, angleV);
    } else {
      setLeaves(ls => ls.map(l => l.id === dragId ? { ...l, offsetX: 0, offsetY: 0, dragging: false } : l));
    }
    setDragId(null);
    setDragOffset({ x: 0, y: 0 });
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchend', handleDragEnd);
  };


  React.useEffect(() => {
    if (tornCount === leaves.length) {
      setTimeout(() => onComplete && onComplete(), 800);
    }
  }, [tornCount, leaves.length, onComplete]);

  // Перерисовать листья при смене дерева или раунда
  React.useEffect(() => {
    setLeaves(
      TREE_BRANCHES[tree].flatMap((branch, branchIdx) =>
        getLeafPointsOnCurve(branch, leavesPerBranch).map((pt, i) => ({
          ...pt,
          id: `${branchIdx}-${i}`,
          branchIdx,
          torn: false,
          offsetY: 0,
          dragging: false
        }))
      )
    );
    setTornCount(0);
  }, [tree, round]);

  // SVG для дерева (тонкие, плавные ветки)
  function renderTree() {
    if (tree === 'sakura') {
      return (
        <g>
          <rect x="190" y="420" width="20" height="130" rx="9" fill="#e3b7a0" />
          {TREE_BRANCHES.sakura.map(([x1, y1, cx, cy, x2, y2], i) => (
            <path key={i} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} stroke="#b07a56" strokeWidth={i < 2 ? 7 : 4} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    }
    if (tree === 'birch') {
      return (
        <g>
          <rect x="196" y="120" width="8" height="420" rx="4" fill="#e9e7e0" stroke="#b7b6b0" strokeWidth="1.5" />
          {TREE_BRANCHES.birch.map(([x1, y1, cx, cy, x2, y2], i) => (
            <path key={i} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} stroke="#b7b6b0" strokeWidth={i === 0 ? 5 : 2.5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    }
    if (tree === 'oak') {
      return (
        <g>
          <rect x="190" y="350" width="20" height="180" rx="8" fill="#bca16a" />
          {TREE_BRANCHES.oak.map(([x1, y1, cx, cy, x2, y2], i) => (
            <path key={i} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} stroke="#8c6d3f" strokeWidth={i < 2 ? 7 : 4} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    }
  }

  // SVG для листа
  function renderLeaf(leaf, dragging) {
    if (tree === 'sakura') return <SakuraLeaf {...leaf} dragging={dragging} />;
    if (tree === 'birch') return <BirchLeaf {...leaf} dragging={dragging} />;
    if (tree === 'oak') return <OakLeaf {...leaf} dragging={dragging} />;
    return null;
  }

  return (
    <div className={styles.gameArea} style={{ width: 420, height: 640 }}>
      <svg width="400" height="600" style={{ display: 'block', margin: '0 auto' }}>
        {renderTree()}
        {leaves.map(leaf =>
          !leaf.torn && (
            <g
              key={leaf.id}
              style={{ pointerEvents: leaf.dragging ? 'none' : 'auto' }}
              onMouseDown={e => handleDragStart(e, leaf.id)}
              onTouchStart={e => handleDragStart(e, leaf.id)}
            >
              {renderLeaf({ ...leaf, y: leaf.y + leaf.offsetY }, leaf.dragging)}
            </g>
          )
        )}
      </svg>
      {tornCount === leaves.length && (
        <div className={styles.levelComplete} style={{ fontSize: 24, marginTop: -340 }}>
          Раунд пройден!
        </div>
      )}
    </div>
  );
}

