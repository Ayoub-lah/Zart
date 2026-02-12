import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import FileUpload from './pages/FileUpload';
import FileDownload from './pages/FileDownload';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogos from './pages/AdminLogos';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminProfile from './pages/AdminProfile';
import AdminDesigns from './pages/AdminDesigns';
import AdminVijingMapping from './pages/AdminVijingMapping';
import AdminVisualAlbum from './pages/AdminVisualAlbum';



function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Ne pas afficher le Header sur les pages admin */}
        {!window.location.pathname.startsWith('/admin') && <Header />}
        
        <main>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/u" element={<FileUpload />} />
            <Route path="/download" element={<FileDownload />} />
            <Route path="/download/:id" element={<FileDownload />} />
            
            {/* Routes admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/logos" element={<AdminLogos />} />
            <Route path="/admin/upload" element={<FileUpload />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/designs" element={<AdminDesigns />} />
            <Route path="/admin/vijing" element={<AdminVijingMapping />} />
            <Route path="/admin/visual-albums" element={<AdminVisualAlbum />} />
            
            {/* Route 404 */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400">Page not found</p>
              </div>
            </div>} />
          </Routes>
        </main>
        
        {/* Ne pas afficher le Footer sur les pages admin */}
        {!window.location.pathname.startsWith('/admin') && <Footer />}
      </div>
    </BrowserRouter>
  );
}
export default App;