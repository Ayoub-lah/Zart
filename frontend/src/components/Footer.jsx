import React from 'react';
import { FaEnvelope, FaGlobe, FaLinkedinIn, FaInstagram, FaFacebookF, FaDribbble, FaBehance, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  // Définir les URLs des réseaux sociaux
  const socialLinks = {
    linkedin: "https://www.linkedin.com/in/zart-issam-%E2%84%A2-a931b0389/",
    instagram: "https://www.instagram.com/zart.issam/?igsh=MXFhNmNrMDFybTQ0eQ%3D%3D",
    whatsapp: "https://wa.me/0632393690"
  };

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
      const duration = 1500; // Augmentez cette valeur pour ralentir le scroll (en ms)
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      // Fonction d'easing pour un mouvement plus naturel
      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  };

  // Navigation items avec leurs IDs correspondants
  const navigationItems = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Partner', id: 'partner' }
  ];

  // Portfolio items
  const portfolioItems = [
    { name: 'Graphics', id: 'designs' },
    { name: 'Vjing & Mapping', id: 'designs' },
    { name: 'Visual Album', id: 'designs' },

  ];

  return (
    <footer className="w-full bg-black border-t border-gray-800 pt-12 pb-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8">
          
          {/* Logo & Brand Section */}
          <div className="md:col-span-3 lg:col-span-4 flex flex-col items-start">
            {/* Logo et Nom avec effet 3D */}
            <div 
              className='flex items-center gap-3 mb-6 cursor-pointer'
              onClick={() => smoothScrollTo('home')}
            >
              <div className="w-30 h-10 sm:w-15 sm:h-15">
                <img 
                  src='/logo192.png' 
                  alt='Profile' 
                  className='w-full h-full object-cover rounded-lg'
                />
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-400 text-sm roboto-font leading-relaxed mb-6 max-w-xs">
              Creating stunning digital experiences through innovative design.
            </p>
            
            {/* Social Media - Version desktop */}
            <div className="hidden md:flex gap-4">
              {[
                { 
                  icon: <FaLinkedinIn />, 
                  color: 'hover:text-blue-400',
                  url: socialLinks.linkedin
                },
                { 
                  icon: <FaInstagram />, 
                  color: 'hover:text-pink-500',
                  url: socialLinks.instagram
                },
                { 
                  icon: <FaWhatsapp />, 
                  color: 'hover:text-green-500',
                  url: socialLinks.whatsapp
                },
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white/70 ${social.color} text-lg p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation & Portfolio Section */}
          <div className="md:col-span-6 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Navigation */}
            <div className="flex flex-col items-start">
              <h3 className="text-white text-lg font-semibold poppins-font mb-4 relative">
                Navigation
                <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
              </h3>
              <ul className="space-y-3">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <button 
                      onClick={() => smoothScrollTo(item.id)}
                      className="text-gray-400 hover:text-white text-sm roboto-font tracking-wide transition-all duration-300 flex items-center group w-full text-left"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 mr-3 transition-all duration-300 transform group-hover:translate-x-1"></span>
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portfolio */}
            <div className="flex flex-col items-start">
              <h3 className="text-white text-lg font-semibold poppins-font mb-4 relative">
                Portfolio
                <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
              </h3>
              <ul className="space-y-3 mb-6">
                {portfolioItems.map((item) => (
                  <li key={item.name}>
                    <button 
                      onClick={() => smoothScrollTo(item.id)}
                      className="text-gray-400 hover:text-white text-sm roboto-font tracking-wide transition-all duration-300 flex items-center group w-full text-left"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 mr-3 transition-all duration-300 transform group-hover:translate-x-1"></span>
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Social Media - Version mobile */}
              <div className="md:hidden flex gap-3 mt-4">
                {[
                  { 
                    icon: <FaLinkedinIn />, 
                    color: 'hover:text-blue-400',
                    url: socialLinks.linkedin
                  },
                  { 
                    icon: <FaInstagram />, 
                    color: 'hover:text-pink-500',
                    url: socialLinks.instagram
                  },
                  { 
                    icon: <FaWhatsapp />, 
                    color: 'hover:text-green-500',
                    url: socialLinks.whatsapp
                  }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-white/70 ${social.color} text-base p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-3 lg:col-span-3 flex flex-col items-start">
            <h3 className="text-white text-lg font-semibold poppins-font mb-4 relative">
              Get In Touch
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
            </h3>
            
            <div className="space-y-4">
              {/* Email */}
              <a 
                href="mailto:contact@zartissam.com" 
                className="flex items-center gap-3 text-gray-400 hover:text-white group transition-all duration-300"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all duration-300">
                  <FaEnvelope className="text-blue-400 text-sm" />
                </div>
                <div>
                  <p className="text-white text-xs poppins-font font-medium">Email</p>
                  <p className="text-gray-400 text-sm roboto-font tracking-wide group-hover:text-white transition-colors duration-300">
                    contact@zartissam.com
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white group transition-all duration-300"
              >
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-all duration-300">
                  <FaWhatsapp className="text-green-400 text-sm" />
                </div>
                <div>
                  <p className="text-white text-xs poppins-font font-medium">WhatsApp</p>
                  <p className="text-gray-400 text-sm roboto-font tracking-wide group-hover:text-white transition-colors duration-300">
                   +212 (6) 32 39 36 90
                    </p>
                </div>
               </a>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => smoothScrollTo('connect')}
              className="mt-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-sm font-medium py-3 px-6 rounded-full hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl poppins-font border border-blue-500/30 w-full text-center"
            >
              Start a Project
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-xs poppins-font tracking-wide">
                © 2026 Zartissam. All rights reserved.
              </p>
            </div>
            
            {/* Additional Links */}
            <div className="flex gap-6 text-xs">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 roboto-font">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 roboto-font">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 roboto-font">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient Effect */}
      <div className='absolute bottom-[-10rem] z-0 left-1/2 -translate-x-1/2 w-[60vw] h-[70vh] bg-gradient-to-b from-blue-200/5 via-blue-400/10 to-blue-500/90 blur-2xl pointer-events-none rounded-full'></div>
    </footer>
  );
}