import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getProfile } from '../api/profile';
import { checkSession } from '../api/session';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, clearAuth, isHydrated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isHydrated) return;
    // Re-hydrate user from persisted tokens on first load.
    void checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!user,
  });

  const showEditProfile = !!user;

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const second = (parts.length > 1 ? parts[parts.length - 1]?.[0] : '') ?? '';
    return `${first}${second}`.toUpperCase();
  }, [user?.name]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold">
            MockPrepAI
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm hover:text-indigo-300">
                  Dashboard
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 text-sm font-semibold flex items-center justify-center"
                    title={user.name || user.email}
                  >
                    {initials}
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-800 bg-slate-950 shadow-lg overflow-hidden"
                    >
                      {showEditProfile && (
                        <Link
                          to="/profile"
                          role="menuitem"
                          className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          Edit profile
                        </Link>
                      )}
                      <Link
                        to="/interview/history"
                        role="menuitem"
                        className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                      >
                        View history
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          clearAuth();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-indigo-300">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm text-indigo-300 hover:text-indigo-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

