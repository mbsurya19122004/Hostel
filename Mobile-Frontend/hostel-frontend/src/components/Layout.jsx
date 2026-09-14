import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Wallet, MessageSquareWarning, UtensilsCrossed, User, Menu, X,
  BedDouble, Bus, ShieldCheck, Megaphone, Users, Package, DoorOpen, Search, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = {
  admin: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/students", label: "Students", icon: Users },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
    { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/fees", label: "Fees", icon: Wallet },
    { to: "/mess", label: "Mess menu", icon: UtensilsCrossed },
    { to: "/bus", label: "Bus schedule", icon: Bus },
    { to: "/kyc", label: "KYC review", icon: ShieldCheck },
    { to: "/announcements", label: "Announcements", icon: Megaphone },
    { to: "/workers", label: "Workers", icon: Package },
    { to: "/leave", label: "Students on leave", icon: DoorOpen },
    { to: "/profile", label: "Profile", icon: User },
  ],
  student: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/fees", label: "My fees", icon: Wallet },
    { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/mess", label: "Mess menu", icon: UtensilsCrossed },
    { to: "/bus", label: "Bus schedule", icon: Bus },
    { to: "/kyc", label: "KYC", icon: ShieldCheck },
    { to: "/announcements", label: "Announcements", icon: Megaphone },
    { to: "/lunchbox", label: "Lunchbox", icon: Package },
    { to: "/leave", label: "Outings", icon: DoorOpen },
    { to: "/students", label: "Find a student", icon: Search },
    { to: "/profile", label: "Profile", icon: User },
  ],
  worker: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/lunchbox", label: "Lunchbox desk", icon: Package },
    { to: "/profile", label: "Profile", icon: User },
  ],
};

const QUICK = {
  admin: ["/", "/students", "/complaints", "/fees"],
  student: ["/", "/fees", "/complaints", "/mess"],
  worker: ["/", "/lunchbox", "/profile"],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const role = user?.role || "student";
  const items = NAV[role] || NAV.student;
  const quickPaths = QUICK[role] || QUICK.student;
  const quickItems = quickPaths.map((p) => items.find((i) => i.to === p)).filter(Boolean);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-30 bg-navy text-white">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-mustard flex items-center justify-center font-display font-bold text-navydeep text-sm">H</div>
            <div>
              <p className="font-display font-semibold text-sm leading-tight">Hostelly</p>
              <p className="text-[11px] text-white/60 leading-tight capitalize">{role} pass</p>
            </div>
          </div>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 -mr-2 text-white/90">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="w-72 bg-white h-full p-4 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-semibold text-ink">Menu</p>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1.5 text-inkmute"><X size={20} /></button>
            </div>
            {user && (
              <div className="mb-3 px-3 py-2.5 rounded-card bg-paper border border-line">
                <p className="text-sm font-medium text-ink truncate">{user.username}</p>
                <p className="text-xs text-inkmute truncate">{user.email}</p>
              </div>
            )}
            <div className="flex-1 flex flex-col gap-1">
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-navy text-white" : "text-ink hover:bg-paper"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
            <button onClick={handleLogout} className="mt-3 flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-brick hover:bg-brick/10">
              <LogOut size={18} /> Log out
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 pt-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line">
        <div className="mx-auto max-w-3xl grid" style={{ gridTemplateColumns: `repeat(${quickItems.length + 1}, minmax(0,1fr))` }}>
          {quickItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive ? "text-navy" : "text-inkmute"}`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-inkmute">
            <Menu size={20} />
            More
          </button>
        </div>
      </nav>
    </div>
  );
}
