import { BrowserRouter, Routes, Route } from "react-router-dom";
import KanbanBoard from "./pages/KanbanBoard";
import Login from "./pages/login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/kanban-board" element={<KanbanBoard />} />
      </Routes>
    </BrowserRouter>
  );
}