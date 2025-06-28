import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/LeafGame.module.css';
import { trees } from '../utils/trees';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLeaves(tree, count, complexity) {
  const leafImg = trees.find(t => t.id === tree)?.leaf;
  return Array.from({ length: count }, (_, i) => ({
    id: `${tree}-leaf-${i}-${Date.now()}`,
    x: getRandomInt(10, 80),
    y: getRandomInt(10, 60),
    size: getRandomInt(30, 44 + complexity * 8),
    rotation: getRandomInt(-30, 30),
    torn: false,
    fallSpeed: getRandomInt(2, 6 + complexity * 2),
    img: leafImg,
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  }));
}

export default function LeafGame({ tree, round, onComplete, roundsTotal }) {
  const [leaves, setLeaves] = useState([]);
  const [tornCount, setTornCount] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [complexity, setComplexity] = useState(1);
  const dragLeafId = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const comp = Math.min(1 + Math.floor(round / 20), 5);
    setComplexity(comp);
    setLeaves(generateLeaves(tree, 4 + comp * 2, comp));
    setTornCount(0);
    setLevelComplete(false);
  }, [tree, round]);

  function handlePointerDown(e, id) {
    dragLeafId.current = id;
    dragStart.current = {
      x: e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX,
      y: e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY,
    };
    setLeaves(leaves => leaves.map(l => l.id === id ? { ...l, isDragging: true } : l));
  }

  function handlePointerMove(e) {
    if (!dragLeafId.current) return;
    const moveX = (e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX) - dragStart.current.x;
    const moveY = (e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY) - dragStart.current.y;
    setLeaves(leaves => leaves.map(l => l.id === dragLeafId.current ? { ...l, offsetX: moveX, offsetY: moveY } : l));
  }

  function handlePointerUp(e) {
    if (!dragLeafId.current) return;
    const moveY = (e.type.startsWith('touch') ? e.changedTouches[0].clientY : e.clientY) - dragStart.current.y;
    if (moveY > 100) {
      // Leaf torn off
      setLeaves(leaves => leaves.map(l => l.id === dragLeafId.current ? { ...l, torn: true, isDragging: false } : l));
      setTornCount(c => c + 1);
    } else {
      // Reset position
      setLeaves(leaves => leaves.map(l => l.id === dragLeafId.current ? { ...l, isDragging: false, offsetX: 0, offsetY: 0 } : l));
    }
    dragLeafId.current = null;
  }

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  });

  useEffect(() => {
    if (leaves.length > 0 && tornCount === leaves.length) {
      setTimeout(() => {
        setLevelComplete(true);
        setTimeout(() => {
          onComplete();
        }, 900);
      }, 700);
    }
  }, [tornCount, leaves, onComplete]);

  const bgUrl = trees.find(t => t.id === tree)?.bg;

  return (
    <div className={styles.gameArea}>
      <div className={styles.bgPhoto} style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className={styles.leafContainer}>
        {leaves.map((leaf) => (
          <motion.img
            key={leaf.id}
            src={leaf.img}
            alt="leaf"
            className={styles.leaf}
            style={{
              left: `calc(${leaf.x}% + ${leaf.offsetX}px)` ,
              top: `calc(${leaf.y}% + ${leaf.offsetY}px)` ,
              width: leaf.size + 'px',
              transform: `rotate(${leaf.rotation}deg)`,
              pointerEvents: leaf.torn ? 'none' : 'auto',
              filter: leaf.torn ? 'blur(2px)' : 'none',
              zIndex: leaf.torn ? 1 : 2,
              opacity: leaf.torn ? 0 : 1,
              transition: leaf.isDragging ? 'none' : 'all 0.3s',
            }}
            onMouseDown={e => !leaf.torn && handlePointerDown(e, leaf.id)}
            onTouchStart={e => !leaf.torn && handlePointerDown(e, leaf.id)}
            draggable={false}
          />
        ))}
      </div>
      <AnimatePresence>
        {levelComplete && (
          <motion.div
            className={styles.levelComplete}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3>Раунд пройден!</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
