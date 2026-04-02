import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../components/firebase";

// userId is passed in from the KanbanBoard page
// Every user has their own tasks stored at: users/{userId}/tasks/
export function useKanban(userId) {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const dragId                  = useRef(null);

  useEffect(() => {
    // No user yet — stop the spinner and do nothing
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to this user's tasks folder in Firestore in real time
    // onSnapshot fires immediately with whatever is in Firestore
    // and again whenever anything changes
    const ref         = collection(db, "users", userId, "tasks");
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort by creation time in JavaScript — no Firestore index needed
        fetched.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

        setTasks(fetched);
        setLoading(false);
      },
      (err) => {
        // Print the exact Firebase error in your browser console
        // Open DevTools → Console to see it
        console.error("Firestore error:", err.code, err.message);
        setLoading(false);
      }
    );

    // Stop listening when the user logs out
    return () => unsubscribe();
  }, [userId]);

  // ── DRAG ──────────────────────────────────────────────────
  const handleDragStart = (id) => { dragId.current = id; };
  const handleDragEnd   = ()   => { dragId.current = null; };

  // ── DROP — move task to a different column ─────────────────
  const handleDrop = async (colId) => {
    if (!dragId.current || !userId) return;
    const id = dragId.current;

    // 1. Update screen immediately so the user doesn't wait
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, col: colId } : t))
    );

    // 2. Save to Firestore in the background
    await updateDoc(doc(db, "users", userId, "tasks", id), { col: colId });
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!userId) return;

    // 1. Remove from screen immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));

    // 2. Delete from Firestore in the background
    await deleteDoc(doc(db, "users", userId, "tasks", id));
  };

  // ── ADD ───────────────────────────────────────────────────
  const handleAddTask = async (colId, text) => {
    if (!userId) return;

    const createdAt = Date.now();
    const tempId    = `temp_${createdAt}`;

    // 1. Show the card on screen immediately with a temporary id
    setTasks((prev) => [...prev, { id: tempId, text, col: colId, createdAt }]);

    // 2. Save to Firestore — onSnapshot will fire and swap
    //    the temp id for the real Firestore id automatically
    await addDoc(collection(db, "users", userId, "tasks"), {
      text,
      col: colId,
      createdAt,
    });
  };

  const total = tasks.length;
  const done  = tasks.filter((t) => t.col === "completed").length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return {
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
  };
}