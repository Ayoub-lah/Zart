  import React, { useState, useEffect, useRef } from 'react'
  import data from '../data.json';
  import Scrollbar from 'smooth-scrollbar';
  import { HiGlobe, HiPencilAlt, HiDeviceMobile, HiShoppingCart, HiPaperAirplane, HiStar, HiLockClosed, HiLightningBolt, HiLightBulb } from 'react-icons/hi';
  import { FaRegSmile, FaSmile, FaRegImage, FaFlag, FaBookOpen, FaInstagram, FaRegGem, FaRegFolderOpen } from 'react-icons/fa';
  import { Link } from 'react-router-dom';
  import VideoCard from '../components/VideoCard';
  import Footer from '../components/Footer';

  import { 
  // Vos imports existants
  FiZap, FiRefreshCw, FiMonitor, FiGlobe, FiLayout, FiImage, FiExternalLink, 
  FiFilm, FiYoutube, FiVideo, FiCpu, FiMessageCircle, FiAperture, 
  FiShoppingCart, FiBookOpen, FiBriefcase, FiFileText, FiTag, FiPlay,
  
  // AJOUTEZ CES NOUVELLES ICÔNES :
  FiCreditCard, FiPackage, FiBook, FiAward, FiShare2, FiFlag, FiStar,
  FiFeather, FiType, FiMessageSquare, FiSend, FiBox, FiHome, FiUser,
  FiMail, FiPhone, FiMapPin, FiCamera, FiMusic, FiHeart, FiSettings,
  FiTool, FiDatabase, FiCloud, FiWifi, FiBluetooth, FiBattery, FiBell,
  FiCalendar, FiClock, FiDollarSign, FiShoppingBag, FiBarChart, FiPieChart,
  FiTrendingUp, FiDownload, FiUpload, FiPrinter, FiHardDrive, FiServer,
  FiCode, FiGitBranch, FiGitCommit, FiGitPullRequest, FiTerminal
  } from 'react-icons/fi';
  // Ajoutez cette ligne avec les autres imports
  import AnimatedCounter from '../components/AnimatedCounter'; // Ajustez le chemin selon votre structure

  // Icon mapping for dynamic rendering
const fiIcons = {
  // Icônes existantes
  FiMonitor,
  FiGlobe,
  FiLayout,
  FiImage,
  FiExternalLink,
  FiFilm,
  FiYoutube,
  FiVideo,
  FiCpu,
  FiMessageCircle,
  FiAperture,
  FiShoppingCart,
  FiBookOpen,
  FiBriefcase,
  FiFileText,
  FiTag,
  FiPlay,
  FiZap,
  
  // Nouvelles icônes ajoutées
  FiCreditCard,
  FiPackage,
  FiBook,
  FiAward,
  FiShare2,
  FiFlag,
  FiStar,
  FiRefreshCw,
  FiFeather,
  FiType,
  FiMessageSquare,
  FiSend,
  FiBox,
  FiHome,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiMusic,
  FiHeart,
  FiSettings,
  FiTool,
  FiDatabase,
  FiCloud,
  FiWifi,
  FiBluetooth,
  FiBattery,
  FiBell,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiDownload,
  FiUpload,
  FiPrinter,
  FiHardDrive,
  FiServer,
  FiCode,
  FiGitBranch,
  FiGitCommit,
  FiGitPullRequest,
  FiTerminal
};

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [scrollY, setScrollY] = useState(0)
    const scrollbarRef = useRef(null)
    const [cubeRotation, setCubeRotation] = useState({ x: -20, y: 30 });
    const [draggingCube, setDraggingCube] = useState(false);
    const lastCubePos = useRef({ x: 0, y: 0 });
    const [clickGlow, setClickGlow] = useState(false);
    const [showContent, setShowContent] = useState(false); // ← AJOUTER CETTE LIGNE
    const [bubble, setBubble] = useState({ x: 175, y: 175, vx: 1.1, vy: 0.8, r: 70 });
    const bubbleBoxRef = useRef(null);
    const bubbleAnimRef = useRef();
    const [mouse, setMouse] = useState({ x: 0, y: 0, inside: false });
    const [cubeClickEffect, setCubeClickEffect] = useState(false);
    const [partnerLogos, setPartnerLogos] = useState([]);
    const [logosLoading, setLogosLoading] = useState(true);
    const [vijingProjects, setVijingProjects] = useState([]);
    const [loadingVijing, setLoadingVijing] = useState(true);
   
    // Ajoutez avec les autres états
const [visualAlbums, setVisualAlbums] = useState([]);
const [loadingVisualAlbums, setLoadingVisualAlbums] = useState(true);
  
    

    // Fonction pour naviguer vers le portfolio avec une catégorie spécifique
  const navigateToPortfolio = (category) => {
  // Utiliser l'API History pour changer l'URL sans recharger
  window.history.pushState(null, '', `/portfolio#${category}`);
    window.location.href = `/portfolio?category=${category}`;

  // Déclencher un événement personnalisé pour notifier le changement d'URL
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  // Optionnel: Forcer le rechargement si nécessaire
  // window.location.href = `/portfolio#${category}`;
};

 const [designsData, setDesignsData] = useState({
    posters: [],
    banners: [],
    brochures: [],
    posts: [],
    logos: [],
    brands: []
  });
  const [loadingDesigns, setLoadingDesigns] = useState(true);


    // Ajoutez ces états avec les autres useState
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: '',
  message: ''
});
const [isSubmitting, setIsSubmitting] = useState(false);

// État pour les designs

useEffect(() => {
  console.log('🏁 useEffect - Chargement des données');
  fetchDesigns();
  fetchVijingProjects();
  fetchPartnerLogos();
  fetchVisualAlbums(); // ← AJOUTER CETTE LIGNE
}, []);

const fetchVisualAlbums = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/visual-albums`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      setVisualAlbums(data.albums || []);
    }
  } catch (error) {
    console.error('❌ Erreur Albums:', error);
    setVisualAlbums([]);
  }
};

useEffect(() => {
  console.log('🔍 État actuel de vijingProjects:', {
    count: vijingProjects.length,
    projects: vijingProjects,
    loading: loadingVijing
  });
}, [vijingProjects, loadingVijing]);



// Ajoutez aussi un useEffect pour surveiller les changements
useEffect(() => {
  console.log('📊 vijingProjects mis à jour:', {
    count: vijingProjects.length,
    data: vijingProjects
  });
}, [vijingProjects]);



const fetchDesigns = async () => {
  try {
    // ❌ ACTUEL (ERREUR)
    // `${API_BASE_URL}/api/admin/public/designs`
    
    // ✅ CORRIGÉ
    const response = await fetch(`${API_BASE_URL}/api/admin/public/designs`);
    // OU ALTERNATIVEMENT (si vous avez ajouté la route dans index.js)
    // const response = await fetch(`${API_BASE_URL}/api/public/designs`);
    
    const data = await response.json();
    console.log('✅ Designs chargés:', data);
    
    if (data.success) {
      setDesignsData(data.designs);
    }
  } catch (error) {
    console.error('❌ Erreur designs:', error);
  }
};

const fetchVijingProjects = async () => {
  try {
    // ❌ ACTUEL: https://zart.onrender.com//api/public/vijing
    // ✅ CORRIGÉ: https://zart.onrender.com/api/public/vijing
    const response = await fetch(`${API_BASE_URL}/api/public/vijing`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      setVijingProjects(data.vijingProjects || []);
    }
  } catch (error) {
    console.error('❌ Erreur VJing:', error);
    setVijingProjects([]);
  }
};



// Ajoutez cette fonction pour tester les URLs d'images
const testImageUrls = async () => {
  if (vijingProjects.length > 0) {
    console.log('🧪 Test des URLs d\'images...');
    
    for (const project of vijingProjects.slice(0, 2)) {
      if (project.image) {
        console.log(`Test image: ${project.image}`);
        
        // Créer une image pour tester
        const img = new Image();
        img.onload = () => console.log(`✅ Image chargée: ${project.image}`);
        img.onerror = () => console.error(`❌ Erreur image: ${project.image}`);
        img.src = project.image;
      }
    }
  }
};

// Appelez après que les projets sont chargés
useEffect(() => {
  if (vijingProjects.length > 0) {
    testImageUrls();
  }
}, [vijingProjects]);

 const designCategories = [
    { 
      key: 'posters', 
      name: 'Posters', 
      data: designsData.posters, 
      icon: <FaRegImage className="text-white text-lg" /> 
    },
    { 
      key: 'banners', 
      name: 'Banners', 
      data: designsData.banners, 
      icon: <FaFlag className="text-white text-lg" /> 
    },
    { 
      key: 'brochures', 
      name: 'Brochure & Flyers', 
      data: designsData.brochures, 
      icon: <FaBookOpen className="text-white text-lg" /> 
    },
    { 
      key: 'posts', 
      name: 'Post Designs', 
      data: designsData.posts, 
      icon: <FaInstagram className="text-white text-lg" /> 
    },
    { 
      key: 'logos', 
      name: 'Logo Designs', 
      data: designsData.logos, 
      icon: <FaRegGem className="text-white text-lg" /> 
    },
    { 
      key: 'brands', 
      name: 'Brand Guidelines', 
      data: designsData.brands, 
      icon: <FaRegFolderOpen className="text-white text-lg" /> 
    },
  ];




// Fonction de soumission du formulaire
// Dans ton Home.jsx - fonction handleSubmit améliorée
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('🔄 Soumission formulaire...');
  setIsSubmitting(true);

  try {
    // ❌ ACTUEL: http://localhost:5000
    // ✅ CORRIGÉ: Utiliser API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/api/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      toast.success('✅ Message envoyé avec succès !');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } else {
      toast.error(data.message || '❌ Erreur d\'envoi');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    toast.error('❌ Erreur de connexion au serveur');
  } finally {
    setIsSubmitting(false);
  }
};
    

// Vérifier si c'est le premier chargement de la session
useEffect(() => {
  const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
  
  if (hasSeenLoading === 'true') {
    // Si l'utilisateur a déjà vu l'écran de chargement dans cette session
    setLoading(false);
    setShowContent(true);
  } else {
    // Premier chargement - afficher l'écran de chargement
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('hasSeenLoading', 'true');
            setTimeout(() => setShowContent(true), 100);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }
}, []);



    useEffect(() => {
      let listener;
      if (window.innerWidth > 640 && scrollbarRef.current) {
        // Desktop: use Smooth Scrollbar
        const instance = scrollbarRef.current;
        listener = ({ offset }) => setScrollY(offset.y);
        instance.addListener(listener);
        setScrollY(instance.offset.y);
        return () => instance.removeListener(listener);
      } else {
        // Mobile: use native scroll
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        setScrollY(window.scrollY);
        return () => window.removeEventListener('scroll', handleScroll);
      }
    }, []);

    // Helper to get container height for triggers
    const container = typeof window !== 'undefined' ? document.getElementById('scroll-container') : null;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    function handleCubeMouseDown(e) {
      setDraggingCube(true);
      lastCubePos.current = { x: e.clientX, y: e.clientY };
    }

    function handleCubeMouseMove(e) {
      if (!draggingCube) return;
      const dx = e.clientX - lastCubePos.current.x;
      const dy = e.clientY - lastCubePos.current.y;
      setCubeRotation(r => ({ x: r.x + dy * 0.7, y: r.y + dx * 0.7 }));
      lastCubePos.current = { x: e.clientX, y: e.clientY };
    }

    function handleCubeMouseUp() {
      setDraggingCube(false);
    }

  const handleCubeMouseEnter = () => {
    // Animation automatique au survol
    setCubeRotation(r => ({ 
      x: r.x + 180, 
      y: r.y + 180 
    }));
  };

  // Réinitialiser l'état de chargement quand on quitte la page
useEffect(() => {
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('hasSeenLoading');
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);

  // Ajouter cet useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCubeRotation(r => ({
        x: r.x + 0.5,
        y: r.y + 0.5
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

    useEffect(() => {
  if (draggingCube) {
    window.addEventListener('mousemove', handleCubeMouseMove);
    window.addEventListener('mouseup', handleCubeMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleCubeMouseMove);
      window.removeEventListener('mouseup', handleCubeMouseUp);
    };
  }
}, [draggingCube]);

    function handleClickBox() {
      setClickGlow(g => !g);
    }

    // Réinitialiser l'état de chargement quand on quitte la page
useEffect(() => {
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('hasSeenLoading');
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);

useEffect(() => {
  fetchPartnerLogos();
}, []);

const fetchPartnerLogos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-logos`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      setPartnerLogos(data.logos || []);
    }
  } catch (error) {
    console.error('❌ Erreur Logos:', error);
    setPartnerLogos([]);
  }
};

  if (loading) {
  return (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 gap-8">
          {/* Video above progress bar */}
          <video 
            className="w-24 md:w-32 h-auto"
            autoPlay 
            muted 
            loop
            playsInline
          >
            <source src="ZART.mp4" type="video/mp4" />
          </video>
          
          {/* Progress Bar - Version courte et responsive */}
          <div className="w-48 md:w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
  className="h-full bg-gray-400 transition-all duration-300 ease-out"
  style={{ width: `${Math.min(progress, 100)}%` }}
  />
          </div>
        </div>
      );
    }


    return (
        <div 
        id="scroll-container" 
        className={`relative w-full min-h-screen transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {clickGlow && (
          <span
            className="pointer-events-none absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
            style={{
              zIndex: 0,
              width: '1200px',
              height: '1200px',
              background: 'radial-gradient(circle,rgba(169, 85, 247, 1) 1%,rgba(169, 85, 247, 0.41) 25%,rgba(124, 58, 237, 0.16) 50%, rgba(169, 85, 247, 0.03) 80%, transparent 100%)',
              filter: 'blur(80px)',
              opacity: 1,
              transition: 'opacity 0.5s',
              pointerEvents: 'none',
            }}
          />
        )}
        {/* <Header /> */}

        <section 
          id="home" 
          className={`min-h-screen flex items-center justify-center w-full flex-col relative overflow-hidden transition-all duration-700 delay-300 px-4 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >       
          {/* Glow effect responsive */}
          <div className='absolute top-[-4rem] sm:top-[-6rem] md:top-[-9rem] left-1/2 -translate-x-1/2 w-[85vw] sm:w-[70vw] md:w-[60vw] h-[25vh] sm:h-[40vh] md:h-[50vh] bg-gradient-to-b from-blue-500/90 via-blue-400/10 to-blue-200/5 blur-lg sm:blur-xl md:blur-2xl pointer-events-none z-0 rounded-full'></div>
          
          <p className='mt-4 sm:mt-5 font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-blue-100 to-blue-600 mb-0 z-10 text-xs sm:text-sm md:text-base text-center'>
            Design in Details
          </p>
          
          <video
            src="/Portfolio.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={`mt-2 w-full max-w-[320px] sm:max-w-md md:max-w-xl rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg md:shadow-2xl z-10 transition-all duration-1000 delay-500 ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </section>

       {/* ABOUT ME  */}
<section 
  id="about"
  className={`mt-14 h-screen flex items-center justify-center w-full flex-col relative transition-all duration-700 delay-500 ${
    showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  }`}
>
    
    {/* Background Images with Scroll Animation */}
    <div className='absolute inset-0 z-0 overflow-hidden '>
      {/* First Row - Slides Right */}
      <div
        className='absolute top-0 left-0 w-[200%] h-1/3 flex gap-4 z-0'
        style={{
          transform: `translateX(${Math.min(scrollY * 0.3, 500)}px)`,
          opacity: Math.min(scrollY / 200, 0.7)
        }}
      >
        {[
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop'
        ].map((image, index) => (
          <img
            key={`row1-${index}`}
            src={image}
            alt={`Design work ${index + 1}`}
            className='h-[30vh] w-[250px] sm:w-[20vw] rounded-lg flex-shrink-0 object-cover'
          />
        ))}
      </div>
      
      {/* Second Row - Slides Left */}
      <div
        className='absolute top-1/3 right-0 w-[200%] h-1/3 flex gap-4 justify-end z-0'
        style={{
          transform: `translateX(${-Math.min(scrollY * 0.3, 500)}px)`,
          opacity: scrollY > 150 ? Math.min((scrollY - 150) / 300, 0.8) : 0
        }}
      >
        {[
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1609921141835-710b7fa6e438?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1609921141835-710b7fa6e438?w=400&h=300&fit=crop'
        ].map((image, index) => (
          <img
            key={`row2-${index}`}
            src={image}
            alt={`Creative work ${index + 7}`}
            className='h-[30vh] w-[250px] sm:w-[20vw] rounded-lg flex-shrink-0 object-cover'
          />
        ))}
      </div>
      
      {/* Third Row - Slides Right */}
      <div
        className='absolute bottom-0 left-0 w-[200%] h-1/3 flex gap-4 z-0'
        style={{
          transform: `translateX(${Math.min(scrollY * 0.3, 500)}px)`,
          opacity: scrollY > 250 ? Math.min((scrollY - 250) / 300, 0.8) : 0
        }}
      >
        {[
          'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1600132806608-231446b2e7af?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'
        ].map((image, index) => (
          <img
            key={`row3-${index}`}
            src={image}
            alt={`Portfolio work ${index + 13}`}
            className='h-[30vh] w-[250px] sm:w-[20vw] rounded-lg flex-shrink-0 object-cover'
          />
        ))}
      </div>
      
      {/* Black Overlay above images, below text */}
      <div className='absolute inset-0 bg-black/70 z-20 pointer-events-none'></div>
      
      {/* Circular Black Overlay */}
      <div 
        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[65vw] h-[65vw] pointer-events-none z-20'
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 70%)'
        }}
      ></div>
    </div>

    {/* Bluish Glow on About Section - appears based on scroll */}
    <div
      className='absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[60vw] h-[70vh] bg-gradient-to-b from-blue-500/90 via-blue-400/10 to-blue-200/5 blur-2xl pointer-events-none z-0 rounded-full transition-opacity duration-1000'
      style={{
        opacity: scrollY > containerHeight * 0.5 ? Math.min((scrollY - containerHeight * 0.5) / (containerHeight * 0.3), 1) : 0
      }}
    ></div>
    
    {/* Desktop: Show photo1.png */}
    <img 
      src="/photo1.png" 
      alt="photo" 
      className="hidden sm:block w-[100%] h-[100%] sm:w-[900px] sm:h-[900px] mb-4 sm:mb-9 z-30 object-contain"
    />
    
    {/* Mobile: Show aboutMo.png */}
   {/* Mobile: Show aboutMo.png - translated to the right */}
<img 
  src="/aboutMo.png" 
  alt="photo" 
  className="block sm:hidden w-[100%] h-[100%] mb-4 sm:mb-9 z-30 object-contain transform translate-x-4"
/>
    
    <p className='font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-blue-100 to-blue-600 mb-3 sm:mb-4 z-30 text-sm sm:text-base'>About Me</p>
    <p className='text-white text-2xl sm:text-4xl poppins-font font-semibold  sm:mb-3 z-30'>Hi There!</p>
    
    {/* Images pour desktop et mobile */}
    <img 
      src="/AboutMe.png" 
      alt="About Me Desktop" 
      className="hidden sm:block w-[100%] h-[100%] sm:w-[900px] sm:h-[900px] mb-4 sm:mb-6 z-30 object-contain px-4 sm:px-0"
    />
    <img 
      src="/aboutMobile.png" 
      alt="About Me Mobile" 
      className="block sm:hidden w-[100%] h-[100%] mb-4 sm:mb-2 z-30 object-contain px-4 sm:px-0"
    />
    
    <p className='text-white text-xs text-gray-400 roboto-font mb-2 z-30'>Want to know more about me?</p>
    <p className='text-white  roboto-font text-xs sm:text-sm z-30'>Let's Connect | Blog</p>
</section>

        {/* SKILLS  */}
        <section 
  id="designs"
  className='mt-20 mb-52 sm:mb-20 sm:mt-20 sm:h-screen flex items-center justify-center w-full flex-col relative leading-[50px] sm:leading-[100px]'
>          {[
            { label: 'Art Director', scrollText: 'Art Director' },
            { label: 'graphic design', scrollText: 'View Designs' },
            { label: 'Vjing & Mapping', scrollText: 'View Vjing & Mapping' },
            { label: 'Visual album', scrollText: 'View Visual Album' },
            { label: 'A lot more', scrollText: 'View More' },
          ].map((skill, idx) => (
            <div key={skill.label} className='relative group w-full flex justify-center items-center'>
              {/* Scrolling strip on hover */}
              <div className='pointer-events-none select-none absolute left-1/2 top-0 -translate-x-1/2 w-full h-[100px] backdrop-blur-sm overflow-hidden z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='flex items-center h-full animate-scroll-strip whitespace-nowrap bg-black/70 min-w-[200%]'>
                  {[...Array(24)].map((_, i) => (
                    <span key={i} className='text-white text-base font-light mx-6 tracking-widest font-monospace'>[{skill.scrollText}]</span>
                  ))}
                </div>
              </div>
              <div className='text-[#f5f5f5] cursor-pointer text-[3rem] sm:text-[6.5rem] oswald-font tracking-tighter font-semibold z-30 uppercase'>{skill.label}</div>
            </div>
          ))}
        </section>

    

  {/* GRAPHIC DESIGNS - DYNAMIQUE */}
<section id='designs' className='flex items-center mt-32 w-full flex-col relative overflow-hidden'>
  <p className='font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-yellow-300 mb-4 z-10'>
    Graphic Design
  </p>
  <p className='text-white poppins-font text-lg sm:text-3xl mb-2'>
    Capture, Communicate, and Connect.
  </p>
  <p className='text-gray-400 roboto-font sm:w-[40%] px-4 sm:px-0 text-sm sm:text-lg text-center'>
    As a Graphic Designer specializing in creating visual identities and impactful graphic content, I support brands, companies, and artists in designing strong, modern, and consistent visuals.
  </p>

  <div className='flex mt-20 w-full px-4 sm:px-16 items-center justify-between'>
    <p className='text-white text-left poppins-font sm:text-lg'>Featured Designs</p>
    <button 
      className='flex items-center gap-2 text-green-600 poppins-font text-sm sm:text-base transition hover:text-green-400'
      onClick={() => navigateToPortfolio('graphics')}
    >
      All Graphics <span className='text-2xl'>&rarr;</span>
    </button>
  </div>

  {/* Grille dynamique des designs - UTILISE designsData AU LIEU DE data */}
  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 px-4 sm:px-16 mt-5">
    {[
      { name: 'Posters', key: 'posters', icon: <FaRegImage className="text-white text-lg mr-2" /> },
      { name: 'Banners', key: 'banners', icon: <FaFlag className="text-white text-lg mr-2" /> },
      { name: 'Brochure & Flyers', key: 'brochures', icon: <FaBookOpen className="text-white text-lg mr-2" /> },
      { name: 'Post Designs', key: 'posts', icon: <FaInstagram className="text-white text-lg mr-2" /> },
      { name: 'Logo Designs', key: 'logos', icon: <FaRegGem className="text-white text-lg mr-2" /> },
      { name: 'Brand Guidelines', key: 'brands', icon: <FaRegFolderOpen className="text-white text-lg mr-2" /> },
    ].map((box) => (
      <Link 
        to="/portfolio" 
        key={box.key} 
        className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col cursor-pointer transition-transform duration-200 hover:border-gray-600"
      >
        <div className="flex items-center mb-2">
          {box.icon}
          <span className="text-white roboto-font">{box.name}</span>
          {/* Afficher le nombre d'items */}
          <span className="ml-auto mr-4 text-xs text-gray-500">
            {designsData[box.key]?.length || 0} items
          </span>
        </div>
        <div className="flex flex-row gap-4 hide-scrollbar h-[120px] sm:h-[140px] overflow-hidden">
          {designsData[box.key] && designsData[box.key].length > 0 ? (
            designsData[box.key].slice(0, 5).map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex-shrink-0 w-[190px] sm:w-[260px] sm:h-[200px] rounded sm:rounded-2xl overflow-hidden relative transition-all duration-500"
                style={{
                  marginLeft: idx === 0 ? 0 : '-105px',
                  zIndex: 10 + idx,
                  boxShadow: '0 8px 42px 5px rgba(0, 0, 0, 0.88), 0 2px 8px 0 rgba(0, 0, 0, 0.9)',
                  transition: 'margin-left 0.3s',
                }}
                onMouseEnter={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-80px';
                }}
                onMouseLeave={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-105px';
                }}
              >
                <img
                  src={item.image}
                  alt={item.title || box.name}
                  className="object-cover w-full h-full rounded sm:rounded-xl bg-gray-500"
                  style={{ boxShadow: '10px 8px 12px 5px rgb(0, 0, 0), 0 2px 8px 0 rgb(0, 0, 0)' }}
                  onError={(e) => {
                    console.error('Erreur chargement image:', item.image);
                    e.target.src = '/placeholder.png'; // Image de fallback
                  }}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
              No designs available
            </div>
          )}
        </div>
      </Link>
    ))}
  </div>
</section>

{/* VIJING MAPPING - Unified Design with Overlapping Cards + Stats + Interactive Boxes */}
<section className='flex items-center mt-20 sm:mt-32 w-full flex-col relative overflow-hidden'>
  {/* Header */}
  <p className='font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 mb-4 z-10 text-sm sm:text-base'>
    VJing & Mapping
  </p>
  
  <p className='text-white poppins-font text-xl sm:text-3xl mb-2 z-10 text-center px-4'>
    Visual Storytelling in Motion.
  </p>
  
  <p className='text-gray-400 roboto-font w-full sm:w-[40%] px-4 sm:px-0 text-sm sm:text-lg text-center z-10'>
    As a VJ and projection mapping artist, I create real-time visuals that sync with music and light to elevate concerts and events. By combining dynamic 2D/3D animations with precise projection mapping, I transform stages, buildings, and objects into immersive, living visual experiences.
  </p>

  {/* Section Header with View All button */}
  <div className='flex mt-12 sm:mt-20 w-full px-4 sm:px-16 items-center justify-between z-10'>
    <p className='text-white text-left poppins-font text-base sm:text-lg'>
      Featured Projects
    </p>
    <button 
      className='flex items-center gap-1 sm:gap-2 text-purple-500 poppins-font text-xs sm:text-base transition hover:text-purple-400'
      onClick={() => navigateToPortfolio('vijing')}
    >
      All Projects <span className='text-lg sm:text-2xl'>&rarr;</span>
    </button>
  </div>

  {/* GRID DYNAMIQUE - Style Graphic Designs avec cartes qui se chevauchent */}
  {loadingVijing ? (
    // Skeleton loading
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 px-4 sm:px-16 mt-5">
      {[1, 2, 3, 4].map((_, idx) => (
        <div key={idx} className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col h-[200px] animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"></div>
          <div className="flex flex-row gap-4 h-full">
            <div className="h-32 w-48 bg-gray-800 rounded"></div>
            <div className="h-32 w-48 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 px-4 sm:px-16 mt-5">
      {/* Box 1: Live VJing Projects */}
      <div className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col cursor-pointer transition-transform duration-200 hover:border-purple-500/50">
        <div className="flex items-center mb-2">
          <FiVideo className="text-purple-400 text-lg mr-2" />
          <span className="text-white roboto-font">Live VJing</span>
          <span className="ml-auto mr-4 text-xs text-gray-500">
            {vijingProjects.filter(p => p.type === 'Live VJing').length} projects
          </span>
        </div>
        <div className="flex flex-row gap-4 hide-scrollbar h-[120px] sm:h-[140px] overflow-hidden pb-4">
          {vijingProjects
            .filter(p => p.type === 'Live VJing')
            .slice(0, 5)
            .map((project, idx) => (
              <div
                key={project.id}
                className="flex-shrink-0 w-[190px] sm:w-[260px] h-[100px] sm:h-[120px] rounded sm:rounded-2xl overflow-hidden relative transition-all duration-500 group"
                style={{
                  marginLeft: idx === 0 ? 0 : '-105px',
                  zIndex: 10 + idx,
                  boxShadow: '0 8px 42px 5px rgba(0, 0, 0, 0.88), 0 2px 8px 0 rgba(0, 0, 0, 0.9)',
                  transition: 'margin-left 0.3s',
                }}
                onMouseEnter={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-80px';
                }}
                onMouseLeave={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-105px';
                }}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="object-cover w-full h-full rounded sm:rounded-xl bg-gray-800 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop';
                  }}
                />
                {/* Overlay avec nom du projet */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{project.name}</p>
                  <p className="text-purple-300 text-[10px]">{project.venue}</p>
                </div>
              </div>
            ))}
          {vijingProjects.filter(p => p.type === 'Live VJing').length === 0 && (
            <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
              No Live VJing projects
            </div>
          )}
        </div>
      </div>

      {/* Box 2: Video Mapping Projects */}
      <div className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col cursor-pointer transition-transform duration-200 hover:border-purple-500/50">
        <div className="flex items-center mb-2">
          <FiMonitor className="text-purple-400 text-lg mr-2" />
          <span className="text-white roboto-font">Video Mapping</span>
          <span className="ml-auto mr-4 text-xs text-gray-500">
            {vijingProjects.filter(p => p.type === 'Video Mapping' || p.type === 'Architectural Mapping' || p.type === '3D Projection').length} projects
          </span>
        </div>
        <div className="flex flex-row gap-4 hide-scrollbar h-[120px] sm:h-[140px] overflow-hidden pb-4">
          {vijingProjects
            .filter(p => ['Video Mapping', 'Architectural Mapping', '3D Projection'].includes(p.type))
            .slice(0, 5)
            .map((project, idx) => (
              <div
                key={project.id}
                className="flex-shrink-0 w-[190px] sm:w-[260px] h-[100px] sm:h-[120px] rounded sm:rounded-2xl overflow-hidden relative transition-all duration-500 group"
                style={{
                  marginLeft: idx === 0 ? 0 : '-105px',
                  zIndex: 10 + idx,
                  boxShadow: '0 8px 42px 5px rgba(0, 0, 0, 0.88), 0 2px 8px 0 rgba(0, 0, 0, 0.9)',
                  transition: 'margin-left 0.3s',
                }}
                onMouseEnter={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-80px';
                }}
                onMouseLeave={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-105px';
                }}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="object-cover w-full h-full rounded sm:rounded-xl bg-gray-800 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{project.name}</p>
                  <p className="text-purple-300 text-[10px]">{project.venue}</p>
                </div>
              </div>
            ))}
          {vijingProjects.filter(p => ['Video Mapping', 'Architectural Mapping', '3D Projection'].includes(p.type)).length === 0 && (
            <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
              No Mapping projects
            </div>
          )}
        </div>
      </div>

      {/* Box 3: Stage Design & Festival */}
      <div className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col cursor-pointer transition-transform duration-200 hover:border-purple-500/50">
        <div className="flex items-center mb-2">
          <FiAperture className="text-purple-400 text-lg mr-2" />
          <span className="text-white roboto-font">Stage & Festival</span>
          <span className="ml-auto mr-4 text-xs text-gray-500">
            {vijingProjects.filter(p => p.type === 'Stage Design' || p.type === 'Festival Visuals' || p.type === 'Concert Visuals').length} projects
          </span>
        </div>
        <div className="flex flex-row gap-4 hide-scrollbar h-[120px] sm:h-[140px] overflow-hidden pb-4">
          {vijingProjects
            .filter(p => ['Stage Design', 'Festival Visuals', 'Concert Visuals'].includes(p.type))
            .slice(0, 5)
            .map((project, idx) => (
              <div
                key={project.id}
                className="flex-shrink-0 w-[190px] sm:w-[260px] h-[100px] sm:h-[120px] rounded sm:rounded-2xl overflow-hidden relative transition-all duration-500 group"
                style={{
                  marginLeft: idx === 0 ? 0 : '-105px',
                  zIndex: 10 + idx,
                  boxShadow: '0 8px 42px 5px rgba(0, 0, 0, 0.88), 0 2px 8px 0 rgba(0, 0, 0, 0.9)',
                  transition: 'margin-left 0.3s',
                }}
                onMouseEnter={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-80px';
                }}
                onMouseLeave={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-105px';
                }}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="object-cover w-full h-full rounded sm:rounded-xl bg-gray-800 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{project.name}</p>
                  <p className="text-purple-300 text-[10px]">{project.venue}</p>
                </div>
              </div>
            ))}
          {vijingProjects.filter(p => ['Stage Design', 'Festival Visuals', 'Concert Visuals'].includes(p.type)).length === 0 && (
            <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
              No Stage/Festival projects
            </div>
          )}
        </div>
      </div>

      {/* Box 4: Interactive Installation */}
      <div className="bg-black/90 rounded-lg sm:rounded-2xl border border-gray-800 pt-4 pl-4 overflow-hidden relative flex flex-col cursor-pointer transition-transform duration-200 hover:border-purple-500/50">
        <div className="flex items-center mb-2">
          <FiCpu className="text-purple-400 text-lg mr-2" />
          <span className="text-white roboto-font">Interactive</span>
          <span className="ml-auto mr-4 text-xs text-gray-500">
            {vijingProjects.filter(p => p.type === 'Interactive Installation').length} projects
          </span>
        </div>
        <div className="flex flex-row gap-4 hide-scrollbar h-[120px] sm:h-[140px] overflow-hidden pb-4">
          {vijingProjects
            .filter(p => p.type === 'Interactive Installation')
            .slice(0, 5)
            .map((project, idx) => (
              <div
                key={project.id}
                className="flex-shrink-0 w-[190px] sm:w-[260px] h-[100px] sm:h-[120px] rounded sm:rounded-2xl overflow-hidden relative transition-all duration-500 group"
                style={{
                  marginLeft: idx === 0 ? 0 : '-105px',
                  zIndex: 10 + idx,
                  boxShadow: '0 8px 42px 5px rgba(0, 0, 0, 0.88), 0 2px 8px 0 rgba(0, 0, 0, 0.9)',
                  transition: 'margin-left 0.3s',
                }}
                onMouseEnter={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-80px';
                }}
                onMouseLeave={e => {
                  if (idx !== 0) e.currentTarget.style.marginLeft = '-105px';
                }}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="object-cover w-full h-full rounded sm:rounded-xl bg-gray-800 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{project.name}</p>
                  <p className="text-purple-300 text-[10px]">{project.venue}</p>
                </div>
              </div>
            ))}
          {vijingProjects.filter(p => p.type === 'Interactive Installation').length === 0 && (
            <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
              No Interactive projects
            </div>
          )}
        </div>
      </div>
    </div>
  )}

 

  {/* INTERESTING LAYOUT BOXES - Intégrées depuis la deuxième section */}
  <div className='w-full px-4 sm:px-16 flex flex-col sm:flex-row gap-3 sm:gap-2 mt-8 sm:mt-8 z-10'>
    {/* Mobile: Stack vertically, Desktop: flex row */}
    <div className='flex flex-col w-full sm:w-3/4 gap-3 sm:gap-2'>
      {/* Row 1 - Mobile: stack, Desktop: flex */}
      <div className='flex flex-col sm:flex-row w-full gap-3 sm:gap-2'>
        {/* Icon Grid Box */}
        <div className='border border-gray-800 rounded-lg sm:rounded-xl h-40 sm:h-60 flex items-center justify-center p-2 bg-black w-full sm:w-[66.8%] z-10'>
          <div className='w-full h-full grid grid-cols-4 grid-rows-2 gap-0'>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-b border-gray-800 rounded-tl icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiVideo />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-b border-gray-800 icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiMonitor />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-b border-gray-800 icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiAperture />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-b border-gray-800 rounded-tr icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiFilm />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-gray-800 rounded-bl icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiYoutube />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-gray-800 icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiCpu />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black border-r border-gray-800 icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiZap />
            </div>
            <div className='flex items-center justify-center text-xl sm:text-3xl text-gray-500 bg-black rounded-br icon-glow hover:text-purple-400 transition-all duration-300 cursor-pointer'>
              <FiPlay />
            </div>
          </div>
        </div>
        
        {/* Category Selector with Spline Animation */}
        <div className='border border-gray-800 rounded-lg sm:rounded-xl h-28 sm:h-60 bg-black p-3 sm:p-4 flex flex-col justify-between w-full sm:w-[30%] z-10 relative overflow-hidden'>
          {/* Spline Animation Background */}
          <div className="absolute inset-0 w-full h-full opacity-70">
            <iframe 
              src="https://my.spline.design/glowingroadtkw16-rWynvsQbjrjkkqG4DzNZF90W/?storefront=envato-elements"
              className="w-full h-full"
              frameBorder="0"
              title="ST35 Hyperoptimized 3D Animation"
            />
          </div>
        </div>
      </div>
      
      {/* Row 2 - Hidden on mobile, visible on desktop */}
      <div className='hidden md:flex w-full gap-2 z-10'>
        <div className='border border-gray-800 rounded-lg sm:rounded-xl h-40 sm:h-60 bg-black p-4 flex flex-col justify-center items-center w-full sm:w-[30%] z-10'>
          {/* Pyramid Loader */}
          <div className="pyramid-loader">
            <div className="wrapper">
              <span className="side side1"></span>
              <span className="side side2"></span>
              <span className="side side3"></span>
              <span className="side side4"></span>
              <span className="shadow"></span>
            </div>  
          </div>
        </div>
        
        <div className='border border-gray-800 rounded-xl h-60 p-4 sm:p-7 flex flex-col z-10' style={{ width: '66.8%' }}>
          <p className='text-white text-sm sm:text-base poppins-font mb-3 sm:mb-4'>
            Animation and Effects
          </p>
          <div className='w-full flex flex-col sm:flex-row gap-2 sm:gap-4 h-full'>
            {['Hover', 'Click', 'Loop', 'Drag'].map((label, idx) => (
              <div
                key={label}
                className={`flex-1 border border-gray-800 rounded-lg h-16 sm:h-full flex flex-col items-center justify-between py-2 sm:py-4${idx === 0 ? ' group' : ''} z-10`}
                {...(idx === 1 ? { onClick: handleClickBox, style: { position: 'relative', cursor: 'pointer', overflow: 'visible' } } : {})}
              >
                <div className="flex-1 flex items-center justify-center" style={{ width: '100%' }}>
                  {idx === 0 && (
                    <FaSmile className='text-3xl sm:text-6xl text-white animate-spin-slow mb-1 sm:mb-2 emoji-hover' />
                  )}
                  {idx === 1 && (
                    <>
                      <svg 
                        className={`text-3xl sm:text-6xl mb-1 sm:mb-2 transition-all duration-300 ${clickGlow ? 'text-yellow-400 filter drop-shadow-[0_0_10px_rgba(255,255,0,0.7)]' : 'text-gray-400'}`}
                        style={{ zIndex: 1, position: 'relative' }}
                        width="1em" 
                        height="1em" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
                      </svg>
                    </>
                  )}
                  {idx === 2 && <FiRefreshCw className='text-3xl sm:text-6xl text-white mb-1 sm:mb-2 animate-spin-slow' />}
                  {idx === 3 && (
                    <div
                      className='cube3d'
                      style={{
                        width: 32,
                        height: 32,
                        cursor: 'grab',
                        transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`
                      }}
                      onMouseDown={handleCubeMouseDown}
                      onMouseEnter={handleCubeMouseEnter}
                    >
                      <div className='face front'></div>
                      <div className='face back'></div>
                      <div className='face right'></div>
                      <div className='face left'></div>
                      <div className='face top'></div>
                      <div className='face bottom'></div>
                    </div>
                  )}
                </div>
                <span className='text-gray-400 text-[12px] sm:text-[14px] roboto-font'>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Right side box - Hidden on mobile, visible on desktop */}
    <div className='hidden sm:flex border border-gray-800 rounded-xl h-120 w-1/4 z-10 justify-center items-center p-4'>
      {/* Card Component */}
      <div className="card">
        <p className="heading">
          Mapping Style
        </p>
        <p className="text-gray-300 text-sm">
          3D Projection
        </p>
        <p className="text-purple-400 font-semibold">
          Architectural
        </p>
      </div>
    </div>
  </div>
</section>

{/* ============ VISUAL ALBUM - DYNAMIC VERSION ============ */}
{loadingVisualAlbums ? (
  // Loading skeleton
  <section className="flex items-center mt-16 w-full flex-col relative overflow-hidden px-4">
    <div className="w-full grid grid-cols-2 gap-3 animate-pulse">
      {[1, 2, 3, 4].map((_, idx) => (
        <div key={idx} className="h-40 bg-gray-800 rounded-lg"></div>
      ))}
    </div>
  </section>
) : visualAlbums.length > 0 ? (
  <>
    {/* MOBILE VERSION */}
    <div className="lg:hidden">
      <section id="VisualAlbum" className="flex items-center mt-16 w-full flex-col relative overflow-hidden px-4">
        <p className="font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#FFF9C4] mb-3 z-10 text-sm">
          Visual Album
        </p>

        <p className="text-white poppins-font text-xl mb-2 text-center">
          Where Music Meets Visual Storytelling
        </p>

        <p className="text-gray-400 roboto-font text-xs text-center mb-6 leading-relaxed px-2">
          I transform music into cinematic visual experiences through album artwork and visual concepts.
        </p>

        {/* Featured Albums - Mobile */}
        <div className="flex mt-6 w-full items-center justify-between mb-4">
          <p className="text-white text-left poppins-font text-base">
            Featured Albums
          </p>
          <button
            className="flex items-center gap-1 poppins-font text-xs text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#FFF9C4]"
            onClick={() => navigateToPortfolio('visualAlbum')}
          >
            View All <span className="text-base">→</span>
          </button>
        </div>

        {/* Album Grid Mobile - Grid 2 colonnes */}
        <div className="w-full grid grid-cols-2 gap-3">
          {visualAlbums.slice(0, 4).map((album, idx) => (
            <div key={album.id || idx} className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 aspect-square">
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    console.error('Erreur image:', album.image);
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30">
                  🎵
                </div>
              </div>
              <h3 className="text-white text-sm font-medium mt-2 truncate px-1">
                {album.title}
              </h3>
              <p className="text-gray-400 text-[10px] mt-0.5 px-1">
                {album.artist} • {album.year}
              </p>
            </div>
          ))}
        </div>

       
      </section>
    </div>

    {/* DESKTOP VERSION */}
    <div className="hidden lg:block">
      <section id="VisualAlbum" className="flex items-center mt-32 w-full flex-col relative overflow-hidden">
        <p className="font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#FFF9C4] mb-4 z-10 text-base">
          Visual Album
        </p>

        <p className="text-white poppins-font text-3xl mb-2">
          Where Music Meets Visual Storytelling.
        </p>

        <p className="text-gray-400 roboto-font w-[40%] text-sm text-center leading-relaxed">
          As a Visual Album creator, I transform music into cinematic visual experiences. Each album cover, artwork, and visual concept tells a unique story through design, color, and composition.
        </p>

        <div className="flex mt-20 w-full px-16 items-center justify-between">
          <p className="text-white text-left poppins-font text-lg">
            Featured Visual Albums
          </p>

          <button
            className="flex items-center gap-2 poppins-font text-sm text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#FFF9C4] transition hover:scale-105"
            onClick={() => navigateToPortfolio('visualAlbum')}
          >
            All Visual Albums <span className="text-2xl">&rarr;</span>
          </button>
        </div>

        {/* ALBUM COVERS - Desktop Grid */}
        <div className="w-full grid grid-cols-3 gap-8 px-16 mt-5">
          {visualAlbums.slice(0, 6).map((album) => (
            <div key={album.id} className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 aspect-square">
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    console.error('Erreur image desktop:', album.image);
                  }}
                />
                
                {/* Overlay avec effet */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                
                {/* Badge visuel */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                  🎵 {album.type || 'Visual Album'}
                </div>
                
                {/* Info au hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-semibold mb-1">{album.title}</h3>
                  <p className="text-gray-300 text-sm">{album.artist}</p>
                  <p className="text-yellow-400 text-xs">{album.year} • {album.genre}</p>
                  {album.description && (
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{album.description}</p>
                  )}
                </div>
              </div>
              
              {/* Titre sous l'image */}
              <h3 className="text-white text-center font-medium mt-3 mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                {album.title}
              </h3>
              <p className="text-gray-400 text-center text-xs">
                {album.artist} • {album.year}
              </p>
            </div>
          ))}
        </div>

     
      </section>
    </div>
  </>
) : (
  // Fallback si pas d'albums
  <section className="flex items-center mt-16 w-full flex-col relative overflow-hidden px-4 py-12">
    <p className="font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#FFF9C4] mb-3 z-10 text-sm">
      Visual Album
    </p>
    <p className="text-white poppins-font text-lg mb-4">
      No visual albums available yet
    </p>
    <p className="text-gray-400 text-sm text-center">
      Check back soon for visual album content
    </p>
  </section>
)}

        {/* SERVICES  */}
        <section 
          id="services"
          className='flex items-center mt-32 w-full flex-col relative overflow-hidden px-2 sm:px-16'
        >          
          <p className="text-7xl lg:text-[18rem] poppins-font z-0 font-semibold uppercase mb-3 bg-gradient-to-b from-white/10 to-black/90 bg-clip-text text-transparent select-none">services</p>
          
          <div className="w-full z-5 flex flex-col md:flex-row items-start justify-between border-t border-gray-800 relative sm:-top-32 rounded-t-2xl px-4 pt-3 gap-2">
            {data.services.map((service, idx) => (
              <div 
                key={idx} 
                className="relative flex-1 h-64 border border-gray-800 rounded-lg bg-black/40 p-5 flex flex-col items-start w-full md:w-1/4 group transition-all duration-300 hover:border-opacity-50 overflow-hidden"
              >
                {/* Effet de bordure colorée */}
        {/* Effet de bordure simple */}
        <div className="absolute inset-0 rounded-lg border-2 border-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>        
                {/* Contenu de la carte */}
                <div className="relative z-10 w-full">
                  <h3 className="text-white text-[15px] poppins-font mb-3 flex items-center gap-2">
                    {service.title}
                  </h3>
                  <ul className="w-full flex flex-col gap-1">
                    {service.links.map((link, lidx) => (
                      <li key={lidx} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        {link.icon && fiIcons[link.icon] && React.createElement(fiIcons[link.icon], { className: 'text-[14px]' })}
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className='text-[13.5px] font-semibold text-[#a3a3a3] poppins-font'>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

      <section id='partner' className='flex items-center w-full flex-col relative overflow-hidden py-12 px-4'>
  <p className='font-semibold font-roboto text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 mb-4 sm:mb-6 z-10 text-center'>
    Partner Companies
  </p>
  <p className='text-white poppins-font text-lg sm:text-2xl mb-2 text-center'>
    They Trusted Me
  </p>
  <p className='text-gray-400 roboto-font w-full sm:w-[40%] text-sm sm:text-base text-center mb-8 sm:mb-12'>
    Discover the companies I've had the pleasure to collaborate with
  </p>

  {/* Container for horizontal scrolling */}
  <div className="w-full overflow-hidden relative">
    {/* Gradient effect on edges */}
    <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
    
    {/* Logos dynamiques */}
    <div className="flex animate-scroll-horizontal-mobile sm:animate-scroll-horizontal space-x-8 sm:space-x-16 py-4">
      {logosLoading ? (
        // Squelette de chargement
        Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="flex-shrink-0 w-24 h-16 sm:w-32 sm:h-20 bg-gray-800 rounded-lg animate-pulse"
          ></div>
        ))
      ) : partnerLogos.length > 0 ? (
        <>
          {/* First set of logos */}
          {partnerLogos.map((logo, index) => (
            <div
              key={`logo-${logo._id || index}`}
              className="flex-shrink-0 w-24 h-16 sm:w-32 sm:h-20 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
            >
              {logo.url ? (
                <a 
                  href={logo.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%232d3748"/><text x="100" y="50" font-family="Arial" font-size="14" fill="%2372829c" text-anchor="middle" dominant-baseline="middle">${logo.name}</text></svg>`;
                    }}
                  />
                </a>
              ) : (
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%232d3748"/><text x="100" y="50" font-family="Arial" font-size="14" fill="%2372829c" text-anchor="middle" dominant-baseline="middle">${logo.name}</text></svg>`;
                  }}
                />
              )}
            </div>
          ))}
          
          {/* Duplication for continuous loop effect */}
          {partnerLogos.map((logo, index) => (
            <div
              key={`logo-duplicate-${logo._id || index}`}
              className="flex-shrink-0 w-24 h-16 sm:w-32 sm:h-20 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 hover:scale-105 group"
            >
              {logo.url ? (
                <a 
                  href={logo.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </a>
              ) : (
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </div>
          ))}
        </>
      ) : (
        // Message si aucun logo
        <div className="text-center py-8 w-full">
          <p className="text-gray-500">Aucun logo de partenaire disponible</p>
        </div>
      )}
    </div>
  </div>
</section>

        {/* CONNECT WITH ME */}
        <section 
          id="connect"
          className="flex items-center w-full flex-col relative overflow-hidden sm:px-16 min-h-[90vh] mt-10 sm:mt-0"
        >          
          <p className="text-5xl sm:text-6xl lg:text-[11.5rem] poppins-font z-0 font-semibold uppercase mb-3 bg-gradient-to-b from-white/10 to-black/90 bg-clip-text text-transparent select-none">Let's Connect</p>

          <div className="mx-5 sm:mx-0 sm:px-5 z-10 bg-black/30 flex flex-col md:flex-row items-start justify-center gap-2 pt-3 pb-16 border-t border-gray-800 rounded-t-2xl sm:-top-20 relative">
            {/* Left: Form */}
            <div className="w-full md:flex-1 md:max-w-2xl md:min-w-[450px] md:min-h-[450px] h-full bg-black/60 border border-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between mb-6 md:mb-0">
              <h2 className="text-white text-lg mb-4 poppins-font">Connect with me</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-2">First name <span className="text-gray-300">*</span></label>
                    <input 
                      type="text" 
                      placeholder="First name" 
                      className="w-full bg-[#ffffff14] border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 placeholder:text-sm" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-2">Last name</label>
                    <input 
                      type="text" 
                      placeholder="Last name" 
                      className="w-full bg-[#ffffff14] border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 placeholder:text-sm" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-2">Email <span className="text-gray-300">*</span></label>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="w-full bg-[#ffffff14] border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 placeholder:text-sm" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-2">Phone</label>
                    <input 
                      type="tel" 
                      placeholder="Phone" 
                      className="w-full bg-[#ffffff14] border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 placeholder:text-sm" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-2">Service Needed</label>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {['Graphics', 'Vjing', 'Mapping', 'Visual Album'].map((service) => (
                      <button 
                        key={service}
                        type="button" 
                        className={`px-3 py-3 border border-gray-600 rounded-xl text-white text-xs transition poppins-font ${
                          formData.service === service 
                            ? 'bg-purple-600 border-purple-400' 
                            : 'bg-[#ffffff14] hover:bg-[#ffffff25]'
                        }`}
                        onClick={() => setFormData({...formData, service})}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs roboto-font tracking-wide mb-1">How can I help? <span className="text-gray-300">*</span></label>
                  <textarea 
                    rows={4} 
                    placeholder="Feel free to outline your ideas or needs..." 
                    className="w-full bg-[#ffffff14] border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/40 placeholder-gray-500 placeholder:text-sm resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 rounded-xl bg-white/90 text-black text-sm roboto-font tracking-wide hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
            
            {/* Right: Contact Info with Spline Animation */}
            <div className="w-full md:flex-1 md:max-w-2xl md:min-w-[500px] min-h-[350px] md:min-h-[545px] h-full bg-black/60 border border-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col justify-center relative overflow-hidden">
              {/* Spline Animation */}
              <div className="absolute inset-0 w-full h-full">
                <iframe 
                  src="https://my.spline.design/chromaticspheresandspiralsrsw02copy-zfzs9bAS3BE9S6gDcbUrkFSe/?storefront=envato-elements"
                  className="w-full h-full"
                  frameBorder="0"
                  title="3D Chromatic Spheres Animation"
                ></iframe>
              </div>
              
            
            </div>
          </div>
        </section>


      </div>
    )
  }

  export default Home
