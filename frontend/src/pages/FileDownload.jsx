// src/pages/FileDownload.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiLock, 
  FiCheck, 
  FiAlertCircle, 
  FiFile, 
  FiPackage, 
  FiClock, 
  FiShield,
  FiGlobe,
  FiCopy,
  FiExternalLink,
  FiRefreshCw,
  FiInfo,
  FiMenu,
  FiX,
  FiArrowLeft
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useLocation } from 'react-router-dom';


const FileDownload = () => {
  const [downloadId, setDownloadId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [transferInfo, setTransferInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ FIXED: Remove /api from base URL since we add it in each API call
  const API_BASE_URL = process.env.REACT_APP_API_URL ;
  

  // Extract ID from link
  const extractIdFromLink = (link) => {
    const match = link.match(/\/download\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : link;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { id: paramId } = useParams();
  const location = useLocation();

  // Calculate time left
  const calculateTimeLeft = (expiry) => {
    if (!expiry) return '';
    
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diff = expiryDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    if (paramId) {
      // Si l'ID vient des paramètres d'URL (/download/:id)
      setDownloadId(paramId);
    } else if (location.search) {
      // Si l'ID vient des query params (/download?id=...)
      const params = new URLSearchParams(location.search);
      const idFromQuery = params.get('id');
      if (idFromQuery) {
        setDownloadId(idFromQuery);
      }
    }
  }, [paramId, location.search]);

  // Update time left in real time
  useEffect(() => {
    if (!expiryDate) return;
    
    const updateTime = () => {
      setTimeLeft(calculateTimeLeft(expiryDate));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [expiryDate]);

  // Verify access
  const verifyAccess = async () => {
    if (!downloadId.trim()) {
      toast.error('Please enter a download link');
      return;
    }

    setIsLoading(true);
    
    try {
      const id = extractIdFromLink(downloadId);
      
      // ✅ FIXED: Correct API endpoint
      const verifyUrl = `${API_BASE_URL}/api/verify/${id}`;
      console.log('📤 Verify URL:', verifyUrl);
      
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: accessCode.toUpperCase() })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        setFiles(data.files || []);
        setExpiryDate(data.expiresAt);
        setTransferInfo({
          remainingDownloads: data.remainingDownloads || 0,
          totalSize: data.totalSize || 0,
          fileCount: data.fileCount || 0,
          uploader: data.uploader || 'Zartissam'
        });
        setIsVerified(true);
        toast.success('Access verified!');
      } else {
        toast.error(data.error || 'Incorrect link or code');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  // Download individual file
  const downloadFile = async (file, index) => {
    if (!file.downloadUrl) {
      toast.error('Download URL not available');
      return;
    }

    setIsDownloading(true);
    setProgress(prev => ({ ...prev, [index]: 0 }));
    
    try {
      const response = await fetch(file.downloadUrl, {
        headers: {
          'Authorization': `Bearer ${accessCode}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          const current = prev[index] || 0;
          if (current >= 95) {
            clearInterval(interval);
            return { ...prev, [index]: 100 };
          }
          return { ...prev, [index]: current + Math.random() * 15 };
        });
      }, 100);
      
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        setProgress(prev => ({ ...prev, [index]: 100 }));
        
        setTimeout(() => {
          setProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
          });
        }, 1000);
        
        toast.success(`"${file.name}" downloaded!`);
      }, 500);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Error downloading "${file.name}"`);
    } finally {
      setIsDownloading(false);
    }
  };

// src/pages/FileDownload.jsx - MODIFIER LA FONCTION downloadAllAsZip

const downloadAllAsZip = async () => {
  if (files.length === 0) {
    toast.error('No files to download');
    return;
  }

  const id = extractIdFromLink(downloadId);
  
  setIsDownloading(true);
  setProgress({ all: 0 });
  
  try {
    toast.info('Preparing ZIP archive...');
    
    // URL pour télécharger le ZIP
    const url = `${API_BASE_URL}/api/download-all/${id}?code=${accessCode}`;
    console.log('📤 Download all URL:', url);
    
    const response = await fetch(url);
    
    // Vérifier le type de réponse
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!response.ok) {
      // Essayer de lire le message d'erreur JSON
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser le texte brut
        errorData = { error: errorText };
      }
      
      console.error('Server error:', errorData);
      
      if (response.status === 404) {
        throw new Error('Transfer not found or files deleted');
      } else if (response.status === 403) {
        throw new Error('Incorrect access code');
      } else if (response.status === 410) {
        throw new Error('Link expired or download limit reached');
      } else {
        throw new Error(errorData.error || `Error ${response.status}`);
      }
    }
    
    // Vérifier que c'est bien un ZIP
    if (!contentType || !contentType.includes('application/zip')) {
      throw new Error('Server returned invalid ZIP file');
    }
    
    // Récupérer le nom du fichier depuis les headers
    let zipFileName = 'shared_by_zartissam.zip';
    
    // Vérifier le header Content-Disposition
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+?)"/);
      if (match && match[1]) {
        zipFileName = match[1];
      }
    }
    
    // Vérifier le header X-Filename personnalisé
    const xFilename = response.headers.get('x-filename');
    if (xFilename) {
      zipFileName = xFilename;
    }
    
    // Récupérer la taille totale
    const contentLength = response.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Créer un lecteur de stream
    const reader = response.body.getReader();
    
    // Collecter les chunks
    const chunks = [];
    let receivedLength = 0;
    
    // Suivre la progression
    const progressInterval = setInterval(() => {
      if (totalSize > 0 && totalSize > receivedLength) {
        const realProgress = Math.round((receivedLength / totalSize) * 100);
        setProgress({ all: Math.min(realProgress, 99) });
      } else {
        // Progression simulée si on ne connaît pas la taille
        setProgress(prev => {
          const current = prev.all || 0;
          if (current >= 95) {
            clearInterval(progressInterval);
            return { all: 100 };
          }
          return { all: current + 5 };
        });
      }
    }, 200);
    
    // Lire le stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Mettre à jour la progression réelle
      if (totalSize > 0) {
        const realProgress = Math.round((receivedLength / totalSize) * 100);
        setProgress({ all: realProgress });
      }
    }
    
    clearInterval(progressInterval);
    
    // Créer le blob
    const blob = new Blob(chunks, { type: 'application/zip' });
    
    // Créer le lien de téléchargement avec le bon nom
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = zipFileName;
    link.style.display = 'none';
    
    // Ajouter des attributs pour le tracking
    link.setAttribute('data-transfer-id', id);
    link.setAttribute('data-files-count', files.length);
    link.setAttribute('data-total-size', blob.size);
    
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      setProgress({ all: 100 });
      
      // Message de succès avec infos détaillées
      toast.success(
        <div className="text-left">
          <p className="font-semibold mb-1">✅ ZIP archive downloaded!</p>
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
            <p><span className="font-medium">Filename:</span> {zipFileName}</p>
            <p><span className="font-medium">Size:</span> {formatFileSize(blob.size)}</p>
            <p><span className="font-medium">Files:</span> {files.length} file{files.length > 1 ? 's' : ''}</p>
          </div>
        </div>,
        { 
          autoClose: 6000,
          closeButton: true
        }
      );
      
      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setProgress({});
      }, 2000);
      
    }, 100);
    
  } catch (error) {
    console.error('Error downloading ZIP:', error);
    
    // Messages d'erreur spécifiques
    let errorMessage = 'Error downloading ZIP archive';
    let errorDetail = 'Try again or contact sender';
    
    if (error.message.includes('expired') || error.message.includes('expiré')) {
      errorMessage = 'Link has expired';
      errorDetail = 'Please ask sender to create a new link';
    } else if (error.message.includes('access code') || error.message.includes('Access denied')) {
      errorMessage = 'Incorrect access code';
      errorDetail = 'Please check the code and try again';
    } else if (error.message.includes('not found') || error.message.includes('not available')) {
      errorMessage = 'Files not found';
      errorDetail = 'Files may have been deleted or moved';
    } else if (error.message.includes('limit reached')) {
      errorMessage = 'Download limit reached';
      errorDetail = 'Maximum downloads exceeded';
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      errorMessage = 'Network connection issue';
      errorDetail = 'Please check your internet connection';
    }
    
    toast.error(
      <div className="text-left">
        <p className="font-semibold mb-1">❌ {errorMessage}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{errorDetail}</p>
      </div>,
      { 
        autoClose: 8000,
        closeButton: true,
        position: 'top-center'
      }
    );
    
    setProgress({});
  } finally {
    setIsDownloading(false);
  }
};

  // Copy to clipboard
  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${message}`))
      .catch(() => toast.error('Error copying'));
  };

  // Reset form
  const resetForm = () => {
    setDownloadId('');
    setAccessCode('');
    setIsVerified(false);
    setFiles([]);
    setExpiryDate('');
    setTransferInfo(null);
    toast.info('Form reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-6 md:py-12 px-4 md:px-4">
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
      

      <div className="max-w-5xl mx-auto">

         <div className="gap-3 px-4 py-2  mb-10">
           
          </div>
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Download Files
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-2">
            Access files shared with you securely
          </p>
        </div>

        {/* Main Content */}
        {!isVerified ? (
          /* Authentication section - MOBILE OPTIMIZED */
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <FiLock className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold truncate">Secure Access</h2>
                  <p className="text-gray-500 text-sm md:text-base">Enter link and access code</p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Download link */}
                <div>
                  <label className="block text-sm font-medium mb-2 md:mb-3 text-gray-300">
                    🔗 Download link
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://zartissam.com/download/abc123-def456-ghi789"
                      value={downloadId}
                      onChange={(e) => setDownloadId(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl p-3 md:p-4 pl-10 md:pl-12 text-sm md:text-base focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                    <FiExternalLink className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm md:text-base" />
                    {downloadId && (
                      <button
                        onClick={() => copyToClipboard(downloadId, 'Link copied!')}
                        className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1.5 md:p-2 text-gray-500 hover:text-white transition-colors"
                        title="Copy link"
                      >
                        <FiCopy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Access code */}
                <div>
                  <label className="block text-sm font-medium mb-2 md:mb-3 text-gray-300">
                    Access code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="XXXXXX"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      maxLength="6"
                      className="w-full bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl p-3 md:p-4 text-center text-xl md:text-2xl font-mono tracking-wider md:tracking-widest focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
                    />
                    <FiShield className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm md:text-base" />
                    {accessCode && (
                      <button
                        onClick={() => copyToClipboard(accessCode, 'Code copied!')}
                        className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1.5 md:p-2 text-gray-500 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <FiCopy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 md:mt-2 text-center">
                    Code was shared separately by sender
                  </p>
                </div>

                {/* Verification button */}
                <button
                  onClick={verifyAccess}
                  disabled={isLoading || !downloadId.trim()}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg md:rounded-xl font-semibold text-base md:text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5 md:w-6 md:h-6" />
                      Access files
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security information */}
            <div className="border-t border-gray-800/50 pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <FiAlertCircle className="text-yellow-500 text-sm md:text-base" />
                <h3 className="font-semibold text-sm md:text-base">Important</h3>
              </div>
              
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-green-400 mt-0.5 md:mt-1 text-xs">✓</span>
                  <span className="flex-1">Link is time-limited</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-blue-400 mt-0.5 md:mt-1 text-xs">✓</span>
                  <span className="flex-1">Code shared separately by sender</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-yellow-400 mt-0.5 md:mt-1 text-xs">✓</span>
                  <span className="flex-1">Download before link expires</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-red-400 mt-0.5 md:mt-1 text-xs">✓</span>
                  <span className="flex-1">Contact sender if link expired</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Files section after verification - MOBILE OPTIMIZED */
          <div className="space-y-6 md:space-y-8">
            {/* Back button for mobile */}
            <button
              onClick={resetForm}
              className="md:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to access</span>
            </button>

            {/* Header with information */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 truncate">
                    Available files
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <FiShield className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">By {transferInfo?.uploader || 'Zartissam'}</span>
                    </div>
                    {timeLeft && (
                      <>
                        <span className="text-gray-700 hidden md:inline">•</span>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <FiClock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span className={timeLeft === 'Expired' ? 'text-red-400' : 'text-yellow-400'}>
                            {timeLeft}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-0">
                  <button
                    onClick={downloadAllAsZip}
                    disabled={isDownloading}
                    className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg md:rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 md:gap-3 text-sm md:text-base flex-1 md:flex-none justify-center min-w-0"
                  >
                    {isDownloading && progress.all !== undefined ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                        <span className="truncate">
                          {progress.all === 100 ? 'Completed' : `${Math.min(progress.all, 99)}%`}
                        </span>
                      </>
                    ) : (
                      <>
                        <FiPackage className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span className="truncate">Download all (.zip)</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 md:px-6 md:py-3 bg-gray-800/30 border border-gray-700 rounded-lg md:rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-colors flex items-center gap-1.5 md:gap-2 text-sm md:text-base flex-shrink-0"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden md:inline">New link</span>
                    <span className="md:hidden">New</span>
                  </button>
                </div>
              </div>

              {/* Statistics */}
              {transferInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                    <div className="text-xl md:text-2xl font-bold text-blue-400 mb-0.5 md:mb-1">
                      {transferInfo.fileCount}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 truncate">
                      Files
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                    <div className="text-xl md:text-2xl font-bold text-purple-400 mb-0.5 md:mb-1">
                      {formatFileSize(transferInfo.totalSize)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 truncate">
                      Total size
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                    <div className="text-xl md:text-2xl font-bold text-green-400 mb-0.5 md:mb-1">
                      {transferInfo.remainingDownloads}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 truncate">
                      Remaining
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-800/30 rounded-lg md:rounded-xl">
                    <div className="text-xl md:text-2xl font-bold text-yellow-400 mb-0.5 md:mb-1">
                      {timeLeft === 'Expired' ? 'Expired' : timeLeft}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 truncate">
                      Time left
                    </div>
                  </div>
                </div>
              )}

              {/* File list */}
              <div className="space-y-3 md:space-y-4">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-gray-800/30 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-gray-800/50 transition-colors border border-gray-700/50 group"
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiFile className="text-blue-400 text-sm md:text-base" />
                          {progress[index] !== undefined && (
                            <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">
                              {progress[index] === 100 ? '✓' : `${Math.min(progress[index], 99)}%`}
                            </div>
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-sm md:text-base">{file.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mt-0.5 md:mt-1">
                            <p className="text-xs md:text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                            <span className="text-gray-700 hidden md:inline">•</span>
                            <p className="text-xs md:text-sm text-gray-500 truncate hidden md:block">
                              {file.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                     
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
                      <FiAlertCircle className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                      No files available
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base px-2">
                      Link may have expired or files deleted
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced security information */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-800/50 p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <FiShield className="text-green-400 text-base md:text-xl" />
                Security Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 md:p-5 bg-gray-800/20 rounded-lg md:rounded-xl">
                  <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                      <FiLock className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-sm md:text-base">Secure</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Encrypted with two-factor authentication
                  </p>
                </div>
                
                <div className="p-4 md:p-5 bg-gray-800/20 rounded-lg md:rounded-xl">
                  <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-sm md:text-base">Verified</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Files scanned for viruses
                  </p>
                </div>
                
                <div className="p-4 md:p-5 bg-gray-800/20 rounded-lg md:rounded-xl">
                  <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    </div>
                    <h4 className="font-semibold text-sm md:text-base">Temporary</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Auto-deleted after expiration
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm px-2">
          <p className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
            <span className="flex items-center gap-1.5">
              <FiShield className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              End-to-end encrypted file protection
            </span>
          </p>
          <p className="mt-1 md:mt-2 text-xs md:text-sm">
            Questions? Email: 
            <a href="mailto:contact@zartissam.com" className="text-blue-400 hover:text-blue-300 ml-1">
              contact@zartissam.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileDownload;