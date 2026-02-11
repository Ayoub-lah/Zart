import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        toast.success('Connexion réussie !');
        
        // Rediriger vers le dashboard après 1.5 secondes
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        toast.error(data.error || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
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
      
      <div className="w-full max-w-md">
        {/* Carte de connexion */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-4">
              <FiLock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Accès Administrateur
            </h1>
            <p className="text-gray-400 text-sm">
              Connectez-vous pour gérer votre portfolio
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiUser className="text-gray-500 text-lg" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/30 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="admin"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiLock className="text-gray-500 text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800/30 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Informations */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-4">
              <h3 className="text-blue-400 font-medium text-sm mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Informations de sécurité
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Gardez vos identifiants confidentiels</li>
                <li>• Déconnectez-vous après chaque session</li>
                <li>• Changez régulièrement votre mot de passe</li>
              </ul>
            </div>
          </div>

          {/* Lien retour */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Retour au portfolio
            </a>
          </div>
        </div>

        {/* Version */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            Portfolio Admin v2.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;