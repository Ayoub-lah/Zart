// src/pages/FileUpload.jsx - ADMIN ONLY VERSION
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, FiLink, FiCopy, FiLock, FiCalendar, FiTrash2, 
  FiMail, FiGlobe, FiMenu, FiX, FiArrowLeft, FiShield 
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../components/AdminHeader';

const FileUpload = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [expiryDate, setExpiryDate] = useState(7);
  const [requireCode, setRequireCode] = useState(true);
  const [email, setEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

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
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        logout();
      }
    }
  }, [navigate]);

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

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file => file.size <= 100 * 1024 * 1024); // 100MB max
    if (validFiles.length !== fileList.length) {
      toast.error('Certains fichiers dépassent la limite de 100MB');
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const calculateTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Veuillez sélectionner des fichiers');
      return;
    }

    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('expiryDays', expiryDate);
      formData.append('requireCode', requireCode);
      if (email) {
        formData.append('email', email);
      }

      const uploadUrl = `${API_BASE_URL}/api/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const textResponse = await response.text();
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error('❌ Erreur JSON:', e);
        throw new Error('Réponse serveur invalide');
      }
      
      if (response.ok && data.success) {
        const downloadUrl = `${window.location.origin}/download/${data.downloadId}`;
        
        setGeneratedLink(downloadUrl);
        setAccessCode(data.accessCode || '');
        
        toast.success('Fichiers uploadés avec succès!');
        
        // Sauvegarder dans localStorage
        localStorage.setItem(`transfer_${data.downloadId}`, JSON.stringify({
          id: data.downloadId,
          code: data.accessCode,
          expiry: data.expiresAt,
          files: data.files,
          downloadUrl: downloadUrl,
          uploadedBy: user?.username || 'Admin'
        }));
      } else {
        toast.error(data.error || `Échec de l'upload: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      toast.error(`Erreur d'upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = () => {
    if (!generatedLink) {
      toast.error('Aucun lien à copier');
      return;
    }
    navigator.clipboard.writeText(generatedLink);
    toast.success('Lien copié dans le presse-papier!');
  };

  const copyCode = () => {
    if (!accessCode) {
      toast.error('Aucun code à copier');
      return;
    }
    navigator.clipboard.writeText(accessCode);
    toast.success('Code copié dans le presse-papier!');
  };

  const sendViaEmail = () => {
    if (!generatedLink) {
      toast.error('Générez un lien d\'abord');
      return;
    }
    
    const subject = 'Fichiers à télécharger - Zartissam Portfolio';
    const body = `Bonjour,\n\nVoici les fichiers que je vous partage :\n\nLien de téléchargement : ${generatedLink}\n${requireCode ? `Code d'accès : ${accessCode}` : ''}\n\nCe lien expirera dans ${expiryDate} jour${expiryDate > 1 ? 's' : ''}.\n\nCordialement,\n${user?.username || 'Zartissam'}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const sendViaWhatsApp = () => {
    if (!generatedLink) {
      toast.error('Générez un lien d\'abord');
      return;
    }
    
    const message = `🔗 Lien de téléchargement : ${generatedLink}\n${requireCode ? `Code : ${accessCode}` : ''}\n\nValide pour ${expiryDate} jour${expiryDate > 1 ? 's' : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const resetForm = () => {
    setFiles([]);
    setGeneratedLink('');
    setAccessCode('');
    setEmail('');
    toast.info('Formulaire réinitialisé');
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
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

      {/* Admin Badge */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
           
          
          </div>
          
          <div className="hidden md:flex items-center gap-3">
          
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Transfert de Fichiers
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-2">
            Partagez des fichiers sécurisés avec vos clients. Accès administrateur uniquement.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            {/* Upload Zone */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <FiUpload className="text-blue-400 text-lg md:text-xl" />
                Sélectionnez vos fichiers
              </h2>
              
              <div 
                className="border-2 border-dashed border-gray-700 rounded-lg md:rounded-xl p-4 md:p-8 text-center hover:border-purple-500 transition-colors cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-gray-700/50 flex items-center justify-center group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300">
                  <FiUpload className="w-8 h-8 md:w-10 md:h-10 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
                
                <h3 className="text-base md:text-lg font-semibold mb-2">Glissez-déposez vos fichiers</h3>
                <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6 max-w-md mx-auto px-2">
                  ou cliquez pour sélectionner (max 100MB par fichier, 500MB total)
                </p>
                
                <button className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm md:text-base">
                  Parcourir les fichiers
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-600 mt-3 md:mt-4 text-center">
                  Formats acceptés : Tous les types de fichiers
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
                    <h3 className="font-semibold text-base md:text-lg">Fichiers sélectionnés ({files.length})</h3>
                    <div className="px-3 py-1 bg-gray-800/50 rounded-full text-xs md:text-sm self-start md:self-auto">
                      {formatFileSize(calculateTotalSize())}
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-1 md:pr-2">
                    {files.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between bg-gray-800/30 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiLink className="text-blue-400 text-sm md:text-base" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-xs md:text-sm">{file.name}</p>
                            <div className="flex items-center gap-2 md:gap-3 mt-0.5">
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <span className="text-xs text-gray-600 hidden md:inline">•</span>
                              <p className="text-xs text-gray-500 truncate hidden md:block">
                                {file.type || 'Fichier'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="p-1.5 md:p-2 text-gray-500 hover:text-red-400 transition-colors ml-1 md:ml-2 flex-shrink-0"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <FiLock className="text-purple-400 text-lg md:text-xl" />
                Options de sécurité
              </h2>
              
              <div className="space-y-4 md:space-y-6">
               

                {/* Security Code */}
                <div>
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <FiLock className="text-gray-400 text-sm md:text-base" />
                    <span className="font-medium text-sm md:text-base">Code de sécurité</span>
                  </div>
                  <div className="flex items-center p-3 md:p-4 bg-gray-800/20 rounded-lg md:rounded-xl">
                    <div className="flex items-center gap-2 md:gap-3">
                      <input
                        type="checkbox"
                        id="requireCode"
                        checked={requireCode}
                        onChange={(e) => setRequireCode(e.target.checked)}
                        className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="requireCode" className="text-xs md:text-sm text-gray-300">
                        Code requis pour le téléchargement
                      </label>
                    </div>
                  </div>
                </div>

                {/* Expiration */}
                <div>
                  <label className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <FiCalendar className="text-gray-400 text-sm md:text-base" />
                    <span className="font-medium text-sm md:text-base">Période de validité</span>
                  </label>
                  <select
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(Number(e.target.value))}
                    className="w-full bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none text-sm md:text-base"
                  >
                    <option value="1">1 jour</option>
                    <option value="3">3 jours</option>
                    <option value="7">7 jours</option>
                    <option value="14">14 jours</option>
                    <option value="30">30 jours</option>
                    <option value="0">Jamais (désactivé)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1 md:mt-2">
                    Les fichiers seront automatiquement supprimés après expiration
                  </p>
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg md:rounded-xl font-semibold text-base md:text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 mt-2 md:mt-4"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-5 h-5 md:w-6 md:h-6" />
                      Générer le lien de partage
                    </>
                  )}
                </button>

                {/* Reset Button */}
                {files.length > 0 && (
                  <button
                    onClick={resetForm}
                    className="w-full py-2.5 md:py-3 bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-gray-600 transition-colors text-sm md:text-base"
                  >
                    Réinitialiser le formulaire
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
            {/* Generated Link */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <FiLink className="text-green-400 text-lg md:text-xl" />
                Lien de partage généré
              </h2>
              
              {generatedLink ? (
                <div className="space-y-4 md:space-y-6">
                  {/* Link */}
                  <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                    <label className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 block">Lien sécurisé</label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 md:p-3 text-xs md:text-sm font-mono truncate focus:outline-none focus:border-green-500 pr-20 md:pr-3"
                        />
                        <button 
                          onClick={copyLink}
                          className="absolute right-0 top-0 h-full px-3 md:px-5 bg-gradient-to-r from-green-600 to-blue-600 rounded-r-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"
                          title="Copier le lien"
                        >
                          <FiCopy className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden md:inline">Copier</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Access Code */}
                  {requireCode && accessCode && (
                    <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                      <label className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 block">Code d'accès</label>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={accessCode}
                              readOnly
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 md:p-4 text-base md:text-xl font-mono text-center tracking-wider md:tracking-widest focus:outline-none focus:border-purple-500 pr-14 md:pr-3"
                            />
                            <button 
                              onClick={copyCode}
                              className="absolute right-0 top-0 h-full px-3 md:px-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-r-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                              title="Copier le code"
                            >
                              <FiCopy className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden md:inline">Copier</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Partagez ce code séparément du lien
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-black/30 p-3 md:p-5 rounded-lg md:rounded-xl">
                    <h4 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Instructions de partage</h4>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 md:mt-1 text-xs">1.</span>
                        <span>Envoyez le <strong className="text-white">lien</strong> à votre client</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 md:mt-1 text-xs">2.</span>
                        {requireCode ? (
                          <span>Partagez le <strong className="text-white">code d'accès</strong> par un autre canal</span>
                        ) : (
                          <span>Le téléchargement est accessible sans code</span>
                        )}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5 md:mt-1 text-xs">3.</span>
                        <span>Lien valable <strong className="text-white">{expiryDate} jour{expiryDate > 1 ? 's' : ''}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 md:mt-1 text-xs">4.</span>
                        <span>Fichiers <strong className="text-white">auto-supprimés</strong> après expiration</span>
                      </li>
                    </ul>
                  </div>

                  {/* Share Buttons */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <button
                      onClick={sendViaEmail}
                      className="py-2.5 md:py-3 bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                    >
                      <FiMail className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Email</span>
                    </button>
                    <button
                      onClick={sendViaWhatsApp}
                      className="py-2.5 md:py-3 bg-green-600/20 border border-green-700/30 rounded-lg md:rounded-xl hover:bg-green-600/30 hover:border-green-600 transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.447h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
                    <FiLink className="w-8 h-8 md:w-12 md:h-12 text-gray-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                    Aucun lien généré
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base px-2">
                    Uploader des fichiers pour générer un lien de partage sécurisé
                  </p>
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl max-w-md mx-auto">
                    <h4 className="font-medium mb-1 md:mb-2 text-xs md:text-sm text-gray-400">Comment ça marche :</h4>
                    <ul className="text-xs text-gray-500 space-y-0.5 md:space-y-1">
                      <li>1. Sélectionnez vos fichiers (max 100MB chacun)</li>
                      <li>2. Configurez les options de sécurité</li>
                      <li>3. Générez un lien unique</li>
                      <li>4. Partagez avec vos clients</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Statistiques</h2>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                  <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-0.5 md:mb-1">
                    {files.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">
                    Fichiers sélectionnés
                  </div>
                </div>
                
                <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-0.5 md:mb-1">
                    {formatFileSize(calculateTotalSize())}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">
                    Taille totale
                  </div>
                </div>
                
                <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-green-400 mb-0.5 md:mb-1">
                        {expiryDate === 0 ? '∞' : `${expiryDate}j`}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Validité
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-bold text-pink-400 mb-0.5 md:mb-1">
                        {requireCode ? 'Activé' : 'Désactivé'}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Code de sécurité
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Transferts récents</h2>
              
              <div className="space-y-2 md:space-y-3">
                {(() => {
                  const transfers = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('transfer_')) {
                      try {
                        const transfer = JSON.parse(localStorage.getItem(key));
                        transfers.push(transfer);
                      } catch (e) {
                        console.error('Erreur parsing transfert:', e);
                      }
                    }
                  }
                  
                  if (transfers.length === 0) {
                    return (
                      <div className="text-center py-6 md:py-8">
                        <p className="text-gray-500 text-sm md:text-base">Aucun transfert récent</p>
                      </div>
                    );
                  }
                  
                  return transfers.slice(0, 3).map((transfer, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-gray-800/30 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs md:text-sm truncate">
                          {transfer.files?.length || 0} fichier{transfer.files?.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
                          {new Date(transfer.expiry).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-blue-400 mt-0.5">
                          Par: {transfer.uploadedBy || 'Admin'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {transfer.code && (
                          <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                            Code requis
                          </span>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm px-2">
          <p className="mb-1 md:mb-0">
            Astuce : Pour une sécurité maximale, partagez toujours le code d'accès par un canal différent du lien.
          </p>
          <p>
            Ce service utilise le chiffrement de bout en bout et supprime automatiquement les fichiers après expiration.
          </p>
          <div className="mt-4 px-4 py-2 bg-blue-900/10 border border-blue-800/20 rounded-lg inline-block">
            <p className="text-blue-400 text-xs">
              🔐 Accès restreint aux administrateurs seulement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;