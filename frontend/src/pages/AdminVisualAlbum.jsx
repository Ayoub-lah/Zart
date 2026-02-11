// frontend/src/pages/AdminVisualAlbum.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMusic, 
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
  FiChevronLeft,
  FiPlay,
  FiPause,
  FiVolume2,
  FiCalendar,
  FiUser,
  FiStar,
  FiHeart
} from 'react-icons/fi';
import { 
  FaRecordVinyl,
  FaCompactDisc,
  FaMusic,
  FaRegImage,
  FaPalette,
  FaBrush
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';

const AdminVisualAlbum = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour les albums
  const [albums, setAlbums] = useState([]);
  const [albumTypes, setAlbumTypes] = useState([]);
  
  // États pour la gestion
  const [activeType, setActiveType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // États pour le formulaire
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist: '',
    year: new Date().getFullYear(),
    type: 'album',
    description: '',
    genre: '',
    link: '',
    featured: false,
    order: 0
  });
  
  const [albumFiles, setAlbumFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Types d'albums avec icônes
  const albumTypeOptions = [
    { key: 'album', name: 'Album Complet', icon: <FaRecordVinyl className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
    { key: 'ep', name: 'EP', icon: <FaCompactDisc className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
    { key: 'single', name: 'Single', icon: <FaMusic className="w-5 h-5" />, color: 'from-green-500 to-green-600' },
    { key: 'mixtape', name: 'Mixtape', icon: <FiMusic className="w-5 h-5" />, color: 'from-yellow-500 to-yellow-600' },
    { key: 'compilation', name: 'Compilation', icon: <FiFolder className="w-5 h-5" />, color: 'from-red-500 to-red-600' },
    { key: 'concept', name: 'Concept Album', icon: <FaPalette className="w-5 h-5" />, color: 'from-pink-500 to-pink-600' }
  ];

  // Genres musicaux
  const musicGenres = [
    'Hip Hop', 'Rap', 'R&B', 'Pop', 'Rock', 'Electronic',
    'Jazz', 'Classical', 'Alternative', 'Indie', 'Folk',
    'Metal', 'Punk', 'Reggae', 'Soul', 'Funk', 'Disco',
    'Techno', 'House', 'Trap', 'Drill', 'Lo-Fi', 'Ambient'
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

  // Charger les albums
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlbums();
      extractAlbumTypes();
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

 // frontend/src/pages/AdminVisualAlbum.jsx - Modifier fetchAlbums
const fetchAlbums = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('admin_token');
    
    // Vérifiez le token
    console.log('🔑 Token:', token ? 'Présent' : 'Manquant');
    
    // Vérifiez l'URL
    const url = `${API_BASE_URL}/api/admin/visual-albums`;
    console.log('📡 URL appelée:', url);
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Réponse status:', response.status);
    console.log('📊 Réponse headers:', response.headers);
    
    const data = await response.json();
    console.log('📦 Données reçues:', data);
    
    if (data.success) {
      setAlbums(data.albums || []);
    } else {
      setAlbums([]);
      console.error('❌ Erreur serveur:', data.error);
      toast.error('Erreur: ' + data.error);
    }
  } catch (error) {
    console.error('❌ Erreur chargement albums:', error);
    console.error('❌ Détails:', error.message);
    toast.error('Erreur de connexion: ' + error.message);
    setAlbums([]);
  } finally {
    setLoading(false);
  }
};

  const extractAlbumTypes = () => {
    const types = [...new Set(albums.map(album => album.type))];
    setAlbumTypes(['all', ...types]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Valider les fichiers
    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) { // 20MB max pour les visuels d'album
        toast.error(`Le fichier ${file.name} dépasse 20MB`);
        return false;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format non supporté pour ${file.name}`);
        return false;
      }

      return true;
    });

    setAlbumFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAlbumFiles(prev => prev.filter((_, i) => i !== index));
  };

const handleUpload = async () => {
  console.log('🔄 Début handleUpload');
  console.log('📁 Fichiers:', albumFiles);
  console.log('📝 Données album:', newAlbum);

  if (albumFiles.length === 0) {
    toast.error('Veuillez sélectionner au moins une image');
    return;
  }

  if (!newAlbum.title || !newAlbum.artist) {
    toast.error('Le titre et l\'artiste sont requis');
    return;
  }

  setUploading(true);

  try {
    const token = localStorage.getItem('admin_token');
    console.log('🔑 Token utilisé:', token ? 'Présent' : 'Manquant');
    
    const formData = new FormData();
    
    // Ajoutez TOUS les champs
    albumFiles.forEach((file, index) => {
      console.log(`📤 Ajout fichier ${index + 1}:`, file.name);
      formData.append('image', file); // Note: 'image' au singulier
    });
    
    // Ajouter les autres champs
    formData.append('title', newAlbum.title);
    formData.append('artist', newAlbum.artist);
    formData.append('year', newAlbum.year.toString());
    formData.append('type', newAlbum.type);
    formData.append('description', newAlbum.description);
    formData.append('genre', newAlbum.genre);
    formData.append('link', newAlbum.link || '');
    formData.append('featured', newAlbum.featured.toString());
    formData.append('order', newAlbum.order.toString());

    console.log('📋 FormData créé');

    // Vérifiez l'URL
    const url = `${API_BASE_URL}/api/admin/visual-albums/upload`;
    console.log('📡 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NE PAS mettre 'Content-Type': 'multipart/form-data'
        // Le navigateur le fera automatiquement avec la bonne boundary
      },
      body: formData
    });

    console.log('📊 Réponse status:', response.status);
    console.log('📊 Réponse headers:', response.headers);

    const textResponse = await response.text();
    console.log('📦 Réponse brute:', textResponse);

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e);
      toast.error('Réponse invalide du serveur');
      return;
    }

    console.log('📦 Données parsées:', data);

    if (data.success) {
      toast.success('Album ajouté avec succès');
      fetchAlbums();
      resetUploadForm();
      setShowUploadModal(false);
    } else {
      console.error('❌ Erreur serveur:', data);
      toast.error(data.error || 'Erreur d\'upload');
    }
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    console.error('❌ Détails:', error.message);
    toast.error('Erreur de connexion: ' + error.message);
  } finally {
    setUploading(false);
  }
};

  const handleUpdate = async () => {
    if (!editingAlbum) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/visual-albums/${editingAlbum.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editingAlbum.title,
            artist: editingAlbum.artist,
            year: editingAlbum.year,
            type: editingAlbum.type,
            description: editingAlbum.description,
            genre: editingAlbum.genre,
            link: editingAlbum.link,
            featured: editingAlbum.featured,
            order: editingAlbum.order
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Album mis à jour');
        fetchAlbums();
        setEditMode(false);
        setEditingAlbum(null);
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/visual-albums/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Album supprimé');
        setAlbums(prev => prev.filter(album => album.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de suppression');
    }
  };

  const updateAlbumOrder = async (id, direction) => {
    const albumsCopy = [...albums];
    const albumIndex = albumsCopy.findIndex(album => album.id === id);
    
    if (albumIndex === -1) return;

    let newOrder;
    if (direction === 'up' && albumIndex > 0) {
      [albumsCopy[albumIndex], albumsCopy[albumIndex - 1]] = 
      [albumsCopy[albumIndex - 1], albumsCopy[albumIndex]];
    } else if (direction === 'down' && albumIndex < albumsCopy.length - 1) {
      [albumsCopy[albumIndex], albumsCopy[albumIndex + 1]] = 
      [albumsCopy[albumIndex + 1], albumsCopy[albumIndex]];
    } else {
      return;
    }

    // Mettre à jour les ordres
    albumsCopy.forEach((album, index) => {
      album.order = index;
    });

    setAlbums(albumsCopy);

    // Envoyer la mise à jour au serveur
    try {
      const token = localStorage.getItem('admin_token');
      const orderUpdate = albumsCopy.map((album, index) => ({
        id: album.id,
        order: index
      }));

      await fetch(`${API_BASE_URL}/api/admin/visual-albums/reorder`, {
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

  const toggleFeatured = async (id) => {
    const album = albums.find(a => a.id === id);
    if (!album) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/visual-albums/${id}/featured`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ featured: !album.featured })
        }
      );

      const data = await response.json();

      if (data.success) {
        setAlbums(prev =>
          prev.map(album =>
            album.id === id ? { ...album, featured: !album.featured } : album
          )
        );
        toast.success(album.featured ? 'Album retiré des favoris' : 'Album marqué comme favori');
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const resetUploadForm = () => {
    setNewAlbum({
      title: '',
      artist: '',
      year: new Date().getFullYear(),
      type: 'album',
      description: '',
      genre: '',
      link: '',
      featured: false,
      order: albums.length
    });
    setAlbumFiles([]);
    setEditMode(false);
    setEditingAlbum(null);
  };

  const startEdit = (album) => {
    setEditMode(true);
    setEditingAlbum({ ...album });
    setShowUploadModal(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const filteredAlbums = albums.filter(album => {
    // Filtrer par type
    if (activeType !== 'all' && album.type !== activeType) {
      return false;
    }
    
    // Filtrer par recherche
    if (searchTerm !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        album.title.toLowerCase().includes(searchLower) ||
        album.artist.toLowerCase().includes(searchLower) ||
        album.description?.toLowerCase().includes(searchLower) ||
        album.genre?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => a.order - b.order);

  // Fonction pour générer des données mock (développement seulement)
  const mockAlbums = () => {
    return [
      {
        id: '1',
        title: 'Midnight Dreams',
        artist: 'Aria Nova',
        year: 2023,
        type: 'album',
        genre: 'Electronic',
        description: 'Un voyage sonore à travers les paysages nocturnes',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        link: 'https://open.spotify.com/album/example',
        featured: true,
        order: 0,
        uploadedAt: '2023-10-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Urban Legends',
        artist: 'City Rhymes',
        year: 2022,
        type: 'mixtape',
        genre: 'Hip Hop',
        description: 'Histoires de rue et beats bruts',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w-400&h=400&fit=crop',
        link: '',
        featured: true,
        order: 1,
        uploadedAt: '2022-08-22T10:15:00Z'
      }
    ];
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
                Visual Albums
              </h1>
              <p className="text-gray-400">
                Gérez vos couvertures d'albums et artwork visuels
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <FiUpload className="w-5 h-5" />
              <span>Ajouter un album</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Albums</p>
                <p className="text-2xl font-bold text-white">{albums.length}</p>
              </div>
              <FiMusic className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Albums Favoris</p>
                <p className="text-2xl font-bold text-white">
                  {albums.filter(a => a.featured).length}
                </p>
              </div>
              <FiStar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Artistes</p>
                <p className="text-2xl font-bold text-white">
                  {[...new Set(albums.map(a => a.artist))].length}
                </p>
              </div>
              <FiUser className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Genres</p>
                <p className="text-2xl font-bold text-white">
                  {[...new Set(albums.map(a => a.genre))].length}
                </p>
              </div>
              <FiTag className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un album, artiste ou genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">Tous les types</option>
                {albumTypeOptions.map(type => (
                  <option key={type.key} value={type.key}>
                    {type.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
                <span className="hidden sm:inline">
                  {viewMode === 'grid' ? 'Liste' : 'Grille'}
                </span>
              </button>
              
              <button
                onClick={fetchAlbums}
                className="px-4 py-3 bg-gray-800/50 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title="Actualiser"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Albums Content */}
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Collection d'Albums
                </h2>
                <p className="text-gray-400 text-sm">
                  {filteredAlbums.length} album{filteredAlbums.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Albums Grid/List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Chargement des albums...</p>
              </div>
            ) : filteredAlbums.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <FiMusic className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Aucun album trouvé
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre premier album visuel'}
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
                >
                  Ajouter un album
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-gray-800/20 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
                  >
                    <div className="relative">
                      {/* Image de l'album */}
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <img
                          src={album.image}
                          alt={`${album.title} - ${album.artist}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Badge favori */}
                      {album.featured && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
                          <FiStar className="w-3 h-3" />
                          Favori
                        </div>
                      )}
                      
                      {/* Badge type */}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs">
                        {albumTypeOptions.find(t => t.key === album.type)?.name || album.type}
                      </div>

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(album)}
                          className="p-2 rounded-full bg-blue-900/80 hover:bg-blue-800"
                          title="Modifier"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(album.id)}
                          className="p-2 rounded-full bg-yellow-900/80 hover:bg-yellow-800"
                          title={album.featured ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          {album.featured ? (
                            <FiStar className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <FiStar className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="p-2 rounded-full bg-red-900/80 hover:bg-red-800"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Titre et artiste */}
                      <h3 className="font-bold text-white truncate text-lg">
                        {album.title}
                      </h3>
                      <p className="text-purple-300 text-sm truncate">
                        {album.artist}
                      </p>
                      
                      {/* Informations */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{album.year}</span>
                        <span>•</span>
                        <span>{album.genre}</span>
                      </div>
                      
                      {album.description && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {album.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateAlbumOrder(album.id, 'up')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-all"
                            title="Monter"
                          >
                            <FiArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => updateAlbumOrder(album.id, 'down')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-all"
                            title="Descendre"
                          >
                            <FiArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {album.link && (
                          <a
                            href={album.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            Écouter
                            <FiPlay className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="flex items-center gap-4 p-4 bg-gray-800/20 border border-gray-700 rounded-xl hover:bg-gray-800/30 transition-all group"
                  >
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={album.image}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                      {album.featured && (
                        <div className="absolute top-1 right-1">
                          <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">
                          {album.title}
                        </h3>
                        <span className="px-2 py-0.5 text-xs bg-gray-800 rounded-full">
                          {albumTypeOptions.find(t => t.key === album.type)?.name || album.type}
                        </span>
                      </div>
                      
                      <p className="text-purple-300 text-sm truncate">
                        {album.artist}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{album.year}</span>
                        <span>•</span>
                        <span>{album.genre}</span>
                        <span>•</span>
                        <span>Ordre: {album.order + 1}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFeatured(album.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                        title={album.featured ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        {album.featured ? (
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ) : (
                          <FiStar className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => startEdit(album)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(album.id)}
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
                  {editMode ? 'Modifier l\'album' : 'Ajouter un album visuel'}
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
                      Image de couverture *
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                      <input
                        type="file"
                        id="album-upload"
                        accept="image/*"
                        multiple={!editMode}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="album-upload" className="cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                          {albumFiles.length > 0 ? (
                            <FiCheck className="w-8 h-8 text-green-400" />
                          ) : (
                            <FiUpload className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <p className="text-gray-400 mb-2">
                          {albumFiles.length > 0 
                            ? `${albumFiles.length} fichier(s) sélectionné(s)`
                            : 'Cliquez pour sélectionner une image'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Formats: JPEG, PNG, WebP, GIF (max 20MB par fichier)
                        </p>
                      </label>
                    </div>

                    {/* File list */}
                    {albumFiles.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {albumFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FiFileText className="text-purple-400" />
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

                {/* Titre et Artiste */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Titre de l'album *
                    </label>
                    <input
                      type="text"
                      value={editMode ? editingAlbum?.title || '' : newAlbum.title}
                      onChange={(e) => editMode
                        ? setEditingAlbum({...editingAlbum, title: e.target.value})
                        : setNewAlbum({...newAlbum, title: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Midnight Dreams"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Artiste *
                    </label>
                    <input
                      type="text"
                      value={editMode ? editingAlbum?.artist || '' : newAlbum.artist}
                      onChange={(e) => editMode
                        ? setEditingAlbum({...editingAlbum, artist: e.target.value})
                        : setNewAlbum({...newAlbum, artist: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Aria Nova"
                      required
                    />
                  </div>
                </div>

                {/* Année et Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Année de sortie
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={editMode ? editingAlbum?.year || new Date().getFullYear() : newAlbum.year}
                      onChange={(e) => editMode
                        ? setEditingAlbum({...editingAlbum, year: parseInt(e.target.value)})
                        : setNewAlbum({...newAlbum, year: parseInt(e.target.value)})
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Type d'album
                    </label>
                    <select
                      value={editMode ? editingAlbum?.type || 'album' : newAlbum.type}
                      onChange={(e) => editMode
                        ? setEditingAlbum({...editingAlbum, type: e.target.value})
                        : setNewAlbum({...newAlbum, type: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      {albumTypeOptions.map(type => (
                        <option key={type.key} value={type.key}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Genre musical
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {musicGenres.slice(0, 12).map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => editMode
                          ? setEditingAlbum({...editingAlbum, genre})
                          : setNewAlbum({...newAlbum, genre})
                        }
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          (editMode ? editingAlbum?.genre : newAlbum.genre) === genre
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editMode ? editingAlbum?.genre || '' : newAlbum.genre}
                    onChange={(e) => editMode
                      ? setEditingAlbum({...editingAlbum, genre: e.target.value})
                      : setNewAlbum({...newAlbum, genre: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Ou entrez un genre personnalisé"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={editMode ? editingAlbum?.description || '' : newAlbum.description}
                    onChange={(e) => editMode
                      ? setEditingAlbum({...editingAlbum, description: e.target.value})
                      : setNewAlbum({...newAlbum, description: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[100px]"
                    placeholder="Décrivez l'album, le concept visuel, l'inspiration..."
                  />
                </div>

                {/* Lien et Favori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Lien (optionnel)
                    </label>
                    <input
                      type="url"
                      value={editMode ? editingAlbum?.link || '' : newAlbum.link}
                      onChange={(e) => editMode
                        ? setEditingAlbum({...editingAlbum, link: e.target.value})
                        : setNewAlbum({...newAlbum, link: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="https://open.spotify.com/album/..."
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editMode ? editingAlbum?.featured || false : newAlbum.featured}
                        onChange={(e) => editMode
                          ? setEditingAlbum({...editingAlbum, featured: e.target.checked})
                          : setNewAlbum({...newAlbum, featured: e.target.checked})
                        }
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        Album favori (mis en avant)
                      </span>
                    </label>
                    
                    <div className="mt-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Ordre d'affichage
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editMode ? editingAlbum?.order || 0 : newAlbum.order}
                        onChange={(e) => editMode
                          ? setEditingAlbum({...editingAlbum, order: parseInt(e.target.value)})
                          : setNewAlbum({...newAlbum, order: parseInt(e.target.value)})
                        }
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        disabled={!editingAlbum?.title || !editingAlbum?.artist}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FiCheck className="w-5 h-5" />
                        Mettre à jour
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditingAlbum(null);
                          setShowUploadModal(false);
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
                        disabled={albumFiles.length === 0 || !newAlbum.title || !newAlbum.artist || uploading}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Upload...
                          </>
                        ) : (
                          'Ajouter l\'album'
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

export default AdminVisualAlbum;