import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUpload, 
  FiImage, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
    FiUser,  // Ajouter cette icône
  FiMenu,
  FiX,
  FiFile,
  FiFolder,
  FiVideo
} from 'react-icons/fi';

const AdminHeader = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: <FiHome className="w-5 h-5" />, 
      path: '/admin/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Upload Fichiers', 
      icon: <FiFile className="w-5 h-5" />, 
      path: '/admin/upload',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Gérer Logos', 
      icon: <FiImage className="w-5 h-5" />, 
      path: '/admin/logos',
      color: 'from-green-500 to-green-600'
    },
    { 
  name: 'Designs Graphiques', 
  icon: <FiImage className="w-5 h-5" />, 
  path: '/admin/designs',
  color: 'from-pink-500 to-pink-600'
},
  { 
    name: 'VJing & Mapping', 
    icon: <FiVideo className="w-5 h-5" />, 
    path: '/admin/vijing',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'visual-albums', 
    icon: <FiVideo className="w-5 h-5" />, 
    path: '/admin/visual-albums',
    color: 'from-purple-500 to-purple-600'
  },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

   return (
    <>
      {/* Desktop Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et navigation principale */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                  <p className="text-gray-400 text-xs">Portfolio Management</p>
                </div>
              </div>

              {/* Navigation Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      window.location.pathname === item.path
                        ? `bg-gradient-to-r ${item.color} text-white`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* User info and mobile menu button */}
            <div className="flex items-center gap-4">
              {/* User info avec dropdown */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-3 hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-all">
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{user?.username}</p>
                    <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => navigate('/admin/profile')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg text-white"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 rounded-lg text-red-400"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-all"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6 text-white" />
                ) : (
                  <FiMenu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="absolute top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-gray-900 border-l border-gray-800 overflow-y-auto">
            {/* User info mobile */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-bold">{user?.username}</p>
                  <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Mobile menu items */}
            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    window.location.pathname === item.path
                      ? `bg-gradient-to-r ${item.color} text-white`
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Logout mobile */}
            <div className="p-4 mt-4 border-t border-gray-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>

            {/* Back to site */}
            <div className="p-4">
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm"
              >
                ← Retour au site
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;