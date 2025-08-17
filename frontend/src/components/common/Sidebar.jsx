import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Home, 
  Search, 
  Calendar, 
  Bell, 
  User, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', authUser?._id],
    queryFn: async () => {
      try {
        const res = await fetch('/api/notifications', {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        return [];
      }
    },
    enabled: !!authUser?._id,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const isLoggingOut = logoutMutation.isPending;

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'Search', icon: <Search size={20} />, path: '/search' },
    { name: 'Vacations', icon: <Calendar size={20} />, path: '/vacations' },
    { 
      name: 'Notifications', 
      icon: <Bell size={20} />, 
      path: '/notifications',
      badge: notifications.length > 0 ? notifications.length : null
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: `/profile/${authUser?.username || ''}`,
    },
  ];

  return (
    <>
    {/* Mobile Toggle Button */}
    <button
      className="fixed top-4 right-4 z-50 rounded-xl bg-white/80 p-2 shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 md:hidden"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <X size={28} /> : <Menu size={28} />}
    </button>
  
    {/* Sidebar */}
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-72 transform border-r border-white/20 bg-white/70 backdrop-blur-md shadow-xl transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex h-screen flex-col justify-between p-6">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            GoJourneys
          </div>
        </Link>
  
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-4 rounded-xl px-5 py-3 font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md scale-[1.02]"
                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <div className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <span>{item.name}</span>
                
                {/* Notification Badge */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
  
        {/* Profile Card */}
        {authUser?.username && (
          <div className="mt-10 rounded-2xl border border-white/30 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <Link
              to={`/profile/${authUser.username}`}
              onClick={() => setIsOpen(false)}
            >
              <img
                src={authUser.profileImg || "/avatar-placeholder.png"}
                alt="Profile"
                className="mx-auto mb-3 h-20 w-20 rounded-full object-cover shadow"
              />
              <div className="text-lg font-semibold text-gray-900">
                {authUser.fullName || "Anonymous"}
              </div>
              <div className="mb-4 text-sm text-gray-600">
                @{authUser.username}
              </div>
            </Link>
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-2 font-semibold text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-60"
              onClick={(e) => {
                e.preventDefault();
                logoutMutation.mutate();
                setIsOpen(false);
              }}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                "Logging out..."
              ) : (
                <>
                  <LogOut size={16} /> Log out
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  </>
  
  );
};

export default Sidebar;
