import { Settings, User, LogOut, ChevronRight, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { handleLogout, handleUpdateUser } from "../services/Auth";
import { useNavigate } from "@tanstack/react-router";

type UserStatus = "online" | "busy" | "offline";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  hasSubmenu?: boolean;
}

interface SettingsProps {
  currentUser: any;
  onUpdateUser: (user: any) => void;
}

const STATUS_OPTIONS: {
  value: UserStatus;
  label: string;
  dotClass: string;
}[] = [
  { value: "online", label: "Online", dotClass: "bg-emerald-500" },
  { value: "busy", label: "Busy", dotClass: "bg-amber-500" },
  { value: "offline", label: "Offline", dotClass: "bg-zinc-500" },
];

export const SettingsComponent = ({ currentUser, onUpdateUser }: SettingsProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [status, setStatus] = useState<UserStatus>(currentUser?.status || "online");
  const leaveTimer = useRef<number | null>(null);
  const countdown_ms = 70;

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar_url || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus(currentUser?.status || "online");
    setEditName(currentUser?.name || "");
    setEditAvatar(currentUser?.avatar_url || "");
  }, [currentUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = async (newStatus: UserStatus) => {
    setStatus(newStatus);
    try {
      const updatedUser = await handleUpdateUser("", newStatus, "");
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error("Failed to update status", err);
      setStatus(currentUser?.status || "online");
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      const updatedUser = await handleUpdateUser(editName, "", editAvatar);
      onUpdateUser(updatedUser);
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const onLogout = async () => {
      await handleLogout();
      navigate({ to: "/login" });
  };

  return (
    <div className="relative h-13 flex items-center justify-center" ref={menuRef}>
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-md hover:bg-white/10 transition"
      >
        <Settings className="w-5 h-5 text-zinc-400 hover:text-white" />
      </button>

      {/* MAIN MENU */}
      {isOpen && (
        <div className="absolute bottom-10 right-0 w-64 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-visible animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 space-y-1 relative">
            <MenuItem
                icon={<User size={16} />}
                label="Edit profile"
                onClick={() => {
                    setIsOpen(false);
                    setIsEditProfileOpen(true);
                }}
            />

            {/* STATUS ITEM */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (leaveTimer.current !== null) {
                  clearTimeout(leaveTimer.current);
                  leaveTimer.current = null;
                }
                setIsStatusOpen(true);
              }}
              onMouseLeave={() => {
                leaveTimer.current = window.setTimeout(() => {
                  setIsStatusOpen(false);
                }, countdown_ms);
              }}
              >
              <MenuItem
                icon={
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      STATUS_OPTIONS.find((s) => s.value === status)?.dotClass
                    }`}
                  />
                }
                label="Status"
                hasSubmenu
              />

              {/* STATUS SUBMENU */}
              {isStatusOpen && (
                <div className="absolute translate-y-1/2 bottom-1 ml-4 left-full mr-2 w-56 rounded-2xl bg-zinc-900/100 border border-white/10 shadow-2xl p-2 animate-in fade-in slide-in-from-right-2 duration-150">
                  {STATUS_OPTIONS.map((s) => {
                    const isActive = status === s.value;

                    return (
                      <button
                        key={s.value}
                        onClick={() => handleStatusChange(s.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                          ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-zinc-400 hover:bg-white/5"
                          }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${s.dotClass}`}
                        />
                        <span className="flex-1 text-left">{s.label}</span>

                        {isActive && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-px bg-white/5 my-2" />

            <MenuItem icon={<LogOut size={16} />} label="Logout" danger onClick={onLogout} />
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Edit Profile</h3>
                    <button
                        onClick={() => setIsEditProfileOpen(false)}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Username</label>
                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Avatar URL</label>
                        <input
                            value={editAvatar}
                            onChange={(e) => setEditAvatar(e.target.value)}
                            placeholder="https://example.com/avatar.png"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        onClick={() => setIsEditProfileOpen(false)}
                        className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        disabled={isUpdating || !editName.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                    >
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({
  icon,
  label,
  danger,
  onClick,
  hasSubmenu,
}: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-zinc-300 hover:bg-white/10"
        }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>

      {hasSubmenu && <ChevronRight size={14} className="text-zinc-500" />}
    </button>
  );
};
