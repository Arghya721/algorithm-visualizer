"use client";
import { useState } from "react";
import { Queue } from "@datastructures-js/queue";

export default function Home() {
  const length = 25;
  const width = 25;
  const [grid, setGrid] = useState(
    Array.from({ length }, () => Array.from({ length: width }, () => 0))
  );
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);

  const boxSize = 25;

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleCellClick = (row: number, col: number) => {
    if (!start) {
      setStart([row, col]);
      const newGrid = grid.map((r) => r.slice());
      newGrid[row][col] = 2;
      setGrid(newGrid);
    } else if (!end && (row !== start[0] || col !== start[1])) {
      setEnd([row, col]);
      const newGrid = grid.map((r) => r.slice());
      newGrid[row][col] = 3;
      setGrid(newGrid);
    }
  };

   const dfs = async (
  ) => {
    if (!start || !end) return;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const visited = grid.map((row) => row.slice());
    let found = false;

    const dfsHelper = async (r: number, c: number): Promise<void> => {
      if (
        r < 0 ||
        r >= length ||
        c < 0 ||
        c >= width ||
        visited[r][c] === 1 ||
        found
      ) {
        return;
      }

      visited[r][c] = 1;
      setGrid(visited.map((row) => row.slice()));
      await sleep(20);

      if (r === endRow && c === endCol) {
        found = true;
        return;
      }

      const drow = [-1, 0, 0, 1];
      const dcol = [0, -1, 1, 0];

      for (let i = 0; i < 4; i++) {
        const newRow = r + drow[i];
        const newCol = c + dcol[i];
        await dfsHelper(newRow, newCol);
        if (found) return;
      }
    };

    await dfsHelper(startRow, startCol);
  };

  const bfs = async () => {
    if (!start || !end) return;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const q = new Queue<[number, number]>();
    q.enqueue([startRow, startCol]);

    const drow = [-1, 0, 0, 1];
    const dcol = [0, -1, 1, 0];

    const visited = grid.map((row) => row.slice());
    visited[startRow][startCol] = 2; // start
    setGrid(visited.map((row) => row.slice()));

    while (!q.isEmpty()) {
      const [r, c] = q.dequeue()!;

      for (let i = 0; i < 4; i++) {
        const newRow = r + drow[i];
        const newCol = c + dcol[i];

        if (
          newRow >= 0 &&
          newRow < length &&
          newCol >= 0 &&
          newCol < width &&
          visited[newRow][newCol] === 0
        ) {
          visited[newRow][newCol] = 1;
          q.enqueue([newRow, newCol]);

          setGrid(visited.map((row) => row.slice()));
          await sleep(20);
        }

        if (newRow === endRow && newCol === endCol) {
          visited[newRow][newCol] = 3; // end
          setGrid(visited.map((row) => row.slice()));
          return;
        }
      }
    }
  };

  const resetGrid = () => {
    setStart(null);
    setEnd(null);
    const newGrid = Array.from({ length }, () =>
      Array.from({ length: width }, () => 0)
    );
    setGrid(newGrid);
  };

  return (
    <>
      <header className="grid grid-cols-12 bg-black text-white p-4">
        <div className="col-span-12 text-center text-xl font-bold">
          Visualizer for Graph Algorithm
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 text-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={bfs}
            disabled={!start || !end}
          >
            Start BFS
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded ml-4"
            onClick={dfs}
            disabled={!start || !end}
          >
            Start DFS
          </button>
          <button
            className="bg-amber-400 text-white px-4 py-2 rounded ml-4"
            onClick={resetGrid}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="grid justify-center p-4"
        style={{
          gridTemplateColumns: `repeat(${length}, ${boxSize}px)`,
          gridTemplateRows: `repeat(${width}, ${boxSize}px)`,
        }}
      >
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, cellIndex) => {
            let bg = "bg-white";
            if (cell === 1) bg = "bg-blue-500";
            else if (cell === 2) bg = "bg-green-500"; // start
            else if (cell === 3) bg = "bg-red-500"; // end

            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                onClick={() => handleCellClick(rowIndex, cellIndex)}
                className={`border border-black transition-colors duration-100 ${bg} cursor-pointer`}
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                }}
              ></div>
            );
          })
        )}
      </div>
    </>
  );
}
