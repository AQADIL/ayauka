import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import { trees } from '../utils/trees';
import { useGameStore } from '../utils/store';
import { motion, AnimatePresence } from 'framer-motion';
import SvgTreeGame from '../components/SvgTreeGame';

export default function Home() {
  const [showMenu, setShowMenu] = useState(true);
  const [selectedTree, setSelectedTree] = useState(null);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const { progress, setProgress, resetProgress } = useGameStore();

  useEffect(() => {
    if (progress?.tree && progress?.round) {
      setSelectedTree(progress.tree);
      setRound(progress.round);
      setShowMenu(false);
      setShowGreeting(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTree) {
      setProgress({ tree: selectedTree, round });
    }
  }, [selectedTree, round]);

  const handleTreeSelect = (tree) => {
    setSelectedTree(tree);
    setShowMenu(false);
    setShowGreeting(false);
    setRound(1);
  };

  const handleLeafTear = () => {
    if (round < 100) {
      setRound(r => r + 1);
    } else {
      setIsGameOver(true);
      // TODO: Telegram notification API call
      resetProgress();
    }
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
    setSelectedTree(null);
    setRound(1);
    setIsGameOver(false);
    resetProgress();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ayauka үshin 💕</title>
        <meta name="description" content="Игра для Айаушки" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              className={styles.greeting}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1>ayauka үshin 💕</h1>
              <button onClick={() => setShowGreeting(false)} className={styles.button}>
                Начать
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showMenu && !showGreeting && (
            <motion.div
              className={styles.menu}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              <h2>Выбери дерево</h2>
              <div className={styles.treeList}>
                {trees.map(tree => (
                  <button
                    key={tree.id}
                    className={styles.treeButton}
                    onClick={() => handleTreeSelect(tree.id)}
                  >
                    <img src={tree.image} alt={tree.name} className={styles.treeImage} />
                    <span>{tree.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedTree && !showMenu && !showGreeting && !isGameOver && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ marginBottom: 8 }}>{trees.find(t => t.id === selectedTree)?.name}</h2>
              <div style={{ marginBottom: 8 }}>Раунд {round} / 100</div>
              <SvgTreeGame
                tree={selectedTree}
                round={round}
                onComplete={handleLeafTear}
              />
              <button className={styles.button} style={{ marginTop: 20 }} onClick={handleBackToMenu}>
                В меню
              </button>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              className={styles.gameOver}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2>Поздравляем! Все раунды пройдены 🎉</h2>
              <button onClick={handleBackToMenu} className={styles.button}>
                В меню
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
