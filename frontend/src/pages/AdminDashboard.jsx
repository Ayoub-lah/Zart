// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, 
  FiTrash2, 
  FiEye, 
  FiEyeOff,
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiImage,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiFile,
  FiFolder,
  FiDownload,
  FiEdit2,
  FiStar,
  FiMusic,
  FiVideo,
  FiPackage,
  FiHome,
  FiLayers,
  FiCamera,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import { 
  FaRecordVinyl,
  FaCompactDisc,
  FaPalette,
  FaBrush,
  FaVrCardboard
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [stats, setStats] = useState({
    totalLogos: 0,
    activeLogos: 0,
    totalUsers: 1,
    totalDesigns: 0,
    totalAlbums: 0,
    totalVijing: 0,
    totalTransfers: 0,
    recentActivity: [],
    storageUsed: '0 MB'
  });
  
  const [quickActions, setQuickActions] = useState([
    {
      id: 1,
      title: 'Gérer les Logos',
      description: 'Partenaires, clients et collaborateurs',
      icon: <FiImage className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      route: '/admin/logos',
      count: 0
    },
    {
      id: 2,
      title: 'Designs Graphiques',
      description: 'Posters, banners, brochures, posts',
      icon: <FaPalette className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/designs',
      count: 0
    },
    {
      id: 3,
      title: 'Visual Albums',
      description: 'Pochettes d\'albums et artwork',
      icon: <FaRecordVinyl className="w-6 h-6" />,
      color: 'from-pink-500 to-pink-600',
      route: '/admin/visual-albums',
      count: 0
    },
    {
      id: 4,
      title: 'VJing & Mapping',
      description: 'Projets de projection mapping',
      icon: <FaVrCardboard className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      route: '/admin/vijing',
      count: 0
    },
    {
      id: 5,
      title: 'Transferts de Fichiers',
      description: 'Partage sécurisé avec clients',
      icon: <FiDownload className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      route: '/admin/upload',
      count: 0
    },
    {
      id: 6,
      title: 'Voir le Portfolio',
      description: 'Visiter le site public',
      icon: <FiHome className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      route: '/',
      external: true
    }
  ]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    verifyToken(token);

    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        logout();
      }
    }
  }, [navigate]);

  // Charger les données
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token invalide');
      }
    } catch (error) {
      console.error('Erreur vérification token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // Récupérer les stats
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            ...data.dashboard
          }));
          
          // Mettre à jour les compteurs des actions rapides
          setQuickActions(prev => prev.map(action => {
            switch (action.id) {
              case 1: // Logos
                return { ...action, count: data.dashboard.totalLogos || 0 };
              case 2: // Designs
                return { ...action, count: data.dashboard.totalDesigns || 0 };
              case 3: // Albums
                return { ...action, count: data.dashboard.albumCount || 0 };
              case 4: // Vijing
                return { ...action, count: data.dashboard.totalVijing || 0 };
              case 5: // Transfers
                return { ...action, count: data.dashboard.totalTransfers || 0 };
              default:
                return action;
            }
          }));
        }
      }
      
      // Récupérer l'activité récente
      const activityResponse = await fetch(`${API_BASE_URL}/api/admin/recent-activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setStats(prev => ({
            ...prev,
            recentActivity: activityData.activity
          }));
        }
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const handleQuickAction = (action) => {
    if (action.external) {
      window.open(action.route, '_blank');
    } else {
      navigate(action.route);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <AdminHeader user={user} onLogout={logout} />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bonjour, {user?.username} 👋
              </h1>
              <p className="text-gray-400">
                Bienvenue sur votre tableau de bord de gestion de portfolio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-xs font-medium">
                Admin
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Logos</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalLogos)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {formatNumber(stats.activeLogos)} actifs
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-900/20">
                <FiImage className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Designs</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalDesigns)}
                </h3>
                <p className="text-gray-400 text-sm">Créations graphiques</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-900/20">
                <FaPalette className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Albums</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalAlbums)}
                </h3>
                <p className="text-gray-400 text-sm">Visual artwork</p>
              </div>
              <div className="p-3 rounded-xl bg-pink-900/20">
                <FaRecordVinyl className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">VJing</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalVijing)}
                </h3>
                <p className="text-gray-400 text-sm">Projets mapping</p>
              </div>
              <div className="p-3 rounded-xl bg-green-900/20">
                <FaVrCardboard className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Actions Rapides
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`bg-gradient-to-br ${action.color} p-5 rounded-xl text-left hover:opacity-90 transition-all hover:scale-[1.02] transform`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-xl bg-white/10">
                        {action.icon}
                      </div>
                      {action.count !== undefined && (
                        <div className="px-2 py-1 bg-black/20 rounded-full text-xs">
                          {formatNumber(action.count)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {action.description}
                    </p>
                    
                    <div className="mt-4 flex items-center text-white/60 text-sm">
                      <span>Cliquer pour accéder</span>
                      <FiArrowUp className="ml-2 transform rotate-45" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4">
                  Statistiques détaillées
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/20 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Transferts</p>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(stats.totalTransfers)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/20 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Utilisateurs</p>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(stats.totalUsers)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/20 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Stockage</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.storageUsed}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/20 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Activité</p>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(stats.recentActivity?.length || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & System Status */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Activité Récente
              </h3>
              
              <div className="space-y-4">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-800/20 rounded-lg transition-colors">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-400 text-xs">
                            Par {activity.user}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Aucune activité récente</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => navigate('/admin/activity')}
                className="w-full mt-4 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                Voir toute l'activité
              </button>
            </div>

            {/* System Status */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                État du Système
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm">API Backend</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">Online</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Base de données</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">OK</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Stockage fichiers</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">OK</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Connexion API</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">Stable</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Version du système
                  </p>
                  <p className="text-white font-mono text-sm">
                    v2.0.0
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Astuces Rapides
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-blue-400">•</span>
                  <span>Utilisez le bouton Actualiser pour mettre à jour les données</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-green-400">•</span>
                  <span>Cliquez sur les cartes pour accéder aux sections</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-purple-400">•</span>
                  <span>Consultez l'activité récente pour suivre les actions</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-yellow-400">•</span>
                  <span>Votre session expire automatiquement après 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Charts (Placeholder) */}
        <div className="mt-8 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Aperçu des Performances
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="text-green-400" />
                <span className="text-sm font-medium">Trafic</span>
              </div>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">+24%</p>
                  <p className="text-gray-400 text-sm">ce mois</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiActivity className="text-blue-400" />
                <span className="text-sm font-medium">Engagement</span>
              </div>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">85%</p>
                  <p className="text-gray-400 text-sm">taux de rétention</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiDownload className="text-purple-400" />
                <span className="text-sm font-medium">Transferts</span>
              </div>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">142</p>
                  <p className="text-gray-400 text-sm">fichiers partagés</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Système de gestion de portfolio • Version 2.0.0 • 
            Connecté en tant que <span className="text-blue-400">{user?.username}</span>
          </p>
          <p className="mt-1 text-xs">
            Dernière actualisation : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function pour les icônes d'activité
const getActivityIcon = (type) => {
  switch (type) {
    case 'logo_upload':
      return <FiImage className="w-4 h-4 text-blue-400" />;
    case 'design_upload':
      return <FaPalette className="w-4 h-4 text-purple-400" />;
    case 'album_upload':
      return <FaRecordVinyl className="w-4 h-4 text-pink-400" />;
    case 'vijing_upload':
      return <FaVrCardboard className="w-4 h-4 text-green-400" />;
    case 'file_upload':
      return <FiUpload className="w-4 h-4 text-orange-400" />;
    case 'user_login':
      return <FiUsers className="w-4 h-4 text-yellow-400" />;
    case 'content_update':
      return <FiEdit2 className="w-4 h-4 text-indigo-400" />;
    case 'content_delete':
      return <FiTrash2 className="w-4 h-4 text-red-400" />;
    default:
      return <FiActivity className="w-4 h-4 text-gray-400" />;
  }
};

export default AdminDashboard;