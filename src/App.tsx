/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Trophy, 
  Gamepad2, 
  Music as MusicIcon,
  RefreshCw,
  Terminal
} from 'lucide-react';

// --- Types ---
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 150;

const TRACKS: Track[] = [
  { id: 1, title: "CYBER_PULSE.EXE", artist: "NEON_VOID", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: "06:12" },
  { id: 2, title: "GLITCH_DREAM.SYS", artist: "VOID_WALKER", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: "07:05" },
  { id: 3, title: "SYNTH_SOUL.DAT", artist: "DATA_GHOST", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration: "05:48" },
];

// --- Components ---

const GlitchText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`glitch-text ${className}`}>{children}</span>
);

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Game Logic ---
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, score, highScore, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
        case 'r':
        case 'R': resetGame(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  // --- Music Logic ---
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (dir: 'next' | 'prev') => {
    let nextIndex = dir === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="noise" />
      <div className="scanline" />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center z-20"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
          <GlitchText>NEON_SNAKE</GlitchText>
          <span className="text-neon-magenta"> // </span>
          <GlitchText className="text-neon-cyan">GLITCH_PLAYER</GlitchText>
        </h1>
        <div className="flex items-center justify-center gap-4 text-xs opacity-50 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Terminal size={12} /> SYSTEM_READY</span>
          <span className="flex items-center gap-1"><MusicIcon size={12} /> AUDIO_SYNCED</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl z-20">
        
        {/* Left Panel: Stats */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-3 space-y-4"
        >
          <div className="glitch-border bg-void-black/80 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-neon-cyan">
              <Trophy size={20} />
              <span className="text-sm font-bold uppercase tracking-tighter">Leaderboard_Data</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] opacity-50 uppercase mb-1">Current_Score</p>
                <p className="text-3xl font-black text-neon-magenta tabular-nums">{score.toString().padStart(5, '0')}</p>
              </div>
              <div className="h-px bg-neon-cyan/20" />
              <div>
                <p className="text-[10px] opacity-50 uppercase mb-1">High_Score</p>
                <p className="text-3xl font-black text-neon-cyan tabular-nums">{highScore.toString().padStart(5, '0')}</p>
              </div>
            </div>
          </div>

          <div className="glitch-border bg-void-black/80 p-6 backdrop-blur-sm border-neon-magenta/50">
            <div className="flex items-center gap-2 mb-4 text-neon-magenta">
              <Gamepad2 size={20} />
              <span className="text-sm font-bold uppercase tracking-tighter">Input_Buffer</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase opacity-70">
              <div className="p-2 border border-neon-magenta/20">ARROWS: MOVE</div>
              <div className="p-2 border border-neon-magenta/20">SPACE: PAUSE</div>
              <div className="p-2 border border-neon-magenta/20">R: RESET</div>
              <div className="p-2 border border-neon-magenta/20">M: MUTE</div>
            </div>
          </div>
        </motion.div>

        {/* Center Panel: Game */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="lg:col-span-6 flex flex-col items-center"
        >
          <div className="relative glitch-border p-1 bg-void-black crt overflow-hidden">
            <div 
              className="grid bg-black/50" 
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(80vw, 400px)',
                height: 'min(80vw, 400px)'
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div 
                    key={i} 
                    className={`
                      w-full h-full border-[0.5px] border-white/5
                      ${isHead ? 'bg-neon-cyan shadow-[0_0_10px_#00f3ff]' : ''}
                      ${isSnake && !isHead ? 'bg-neon-cyan/40' : ''}
                      ${isFood ? 'bg-neon-magenta animate-pulse shadow-[0_0_15px_#ff00ff]' : ''}
                    `}
                  />
                );
              })}
            </div>

            <AnimatePresence>
              {(isGameOver || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-void-black/90 backdrop-blur-md flex flex-col items-center justify-center z-30"
                >
                  <GlitchText className="text-4xl font-black mb-4">
                    {isGameOver ? 'GAME_OVER' : 'SYSTEM_PAUSED'}
                  </GlitchText>
                  <button 
                    onClick={isGameOver ? resetGame : () => setIsPaused(false)}
                    className="flex items-center gap-2 px-8 py-3 bg-neon-cyan text-void-black font-black uppercase tracking-tighter hover:bg-white transition-colors"
                  >
                    {isGameOver ? <RefreshCw size={20} /> : <Play size={20} />}
                    {isGameOver ? 'REBOOT_CORE' : 'RESUME_PROCESS'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-4 flex gap-4">
             <div className="text-[10px] uppercase tracking-widest text-neon-cyan animate-pulse">
                &gt; CONNECTION_STABLE
             </div>
             <div className="text-[10px] uppercase tracking-widest text-neon-magenta animate-pulse" style={{ animationDelay: '1s' }}>
                &gt; CORE_TEMP_OPTIMAL
             </div>
          </div>
        </motion.div>

        {/* Right Panel: Music Player */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-3"
        >
          <div className="glitch-border bg-void-black/80 p-6 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-neon-magenta">
              <MusicIcon size={20} />
              <span className="text-sm font-bold uppercase tracking-tighter">Audio_Stream</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
              <div className="w-32 h-32 bg-neon-magenta/10 border border-neon-magenta/30 flex items-center justify-center mb-4 relative overflow-hidden">
                <motion.div 
                  animate={{ 
                    scale: isPlaying ? [1, 1.2, 1] : 1,
                    rotate: isPlaying ? [0, 90, 180, 270, 360] : 0
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-neon-magenta opacity-50"
                >
                  <MusicIcon size={48} />
                </motion.div>
                {isPlaying && Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border border-neon-magenta/20"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  />
                ))}
              </div>
              <h3 className="text-lg font-black tracking-tighter text-white truncate w-full">
                {TRACKS[currentTrackIndex].title}
              </h3>
              <p className="text-xs text-neon-cyan uppercase tracking-widest opacity-70">
                {TRACKS[currentTrackIndex].artist}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => skipTrack('prev')}
                  className="p-2 hover:text-neon-cyan transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full border-2 border-neon-magenta flex items-center justify-center hover:bg-neon-magenta hover:text-void-black transition-all magenta-glow"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                </button>
                <button 
                  onClick={() => skipTrack('next')}
                  className="p-2 hover:text-neon-cyan transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase opacity-50">
                  <span>00:00</span>
                  <span>{TRACKS[currentTrackIndex].duration}</span>
                </div>
                <div className="h-1 bg-white/10 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-neon-cyan"
                    animate={{ width: isPlaying ? '100%' : '0%' }}
                    transition={{ duration: 300, ease: "linear" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-50">
                <Volume2 size={16} />
                <div className="flex-1 h-1 bg-white/10">
                  <div className="w-2/3 h-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer / Status Bar */}
      <div className="fixed bottom-0 left-0 w-full p-2 bg-void-black border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-[0.2em] opacity-30 z-30">
        <span>LOC: ASIA-SOUTHEAST1 // RUN_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span className="flex items-center gap-4">
          <span>FPS: 60.00</span>
          <span>LATENCY: 12MS</span>
          <span className="text-neon-cyan">ENCRYPTED_STREAM</span>
        </span>
      </div>

      <audio 
        ref={audioRef}
        src={TRACKS[currentTrackIndex].url}
        onEnded={() => skipTrack('next')}
      />
    </div>
  );
}
