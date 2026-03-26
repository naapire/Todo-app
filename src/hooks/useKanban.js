import { useState, useRef } from "react";
import { INITIAL_TASKS } from "../constants/initialTasks";

export function useKanban() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [nextId, setNextId] = useState(INITIAL_TASKS.length + 1);
  const dragId = useRef(null);

  const handleDragStart = (id) => {
    dragId.current = id;
  };

  const handleDragEnd = () => {
    dragId.current = null;
  };

  const handleDrop = (colId) => {
    if (dragId.current === null) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === dragId.current ? { ...t, col: colId } : t))
    );
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = (colId, text) => {
    setTasks((prev) => [...prev, { id: nextId, text, col: colId }]);
    setNextId((n) => n + 1);
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.col === "completed").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return {
    tasks,
    done,
    total,
    pct,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDelete,
    handleAddTask,
  };
}
