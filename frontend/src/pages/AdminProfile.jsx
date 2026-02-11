// frontend/src/pages/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiKey, 
  FiCalendar, 
  FiSave,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Vérifier l'authentification et charger le profil
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
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setProfileData(prev => ({
          ...prev,
          username: parsedUser.username,
          email: parsedUser.email
        }));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        logout();
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
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

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setProfileData(prev => ({
          ...prev,
          username: data.user.username,
          email: data.user.email
        }));
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation du nom d'utilisateur
    if (!profileData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Minimum 3 caractères';
    }

    // Validation de l'email
    if (!profileData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation des mots de passe
    if (profileData.newPassword || profileData.currentPassword) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Mot de passe actuel requis';
      }
      if (!profileData.newPassword) {
        newErrors.newPassword = 'Nouveau mot de passe requis';
      } else if (profileData.newPassword.length < 6) {
        newErrors.newPassword = 'Minimum 6 caractères';
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');

     try {
    const token = localStorage.getItem('admin_token');
    const payload = {
      username: profileData.username,
      email: profileData.email
    };

    // Inclure le changement de mot de passe si nécessaire
    if (profileData.currentPassword && profileData.newPassword) {
      payload.currentPassword = profileData.currentPassword;
      payload.newPassword = profileData.newPassword;
    }

    // Vérifier que l'URL est correcte
    const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

      if (data.success) {
        // Mettre à jour les données utilisateur dans le localStorage
        const updatedUser = {
          ...user,
          username: profileData.username,
          email: profileData.email
        };
        
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Réinitialiser les champs de mot de passe
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        setSuccessMessage(data.message || 'Profil mis à jour avec succès');
        toast.success('Profil mis à jour avec succès');
        
        // Nettoyer le message après 3 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
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

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Mon Profil
              </h1>
              <p className="text-gray-400">
                Gérez vos informations personnelles et votre mot de passe
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800/30 rounded-xl">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Informations Personnelles</h2>
                
                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Nom d'utilisateur
                      </div>
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => {
                        setProfileData({...profileData, username: e.target.value});
                        setErrors({...errors, username: ''});
                      }}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="Votre nom d'utilisateur"
                    />
                    {errors.username && (
                      <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4" />
                        Adresse email
                      </div>
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData({...profileData, email: e.target.value});
                        setErrors({...errors, email: ''});
                      }}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Rôle
                    </label>
                    <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-white capitalize">{user?.role}</span>
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                          Administrateur
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">
                    <div className="flex items-center gap-2">
                      <FiKey className="w-5 h-5" />
                      Changer le mot de passe
                    </div>
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Laissez vide si vous ne souhaitez pas changer le mot de passe
                  </p>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={profileData.currentPassword}
                          onChange={(e) => {
                            setProfileData({...profileData, currentPassword: e.target.value});
                            setErrors({...errors, currentPassword: ''});
                          }}
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-700'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.newPassword}
                          onChange={(e) => {
                            setProfileData({...profileData, newPassword: e.target.value});
                            setErrors({...errors, newPassword: ''});
                          }}
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                            errors.newPassword ? 'border-red-500' : 'border-gray-700'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={(e) => {
                            setProfileData({...profileData, confirmPassword: e.target.value});
                            setErrors({...errors, confirmPassword: ''});
                          }}
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Sauvegarder les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Info */}
          <div className="space-y-8">

            {/* Security Tips */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Conseils de sécurité</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <p className="text-gray-300 text-sm">
                    Utilisez un mot de passe fort avec des lettres, chiffres et symboles
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <p className="text-gray-300 text-sm">
                    Changez régulièrement votre mot de passe
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <p className="text-gray-300 text-sm">
                    Ne partagez jamais vos identifiants de connexion
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <p className="text-gray-300 text-sm">
                    Déconnectez-vous toujours après utilisation
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;