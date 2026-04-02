import { useNavigate }        from "react-router-dom";
import { useAuthState }       from "react-firebase-hooks/auth";
import { signOut }            from "firebase/auth";
import { auth }               from "../components/firebase";
import { useKanban }          from "../hooks/useKanban";
import { COLUMNS }            from "../constants/columns";
import BoardHeader            from "../components/BoardHeader";
import Column                 from "../components/Column";

export default function KanbanBoard() {
  const [user, authLoading] = useAuthState(auth);
  const navigate            = useNavigate();

  // Pass the user's unique Firebase id into the hook
  // If user is not ready yet, pass null — the hook handles that safely
  const {
    tasks,
    loading,
    done,
    total,
    pct,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDelete,
    handleAddTask,
  } = useKanban(user?.uid ?? null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Show a full-screen spinner while Firebase checks who is logged in
  // This prevents the board from flashing empty on refresh
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <svg className="animate-spin h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">TaskFlow</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
              {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-600 hidden sm:block">
            {user?.displayName || user?.email}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </div>

      {/* ── Board Header (progress bar) ─────────────────────── */}
      <BoardHeader done={done} total={total} pct={pct} />

      {/* ── Empty state ─────────────────────────────────────── */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-600">No tasks yet</p>
          <p className="text-xs text-gray-400">Add your first task using the input below any column</p>
        </div>
      )}

      {/* ── Kanban columns ──────────────────────────────────── */}
      <div className="px-6 pb-12 overflow-x-auto">
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