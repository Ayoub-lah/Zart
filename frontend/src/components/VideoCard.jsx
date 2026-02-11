import React, { useRef } from 'react';
import { BsThreeDots } from 'react-icons/bs';

const VideoCard = ({ title, children }) => {
  const videoRef = useRef(null);

  // Find the video element among children
  const enhancedChildren = React.Children.map(children, child => {
    if (child && child.type === 'video') {
      return React.cloneElement(child, { ref: videoRef });
    }
    return child;
  });

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative bg-black/80 border border-gray-800 rounded-2xl flex flex-col min-h-[180px] shadow-lg group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center px-4 py-2 relative">
        <BsThreeDots className="absolute text-gray-400 text-5xl mr-2 flex-shrink-0" />
        <span className="text-white text-sm poppins-font flex-1 text-center ml-0">{title}</span>
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {enhancedChildren}
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)'}} />
      </div>
    </div>
  );
};

export default VideoCard; 