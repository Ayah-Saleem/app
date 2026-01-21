import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Settings, History, MessageSquare, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Jusoor</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/translate" className="hover:text-primary transition-colors" data-testid="nav-translate">
                  Translate
                </Link>
                <Link to="/live" className="hover:text-primary transition-colors" data-testid="nav-live">
                  Live Translation
                </Link>
                <Link to="/history" className="hover:text-primary transition-colors" data-testid="nav-history">
                  History
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-primary transition-colors" data-testid="nav-admin">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 hover:text-primary transition-colors" data-testid="user-menu-button">
                    <User className="w-5 h-5" />
                    <span>{user?.full_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg" data-testid="nav-settings">
                      <Settings className="w-4 h-4 inline mr-2" /> Settings
                    </Link>
                    <Link to="/feedback" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-testid="nav-feedback">
                      <MessageSquare className="w-4 h-4 inline mr-2" /> Feedback
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg text-red-600" data-testid="logout-button">
                      <LogOut className="w-4 h-4 inline mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors" data-testid="nav-login">Login</Link>
                <Link to="/register" className="btn-primary" data-testid="nav-register">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden" data-testid="mobile-menu-button">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4" data-testid="mobile-menu">
            {isAuthenticated ? (
              <>
                <Link to="/translate" className="block py-2 hover:text-primary transition-colors">Translate</Link>
                <Link to="/live" className="block py-2 hover:text-primary transition-colors">Live Translation</Link>
                <Link to="/history" className="block py-2 hover:text-primary transition-colors">History</Link>
                <Link to="/settings" className="block py-2 hover:text-primary transition-colors">Settings</Link>
                <Link to="/feedback" className="block py-2 hover:text-primary transition-colors">Feedback</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block py-2 hover:text-primary transition-colors">Admin</Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2">Login</Link>
                <Link to="/register" className="block py-2 text-primary">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;