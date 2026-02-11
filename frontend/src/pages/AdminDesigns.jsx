// frontend/src/pages/AdminDesigns.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiImage, 
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
  FiFolder,
  FiType,
  FiLink,
  FiFileText,
  FiCamera,
  FiTag,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';
import { 
  FaRegImage, 
  FaFlag, 
  FaBookOpen, 
  FaInstagram, 
  FaRegGem, 
  FaRegFolderOpen 
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';

const AdminDesigns = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState({
    posters: [],
    banners: [],
    brochures: [],
    posts: [],
    logos: [],
    brands: []
  });
  
  const [activeCategory, setActiveCategory] = useState('posters');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newDesign, setNewDesign] = useState({
    category: 'posters',
    title: '',
    description: '',
    link: ''
  });
  
  const [designFiles, setDesignFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Catégories avec icônes
  const categories = [
    { key: 'posters', name: 'Posters', icon: <FaRegImage className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
    { key: 'banners', name: 'Banners', icon: <FaFlag className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
    { key: 'brochures', name: 'Brochure & Flyers', icon: <FaBookOpen className="w-5 h-5" />, color: 'from-green-500 to-green-600' },
    { key: 'posts', name: 'Post Designs', icon: <FaInstagram className="w-5 h-5" />, color: 'from-pink-500 to-pink-600' },
    { key: 'logos', name: 'Logo Designs', icon: <FaRegGem className="w-5 h-5" />, color: 'from-yellow-500 to-yellow-600' },
    { key: 'brands', name: 'Brand Guidelines', icon: <FaRegFolderOpen className="w-5 h-5" />, color: 'from-red-500 to-red-600' }
  ];

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

  // Charger les designs
  useEffect(() => {
    if (isAuthenticated) {
      fetchDesigns();
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

  const fetchDesigns = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/designs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    console.log('📦 Données reçues:', data); // Ajoutez ce log
    
    if (data.success) {
      // Vérifier si les designs sont dans data.designs
      if (data.designs) {
        setDesigns(data.designs);
      } else {
        // Si la structure est différente
        setDesigns({
          posters: data.posters || [],
          banners: data.banners || [],
          brochures: data.brochures || [],
          posts: data.posts || [],
          logos: data.logos || [],
          brands: data.brands || []
        });
      }
    } else {
      // Structure par défaut en cas d'erreur
      setDesigns({
        posters: [],
        banners: [],
        brochures: [],
        posts: [],
        logos: [],
        brands: []
      });
    }
  } catch (error) {
    console.error('Erreur chargement designs:', error);
    toast.error('Erreur de chargement des designs');
  } finally {
    setLoading(false);
  }
};

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Valider les fichiers
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} dépasse 10MB`);
        return false;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format non supporté pour ${file.name}`);
        return false;
      }

      return true;
    });

    setDesignFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setDesignFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
  if (designFiles.length === 0) {
    toast.error('Veuillez sélectionner des images');
    return;
  }

  setUploading(true);

  try {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    
    designFiles.forEach(file => {
      formData.append('images', file);
    });
    
    formData.append('category', newDesign.category);
    formData.append('title', newDesign.title);
    formData.append('description', newDesign.description);
    if (newDesign.link) {
      formData.append('link', newDesign.link);
    }

    console.log('📤 Upload en cours...', newDesign.category);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/designs/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('📦 Réponse upload:', data);

    if (data.success) {
      toast.success(data.message || 'Designs uploadés avec succès');
      
      // Recharger les designs depuis le serveur
      fetchDesigns();
      
      // OU: Mettre à jour manuellement l'état
      if (data.designs && data.category) {
        setDesigns(prev => ({
          ...prev,
          [data.category]: [...(prev[data.category] || []), ...data.designs]
        }));
      }
      
      // Réinitialiser le formulaire
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

const testAPI = async () => {
  try {
    const token = localStorage.getItem('admin_token');
    console.log('🔍 Test API avec token:', token ? '✓' : '✗');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/designs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📡 Statut réponse:', response.status);
    const data = await response.json();
    console.log('📦 Données API:', data);
    
    // Test public endpoint
    const publicResponse = await fetch(`${API_BASE_URL}/api/admin/public/designs`);
    const publicData = await publicResponse.json();
    console.log('🌐 Données publiques:', publicData);
    
  } catch (error) {
    console.error('❌ Erreur test API:', error);
  }
};

// Appeler dans useEffect
useEffect(() => {
  if (isAuthenticated) {
    fetchDesigns();
    testAPI(); // Ajoutez cette ligne pour déboguer
  }
}, [isAuthenticated]);

  const handleUpdate = async () => {
    if (!editingDesign) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/designs/${editingDesign.category}/${editingDesign.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editingDesign.title,
            description: editingDesign.description,
            link: editingDesign.link
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Design mis à jour');
        
        // Mettre à jour l'affichage
        setDesigns(prev => ({
          ...prev,
          [editingDesign.category]: prev[editingDesign.category].map(design =>
            design.id === editingDesign.id ? data.design : design
          )
        }));
        
        setEditMode(false);
        setEditingDesign(null);
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDelete = async (category, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/designs/${category}/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Design supprimé');
        
        // Mettre à jour l'affichage
        setDesigns(prev => ({
          ...prev,
          [category]: prev[category].filter(design => design.id !== id)
        }));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de suppression');
    }
  };

  const updateDesignOrder = async (category, id, direction) => {
    const designsInCategory = [...designs[category]];
    const designIndex = designsInCategory.findIndex(design => design.id === id);
    
    if (designIndex === -1) return;

    let newOrder;
    if (direction === 'up' && designIndex > 0) {
      [designsInCategory[designIndex], designsInCategory[designIndex - 1]] = 
      [designsInCategory[designIndex - 1], designsInCategory[designIndex]];
    } else if (direction === 'down' && designIndex < designsInCategory.length - 1) {
      [designsInCategory[designIndex], designsInCategory[designIndex + 1]] = 
      [designsInCategory[designIndex + 1], designsInCategory[designIndex]];
    } else {
      return;
    }

    // Mettre à jour les ordres
    designsInCategory.forEach((design, index) => {
      design.order = index;
    });

    setDesigns(prev => ({
      ...prev,
      [category]: designsInCategory
    }));

    // Envoyer la mise à jour au serveur
    try {
      const token = localStorage.getItem('admin_token');
      const orderUpdate = designsInCategory.map((design, index) => ({
        id: design.id,
        order: index
      }));

      await fetch(`${API_BASE_URL}/api/admin/designs/reorder/${category}`, {
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
    setNewDesign({
      category: 'posters',
      title: '',
      description: '',
      link: ''
    });
    setDesignFiles([]);
    setEditMode(false);
    setEditingDesign(null);
  };

  const startEdit = (design) => {
    setEditMode(true);
    setEditingDesign({ ...design });
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const filteredDesigns = designs[activeCategory]?.filter(design => {
    return searchTerm === '' || 
      design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Designs Graphiques
              </h1>
              <p className="text-gray-400">
                Gérez vos créations graphiques pour le portfolio
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <FiUpload className="w-5 h-5" />
              <span>Ajouter des designs</span>
            </button>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                  activeCategory === category.key
                    ? `bg-gradient-to-r ${category.color} text-white`
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
                <span className="px-2 py-0.5 text-xs bg-gray-900/50 rounded-full">
                  {designs[category.key]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un design..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-800/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <FiGrid className="w-5 h-5" />
                <span className="hidden sm:inline">Grille</span>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-purple-900/30 text-purple-400 border border-purple-800/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <FiList className="w-5 h-5" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              
              <button
                onClick={fetchDesigns}
                className="px-4 py-3 bg-gray-800/50 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title="Actualiser"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Designs Content */}
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {/* Category Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {categories.find(c => c.key === activeCategory)?.icon}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {categories.find(c => c.key === activeCategory)?.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Designs Grid/List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Chargement des designs...</p>
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Aucun design trouvé
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre premier design'}
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                >
                  Ajouter des designs
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDesigns.map((design, index) => (
                  <div
                    key={design.id}
                    className="bg-gray-800/20 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={design.image}
                        alt={design.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(design)}
                          className="p-2 rounded-full bg-blue-900/80 hover:bg-blue-800"
                          title="Modifier"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(activeCategory, design.id)}
                          className="p-2 rounded-full bg-red-900/80 hover:bg-red-800"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-white truncate">
                        {design.title}
                      </h3>
                      
                      {design.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {design.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateDesignOrder(activeCategory, design.id, 'up')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-all"
                            title="Monter"
                          >
                            <FiArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => updateDesignOrder(activeCategory, design.id, 'down')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-all"
                            title="Descendre"
                          >
                            <FiArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          {new Date(design.uploadedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="flex items-center gap-4 p-4 bg-gray-800/20 border border-gray-700 rounded-xl hover:bg-gray-800/30 transition-all group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={design.image}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {design.title}
                      </h3>
                      {design.description && (
                        <p className="text-gray-400 text-sm mt-1 truncate">
                          {design.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{formatFileSize(design.size)}</span>
                        <span>•</span>
                        <span>{new Date(design.uploadedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(design)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeCategory, design.id)}
                        className="p-2 hover:bg-red-900/30 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {(showUploadModal || editMode) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {editMode ? 'Modifier le design' : 'Ajouter des designs'}
                </h3>
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

              <div className="space-y-6">
                {!editMode && (
                  /* Upload Section */
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Images *
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        id="design-upload"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="design-upload" className="cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                          {designFiles.length > 0 ? (
                            <FiCheck className="w-8 h-8 text-green-400" />
                          ) : (
                            <FiUpload className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <p className="text-gray-400 mb-2">
                          {designFiles.length > 0 
                            ? `${designFiles.length} fichier(s) sélectionné(s)`
                            : 'Cliquez pour sélectionner des images'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Formats: JPEG, PNG, WebP, GIF (max 10MB par fichier)
                        </p>
                      </label>
                    </div>

                    {/* File list */}
                    {designFiles.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {designFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FiFileText className="text-blue-400" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-gray-500 hover:text-red-400"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <FiFolder className="w-4 h-4" />
                      Catégorie *
                    </div>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => editMode 
                          ? setEditingDesign({...editingDesign, category: category.key})
                          : setNewDesign({...newDesign, category: category.key})
                        }
                        className={`p-3 rounded-lg border transition-all ${
                          (editMode ? editingDesign?.category : newDesign.category) === category.key
                            ? `border-transparent bg-gradient-to-r ${category.color} text-white`
                            : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <FiType className="w-4 h-4" />
                      Titre
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editMode ? editingDesign?.title || '' : newDesign.title}
                    onChange={(e) => editMode
                      ? setEditingDesign({...editingDesign, title: e.target.value})
                      : setNewDesign({...newDesign, title: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Titre du design"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={editMode ? editingDesign?.description || '' : newDesign.description}
                    onChange={(e) => editMode
                      ? setEditingDesign({...editingDesign, description: e.target.value})
                      : setNewDesign({...newDesign, description: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[100px]"
                    placeholder="Description du design"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <FiLink className="w-4 h-4" />
                      Lien (optionnel)
                    </div>
                  </label>
                  <input
                    type="url"
                    value={editMode ? editingDesign?.link || '' : newDesign.link}
                    onChange={(e) => editMode
                      ? setEditingDesign({...editingDesign, link: e.target.value})
                      : setNewDesign({...newDesign, link: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        disabled={!editingDesign?.title}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FiCheck className="w-5 h-5" />
                        Mettre à jour
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditingDesign(null);
                        }}
                        className="px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleUpload}
                        disabled={designFiles.length === 0 || uploading}
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default AdminDesigns;