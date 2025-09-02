import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import logo from "./images/logo.jpg";
import img1 from "./images/img1.png";
import img2 from "./images/img2.png";
import img3 from "./images/img3.png";
import img4 from "./images/img4.png";
import img5 from "./images/img5.png";
import img6 from "./images/img6.png";
import img7 from "./images/img7.png";
import img8 from "./images/img8.png";
import img9 from "./images/img9.png";
import img10 from "./images/img10.png";
export default function App() {
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  // Client-side rendering state
  const [isClient, setIsClient] = useState(false);
  const ROWS = 8; // giảm số hàng để dễ hơn
  const COLS = 10; // giảm số cột để dễ hơn
  const PAD = 1;
  const totalRows = ROWS + PAD * 2;
  const totalCols = COLS + PAD * 2;

  const pool = [
    img1, img2 , img3,img4, img5 , img6,img7, img8 , img9, img10
  ];

  const createBoard = () => {
    const innerCount = ROWS * COLS;
    const pairCount = Math.floor(innerCount / 2);
    const tiles = [];
    for (let i = 0; i < pairCount; i++) {
      const type = pool[i % pool.length];
      tiles.push(type, type);
    }
    if (tiles.length < innerCount) tiles.push("");

    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    const grid = Array.from({ length: totalRows }, () =>
      Array.from({ length: totalCols }, () => "")
    );

    let idx = 0;
    for (let r = PAD; r < totalRows - PAD; r++) {
      for (let c = PAD; c < totalCols - PAD; c++) {
        grid[r][c] = tiles[idx++] || "";
      }
    }
    return grid;
  };

  const [grid, setGrid] = useState(createBoard());
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [moves, setMoves] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const samePos = (a, b) => a && b && a.r === b.r && a.c === b.c;

  function canConnect(grid, start, end) {
    if (!start || !end) return null;
    if (start.r === end.r && start.c === end.c) return null;
    if (grid[start.r][start.c] === "" || grid[end.r][end.c] === "") return null;
    if (grid[start.r][start.c] !== grid[end.r][end.c]) return null;

    // Check if they are directly adjacent (no turns needed)
    const isAdjacent = Math.abs(start.r - end.r) + Math.abs(start.c - end.c) === 1;
    if (isAdjacent) {
      return [{ r: start.r, c: start.c }, { r: end.r, c: end.c }];
    }

    const dirs = [
      { dr: -1, dc: 0 }, // up
      { dr: 0, dc: 1 },  // right
      { dr: 1, dc: 0 },  // down
      { dr: 0, dc: -1 }, // left
    ];

    const R = grid.length;
    const C = grid[0].length;

    // BFS with turn tracking
    const queue = [];
    const visited = new Set();
    
    // Start from all 4 directions from the start position
    for (let d = 0; d < 4; d++) {
      const nr = start.r + dirs[d].dr;
      const nc = start.c + dirs[d].dc;
      
      if (nr >= 0 && nr < R && nc >= 0 && nc < C) {
        if (grid[nr][nc] === "" || (nr === end.r && nc === end.c)) {
          const key = `${nr},${nc},${d}`;
          visited.add(key);
          queue.push({
            r: nr,
            c: nc,
            dir: d,
            turns: 0,
            path: [{ r: start.r, c: start.c }, { r: nr, c: nc }]
          });
        }
      }
    }

    while (queue.length > 0) {
      const current = queue.shift();
      
      // Check if we reached the end
      if (current.r === end.r && current.c === end.c) {
        return current.path;
      }

      // Continue in the same direction
      const nr = current.r + dirs[current.dir].dr;
      const nc = current.c + dirs[current.dir].dc;
      
      if (nr >= 0 && nr < R && nc >= 0 && nc < C) {
        const key = `${nr},${nc},${current.dir}`;
        if (!visited.has(key) && (grid[nr][nc] === "" || (nr === end.r && nc === end.c))) {
          visited.add(key);
          queue.push({
            r: nr,
            c: nc,
            dir: current.dir,
            turns: current.turns,
            path: [...current.path, { r: nr, c: nc }]
          });
        }
      }

      // Try turning (if we haven't exceeded 2 turns)
      if (current.turns < 2) {
        for (let d = 0; d < 4; d++) {
          if (d === current.dir) continue; // Skip same direction
          
          const nr = current.r + dirs[d].dr;
          const nc = current.c + dirs[d].dc;
          
          if (nr >= 0 && nr < R && nc >= 0 && nc < C) {
            const key = `${nr},${nc},${d}`;
            if (!visited.has(key) && (grid[nr][nc] === "" || (nr === end.r && nc === end.c))) {
              visited.add(key);
              queue.push({
                r: nr,
                c: nc,
                dir: d,
                turns: current.turns + 1,
                path: [...current.path, { r: nr, c: nc }]
              });
            }
          }
        }
      }
    }
    
    return null;
  }

  const onCellClick = (r, c) => {
    try {
      const val = grid[r][c];
      if (!val) return;
      
      const pos = { r, c };
      
      // If no tile is selected, select this one
      if (!selected) {
        setSelected(pos);
        setMessage("");
        return;
      }
      
      // If clicking the same tile, deselect it
      if (samePos(selected, pos)) {
        setSelected(null);
        setMessage("");
        return;
      }
      
      // If clicking a different tile, try to connect
      setMoves((m) => m + 1);
      const path = canConnect(grid, selected, pos);
      
      if (path) {
        // Successful match
        const newGrid = grid.map((row) => row.slice());
        newGrid[selected.r][selected.c] = "";
        newGrid[pos.r][pos.c] = "";
        setGrid(newGrid);
        setSelected(null);
        setMessage("Matched and removed!");
        setRemovedCount((n) => n + 2);
        
        // Check if game is won
        const remain = newGrid.flat().filter((x) => x !== "").length;
        if (remain === 0) {
          setMessage("You win! All cleared.");
        }
      } else {
        // Cannot connect - select the new tile instead
        setMessage("Cannot connect. Try another pair.");
        setSelected(pos);
      }
    } catch (error) {
      console.error("Error in onCellClick:", error);
      setMessage("An error occurred. Please try again.");
    }
  };


  const reset = () => {
    setGrid(createBoard());
    setSelected(null);
    setMessage("");
    setMoves(0);
    setRemovedCount(0);
    setStartTime(Date.now());
    setElapsed(0);
  };

  const shuffleInner = () => {
    const vals = [];
    for (let r = PAD; r < totalRows - PAD; r++) for (let c = PAD; c < totalCols - PAD; c++) vals.push(grid[r][c]);
    for (let i = vals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    const newGrid = grid.map((row) => row.slice());
    let idx = 0;
    for (let r = PAD; r < totalRows - PAD; r++) for (let c = PAD; c < totalCols - PAD; c++) newGrid[r][c] = vals[idx++];
    setGrid(newGrid);
    setSelected(null);
    setMessage("Shuffled.");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        reset();
      } catch (error) {
        console.error("Error initializing game:", error);
        setHasError(true);
      }
    }
  }, [isClient]);

  // Loading state for client-side rendering
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex flex-col items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Error boundary
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex flex-col items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Game Error</h1>
          <p className="mb-4">Something went wrong. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex flex-col items-center text-white">
     
      
                  <div className="">
            <img
              src={logo.src}
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16"
              alt="logo"
            />
          </div>
        <h1 className="text-3xl font-bold mb-4">Sentient Connect Game</h1>
      

      <div className="w-full max-w-4xl bg-white/5 rounded-2xl p-4 shadow-lg">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <div>Moves: {moves}</div>
            <div>Removed: {removedCount}</div>
            <div>Time: {elapsed}s</div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500">Reset</button>
            <button onClick={shuffleInner} className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-500">Shuffle</button>
          </div>
        </div>

        <div className="overflow-auto">
          <div className="inline-block bg-gray-700 rounded-lg p-2">
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${totalCols}, 64px)`, gap: 8 }}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selected && selected.r === r && selected.c === c;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => onCellClick(r, c)}
                      className={`w-16 h-16 rounded flex items-center justify-center select-none cursor-pointer transition-transform transform ${cell ? 'scale-100' : 'opacity-30'} ${isSelected ? 'ring-4 ring-green-400' : ''} bg-pink-50/10`}
                    >
                      <div className="text-3xl">
                        {cell && <img src={cell.src} className="object-cover w-full h-full"/>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-300">{message}</div>
      </div>
    </div>
  );
}
