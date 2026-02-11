import React, { useState, useEffect, useRef } from 'react';
import { BiChevronRight, BiChevronDown } from 'react-icons/bi';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiUpload } from 'react-icons/fi'; // Import manquant


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [portfolioDropdown, setPortfolioDropdown] = useState(false);
  const rotationRef = useRef(null);
  const dropdownRef = useRef(null);
  const portfolioButtonRef = useRef(null);

  // Fonction pour le scroll fluide - Version personnalisée (plus lente)
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      // Animation de scroll personnalisée
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 1500;
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  };

  // Fonction pour naviguer sans recharger la page
  const navigateTo = (url) => {
    // Utiliser l'API History pour changer l'URL sans recharger
    window.history.pushState(null, '', url);
    
    // Déclencher un événement personnalisé pour notifier le changement d'URL
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // MÉTHODE 2 AMÉLIORÉE : Navigation sans rechargement
  const handleNavClick = (item, e) => {
    e.preventDefault();
    
    if (window.location.pathname === '/') {
      // Si on est déjà sur la page d'accueil, utiliser le scroll
      smoothScrollTo(item);
      
      // Mettre à jour l'URL avec le hash
      navigateTo(`/#${item}`);
    } else {
      // Si on est sur une autre page, naviguer vers l'accueil avec hash SANS rechargement
      navigateTo(`/#${item}`);
      
      // Forcer le scroll après un court délai pour laisser le temps à la page de changer
      setTimeout(() => {
        const element = document.getElementById(item);
        if (element) {
          smoothScrollTo(item);
        }
      }, 100);
    }
    
    setMenuOpen(false);
  };

  // Fonction pour aller à la page d'accueil SANS rechargement
  const goToHome = () => {
    if (window.location.pathname !== '/') {
      navigateTo('/');
    } else {
      // Si déjà sur l'accueil, scroll vers le haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigateTo('/');
    }
  };

  // Fonction pour Portfolio SANS rechargement
  const handlePortfolioClick = (categoryId) => {
    navigateTo(`/portfolio#${categoryId}`);
    setPortfolioDropdown(false);
    setMenuOpen(false);
  };

  // Effet pour gérer les changements d'URL (pour le portfolio)
  useEffect(() => {
    const handleUrlChange = () => {
      // Si l'URL change vers le portfolio, on peut déclencher des actions ici
      if (window.location.pathname === '/portfolio' && window.location.hash) {
        // Le composant Portfolio gérera automatiquement le hash
        console.log('Navigated to portfolio with hash:', window.location.hash);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Effet pour fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          portfolioButtonRef.current && !portfolioButtonRef.current.contains(event.target)) {
        setPortfolioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // Effet pour l'animation de rotation 360°
  useEffect(() => {
    if (!isHovering) return;

    rotationRef.current = requestAnimationFrame(() => {
      setRotation(prev => (prev + 1) % 360);
    });

    return () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
      }
    };
  }, [rotation, isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTimeout(() => setRotation(0), 500);
  };

  const portfolioCategories = [
    { id: 'graphics', label: 'Graphics' },
    { id: 'vjing', label: 'Vjing & Mapping' },
    { id: 'VisualAlbum', label: 'Visual album' },
  ];

  // Fonctions pour gérer le hover sur le dropdown
  const handlePortfolioMouseEnter = () => {
    setPortfolioDropdown(true);
  };

  const handlePortfolioMouseLeave = () => {
    setTimeout(() => {
      const isOverDropdown = dropdownRef.current?.matches(':hover');
      const isOverButton = portfolioButtonRef.current?.matches(':hover');
      
      if (!isOverDropdown && !isOverButton) {
        setPortfolioDropdown(false);
      }
    }, 100);
  };

  const handleDropdownMouseEnter = () => {
    setPortfolioDropdown(true);
  };

  const handleDropdownMouseLeave = () => {
    setTimeout(() => {
      const isOverDropdown = dropdownRef.current?.matches(':hover');
      const isOverButton = portfolioButtonRef.current?.matches(':hover');
      
      if (!isOverDropdown && !isOverButton) {
        setPortfolioDropdown(false);
      }
    }, 100);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/80 backdrop-blur-lg py-2' : 'bg-transparent py-4'
    }`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className={`flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'h-14' : 'h-16'
        }`}>
          
          {/* Logo et Nom - Cliquable pour aller à l'accueil */}
          <div 
            className='flex items-center gap-3 cursor-pointer'
            onClick={goToHome}
          >
            <div className="w-30 h-10 sm:w-15 sm:h-15">
              <img 
                src='/logo192.png' 
                alt='Profile' 
                className='w-full h-full object-cover rounded-lg'
              />
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className='hidden lg:flex items-center gap-8'>
            {['home', 'about', 'services', 'partner'].map((item) => (
              <a 
                key={item}
                href={`#${item}`}
                className='text-gray-300 roboto-font text-[15px] font-medium hover:text-white transition-all duration-300 relative group'
                onClick={(e) => handleNavClick(item, e)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300'></span>
              </a>
            ))}
            
            {/* Portfolio Dropdown */}
            <div className='relative'>
              <button
                ref={portfolioButtonRef}
                className='text-gray-300 roboto-font text-[15px] font-medium hover:text-white transition-all duration-300 relative group flex items-center gap-1'
                onClick={() => setPortfolioDropdown(!portfolioDropdown)}
                onMouseEnter={handlePortfolioMouseEnter}
                onMouseLeave={handlePortfolioMouseLeave}
              >
                Portfolio
                <BiChevronDown className={`transform transition-transform duration-300 ${portfolioDropdown ? 'rotate-180' : ''}`} />
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300'></span>
              </button>
              
              {/* Dropdown Menu */}
              <div 
                ref={dropdownRef}
                className={`absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/50 transition-all duration-300 ${
                  portfolioDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                {portfolioCategories.map((category) => (
                  <button
                    key={category.id}
                    className='w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-600/20 transition-all duration-200 border-b border-gray-700/30 last:border-b-0 flex items-center gap-2 group'
                    onClick={() => handlePortfolioClick(category.id)}
                  >
                    <BiChevronRight className='opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-400' />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

          
          </nav>

          {/* CTA Button et Menu Mobile */}
          <div className='flex items-center gap-4'>
            <button 
              className='hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-700 text-white text-sm font-medium py-2.5 px-6 rounded-full hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl poppins-font border border-blue-500/30'
              onClick={(e) => handleNavClick('connect', e)}
            >
              Let's Connect
            </button>
            
            <button 
              className='lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300 z-50'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? 
                <HiX className='text-2xl text-white' /> : 
                <HiMenu className='text-2xl text-white' />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay - Version améliorée */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
        menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible delay-300'
      }`}>
        {/* Backdrop avec animation améliorée */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-purple-900/30 transition-all duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        ></div>
        
        {/* Menu Content avec animation slide-from-top */}
        <div className={`relative z-50 h-full flex flex-col items-center justify-center transition-all duration-500 transform ${
          menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}>
          <nav className='flex flex-col gap-2 text-center w-full px-6'>
            {['home', 'about', 'services', 'partner'].map((item, index) => (
              <a 
                key={item}
                href={`#${item}`}
                className='text-white oswald-font tracking-tight text-3xl sm:text-4xl uppercase py-4 hover:text-blue-300 transition-all duration-300 transform hover:translate-x-3 flex items-center justify-center group border-b border-gray-700/50'
                style={{ 
                  transitionDelay: `${index * 80}ms`,
                  animationDelay: `${index * 100}ms`
                }}
                onClick={(e) => handleNavClick(item, e)}
              >
                <BiChevronRight className='opacity-0 group-hover:opacity-100 transform -translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-blue-400 text-2xl mr-2' />
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </a>
            ))}
            
            {/* Portfolio Mobile avec sous-menu */}
            <div className='border-b border-gray-700/50'>
              <button
                className='text-white oswald-font tracking-tight text-3xl sm:text-4xl uppercase py-4 hover:text-blue-300 transition-all duration-300 transform flex items-center justify-center group w-full'
                onClick={() => setPortfolioDropdown(!portfolioDropdown)}
              >
                <BiChevronRight className={`transform transition-transform duration-300 ${portfolioDropdown ? 'rotate-90' : ''} text-blue-400 text-2xl mr-2`} />
                Portfolio
              </button>
              
              {/* Sous-menu mobile */}
              <div className={`overflow-hidden transition-all duration-300 ${
                portfolioDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {portfolioCategories.map((category, index) => (
                  <button
                    key={category.id}
                    className='w-full text-white oswald-font tracking-tight text-xl sm:text-2xl uppercase py-3 hover:text-blue-300 transition-all duration-300 transform hover:translate-x-6 flex items-center justify-center group'
                    style={{ 
                      transitionDelay: `${index * 50}ms`
                    }}
                    onClick={() => handlePortfolioClick(category.id)}
                  >
                    <BiChevronRight className='opacity-0 group-hover:opacity-100 transform -translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-blue-400 text-xl mr-2' />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
          
          {/* CTA Mobile dans le menu */}
          <div className='mt-8 px-6 w-full'>
            <button 
              className='w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white text-lg font-medium py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg poppins-font border border-blue-500/30'
              onClick={(e) => {
                handleNavClick('connect', e);
                setMenuOpen(false);
              }}
            >
              Let's Connect
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;