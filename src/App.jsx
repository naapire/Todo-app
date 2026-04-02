import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./components/firebase";
import Login from "./pages/login";
import KanbanBoard from "./pages/KanbanBoard";

// Protects /kanban-board — sends anyone not logged in back to /
function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  // Still checking — show nothing yet (KanbanBoard has its own spinner)
  if (loading) return null;

  // Not logged in — go to login
  if (!user) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Login />} />
        <Route path="/kanban-board" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}