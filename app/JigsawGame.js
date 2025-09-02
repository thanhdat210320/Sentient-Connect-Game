import React, { useEffect, useState } from "react";
import logo from "../app/images/logo.jpg";
import img1 from "../app/images/img1.png";
import img2 from "../app/images/img2.png";
import img3 from "../app/images/img3.png";
import img4 from "../app/images/img4.png";
import img5 from "../app/images/img5.png";
import img6 from "../app/images/img6.png";
import img7 from "../app/images/img7.png";
import img8 from "../app/images/img8.png";
import img9 from "../app/images/img9.png";
import img10 from "../app/images/img10.png";
export default function App() {
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
      { dr: -1, dc: 0 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
    ];

    const R = grid.length;
    const C = grid[0].length;

    // Use a simpler BFS approach
    const visited = Array.from({ length: R }, () => Array(C).fill(false));
    const queue = [{ r: start.r, c: start.c, path: [{ r: start.r, c: start.c }], turns: 0, lastDir: -1 }];
    visited[start.r][start.c] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      
      // Check if we reached the end
      if (current.r === end.r && current.c === end.c && current.turns <= 2) {
        return current.path;
      }

      // Try all 4 directions
      for (let d = 0; d < 4; d++) {
        const nr = current.r + dirs[d].dr;
        const nc = current.c + dirs[d].dc;
        
        // Check bounds
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        
        // Skip if already visited
        if (visited[nr][nc]) continue;
        
        // Check if this cell is empty or is our target
        if (grid[nr][nc] === "" || (nr === end.r && nc === end.c)) {
          const newTurns = current.lastDir === -1 || current.lastDir === d ? current.turns : current.turns + 1;
          
          // Only proceed if we haven't exceeded 2 turns
          if (newTurns <= 2) {
            visited[nr][nc] = true;
            const newPath = [...current.path, { r: nr, c: nc }];
            queue.push({ r: nr, c: nc, path: newPath, turns: newTurns, lastDir: d });
          }
        }
      }
    }
    
    return null;
  }

  const onCellClick = (r, c) => {
    const val = grid[r][c];
    if (!val) return;
    const pos = { r, c };
    if (!selected) {
      setSelected(pos);
      setMessage("");
      return;
    }
    if (samePos(selected, pos)) {
      setSelected(null);
      return;
    }
    setMoves((m) => m + 1);
    const path = canConnect(grid, selected, pos);
    if (path) {
      const newGrid = grid.map((row) => row.slice());
      newGrid[selected.r][selected.c] = "";
      newGrid[pos.r][pos.c] = "";
      setGrid(newGrid);
      setSelected(null);
      setMessage("Matched and removed!");
      setRemovedCount((n) => n + 2);
      const remain = newGrid.flat().filter((x) => x !== "").length;
      if (remain === 0) setMessage("You win! All cleared.");
    } else {
      setMessage("Cannot connect.");
      setSelected(pos);
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
    reset()
  }, [])

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
                        <img src={cell.src} className="object-cover"/>
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
