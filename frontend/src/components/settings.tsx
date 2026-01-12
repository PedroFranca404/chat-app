import { Settings, User, LogOut, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type UserStatus = "online" | "busy" | "offline";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  hasSubmenu?: boolean;
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

export const SettingsComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [status, setStatus] = useState<UserStatus>("online");

  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 rounded-md hover:bg-white/10 transition"
      >
        <Settings className="w-4 h-4 text-zinc-400 hover:text-white" />
      </button>

      {/* MAIN MENU */}
      {isOpen && (
        <div className="absolute bottom-10 right-0 w-64 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-visible animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 space-y-1 relative">
            <MenuItem icon={<User size={16} />} label="Edit profile" />

            {/* STATUS ITEM */}
            <div
              className="relative"
              onMouseEnter={() => setIsStatusOpen(true)}
              onMouseLeave={() => setIsStatusOpen(false)}
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
                <div className="absolutew top-0 left-full mr-2 w-56 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl p-2 animate-in fade-in slide-in-from-right-2 duration-150">
                  {STATUS_OPTIONS.map((s) => {
                    const isActive = status === s.value;

                    return (
                      <button
                        key={s.value}
                        onClick={() => {
                          setStatus(s.value);
                          setIsStatusOpen(false);
                          setIsOpen(false);
                        }}
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

            <MenuItem icon={<LogOut size={16} />} label="Logout" danger />
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
