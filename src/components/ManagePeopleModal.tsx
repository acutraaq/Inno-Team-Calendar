"use client";

import { useState } from "react";
import { X, Trash2, Plus, UserPlus } from "lucide-react";
import { SafeTeamMember } from "@/types";
import { createTeamMember, deleteTeamMember } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface ManagePeopleModalProps {
  members: SafeTeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onMembersChange: () => void;
}

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Unexpected error";
}

export function ManagePeopleModal({
  members,
  isOpen,
  onClose,
  onMembersChange,
}: ManagePeopleModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addColor, setAddColor] = useState("#7EB5C4");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetAdd = () => {
    setAddName("");
    setAddColor("#7EB5C4");
    setError("");
    setShowAddForm(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createTeamMember(addName.trim(), addColor);
      onMembersChange();
      resetAdd();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setLoading(true);
    try {
      await deleteTeamMember(id);
      onMembersChange();
      setDeleteConfirmId(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteConfirmId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60]"
        onClick={() => { if (!loading) onClose(); }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-people-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[380px] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 id="manage-people-title" className="text-sm font-semibold text-stone-800">
            Manage People
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-stone-100 rounded-md transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            {members.map((member) =>
              deleteConfirmId === member.id ? (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-red-50 border border-red-200"
                >
                  <span className="text-xs text-red-700 font-medium">
                    Delete {member.name}?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={loading}
                      className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id)}
                      disabled={loading}
                      className="text-xs text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                    >
                      {loading ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-stone-50 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="text-sm text-stone-700">{member.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDeleteConfirmId(member.id); setError(""); }}
                    disabled={loading}
                    className={cn(
                      "p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50",
                      "hover:bg-red-50"
                    )}
                    aria-label={`Delete ${member.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                  </button>
                </div>
              )
            )}
          </div>

          {/* Add form */}
          {showAddForm ? (
            <form
              onSubmit={handleAdd}
              className="mt-3 border border-stone-200 rounded-lg p-4 bg-stone-50/50"
            >
              <p className="text-xs font-semibold text-stone-600 mb-3 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> New Member
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="add-name" className="text-xs font-medium text-stone-500 mb-1 block">
                    Name
                  </label>
                  <input
                    id="add-name"
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                    maxLength={60}
                    placeholder="e.g. Alex"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="add-color" className="text-xs font-medium text-stone-500 mb-1 block">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="add-color"
                      type="color"
                      value={addColor}
                      onChange={(e) => setAddColor(e.target.value)}
                      className="w-10 h-9 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={addColor}
                      onChange={(e) => setAddColor(e.target.value)}
                      maxLength={7}
                      placeholder="#RRGGBB"
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 font-mono"
                    />
                    <span
                      className="w-6 h-6 rounded-full flex-shrink-0 border border-stone-200"
                      style={{ backgroundColor: addColor }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={resetAdd}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !addName.trim()}
                  className="px-3 py-1.5 text-xs bg-stone-700 text-white rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setError(""); setDeleteConfirmId(null); }}
              disabled={loading}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-stone-200 rounded-lg text-xs text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          )}
        </div>
      </div>
    </>
  );
}
