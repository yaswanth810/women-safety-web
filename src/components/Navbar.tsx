import { useState } from 'react';
import { Menu, X, Shield, LogOut, Home, AlertCircle, FileText, Users, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
    setIsOpen(false);
  };

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'SOS Alert', icon: AlertCircle, href: '/sos' },
    { label: 'Report Incident', icon: FileText, href: '/report' },
    { label: 'Community', icon: Users, href: '/forum' },
    { label: 'Legal Resources', icon: BookOpen, href: '/resources' },
  ];

  const adminItems = [
    { label: 'Dashboard', icon: Settings, href: '/admin' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Shield size={28} />
            SafetyHub
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </a>
            ))}
            {user?.role === 'admin' && (
              adminItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </a>
              ))
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <a href="/profile" className="text-sm font-medium hover:text-blue-200">
                  {user.email}
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-700 hover:bg-blue-900 rounded-md transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Login
              </a>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors block w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </a>
            ))}
            {user?.role === 'admin' && (
              adminItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors block w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </a>
              ))
            )}
            {user ? (
              <>
                <a
                  href="/profile"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {user.email}
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors w-full text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="block px-3 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
