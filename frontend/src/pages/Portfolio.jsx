import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Portfolio = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [designsData, setDesignsData] = useState({
    posters: [],
    banners: [],
    brochures: [],
    posts: [],
    logos: [],
    brands: []
  });
  const [vijingProjects, setVijingProjects] = useState([]);
  const [visualAlbums, setVisualAlbums] = useState([]);
  const [loadingVijing, setLoadingVijing] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // URLs API
  const API_BASE_URL = process.env.REACT_APP_API_URL ;

  // Détecter la taille de l'écran pour mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Début du chargement des données depuis:', API_BASE_URL);
        
        // Charger les designs
        console.log('📥 Chargement designs...');
        const designsResponse = await fetch(`${API_BASE_URL}/api/admin/public/designs`);
        console.log('📤 Réponse designs:', designsResponse.status);
        
        if (!designsResponse.ok) {
          console.error('❌ Erreur HTTP designs:', designsResponse.status);
          throw new Error(`HTTP ${designsResponse.status}`);
        }
        
        const designsData = await designsResponse.json();
        console.log('✅ Données designs reçues:', {
          success: designsData.success,
          posters: designsData.designs?.posters?.length || 0,
          banners: designsData.designs?.banners?.length || 0,
          brochures: designsData.designs?.brochures?.length || 0,
          posts: designsData.designs?.posts?.length || 0,
          logos: designsData.designs?.logos?.length || 0,
          brands: designsData.designs?.brands?.length || 0
        });
        
        if (designsData.success) {
          setDesignsData(designsData.designs);
        } else {
          console.error('❌ Success false dans designs:', designsData);
        }

        // Charger les projets VJing
        console.log('📥 Chargement VJing...');
        const vijingResponse = await fetch(`${API_BASE_URL}/api/admin/public/vijing`);
        console.log('📤 Réponse VJing:', vijingResponse.status);
        
        if (!vijingResponse.ok) {
          console.error('❌ Erreur HTTP VJing:', vijingResponse.status);
          throw new Error(`HTTP ${vijingResponse.status}`);
        }
        
        const vijingData = await vijingResponse.json();
        console.log('✅ Données VJing reçues:', {
          success: vijingData.success,
          count: vijingData.vijingProjects?.length || 0
        });
        
        if (vijingData.success) {
          setVijingProjects(vijingData.vijingProjects);
        }
        setLoadingVijing(false);

        // Charger les visual albums
        console.log('📥 Chargement visual albums...');
        const albumsResponse = await fetch(`${API_BASE_URL}/api/admin/public/visual-albums`);
        console.log('📤 Réponse albums:', albumsResponse.status);
        
        if (!albumsResponse.ok) {
          console.error('❌ Erreur HTTP albums:', albumsResponse.status);
          throw new Error(`HTTP ${albumsResponse.status}`);
        }
        
        const albumsData = await albumsResponse.json();
        console.log('✅ Données albums reçues:', {
          success: albumsData.success,
          count: albumsData.albums?.length || 0
        });
        
        if (albumsData.success) {
          setVisualAlbums(albumsData.albums);
        }
        setLoadingAlbums(false);

      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        console.error('❌ Stack trace:', error.stack);
        
        // Fallback: essayez des endpoints alternatifs
        tryFallbackEndpoints();
      } finally {
        setLoading(false);
        console.log('🏁 Chargement terminé');
      }
    };

    const tryFallbackEndpoints = async () => {
      console.log('🔄 Tentative de fallback...');
      
      // Essayer sans le préfixe /admin
      try {
        const designsResponse = await fetch(`${API_BASE_URL}/api/public/designs`);
        if (designsResponse.ok) {
          const data = await designsResponse.json();
          if (data.success) {
            console.log('✅ Fallback designs réussi');
            setDesignsData(data.designs);
          }
        }
      } catch (e) {
        console.error('❌ Fallback designs échoué:', e);
      }
      
      // Essayer VJing sans préfixe
      try {
        const vijingResponse = await fetch(`${API_BASE_URL}/api/public/vijing`);
        if (vijingResponse.ok) {
          const data = await vijingResponse.json();
          if (data.success) {
            console.log('✅ Fallback VJing réussi');
            setVijingProjects(data.vijingProjects);
          }
        }
        setLoadingVijing(false);
      } catch (e) {
        console.error('❌ Fallback VJing échoué:', e);
      }
      
      // Essayer albums sans préfixe
      try {
        const albumsResponse = await fetch(`${API_BASE_URL}/api/public/visual-albums`);
        if (albumsResponse.ok) {
          const data = await albumsResponse.json();
          if (data.success) {
            console.log('✅ Fallback albums réussi');
            setVisualAlbums(data.albums);
          }
        }
        setLoadingAlbums(false);
      } catch (e) {
        console.error('❌ Fallback albums échoué:', e);
      }
    };

    fetchAllData();
  }, []);

  // Gestion de la modale
  const openProjectModal = (project) => {
    setSelectedProject(project);
    setModalAnimating(true);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    setModalAnimating(false);
    setTimeout(() => {
      setModalOpen(false);
      setSelectedProject(null);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  // Fermer la modale avec ESC
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeProjectModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [modalOpen]);

  // Cliquer en dehors pour fermer
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && modalOpen) {
        closeProjectModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalOpen, modalRef]);

  // Détecter la catégorie depuis l'URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else if (hash) {
      setActiveCategory(hash);
    }
  }, [location]);

  // Transformer les données pour le portfolio
  const transformDesignsToPortfolioItems = (designs, category) => {
    return Object.entries(designs).flatMap(([key, items]) => 
      items.map((item, idx) => ({
        id: item.id || `${key}-${idx}`,
        title: item.title || `Design ${idx + 1}`,
        description: item.description || '',
        image: item.image,
        year: new Date(item.uploadedAt || item.createdAt).getFullYear(),
        tags: item.category ? [item.category] : [key],
        category: 'graphics',
        thumbnail: getThumbnailForCategory(key),
        type: key,
        uploadedAt: item.uploadedAt,
        order: item.order || idx,
        originalName: item.originalName,
        size: item.size,
        mimetype: item.mimetype,
        uploadedBy: item.uploadedBy,
        link: item.link,
        client: getClientForCategory(key)
      }))
    );
  };

  const transformVijingToPortfolioItems = (projects) => {
    return projects.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description,
      image: project.image,
      year: new Date(project.createdAt).getFullYear(),
      tags: [project.type],
      category: 'vijing',
      venue: project.venue,
      thumbnail: '✨',
      type: project.type,
      videoUrl: project.videoUrl,
      uploadedAt: project.createdAt,
      client: project.venue,
      technicalDetails: getVijingTechnicalDetails(project.type)
    }));
  };

  const transformAlbumsToPortfolioItems = (albums) => {
    return albums.map(album => ({
      id: album.id,
      title: album.title,
      description: album.description,
      image: album.image,
      year: album.year,
      tags: [album.genre, album.type],
      category: 'visualAlbum',
      artist: album.artist,
      thumbnail: '🎵',
      type: album.type,
      genre: album.genre,
      uploadedAt: album.createdAt,
      client: album.artist,
      duration: 'Album complet',
      featured: album.featured
    }));
  };

  // Helper functions
  const getThumbnailForCategory = (category) => {
    const thumbnails = {
      posters: '🖼️',
      banners: '🚩',
      brochures: '📄',
      posts: '📱',
      logos: '✨',
      brands: '🏢',
      'brand guidelines': '📋'
    };
    return thumbnails[category.toLowerCase()] || '🎨';
  };

  const getClientForCategory = (category) => {
    const clients = {
      posters: 'Creative Agency',
      banners: 'Marketing Firm',
      brochures: 'Corporate Client',
      posts: 'Social Media Brand',
      logos: 'Startup Company',
      brands: 'Enterprise Business'
    };
    return clients[category.toLowerCase()] || 'Confidential Client';
  };

  const getVijingTechnicalDetails = (type) => {
    const details = {
      'Interactive Installation': 'TouchDesigner + Projection Mapping',
      'Stage Design': 'Resolume + MadMapper',
      'Festival Visuals': 'Notch + Real-time Rendering',
      '3D Projection': 'Blender + HeavyM',
      'Video Mapping': 'After Effects + Mapping Tools'
    };
    return details[type] || 'Custom Visual Software';
  };

  // Obtenir tous les items transformés
  const getAllItems = () => {
    const designItems = transformDesignsToPortfolioItems(designsData, 'graphics');
    const vijingItems = transformVijingToPortfolioItems(vijingProjects);
    const albumItems = transformAlbumsToPortfolioItems(visualAlbums);
    
    return [...designItems, ...vijingItems, ...albumItems];
  };

  // Filtrer les items
  useEffect(() => {
    if (loading || loadingVijing || loadingAlbums) return;

    let items = [];
    
    if (activeCategory === 'all') {
      items = getAllItems();
    } else if (activeCategory === 'graphics') {
      items = transformDesignsToPortfolioItems(designsData, 'graphics');
    } else if (activeCategory === 'vijing') {
      items = transformVijingToPortfolioItems(vijingProjects);
    } else if (activeCategory === 'visualAlbum') {
      items = transformAlbumsToPortfolioItems(visualAlbums);
    }

    // Appliquer la recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (item.artist && item.artist.toLowerCase().includes(query)) ||
        (item.venue && item.venue.toLowerCase().includes(query)) ||
        (item.client && item.client.toLowerCase().includes(query))
      );
    }

    // Trier par date (plus récent d'abord)
    items.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    setFilteredItems(items);
  }, [activeCategory, searchQuery, designsData, vijingProjects, visualAlbums, loading, loadingVijing, loadingAlbums]);

  // Catégories dynamiques
  const categories = [
    { 
      id: 'all', 
      label: 'All Projects',
      mobileLabel: 'All',
      color: 'from-gray-600 to-gray-800',
      gradient: 'linear-gradient(135deg, #4B5563 0%, #1F2937 100%)',
      icon: '🌐',
      count: getAllItems().length
    },
    { 
      id: 'graphics', 
      label: 'Graphic Design',
      mobileLabel: 'Graphics',
      color: 'from-purple-600 to-indigo-700',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #3730A3 100%)',
      icon: '🎨',
      count: transformDesignsToPortfolioItems(designsData, 'graphics').length
    },
    { 
      id: 'vijing', 
      label: 'VJing & Mapping',
      mobileLabel: 'VJing',
      color: 'from-blue-600 to-cyan-600',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #0891B2 100%)',
      icon: '✨',
      count: vijingProjects.length
    },
    { 
      id: 'visualAlbum', 
      label: 'Visual Albums',
      mobileLabel: 'Albums',
      color: 'from-rose-600 to-pink-600',
      gradient: 'linear-gradient(135deg, #E11D48 0%, #DB2777 100%)',
      icon: '🎬',
      count: visualAlbums.length
    },
  ];

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === activeCategory) || categories[0];
  };

  // Afficher le statut de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Fonction pour obtenir le layout de grille approprié
  const getGridLayout = () => {
    if (isMobile) {
      return 'grid-cols-1';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  // Fonction pour la hauteur des images
  const getImageHeight = () => {
    if (isMobile) {
      return 'h-48';
    }
    return 'h-64';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <Header />
      
      {/* Mobile Header */}
      <div className="lg:hidden">
        <section className="relative overflow-hidden pt-20 pb-6 px-4 safe-area">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-xs text-gray-300 font-medium">Portfolio</span>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">
                <span className="block text-white mb-1">Creative</span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Portfolio
                </span>
              </h1>
              
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                A curated collection of visual design, motion graphics, and immersive experiences.
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{getAllItems().length} projects • Updated daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Controls */}
        <section className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/30 py-2 px-4 safe-area">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 w-full text-left active:bg-gray-800/70"
                >
                  <span className="text-base">{getCurrentCategory().icon}</span>
                  <span className="font-medium text-sm flex-1">{getCurrentCategory().mobileLabel}</span>
                  <span className="px-1.5 py-0.5 text-xs bg-gray-700 rounded-lg">
                    {getCurrentCategory().count}
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="mb-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 text-xs transition-colors active:bg-gray-800/70 ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900'
                        : 'hover:bg-gray-800/50'
                    } ${cat.id !== 'all' ? 'border-t border-gray-700/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-xs bg-gray-700 rounded-lg">
                        {cat.count}
                      </span>
                      {activeCategory === cat.id && (
                        <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full px-3 py-2.5 pl-10 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-xs"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 active:text-purple-200"
                >
                  Clear
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Navigation Mobile */}
        <section className="py-2 px-4 border-b border-gray-800/30 bg-gray-900/50 safe-area">
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {cat.mobileLabel}
                </span>
                <span className={`px-1 py-0.5 text-2xs rounded ${
                  activeCategory === cat.id ? 'bg-gray-700' : 'bg-gray-800'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Mobile Content */}
        <section className="py-4 px-4 safe-area">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white mb-1">
                {getCurrentCategory().label}
              </h2>
              <p className="text-gray-400 text-xs">
                {activeCategory === 'all' && "All creative projects"}
                {activeCategory === 'graphics' && "Visual design and branding"}
                {activeCategory === 'vijing' && "Live visual performances"}
                {activeCategory === 'visualAlbum' && "Cinematic experiences"}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {filteredItems.length} of {getCurrentCategory().count} projects
                </span>
                {searchQuery && (
                  <span className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded-full text-2xs">
                    "{searchQuery}"
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Grid */}
            <div id="portfolio-grid" className={`grid ${getGridLayout()} gap-3`}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 active:scale-[0.98] transition-transform duration-150 touch-manipulation"
                  onClick={() => openProjectModal(item)}
                >
                  <div className={`relative ${getImageHeight()}`}>
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
                      <span className="text-3xl opacity-50">{item.thumbnail}</span>
                    </div>
                    
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <div className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-full text-2xs font-medium text-white border border-white/10">
                        {item.year}
                      </div>
                      {item.artist && (
                        <div className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-full text-2xs font-medium text-white">
                          {item.artist}
                        </div>
                      )}
                      {item.venue && (
                        <div className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-sm rounded-full text-2xs font-medium text-white">
                          {item.venue}
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1 border border-white/10">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="text-gray-500 text-2xs text-right">
                        {item.artist && <div className="line-clamp-1">{item.artist}</div>}
                        {item.venue && <div className="line-clamp-1">{item.venue}</div>}
                        {item.type && <div className="text-gray-400 text-2xs">{item.type}</div>}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-gray-800/30 text-gray-300 text-2xs rounded-full border border-gray-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-800/30 text-gray-300 text-2xs rounded-full border border-gray-700/50">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-gray-800/30 flex items-center justify-between text-2xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrentCategory().icon}</span>
                        <span className="capitalize">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Tap to view</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-800/50 border border-gray-700/50 mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {searchQuery ? 'No Results' : 'Coming Soon'}
                </h3>
                <p className="text-gray-500 text-xs mb-4 max-w-xs mx-auto">
                  {searchQuery 
                    ? `No projects match "${searchQuery}"`
                    : 'No projects in this category yet'
                  }
                </p>
                {searchQuery && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg border border-gray-700 transition-colors text-xs active:bg-gray-900"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="px-4 py-2 bg-gray-900/50 text-gray-300 rounded-lg border border-gray-800 transition-colors text-xs active:bg-gray-900/70"
                    >
                      View All Projects
                    </button>
                  </div>
                )}
              </div>
            )}

            {filteredItems.length > 3 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700 hover:border-gray-600 transition-all flex items-center gap-1 text-xs active:bg-gray-800/70"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Back to Top
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block">
        <section className="relative overflow-hidden pt-36 pb-24 px-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-10">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                <span className="text-sm text-gray-300 font-medium">Portfolio Showcase</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                <span className="block bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent mb-2">
                  Creative
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Portfolio
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl">
                A curated collection of my finest work in visual design, motion graphics, 
                and immersive experiences. Each project tells a unique story.
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{getAllItems().length} projects</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Updated daily</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Controls */}
        <section className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-2xl border-b border-gray-800/50 py-6 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-8">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group relative px-6 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      activeCategory === cat.id
                        ? 'text-white shadow-xl'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    style={{
                      background: activeCategory === cat.id ? cat.gradient : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredItem(cat.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.label}</span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      activeCategory === cat.id
                        ? 'bg-white/20'
                        : 'bg-gray-800'
                    }`}>
                      {cat.count}
                    </span>
                    
                    {activeCategory === cat.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="w-96">
                <div className={`relative transition-all duration-300 ${
                  isSearchFocused ? 'scale-[1.02]' : ''
                }`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search projects, tags, artists, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onMouseEnter={() => setHoveredItem('search')}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="w-full px-5 py-3.5 pl-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:shadow-2xl focus:shadow-purple-500/10 transition-all duration-300 text-sm"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {searchQuery && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  Found <span className="text-white font-semibold">{filteredItems.length}</span> result{filteredItems.length !== 1 ? 's' : ''}
                  {filteredItems.length > 0 && (
                    <span className="ml-2 text-purple-400">
                      ({Math.round((filteredItems.length / getAllItems().length) * 100)}% match)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  Clear Search
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Desktop Content */}
        <section className="py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    {getCurrentCategory().label}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {activeCategory === 'all' && "A comprehensive collection of all creative endeavors"}
                    {activeCategory === 'graphics' && "Visual identities and graphic design solutions"}
                    {activeCategory === 'vijing' && "Immersive visual performances and installations"}
                    {activeCategory === 'visualAlbum' && "Cinematic audiovisual experiences"}
                  </p>
                </div>
                <div className="text-lg text-gray-400">
                  Showing <span className="text-white font-semibold">{filteredItems.length}</span> of{' '}
                  <span className="text-white font-semibold">{getCurrentCategory().count}</span> projects
                </div>
              </div>
            </div>

            <div id="portfolio-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:transform hover:scale-[1.02]"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => openProjectModal(item)}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 group-hover:opacity-0 transition-opacity duration-500">
                      <span className="text-5xl opacity-20">{item.thumbnail}</span>
                    </div>
                    
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent opacity-70"></div>
                    
                    <div className="absolute top-5 right-5 flex flex-col gap-2">
                      <div className="px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/10">
                        {item.year}
                      </div>
                      {item.artist && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                          {item.artist}
                        </div>
                      )}
                      {item.venue && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                          {item.venue}
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-5 right-5 bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">
                        {item.title}
                      </h3>
                      <div className="text-2xl opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        →
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                      {item.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-5 text-xs text-gray-400">
                      {item.artist && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {item.artist}
                        </div>
                      )}
                      {item.venue && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.venue}
                        </div>
                      )}
                      {item.type && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {item.type}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gray-800/30 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 mb-10">
                  <svg className="w-14 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {searchQuery ? 'No Results Found' : 'Coming Soon'}
                </h3>
                <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
                  {searchQuery 
                    ? `No projects match "${searchQuery}". Try different keywords or browse all categories.`
                    : 'No projects available in this category yet. Check back soon!'
                  }
                </p>
                {searchQuery && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 text-sm font-medium"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-sm font-medium"
                    >
                      View All Projects
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Project Modal */}
      {modalOpen && (
        <>
          <div className={`fixed inset-0 z-50 transition-all duration-500 ${
            modalAnimating ? 'backdrop-blur-md bg-black/70' : 'backdrop-blur-0 bg-black/0'
          }`} onClick={closeProjectModal}></div>
          
          <div 
            ref={modalRef}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
              modalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {selectedProject && (
              <div className={`relative w-full ${
                isMobile ? 'max-w-full max-h-full' : 'max-w-6xl max-h-[90vh]'
              } overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800/50 shadow-2xl shadow-purple-500/10`}>
                {/* Close Button */}
                <button
                  onClick={closeProjectModal}
                  className={`absolute ${
                    isMobile ? 'top-4 right-4 w-8 h-8' : 'top-6 right-6 w-10 h-10'
                  } z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 group`}
                >
                  <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className={`flex ${isMobile ? 'flex-col h-full' : 'flex-row h-full max-h-[90vh]'}`}>
                  {/* Left Side - Main Image */}
                  <div className={`${isMobile ? 'w-full h-48' : 'lg:w-2/3'} relative overflow-hidden bg-gradient-to-br from-gray-950 to-black`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5"></div>
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className={`w-full h-full ${isMobile ? 'object-cover p-4' : 'object-contain p-8 lg:p-12'}`}
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                  </div>

                  {/* Right Side - Details */}
                  <div className={`${isMobile ? 'w-full p-4' : 'lg:w-1/3 p-8 lg:p-12'} overflow-y-auto`}>
                    {/* Header with title and category */}
                    <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>{selectedProject.thumbnail}</span>
                        <div className="flex-1">
                          <h2 className={`${isMobile ? 'text-lg font-bold' : 'text-2xl lg:text-3xl font-bold'} text-white mb-2`}>
                            {selectedProject.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                              {selectedProject.category}
                            </span>
                            <span className="text-gray-500 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{selectedProject.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
                      <h3 className={`${isMobile ? 'text-base font-semibold' : 'text-lg font-semibold'} text-white mb-2 flex items-center gap-2`}>
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Project Description
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {selectedProject.description || 'No detailed description available for this project.'}
                      </p>
                    </div>

                    {/* Client Details */}
                    <div className={`${isMobile ? 'mb-4' : 'mb-8'} bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30`}>
                      <h3 className={`${isMobile ? 'text-base font-semibold' : 'text-lg font-semibold'} text-white mb-3 flex items-center gap-2`}>
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Client Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Client</span>
                          <span className="text-white font-medium text-sm">{selectedProject.client || 'Confidential'}</span>
                        </div>
                        {selectedProject.artist && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Artist</span>
                            <span className="text-white font-medium text-sm">{selectedProject.artist}</span>
                          </div>
                        )}
                        {selectedProject.venue && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Venue</span>
                            <span className="text-white font-medium text-sm">{selectedProject.venue}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Category</span>
                          <span className="text-purple-300 font-medium text-sm capitalize">{selectedProject.type}</span>
                        </div>
                        {selectedProject.technicalDetails && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Technologies</span>
                            <span className="text-blue-300 font-medium text-xs">{selectedProject.technicalDetails}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
                      <h3 className={`${isMobile ? 'text-base font-semibold' : 'text-lg font-semibold'} text-white mb-2 flex items-center gap-2`}>
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tags & Categories
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-3'}`}>
                      <button
                        onClick={() => window.open(selectedProject.image, '_blank')}
                        className={`${isMobile ? 'w-full py-2' : 'flex-1 py-3 px-6'} bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95`}
                      >
                        <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Full Size
                      </button>
                      <button
                        onClick={closeProjectModal}
                        className={`${isMobile ? 'w-full py-2' : 'py-3 px-6'} bg-gray-800/50 text-gray-300 font-medium rounded-xl border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70 transition-all duration-300 active:scale-95`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative animated line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
              </div>
            )}
          </div>
        </>
      )}


      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-enter {
          animation: modalSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .glass-effect {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }

        .touch-manipulation {
          touch-action: manipulation;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 1024px) {
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.3);
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #7C3AED, #DB2777);
            border-radius: 5px;
            border: 2px solid rgba(17, 24, 39, 0.3);
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #8B5CF6, #EC4899);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradientShift 3s ease infinite;
        }

        @media (max-width: 1024px) {
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          img {
            content-visibility: auto;
          }
        }

        @supports (padding: max(0px)) {
          .safe-area {
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .text-2xs {
          font-size: 0.625rem;
          line-height: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default Portfolio;