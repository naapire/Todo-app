import { useNavigate }        from "react-router-dom";
import { useAuthState }       from "react-firebase-hooks/auth";
import { signOut, updateProfile } from "firebase/auth";
import { auth }               from "../components/firebase";
import { useKanban }          from "../hooks/useKanban";
import { COLUMNS }            from "../constants/columns";
import BoardHeader            from "../components/BoardHeader";
import Column                 from "../components/Column";
import { useState, useRef }   from "react";

export default function KanbanBoard() {
  const [user, authLoading] = useAuthState(auth);
  const navigate            = useNavigate();

  // ── Logout confirmation state ──────────────────────────
  const [showLogoutModal, setShowLogoutModal]   = useState(false);

  // ── Edit username state ────────────────────────────────
  const [editingName, setEditingName]           = useState(false);
  const [nameInput, setNameInput]               = useState("");
  const [nameError, setNameError]               = useState("");
  const [nameSaving, setNameSaving]             = useState(false);

  // ── Profile picture state ──────────────────────────────
  const [avatarMenuOpen, setAvatarMenuOpen]     = useState(false);
  const [uploading, setUploading]               = useState(false);
  const [uploadError, setUploadError]           = useState("");
  const [photoURL, setPhotoURL]                 = useState(user?.photoURL || "");
  const fileInputRef                            = useRef(null);

  const {
    tasks, loading, done, total, pct,
    handleDragStart, handleDragEnd, handleDrop,
    handleDelete, handleAddTask,
  } = useKanban(user?.uid ?? null);

  // ── Logout ─────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // ── Save username ──────────────────────────────────────
  const startEditing = () => {
    setNameInput(user?.displayName || "");
    setNameError("");
    setEditingName(true);
  };
  const cancelEditing = () => { setEditingName(false); setNameError(""); };
  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed)           { setNameError("Username cannot be empty.");               return; }
    if (trimmed.length < 2) { setNameError("Username must be at least 2 characters."); return; }
    setNameSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      setEditingName(false);
    } catch { setNameError("Failed to update username. Try again."); }
    finally  { setNameSaving(false); }
  };

  // ── Upload profile picture to Cloudinary ───────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadError("Image must be under 5MB.");      return; }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append("public_id", `profile_${user.uid}`); // unique per user

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      // Save URL to Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: data.secure_url });

      // ✅ Update avatar instantly without reloading
      setPhotoURL(data.secure_url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Loading spinner
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

      {/* ── Logout Confirmation Modal ─────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900">Log out?</h3>
              <p className="text-sm text-gray-400 mt-1">Are you sure you want to log out of your account?</p>
            </div>
            <div className="flex gap-3 w-full mt-1">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Yes, Log out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Username Modal ───────────────────────────── */}
      {editingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Edit Username</h3>
              <p className="text-sm text-gray-400 mt-0.5">Enter a new display name for your account.</p>
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="Your name"
                autoFocus
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none transition-colors ${
                  nameError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"
                }`}
              />
              {nameError && <p className="text-xs text-red-400 px-1">{nameError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={cancelEditing} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={saveName} disabled={nameSaving} className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-50">
                {nameSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ───────────────────────────────────────── */}
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

          {/* ── Avatar with dropdown ──────────────────────── */}
          <div className="relative">
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="relative group focus:outline-none"
              title="Change profile picture"
            >
              {/* ✅ Uses local photoURL state so it updates instantly */}
              {photoURL ? (
                <img src={photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-400 transition" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-transparent group-hover:ring-blue-400 transition">
                  {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {/* Camera icon overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* Uploading spinner */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}
            </button>

            {/* Dropdown menu */}
            {avatarMenuOpen && !uploading && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1.5">
                <button
                  onClick={() => { fileInputRef.current.click(); setAvatarMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Change Photo
                </button>
                <p className="px-4 py-1 text-xs text-gray-300">JPG, PNG · Max 5MB</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Upload error */}
          {uploadError && (
            <span className="text-xs text-red-400">{uploadError}</span>
          )}

          {/* Username + edit pencil */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </span>
            <button onClick={startEditing} title="Edit username" className="p-1 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </div>

      {/* ── Board Header ─────────────────────────────────── */}
      <BoardHeader done={done} total={total} pct={pct} />

      {/* ── Empty state ──────────────────────────────────── */}
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

      {/* ── Kanban columns ───────────────────────────────── */}
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