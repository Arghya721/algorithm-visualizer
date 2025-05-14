"use client";
import { useState, useEffect, useRef } from "react"; // Import useEffect and useRef

export default function Sort() {
  const numLength = 100;
  const width = 10;

  // Numbers 1 to 25 in random order (or ascending)
  const [numbers, setNumbers] = useState(
    Array.from({ length: numLength }, (_, i) => i + 1)
  );

  const heightMultiplier = 100 / numLength;

  // Use useRef to persist the audio context across renders
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize the AudioContext when the component mounts
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Clean up the audio context when the component unmounts
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const playTone = (value: number, duration = 50, volume = 0.1) => {
    // Added volume parameter, default to 0.5
    if (!audioContextRef.current) {
      console.warn("AudioContext not initialized.");
      return;
    }

    const audioCtx = audioContextRef.current;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Set the volume
    gainNode.gain.value = volume; // <-- Set the gain value here

    // Map the value to a frequency range (e.g., 200 Hz to 1000 Hz)
    const frequency = 200 + (value / numLength) * 800;

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Connect the oscillator to the gain node and then to the audio context's destination
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Schedule the start and stop of the oscillator
    const now = audioCtx.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);

    // Optional: Disconnect nodes after stopping to clean up resources
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  };

  const merge = async (
    arr: number[],
    left: number,
    mid: number,
    right: number,
    updateVisual: (arr: number[]) => void
  ) => {
    let i = left;
    let j = mid + 1;
    let temp: number[] = [];

    while (i <= mid && j <= right) {
      if (arr[i] < arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    while (i <= mid) temp.push(arr[i++]);
    while (j <= right) temp.push(arr[j++]);

    for (let k = left; k <= right; k++) {
      arr[k] = temp[k - left];
      updateVisual([...arr]); // state update to animate
      playTone(arr[k]); // 🔊 Play sound based on value
      await sleep(20);
    }
  };

  const mergeSortHelper = async (
    arr: number[],
    left: number,
    right: number,
    updateVisual: (arr: number[]) => void
  ) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(arr, left, mid, updateVisual);
      await mergeSortHelper(arr, mid + 1, right, updateVisual);
      await merge(arr, left, mid, right, updateVisual);
    }
  };

  const startMergeSort = async () => {
    const arr = [...numbers]; // local copy
    await mergeSortHelper(arr, 0, arr.length - 1, setNumbers);
  };

  const bubbleSort = async () => {
    const arr = [...numbers]; // local copy
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          // Swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setNumbers([...arr]); // state update to animate
          playTone(arr[j]); // 🔊 Play sound based on value
          await sleep(20);
        }
      }
    }
    setNumbers(arr); // Final state update
    playTone(arr[n - 1]); // 🔊 Play sound for the last element
  };

  const selectionSort = async () => {
    const arr = [...numbers]; // local copy
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        // Swap
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        setNumbers([...arr]); // state update to animate
        playTone(arr[i]); // 🔊 Play sound based on value
        await sleep(20);
      }
    }
    setNumbers(arr); // Final state update
    playTone(arr[n - 1]); // 🔊 Play sound for the last element
  };

  const quickSort = async (
    arr: number[],
    low: number,
    high: number,
    updateVisual: (arr: number[]) => void
  ) => {
    if (low < high) {
      const pi = await partition(arr, low, high, updateVisual);
      await quickSort(arr, low, pi - 1, updateVisual);
      await quickSort(arr, pi + 1, high, updateVisual);
    }
  }

  const partition = async (
    arr: number[],
    low: number,
    high: number,
    updateVisual: (arr: number[]) => void
  ) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        updateVisual([...arr]); // state update to animate
        playTone(arr[i]); // 🔊 Play sound based on value
        await sleep(20);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    updateVisual([...arr]); // state update to animate
    playTone(arr[i + 1]); // 🔊 Play sound based on value
    await sleep(20);
    return i + 1;
  };

    const startQuickSort = async () => {
        const arr = [...numbers]; // local copy
        await quickSort(arr, 0, arr.length - 1, setNumbers);
    };

  const insertionSort = async () => {
    const arr = [...numbers]; // local copy
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = key;
      setNumbers([...arr]); // state update to animate
      playTone(arr[j + 1]); // 🔊 Play sound based on value
      await sleep(20);
    }
    setNumbers(arr); // Final state update
    playTone(arr[n - 1]); // 🔊 Play sound for the last element
  };

  return (
    <>
      <header className="grid grid-cols-12 bg-black text-white p-4">
        <div className="col-span-12 text-center text-xl font-bold">
          Visualizer for Sorting Algorithm
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 text-center">
          <button
            onClick={startMergeSort}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Merge Sort
          </button>
            <button
                onClick={startQuickSort}
                className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
                Start Quick Sort
            </button>
          <button
            onClick={bubbleSort}
            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
          >
            Start Bubble Sort
          </button>
          <button
            onClick={selectionSort}
            className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
          >
            Start Selection Sort
          </button>
            <button
                onClick={insertionSort}
                className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
            >
                Start Insertion Sort
            </button>

          <button
            onClick={() => {
              const shuffled = [...numbers].sort(() => Math.random() - 0.5);
              setNumbers(shuffled);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Shuffle
          </button>
        </div>
      </div>

      {/* Bar Graph */}
      <div className="flex justify-center">
        <div className="h-100 flex items-end overflow-x-auto">
          {numbers.map((num, idx) => (
            <div
              key={idx}
              style={{
                width: `${width}px`,
                height: `${num * heightMultiplier}px`,
              }}
              className="bg-blue-600 mx-[1px]"
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}
