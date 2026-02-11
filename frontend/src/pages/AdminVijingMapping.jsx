import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiUpload, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiEyeOff,
  FiArrowUp,
  FiArrowDown,
  FiVideo,
  FiSave,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import API_BASE_URL from '../config/api';


const AdminVijingMapping = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [vijingProjects, setVijingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    venue: '',
    type: 'Live VJing',
    videoUrl: '',
    description: '',
    image: null
  });

  const fileInputRef = useRef(null);

  // Types de projets disponibles
  const projectTypes = [
    'Live VJing',
    'Video Mapping',
    'Stage Design',
    'Interactive Installation',
    'Architectural Mapping',
    '3D Projection',
    'Concert Visuals',
    'Festival Visuals'
  ];


  // Vérifier l'authentification - MÊME LOGIQUE QUE AdminLogos
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

  // Charger les projets vijing
  useEffect(() => {
    if (isAuthenticated) {
      fetchVijingProjects();
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

  // Charger les projets depuis l'API
  const fetchVijingProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/vijing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur de chargement');
      }

      const data = await response.json();

      if (data.success) {
        // Trier par ordre
        const sortedProjects = data.vijingProjects.sort((a, b) => a.order - b.order);
        setVijingProjects(sortedProjects);
      } else {
        toast.error(data.error || 'Erreur de chargement des projets');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer l'upload de l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 10MB');
        return;
      }
      
      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format d\'image non supporté (JPEG, PNG, WebP, GIF uniquement)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        logout();
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('videoUrl', formData.videoUrl);
      formDataToSend.append('description', formData.description);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingProject 
        ? `${API_BASE_URL}/api/admin/vijing/${editingProject.id}`
        : `${API_BASE_URL}/api/admin/vijing/upload`;

      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      // Vérifier le statut de la réponse
      if (response.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        logout();
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success(editingProject ? 'Projet mis à jour !' : 'Projet ajouté !');
        resetForm();
        fetchVijingProjects();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Erreur de connexion au serveur');
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setUploading(false);
    }
  };

  // Éditer un projet
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      venue: project.venue,
      type: project.type,
      videoUrl: project.videoUrl || '',
      description: project.description || '',
      image: null
    });
    setShowForm(true);
  };

  // Supprimer un projet
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/vijing/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Session expirée');
        logout();
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Projet supprimé !');
        fetchVijingProjects();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Activer/Désactiver un projet
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/vijing/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`Projet ${!currentStatus ? 'activé' : 'désactivé'} !`);
        fetchVijingProjects();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Réorganiser les projets
  const handleReorder = async () => {
    const order = vijingProjects.map((project, index) => ({
      id: project.id,
      order: index
    }));

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/vijing/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Ordre mis à jour !');
        setReordering(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la réorganisation');
    }
  };

  // Déplacer un projet vers le haut
  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const newProjects = [...vijingProjects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index - 1];
    newProjects[index - 1] = temp;
    
    // Mettre à jour l'ordre
    const updatedProjects = newProjects.map((project, i) => ({
      ...project,
      order: i
    }));
    
    setVijingProjects(updatedProjects);
    setReordering(true);
  };

  // Déplacer un projet vers le bas
  const handleMoveDown = (index) => {
    if (index === vijingProjects.length - 1) return;
    
    const newProjects = [...vijingProjects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index + 1];
    newProjects[index + 1] = temp;
    
    // Mettre à jour l'ordre
    const updatedProjects = newProjects.map((project, i) => ({
      ...project,
      order: i
    }));
    
    setVijingProjects(updatedProjects);
    setReordering(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      venue: '',
      type: 'Live VJing',
      videoUrl: '',
      description: '',
      image: null
    });
    setEditingProject(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  // Afficher les statistiques
  const getStats = () => {
    const total = vijingProjects.length;
    const active = vijingProjects.filter(p => p.isActive).length;
    const types = {};
    
    vijingProjects.forEach(project => {
      types[project.type] = (types[project.type] || 0) + 1;
    });

    return { total, active, types };
  };

  const stats = getStats();

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* En-tête */}
      <div className="max-w-7xl mx-auto">
        <AdminHeader user={user} onLogout={logout} />
        
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion VJing & Mapping</h1>
            <p className="text-gray-400">
              Gérer les projets de VJing et projection mapping
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {showForm ? 'Annuler' : '+ Nouveau Projet'}
          </button>
        </div>

        {/* Le reste de votre code JSX... */}
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400">Projets au total</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{stats.active}</div>
            <div className="text-gray-400">Projets actifs</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400">
              {Object.keys(stats.types).length}
            </div>
            <div className="text-gray-400">Types de projets</div>
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">
              {editingProject ? 'Modifier le projet' : 'Ajouter un nouveau projet'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom du projet */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="Ex: Electric Festival 2024"
                    required
                  />
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="Ex: Stadium Arena"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type de projet *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  >
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* URL vidéo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL vidéo (optionnel)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  placeholder="Description du projet..."
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image du projet {!editingProject ? '*' : ''}
                  <span className="text-gray-500 text-xs ml-2">
                    (JPEG, PNG, WebP, GIF - max 10MB)
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  required={!editingProject}
                />
                {formData.image && (
                  <p className="mt-2 text-sm text-green-400">
                    ✓ Image sélectionnée: {formData.image.name}
                  </p>
                )}
                {editingProject && !formData.image && (
                  <p className="mt-2 text-sm text-gray-400">
                    Laisser vide pour conserver l'image actuelle
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      Enregistrement...
                    </span>
                  ) : editingProject ? (
                    <span className="flex items-center gap-2">
                      <FiSave /> Mettre à jour
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiUpload /> Ajouter le projet
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des projets */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Liste des projets ({vijingProjects.length})</h2>
            
            {vijingProjects.length > 0 && (
              <div className="flex gap-2">
                {reordering && (
                  <button
                    onClick={handleReorder}
                    className="px-4 py-2 bg-green-600 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <FiSave /> Enregistrer l'ordre
                  </button>
                )}
                
                <button
                  onClick={() => setReordering(!reordering)}
                  className="px-4 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {reordering ? 'Annuler réorganisation' : 'Réorganiser'}
                </button>
              </div>
            )}
          </div>

          {vijingProjects.length === 0 ? (
            <div className="text-center py-12">
              <FiVideo className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun projet</h3>
              <p className="text-gray-400">
                Commencez par ajouter votre premier projet de VJing/Mapping
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vijingProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/30 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Informations du projet */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {reordering && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-800 rounded disabled:opacity-30"
                            >
                              <FiArrowUp />
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === vijingProjects.length - 1}
                              className="p-1 hover:bg-gray-800 rounded disabled:opacity-30"
                            >
                              <FiArrowDown />
                            </button>
                          </div>
                        )}
                        
                        <span className="text-lg font-semibold">{project.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.isActive 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {project.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">
                          {project.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>📍 {project.venue}</p>
                        {project.videoUrl && (
                          <p>
                            <a 
                              href={project.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Lien vidéo
                            </a>
                          </p>
                        )}
                        {project.description && (
                          <p className="text-gray-500">{project.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Image miniature */}
                    <div className="md:w-32">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 bg-blue-900/30 hover:bg-blue-800/50 rounded-lg transition"
                        title="Modifier"
                      >
                        <FiEdit className="text-blue-400" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(project.id, project.isActive)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                        title={project.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {project.isActive ? (
                          <FiEyeOff className="text-gray-400" />
                        ) : (
                          <FiEye className="text-gray-400" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 bg-red-900/30 hover:bg-red-800/50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <FiTrash2 className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-sm text-gray-400">
          <h3 className="font-medium text-white mb-2">Instructions :</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Les projets avec le statut "Actif" seront affichés sur le site</li>
            <li>L'ordre d'affichage peut être modifié avec les flèches</li>
            <li>L'URL vidéo doit pointer vers une vidéo YouTube ou Vimeo</li>
            <li>La taille maximale des images est de 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminVijingMapping;