import { COLUMNS } from "../constants/columns";
import { useKanban } from "../hooks/useKanban";
import BoardHeader from "../components/BoardHeader";
import Column from "../components/Column";

export default function KanbanBoard() {
  const {
    tasks,
    done,
    total,
    pct,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDelete,
    handleAddTask,
  } = useKanban();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <BoardHeader done={done} total={total} pct={pct} />

      <div className="px-8 pb-12 overflow-x-auto">
        <div className="flex gap-4 w-max">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              col={col}
              tasks={tasks.filter((t) => t.col === col.id)}
              onDelete={handleDelete}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
