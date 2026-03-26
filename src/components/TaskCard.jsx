export default function TaskCard({ task, col, onDelete, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm px-3.5 py-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-200 transition-all duration-150 select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 leading-snug flex-1">{task.text}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-base leading-none flex-shrink-0 mt-0.5"
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
      <div className="mt-2">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${col.badge}`}>
          {col.label}
        </span>
      </div>
    </div>
  );
}
