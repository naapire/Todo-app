export default function BoardHeader({ done, total, pct }) {
  return (
    <div className="max-w-full px-8 pt-10 pb-6">
      <div className="mb-1 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Board</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Drag cards between stages to update progress
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">
            {done} / {total} done
          </p>
          <p className="text-xs text-gray-400">{pct}% complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
