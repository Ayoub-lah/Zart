const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import des routes
const apiRoutes = require('./api');
const contactRoutes = require('./contact');
const adminRoutes = require('./routes/admin'); // Nouvelle route sans MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', process.env.FRONTEND_URL, 'https://votre-domaine.com','https://www.votre-domaine.com' ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer les dossiers nécessaires
const ensureDirectories = () => {
  const directories = [
    'data',
    'uploads',
    'uploads/logos',
    'uploads/files'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Dossier créé: ${dir}`);
    }
  });
};

// Routes principales
app.use('/api', apiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Dans backend/index.js, après les autres routes
// Route publique pour récupérer les projets vijing (sans authentification)
app.get('/api/public/vijing', (req, res) => {
  try {
    console.log('📡 Route /api/public/vijing appelée');
    
    const vijingDataPath = path.join(__dirname, 'data', 'vijing.json');
    
    if (!fs.existsSync(vijingDataPath)) {
      console.log('❌ Fichier vijing.json non trouvé');
      return res.json({
        success: true,
        vijingProjects: []
      });
    }
    
    const data = fs.readFileSync(vijingDataPath, 'utf8');
    let vijingProjects;
    
    try {
      vijingProjects = JSON.parse(data);
      console.log(`📊 ${vijingProjects.length} projets chargés`);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      vijingProjects = [];
    }
    
    // Filtrer seulement les projets actifs
    const activeProjects = Array.isArray(vijingProjects) 
      ? vijingProjects.filter(project => project.isActive !== false)
      : [];
    
    // Trier par ordre
    const sortedProjects = activeProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json({
      success: true,
      vijingProjects: sortedProjects
    });
    
  } catch (error) {
    console.error('❌ Erreur route publique vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de chargement des projets vijing',
      message: error.message
    });
  }
});

// Route publique pour récupérer les visual albums
app.get('/api/public/visual-albums', (req, res) => {
  try {
    console.log('📡 Route /api/public/visual-albums appelée');
    
    const albumsDataPath = path.join(__dirname, 'data', 'visual-albums.json');
    
    if (!fs.existsSync(albumsDataPath)) {
      console.log('❌ Fichier visual-albums.json non trouvé');
      return res.json({
        success: true,
        albums: []
      });
    }
    
    const data = fs.readFileSync(albumsDataPath, 'utf8');
    let albums;
    
    try {
      albums = JSON.parse(data);
      console.log(`📊 ${albums.length} albums chargés`);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      albums = [];
    }
    
    // Filtrer seulement les albums actifs
    const activeAlbums = Array.isArray(albums) 
      ? albums.filter(album => album.isActive !== false)
      : [];
    
    // Trier par ordre
    const sortedAlbums = activeAlbums.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json({
      success: true,
      albums: sortedAlbums
    });
    
  } catch (error) {
    console.error('❌ Erreur route publique visual albums:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de chargement des visual albums',
      message: error.message
    });
  }
});

// Route pour obtenir les logos partenaires (version simplifiée)
app.get('/api/partner-logos', (req, res) => {
  try {
    const logoFiles = fs.readdirSync(path.join(__dirname, 'uploads/logos'));
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    
    const logos = logoFiles
      .filter(file => /\.(jpg|jpeg|png|svg|webp)$/i.test(file))
      .map((file, index) => ({
        id: index + 1,
        name: file.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
        filename: file,
        url: `${baseUrl}/uploads/logos/${file}`,
        category: 'partner',
        isActive: true,
        order: index
      }));

    res.json({
      success: true,
      logos
    });

  } catch (error) {
    console.error('Erreur logos partenaires:', error);
    res.json({
      success: true,
      logos: []
    });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur fonctionnel',
    timestamp: new Date().toISOString(),
    services: {
      upload: true,
      contact: true,
      download: true,
      admin: true
    }
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio Backend API',
    version: '2.0.0',
    description: 'Système sans MongoDB - Stockage fichiers JSON',
    endpoints: {
      upload: 'POST /api/upload',
      contact: 'POST /api/contact/send',
      download: 'GET /api/download/:id',
      admin: 'POST /api/admin/login',
      logos: 'GET /api/partner-logos',
      health: 'GET /api/health'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware de logging détaillé
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/uploads/vijing', express.static(path.join(__dirname, 'uploads/vijing')));

// Démarrer le serveur
app.listen(PORT, () => {
  // Créer les dossiers nécessaires
  ensureDirectories();
  
  console.log('='.repeat(60));
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER || 'Non configuré'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓' : '✗ (utilise la valeur par défaut)'}`);
  console.log(`📁 Dossier data: ${path.join(__dirname, 'data')}`);
  console.log(`📁 Dossier uploads: ${path.join(__dirname, 'uploads')}`);
  console.log('='.repeat(60));
  console.log('🎯 Stockage: Fichiers JSON (pas de MongoDB requis)');
  console.log('👑 Admin par défaut: admin / admin123');
  console.log('⚠️  Changez le mot de passe admin après la première connexion!');
  console.log('='.repeat(60));
  
  console.log('\n📋 Endpoints disponibles:');
  console.log(`  • http://localhost:${PORT}/api/health`);
  console.log(`  • http://localhost:${PORT}/api/admin/login`);
  console.log(`  • http://localhost:${PORT}/api/partner-logos`);
  console.log(`  • http://localhost:${PORT}/api/contact/send`);
  console.log(`  • http://localhost:${PORT}/api/upload`);
  console.log('='.repeat(60));
  console.log('💻 Frontend: http://localhost:3000');
  console.log('🔐 Admin: http://localhost:3000/admin/login');
  console.log('='.repeat(60));
});