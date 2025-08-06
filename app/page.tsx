"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import { MiniAppProvider, useMiniApp } from "@neynar/react";
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { FarcasterSolanaProvider } from '@farcaster/mini-app-solana';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterMiniApp()
  ]
});

const GRID_SIZE = 25;

type Grid = boolean[][];

const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(false));
};

const createRandomGrid = (): Grid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Math.random() > 0.7)
    );
};

const countNeighbors = (grid: Grid, x: number, y: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        if (grid[newX][newY]) count++;
      }
    }
  }
  return count;
};

const nextGeneration = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const neighbors = countNeighbors(grid, x, y);
      const isAlive = grid[x][y];

      if (isAlive) {
        newGrid[x][y] = neighbors === 2 || neighbors === 3;
      } else {
        newGrid[x][y] = neighbors === 3;
      }
    }
  }

  return newGrid;
};

const isGridEmpty = (grid: Grid): boolean => {
  return grid.every((row) => row.every((cell) => !cell));
};

export default function GameOfLife() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const runningRef = useRef(isRunning);

  runningRef.current = isRunning;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((currentGrid) => {
      const newGrid = nextGeneration(currentGrid);
      if (isGridEmpty(newGrid)) {
        setIsRunning(false);
        return newGrid;
      }
      return newGrid;
    });

    setGeneration((gen) => gen + 1);

    setTimeout(runSimulation, 150);
  }, []);

  const toggleCell = useCallback(
    (x: number, y: number) => {
      if (isRunning) return;
      setGrid((currentGrid) => {
        const newGrid = currentGrid.map((row) => [...row]);
        newGrid[x][y] = !newGrid[x][y];
        return newGrid;
      });
    },
    [isRunning]
  );

  useEffect(() => {
    if (isRunning) {
      runningRef.current = true;
      runSimulation();
    }
  }, [isRunning, runSimulation]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    runSimulation();
  }, [runSimulation]);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid());
    setGeneration(0);
    setIsRunning(false);
  }, []);

  const randomizeGrid = useCallback(() => {
    if (isRunning) return;
    setGrid(createRandomGrid());
    setGeneration(0);
  }, [isRunning]);

  const solanaEndpoint = 'https://solana-rpc.publicnode.com';

  return (

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Conway's Game of Life
            </h1>
            <p className="text-slate-300 mb-6 text-lg">
              Click cells to toggle them, then press start to watch evolution
              unfold
            </p>
            <div className="inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xl font-semibold text-cyan-400">
                Generation: {generation}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <Button
              onClick={isRunning ? pauseSimulation : startSimulation}
              className={`min-w-32 h-12 text-lg font-semibold transition-all duration-300 ${
                isRunning
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={clearGrid}
              disabled={isRunning}
              className="min-w-32 h-12 text-lg font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 shadow-lg shadow-slate-500/25 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear
            </Button>

            <Button
              onClick={randomizeGrid}
              disabled={isRunning}
              className="min-w-32 h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 shadow-lg shadow-purple-500/25 transition-all duration-300"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Randomize
            </Button>
          </div>

          <div className="flex justify-center overflow-x-auto">
            <div className="relative">
              <div
                className="grid bg-slate-800/80 p-4 rounded-2xl border border-slate-700"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(12px, 1fr))`,
                }}
              >
                {grid.map((row, x) =>
                  row.map((cell, y) => (
                    <div
                      key={`${x}-${y}`}
                      className={`
                      aspect-square w-[clamp(12px,4vw,20px)] 
                      border border-slate-700 
                      transition-colors duration-100 
                      ${
                        cell ? "bg-cyan-400" : "bg-slate-800 hover:bg-slate-700"
                      } 
                      ${isRunning ? "cursor-default" : "cursor-pointer"}
                    `}
                      onClick={() => toggleCell(x, y)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 text-center">
              Rules of Evolution
            </h2>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-700">
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-1.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="text-lg">
                    Any live cell with 2 or 3 live neighbors survives
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-1.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="text-lg">
                    Any dead cell with exactly 3 live neighbors becomes alive
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full mt-1.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="text-lg">
                    All other live cells die, and all other dead cells stay dead
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  
  )
}
