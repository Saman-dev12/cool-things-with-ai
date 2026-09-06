import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundFx } from '../../audio/soundEngine';
import { Trophy, Gamepad2 } from 'lucide-react';

type GameMode = 'shooter' | 'snake' | 'breaker' | 'typing';

export const ArcadeApp: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameMode>('shooter');
  const [crtFilter, setCrtFilter] = useState(true);

  return (
    <div className="w-full h-full bg-[#05070d] flex flex-col overflow-hidden text-gray-100 select-none font-mono">
      {/* Arcade Station Header */}
      <div className="bg-slate-950/90 border-b border-white/10 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-pink-400" />
          <span className="font-bold text-xs text-white tracking-wider">AETHER ARCADE HUB</span>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => {
              soundFx.click();
              setActiveGame('shooter');
            }}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs font-semibold ${
              activeGame === 'shooter'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🚀 Space Defender
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setActiveGame('snake');
            }}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs font-semibold ${
              activeGame === 'snake'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🐍 Cyber Snake
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setActiveGame('breaker');
            }}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs font-semibold ${
              activeGame === 'breaker'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🧱 Neon Breaker
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setActiveGame('typing');
            }}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs font-semibold ${
              activeGame === 'typing'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ Hacker Typing
          </button>
        </div>

        {/* CRT Scanline Filter Toggle */}
        <button
          onClick={() => setCrtFilter(!crtFilter)}
          className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
            crtFilter
              ? 'border-pink-500/50 bg-pink-500/10 text-pink-300'
              : 'border-white/10 text-gray-500'
          }`}
        >
          CRT FX: {crtFilter ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Game Viewport Container with optional CRT scanlines */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {activeGame === 'shooter' && <SpaceShooterGame crtFilter={crtFilter} />}
        {activeGame === 'snake' && <CyberSnakeGame crtFilter={crtFilter} />}
        {activeGame === 'breaker' && <NeonBreakerGame crtFilter={crtFilter} />}
        {activeGame === 'typing' && <HackerTypingGame crtFilter={crtFilter} />}

        {/* Scanlines overlay */}
        {crtFilter && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-80" />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 1. SPACE SHOOTER GAME
// ==========================================
interface Bullet {
  x: number;
  y: number;
  vy: number;
}
interface Enemy {
  x: number;
  y: number;
  vx: number;
  radius: number;
  hp: number;
  color: string;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

const SpaceShooterGame: React.FC<{ crtFilter: boolean }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(1450);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef({
    playerX: 220,
    movingLeft: false,
    movingRight: false,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    lastSpawn: 0,
    lives: 3,
    score: 0,
  });

  const resetGame = useCallback(() => {
    soundFx.arcadePowerup();
    stateRef.current = {
      playerX: 220,
      movingLeft: false,
      movingRight: false,
      bullets: [],
      enemies: [],
      particles: [],
      lastSpawn: Date.now(),
      lives: 3,
      score: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  const shootBullet = useCallback(() => {
    if (gameOver || !gameStarted) return;
    soundFx.arcadeLaser();
    stateRef.current.bullets.push({
      x: stateRef.current.playerX,
      y: 390,
      vy: -10,
    });
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.movingLeft = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.movingRight = true;
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.movingLeft = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.movingRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootBullet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

      // Background stars
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      // Render stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 37 + Date.now() * 0.05) % width);
        const sy = (i * 29) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (!gameStarted) return;

      const state = stateRef.current;

      // Update Player position
      if (state.movingLeft && state.playerX > 20) state.playerX -= 7;
      if (state.movingRight && state.playerX < width - 20) state.playerX += 7;

      // Spawn Enemies
      const now = Date.now();
      if (now - state.lastSpawn > 900) {
        state.lastSpawn = now;
        const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4'];
        state.enemies.push({
          x: 30 + Math.random() * (width - 60),
          y: -20,
          vx: (Math.random() - 0.5) * 2,
          radius: 14 + Math.random() * 8,
          hp: 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Update Bullets
      state.bullets.forEach((b) => {
        b.y += b.vy;
      });
      state.bullets = state.bullets.filter((b) => b.y > -10);

      // Update Enemies
      state.enemies.forEach((e) => {
        e.y += 2.2;
        e.x += e.vx;
        if (e.x < e.radius || e.x > width - e.radius) e.vx *= -1;
      });

      // Collision Detection: Bullet <-> Enemy
      state.bullets.forEach((b) => {
        state.enemies.forEach((e) => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < e.radius + 6) {
            b.y = -999; // destroy bullet
            e.hp -= 1;
            if (e.hp <= 0) {
              e.y = 9999; // destroy enemy
              state.score += 50;
              setScore(state.score);
              setHighScore((h) => Math.max(h, state.score));

              // Spawn Explosion Particles
              for (let p = 0; p < 12; p++) {
                const angle = (p / 12) * Math.PI * 2;
                state.particles.push({
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * (2 + Math.random() * 3),
                  vy: Math.sin(angle) * (2 + Math.random() * 3),
                  alpha: 1,
                  color: e.color,
                });
              }
            }
          }
        });
      });

      // Enemy passes bottom -> lose life
      state.enemies.forEach((e) => {
        if (e.y > height + 20 && e.y < 9000) {
          state.lives -= 1;
          e.y = 9999;
          if (state.lives <= 0) {
            setGameOver(true);
            setGameStarted(false);
          }
        }
      });
      state.enemies = state.enemies.filter((e) => e.y < height + 50);

      // Update & Draw Particles
      state.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      state.particles = state.particles.filter((p) => p.alpha > 0);

      // Draw Bullets
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      state.bullets.forEach((b) => {
        ctx.fillRect(b.x - 2, b.y, 4, 12);
      });
      ctx.shadowBlur = 0;

      // Draw Enemies
      state.enemies.forEach((e) => {
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Player Ship (Neon Triangle)
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(state.playerX, height - 35);
      ctx.lineTo(state.playerX - 16, height - 12);
      ctx.lineTo(state.playerX, height - 18);
      ctx.lineTo(state.playerX + 16, height - 12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD */}
      <div className="absolute top-2 left-3 right-3 flex justify-between items-center text-xs font-mono text-white pointer-events-none">
        <div className="flex items-center gap-4">
          <div>SCORE: <span className="text-pink-400 font-bold">{score}</span></div>
          <div>LIVES: <span className="text-emerald-400 font-bold">{'❤️'.repeat(Math.max(0, stateRef.current.lives))}</span></div>
        </div>
        <div className="text-amber-300 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" /> HIGH: {highScore}
        </div>
      </div>

      {/* Start / Game Over Overlay */}
      {(!gameStarted || gameOver) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
            {gameOver ? 'GAME OVER' : 'SPACE DEFENDER 1984'}
          </h2>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            Use <kbd className="bg-white/10 px-1 rounded">A/D</kbd> or <kbd className="bg-white/10 px-1 rounded">← / →</kbd> to move, <kbd className="bg-white/10 px-1 rounded">SPACE</kbd> to shoot lasers.
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            {gameOver ? 'Try Again' : 'Launch Fighter'}
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. CYBER SNAKE 2088 GAME
// ==========================================
const CyberSnakeGame: React.FC<{ crtFilter: boolean }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(380);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const gameState = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    score: 0,
  });

  const spawnFood = () => {
    return {
      x: Math.floor(Math.random() * 24),
      y: Math.floor(Math.random() * 18),
    };
  };

  const startGame = () => {
    soundFx.arcadePowerup();
    gameState.current = {
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: spawnFood(),
      score: 0,
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const { dir } = gameState.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dir.y === 0) {
        e.preventDefault();
        gameState.current.nextDir = { x: 0, y: -1 };
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dir.y === 0) {
        e.preventDefault();
        gameState.current.nextDir = { x: 0, y: 1 };
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dir.x === 0) {
        gameState.current.nextDir = { x: -1, y: 0 };
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dir.x === 0) {
        gameState.current.nextDir = { x: 1, y: 0 };
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const interval = setInterval(() => {
      const state = gameState.current;
      state.dir = state.nextDir;
      const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };

      // Wall wrap
      if (head.x < 0) head.x = 24 - 1;
      if (head.x >= 24) head.x = 0;
      if (head.y < 0) head.y = 18 - 1;
      if (head.y >= 18) head.y = 0;

      // Self collision
      if (state.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        soundFx.arcadeLaser();
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      state.snake.unshift(head);

      // Check food
      if (head.x === state.food.x && head.y === state.food.y) {
        soundFx.arcadePowerup();
        state.score += 20;
        setScore(state.score);
        setHighScore((h) => Math.max(h, state.score));
        state.food = spawnFood();
      } else {
        state.snake.pop();
      }
    }, 95);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      const stepX = width / 24;
      const stepY = height / 18;
      for (let x = 0; x < 24; x++) {
        for (let y = 0; y < 18; y++) {
          ctx.fillRect(x * stepX, y * stepY, 1, 1);
        }
      }

      const state = gameState.current;

      // Food
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(
        state.food.x * stepX + stepX / 2,
        state.food.y * stepY + stepY / 2,
        stepX * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake body
      state.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#34d399' : '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = i === 0 ? 10 : 0;
        ctx.fillRect(
          seg.x * stepX + 1,
          seg.y * stepY + 1,
          stepX - 2,
          stepY - 2
        );
      });
      ctx.shadowBlur = 0;
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 left-3 right-3 flex justify-between text-xs font-mono text-white pointer-events-none">
        <div>SCORE: <span className="text-emerald-400 font-bold">{score}</span></div>
        <div className="text-amber-300 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> HIGH: {highScore}</div>
      </div>

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            {isGameOver ? 'SYSTEM CRASH (SNAKE DIED)' : 'CYBER SNAKE 2088'}
          </h2>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            Use Arrow keys or WASD to navigate through cyber cyberspace. Don't bite your own tail!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            {isGameOver ? 'Play Again' : 'Connect Snake'}
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. NEON BREAKER / QUANTUM PONG
// ==========================================
interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
}

const NeonBreakerGame: React.FC<{ crtFilter: boolean }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(520);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    paddleX: 200,
    paddleW: 80,
    ballX: 240,
    ballY: 280,
    ballVx: 4,
    ballVy: -4,
    bricks: [] as Brick[],
    movingLeft: false,
    movingRight: false,
    score: 0,
  });

  const initBricks = (w: number) => {
    const cols = 8;
    const rows = 4;
    const brickW = (w - 60) / cols;
    const brickH = 16;
    const colors = ['#f43f5e', '#ec4899', '#38bdf8', '#a855f7'];
    const bricks: Brick[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: 30 + c * brickW,
          y: 40 + r * (brickH + 8),
          w: brickW - 6,
          h: brickH,
          color: colors[r],
          alive: true,
        });
      }
    }
    return bricks;
  };

  const startGame = () => {
    soundFx.arcadePowerup();
    const w = canvasRef.current?.width || 480;
    stateRef.current = {
      paddleX: w / 2 - 40,
      paddleW: 80,
      ballX: w / 2,
      ballY: 280,
      ballVx: 4.5,
      ballVy: -4.5,
      bricks: initBricks(w),
      movingLeft: false,
      movingRight: false,
      score: 0,
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.movingLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.movingRight = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.movingLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.movingRight = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, width, height);

      const state = stateRef.current;

      if (isPlaying && !isGameOver) {
        // Paddle movement
        if (state.movingLeft && state.paddleX > 10) state.paddleX -= 7;
        if (state.movingRight && state.paddleX < width - state.paddleW - 10) state.paddleX += 7;

        // Ball movement
        state.ballX += state.ballVx;
        state.ballY += state.ballVy;

        // Wall collisions
        if (state.ballX < 8 || state.ballX > width - 8) {
          state.ballVx *= -1;
          soundFx.click();
        }
        if (state.ballY < 8) {
          state.ballVy *= -1;
          soundFx.click();
        }

        // Paddle collision
        if (
          state.ballY >= height - 38 &&
          state.ballY <= height - 26 &&
          state.ballX >= state.paddleX &&
          state.ballX <= state.paddleX + state.paddleW
        ) {
          state.ballVy = -Math.abs(state.ballVy);
          soundFx.click();
        }

        // Brick collisions
        state.bricks.forEach((b) => {
          if (!b.alive) return;
          if (
            state.ballX >= b.x &&
            state.ballX <= b.x + b.w &&
            state.ballY >= b.y &&
            state.ballY <= b.y + b.h
          ) {
            b.alive = false;
            state.ballVy *= -1;
            state.score += 25;
            setScore(state.score);
            setHighScore((h) => Math.max(h, state.score));
            soundFx.arcadePowerup();
          }
        });

        // Ball out bottom -> Game Over
        if (state.ballY > height + 10) {
          setIsGameOver(true);
          setIsPlaying(false);
          soundFx.arcadeLaser();
        }
      }

      // Draw bricks
      state.bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });
      ctx.shadowBlur = 0;

      // Draw paddle
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.paddleX, height - 30, state.paddleW, 10);

      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 left-3 right-3 flex justify-between text-xs font-mono text-white pointer-events-none">
        <div>SCORE: <span className="text-cyan-400 font-bold">{score}</span></div>
        <div className="text-amber-300 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> HIGH: {highScore}</div>
      </div>

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            {isGameOver ? 'ORB LOST (GAME OVER)' : 'NEON BREAKER 2088'}
          </h2>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            Use <kbd className="bg-white/10 px-1 rounded">A/D</kbd> or Arrow Keys to position the laser paddle and smash all quantum bricks!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            {isGameOver ? 'Restart Session' : 'Start Breaker'}
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. HACKER TYPING CHALLENGE
// ==========================================
interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  matched: number;
}

const WORDS = [
  'QUANTUM', 'FIREWALL', 'OVERRIDE', 'ENCRYPT', 'GLITCH',
  'CYBER', 'KERNEL', 'AETHER', 'MATRIX', 'NEURAL',
  'PACKET', 'SYNTH', 'BYPASS', 'DECRYPT', 'PAYLOAD',
];

const HackerTypingGame: React.FC<{ crtFilter: boolean }> = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(720);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = () => {
    soundFx.arcadePowerup();
    setScore(0);
    setLives(3);
    setFallingWords([]);
    setCurrentInput('');
    setIsGameOver(false);
    setIsPlaying(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Word spawner
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const interval = setInterval(() => {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      setFallingWords((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          word,
          x: 10 + Math.random() * 70, // percentage
          y: 0,
          speed: 0.6 + Math.random() * 0.5,
          matched: 0,
        },
      ]);
    }, 1400);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  // Game tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const interval = setInterval(() => {
      setFallingWords((prev) => {
        const next: FallingWord[] = [];
        let lostLife = false;

        prev.forEach((w) => {
          const newY = w.y + w.speed;
          if (newY >= 88) {
            lostLife = true;
          } else {
            next.push({ ...w, y: newY });
          }
        });

        if (lostLife) {
          soundFx.arcadeLaser();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
            }
            return nextL;
          });
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCurrentInput(val);
    soundFx.keyPress();

    // Check if input completely matches any falling word
    const matchIdx = fallingWords.findIndex((w) => w.word === val);
    if (matchIdx !== -1) {
      soundFx.arcadePowerup();
      setScore((s) => {
        const newScore = s + 40;
        setHighScore((h) => Math.max(h, newScore));
        return newScore;
      });
      setFallingWords((prev) => prev.filter((_, idx) => idx !== matchIdx));
      setCurrentInput('');
    }
  };

  return (
    <div className="relative w-full h-full bg-[#03060c] p-4 flex flex-col justify-between overflow-hidden">
      {/* HUD */}
      <div className="flex justify-between text-xs font-mono text-white z-10 border-b border-white/10 pb-2">
        <div className="flex items-center gap-4">
          <div>FIREWALL INTEGRITY: <span className="text-emerald-400 font-bold">{'🛡️'.repeat(Math.max(0, lives))}</span></div>
          <div>SCORE: <span className="text-amber-400 font-bold">{score}</span></div>
        </div>
        <div className="text-amber-300 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> HIGH: {highScore}</div>
      </div>

      {/* Falling Words Area */}
      <div className="flex-1 relative overflow-hidden">
        {fallingWords.map((w) => (
          <div
            key={w.id}
            className="absolute px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-lg shadow-amber-500/20 transition-all duration-75"
            style={{ left: `${w.x}%`, top: `${w.y}%` }}
          >
            {w.word}
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="z-10 pt-2 border-t border-white/10 flex items-center gap-2">
        <span className="text-xs text-amber-400 font-mono font-bold">$ TARGET &gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          placeholder="TYPE WORD TO NEUTRALIZE MALWARE..."
          className="flex-1 bg-black/60 border border-amber-500/40 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 outline-none uppercase placeholder:text-gray-600 focus:border-amber-400"
          autoFocus
        />
      </div>

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-4 z-20">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            {isGameOver ? 'FIREWALL BREACHED' : 'CYBER HACKER TYPING'}
          </h2>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            Type falling cyber keywords on your physical keyboard to destroy incoming intrusions before they breach the core mainframe!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            {isGameOver ? 'Restart Firewall' : 'Initialize Terminal'}
          </button>
        </div>
      )}
    </div>
  );
};
