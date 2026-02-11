import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, 
  FiTrash2, 
  FiEdit2, 
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
  FiExternalLink,
  FiCopy,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';
import API_BASE_URL from '../config/api';


const AdminLogos = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [newLogo, setNewLogo] = useState({
    name: '',
    category: 'partner',
    url: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

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

  // Charger les logos
  useEffect(() => {
    if (isAuthenticated) {
      fetchLogos();
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
    }
  };

  const fetchLogos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/logos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setLogos(data.logos);
      } else {
        toast.error(data.error || 'Erreur de chargement');
      }
    } catch (error) {
      console.error('Erreur fetch logos:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 5MB)');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté. Formats: JPEG, PNG, SVG, WebP');
        return;
      }

      setLogoFile(file);
      if (!newLogo.name) {
        setNewLogo(prev => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  const handleUpload = async () => {
    if (!logoFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('name', newLogo.name);
      formData.append('category', newLogo.category);
      if (newLogo.url) {
        formData.append('url', newLogo.url);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/logos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Logo uploadé avec succès');
        setLogos(prev => [data.logo, ...prev]);
        resetUploadForm();
        setShowUploadModal(false);
      } else {
        toast.error(data.error || 'Erreur d\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateLogo = async () => {
    if (!editingLogo) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/logos/${editingLogo._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingLogo.name,
          category: editingLogo.category,
          url: editingLogo.url,
          isActive: editingLogo.isActive
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Logo mis à jour');
        setLogos(prev => prev.map(logo => 
          logo._id === editingLogo._id ? { ...logo, ...editingLogo } : logo
        ));
        setShowEditModal(false);
        setEditingLogo(null);
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  const toggleLogoStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/logos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        setLogos(prev => prev.map(logo => 
          logo._id === id ? { ...logo, isActive: !currentStatus } : logo
        ));
        toast.success(`Logo ${!currentStatus ? 'activé' : 'désactivé'}`);
      }
    } catch (error) {
      console.error('Erreur toggle status:', error);
    }
  };

  const deleteLogo = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce logo ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/logos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setLogos(prev => prev.filter(logo => logo._id !== id));
        toast.success('Logo supprimé');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de suppression');
    }
  };

  const deleteSelectedLogos = async () => {
    if (bulkSelection.length === 0) {
      toast.error('Aucun logo sélectionné');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${bulkSelection.length} logo(s) ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const promises = bulkSelection.map(id =>
        fetch(`${API_BASE_URL}/api/admin/logos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      await Promise.all(promises);
      setLogos(prev => prev.filter(logo => !bulkSelection.includes(logo._id)));
      setBulkSelection([]);
      toast.success(`${bulkSelection.length} logo(s) supprimé(s)`);
    } catch (error) {
      console.error('Erreur suppression multiple:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateLogoOrder = async (id, direction) => {
    const logoIndex = logos.findIndex(logo => logo._id === id);
    if (logoIndex === -1) return;

    const newOrder = [...logos];
    if (direction === 'up' && logoIndex > 0) {
      [newOrder[logoIndex], newOrder[logoIndex - 1]] = [newOrder[logoIndex - 1], newOrder[logoIndex]];
    } else if (direction === 'down' && logoIndex < newOrder.length - 1) {
      [newOrder[logoIndex], newOrder[logoIndex + 1]] = [newOrder[logoIndex + 1], newOrder[logoIndex]];
    }

    setLogos(newOrder);

    try {
      const token = localStorage.getItem('admin_token');
      const orderUpdate = newOrder.map((logo, index) => ({
        id: logo._id,
        order: index
      }));

      await fetch(`${API_BASE_URL}/api/admin/logos/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order: orderUpdate })
      });
    } catch (error) {
      console.error('Erreur réorganisation:', error);
    }
  };

  const resetUploadForm = () => {
    setNewLogo({
      name: '',
      category: 'partner',
      url: ''
    });
    setLogoFile(null);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  // Filtrer et trier les logos
  const filteredLogos = logos.filter(logo => {
    const matchesSearch = searchTerm === '' || 
      logo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      logo.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
      logo.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && logo.isActive) ||
      (filterStatus === 'inactive' && !logo.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Trier les logos
  const sortedLogos = [...filteredLogos].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      comparison = new Date(b.uploadedAt) - new Date(a.uploadedAt);
    } else if (sortBy === 'size') {
      comparison = b.size - a.size;
    } else {
      comparison = a.order - b.order;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLogos.length / itemsPerPage);
  const paginatedLogos = sortedLogos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle bulk selection
  const toggleBulkSelection = (id) => {
    setBulkSelection(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    const pageIds = paginatedLogos.map(logo => logo._id);
    setBulkSelection(prev => {
      const allSelected = pageIds.every(id => prev.includes(id));
      return allSelected 
        ? prev.filter(id => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])];
    });
  };

  // Copy URL to clipboard
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papier');
  };

  if (!isAuthenticated) {
    return null;
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestion des Logos</h1>
              <p className="text-gray-400">
                Gérez tous les logos de votre portfolio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm"
              >
                <FiChevronLeft className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 text-sm"
              >
                <FiUpload className="w-4 h-4" />
                Nouveau logo
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelection.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">{bulkSelection.length}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{bulkSelection.length} logo(s) sélectionné(s)</p>
                  <p className="text-gray-400 text-sm">Actions en masse</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Activer tous les logos sélectionnés
                    const promises = bulkSelection.map(id => {
                      const logo = logos.find(l => l._id === id);
                      if (logo && !logo.isActive) {
                        return toggleLogoStatus(id, logo.isActive);
                      }
                      return Promise.resolve();
                    });
                    Promise.all(promises);
                  }}
                  className="px-3 py-1.5 bg-green-900/20 border border-green-800/30 rounded-lg text-green-400 hover:bg-green-900/30 transition-all text-sm"
                >
                  <FiEye className="inline w-3 h-3 mr-1" />
                  Activer
                </button>
                <button
                  onClick={() => {
                    // Désactiver tous les logos sélectionnés
                    const promises = bulkSelection.map(id => {
                      const logo = logos.find(l => l._id === id);
                      if (logo && logo.isActive) {
                        return toggleLogoStatus(id, logo.isActive);
                      }
                      return Promise.resolve();
                    });
                    Promise.all(promises);
                  }}
                  className="px-3 py-1.5 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-400 hover:bg-yellow-900/30 transition-all text-sm"
                >
                  <FiEyeOff className="inline w-3 h-3 mr-1" />
                  Désactiver
                </button>
                <button
                  onClick={deleteSelectedLogos}
                  className="px-3 py-1.5 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400 hover:bg-red-900/30 transition-all text-sm"
                >
                  <FiTrash2 className="inline w-3 h-3 mr-1" />
                  Supprimer
                </button>
                <button
                  onClick={() => setBulkSelection([])}
                  className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 transition-all text-sm"
                >
                  <FiX className="inline w-3 h-3 mr-1" />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="mb-6 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un logo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="partner">Partenaires</option>
              <option value="client">Clients</option>
              <option value="collaborator">Collaborateurs</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="inactive">Inactifs seulement</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="order">Trier par ordre</option>
                <option value="name">Trier par nom</option>
                <option value="date">Trier par date</option>
                <option value="size">Trier par taille</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all"
                title={sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Affichage:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800/50 hover:bg-gray-800'}`}
                  title="Vue grille"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800/50 hover:bg-gray-800'}`}
                  title="Vue liste"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="12">12 par page</option>
                <option value="24">24 par page</option>
                <option value="48">48 par page</option>
                <option value="96">96 par page</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogos}
                className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
              >
                <FiRefreshCw className="w-3 h-3" />
                Actualiser
              </button>
              <div className="text-sm text-gray-400">
                {filteredLogos.length} logo(s) trouvé(s)
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Chargement des logos...</p>
          </div>
        ) : filteredLogos.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <FiImage className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun logo trouvé
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Aucun logo ne correspond à votre recherche. Essayez d\'autres termes.' : 'Commencez par ajouter votre premier logo.'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <FiUpload className="inline w-4 h-4 mr-2" />
              Ajouter un logo
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedLogos.map((logo) => (
                <div
                  key={logo._id}
                  className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group"
                >
                  <div className="relative">
                    {/* Bulk selection checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={bulkSelection.includes(logo._id)}
                        onChange={() => toggleBulkSelection(logo._id)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                    </div>

                    {/* Logo image */}
                    <div className="h-48 bg-gray-900 flex items-center justify-center p-6">
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%232d3748"/><text x="100" y="50" font-family="Arial" font-size="14" fill="%2372829c" text-anchor="middle" dominant-baseline="middle">${logo.name}</text></svg>`;
                        }}
                      />
                    </div>

                    {/* Status badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                      logo.isActive 
                        ? 'bg-green-900/80 text-green-300' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {logo.isActive ? 'Actif' : 'Inactif'}
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingLogo(logo);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-full bg-blue-900/80 hover:bg-blue-800"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleLogoStatus(logo._id, logo.isActive)}
                        className={`p-2 rounded-full ${logo.isActive ? 'bg-yellow-900/80 hover:bg-yellow-800' : 'bg-green-900/80 hover:bg-green-800'}`}
                        title={logo.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {logo.isActive ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteLogo(logo._id)}
                        className="p-2 rounded-full bg-red-900/80 hover:bg-red-800"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Order controls */}
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      <button
                        onClick={() => updateLogoOrder(logo._id, 'up')}
                        className="p-1.5 rounded bg-gray-900/80 hover:bg-gray-800"
                        title="Monter"
                      >
                        <FiArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateLogoOrder(logo._id, 'down')}
                        className="p-1.5 rounded bg-gray-900/80 hover:bg-gray-800"
                        title="Descendre"
                      >
                        <FiArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Logo info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate" title={logo.name}>
                          {logo.name}
                        </h3>
                        <p className="text-gray-500 text-xs truncate" title={logo.originalName}>
                          {logo.originalName}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs capitalize ml-2 flex-shrink-0">
                        {logo.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-400">
                        {new Date(logo.uploadedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {logo.url && (
                          <a
                            href={logo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                            title="Visiter le site"
                          >
                            <FiExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => copyUrl(logo.url)}
                          className="text-gray-400 hover:text-white"
                          title="Copier l'URL"
                        >
                          <FiCopy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  Page {currentPage} sur {totalPages} • {filteredLogos.length} logo(s)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // List View
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedLogos.length > 0 && paginatedLogos.every(logo => bulkSelection.includes(logo._id))}
                      onChange={selectAllOnPage}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                  </th>
                  <th className="p-4 text-gray-400 font-medium text-left">Logo</th>
                  <th className="p-4 text-gray-400 font-medium text-left">Nom</th>
                  <th className="p-4 text-gray-400 font-medium text-left">Catégorie</th>
                  <th className="p-4 text-gray-400 font-medium text-left">Statut</th>
                  <th className="p-4 text-gray-400 font-medium text-left">Date</th>
                  <th className="p-4 text-gray-400 font-medium text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogos.map((logo) => (
                  <tr key={logo._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={bulkSelection.includes(logo._id)}
                        onChange={() => toggleBulkSelection(logo._id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                    </td>
                    <td className="p-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                        <img
                          src={logo.url}
                          alt={logo.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white">{logo.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{logo.originalName}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-800 rounded-full text-xs capitalize">
                        {logo.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleLogoStatus(logo._id, logo.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          logo.isActive
                            ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {logo.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(logo.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingLogo(logo);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-900/30 text-blue-400 rounded"
                          title="Modifier"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateLogoOrder(logo._id, 'up')}
                          className="p-1.5 hover:bg-gray-800 rounded"
                          title="Monter"
                        >
                          <FiArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateLogoOrder(logo._id, 'down')}
                          className="p-1.5 hover:bg-gray-800 rounded"
                          title="Descendre"
                        >
                          <FiArrowDown className="w-4 h-4" />
                        </button>
                        {logo.url && (
                          <a
                            href={logo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-800 text-green-400 rounded"
                            title="Visiter le site"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => copyUrl(logo.url)}
                          className="p-1.5 hover:bg-gray-800 text-gray-400 rounded"
                          title="Copier l'URL"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLogo(logo._id)}
                          className="p-1.5 hover:bg-red-900/30 text-red-400 rounded"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Ajouter un logo</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-xl"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Fichier logo *
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                        {logoFile ? (
                          <FiCheck className="w-8 h-8 text-green-400" />
                        ) : (
                          <FiUpload className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <p className="text-gray-400 mb-2">
                        {logoFile ? logoFile.name : 'Cliquez pour sélectionner un fichier'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Formats: JPEG, PNG, SVG, WebP (max 5MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nom du logo *
                  </label>
                  <input
                    type="text"
                    value={newLogo.name}
                    onChange={(e) => setNewLogo({...newLogo, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Google, Microsoft, etc."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newLogo.category}
                    onChange={(e) => setNewLogo({...newLogo, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="partner">Partenaire</option>
                    <option value="client">Client</option>
                    <option value="collaborator">Collaborateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    URL du site (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newLogo.url}
                    onChange={(e) => setNewLogo({...newLogo, url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!logoFile || uploading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Upload...
                      </>
                    ) : (
                      'Uploader'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingLogo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Modifier le logo</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLogo(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-xl"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nom du logo *
                  </label>
                  <input
                    type="text"
                    value={editingLogo.name}
                    onChange={(e) => setEditingLogo({...editingLogo, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Catégorie
                  </label>
                  <select
                    value={editingLogo.category}
                    onChange={(e) => setEditingLogo({...editingLogo, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="partner">Partenaire</option>
                    <option value="client">Client</option>
                    <option value="collaborator">Collaborateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    URL du site (optionnel)
                  </label>
                  <input
                    type="url"
                    value={editingLogo.url || ''}
                    onChange={(e) => setEditingLogo({...editingLogo, url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingLogo.isActive}
                    onChange={(e) => setEditingLogo({...editingLogo, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-gray-300 text-sm">
                    Logo actif (visible sur le site)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateLogo}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingLogo(null);
                    }}
                    className="px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogos;