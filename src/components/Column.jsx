import { useState } from "react";
import TaskCard from "./TaskCard";

export default function Column({ col, tasks, onDelete, onDrop, onDragStart, onDragEnd, onAddTask }) {
  const [isOver, setIsOver] = useState(false);
  const [input, setInput]   = useState("");
  const [error, setError]   = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(col.id);
  };

  // Clear error as soon as the user starts typing again
  const handleChange = (e) => {
    setInput(e.target.value);
    if (error) setError("");
  };

  const submit = () => {
    const trimmed = input.trim();

    // Empty — do nothing
    if (!trimmed) return;

    // Only 1 character — show error prompt under the input
    if (trimmed.length < 2) {
      setError("Task must be at least 2 characters.");
      return;
    }

    // Valid — add task and reset
    setError("");
    onAddTask(col.id, trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col w-56 flex-shrink-0">

      {/* Column Header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${col.border} ${col.header} mb-2`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
        <span className="text-xs font-semibold text-gray-700 flex-1 tracking-wide uppercase">
          {col.label}
        </span>
        <span className="text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-2 py-0.5 font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col gap-2 rounded-xl p-2 border-2 border-dashed transition-colors duration-150 min-h-[120px] ${
          isOver ? col.dropZone : "border-transparent"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            col={col}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>

      {/* Add Task Input */}
      <div className="mt-2 flex flex-col gap-1">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add task…"
            className={`flex-1 text-xs border rounded-lg px-3 py-2 bg-white text-gray-700 placeholder-gray-300 focus:outline-none transition-colors ${
              error
                ? "border-red-300 focus:border-red-400"   // red border when there's an error
                : "border-gray-200 focus:border-gray-400"  // normal border
            }`}
          />
          <button
            onClick={submit}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-base"
          >
            +
          </button>
        </div>

        {/* Error message — only shows when there's an error */}
        {error && (
          <p className="text-xs text-red-400 px-1">{error}</p>
        )}
      </div>

    </div>
  );
}