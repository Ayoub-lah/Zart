// backend/index.js - VERSION CORRIGÉE COMPLÈTE

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRoutes = require('./api');
const contactRoutes = require('./contact');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ SOLUTION 1 : CORS OUVERT POUR TOUT (RECOMMANDÉ POUR DÉPANNAGE)
app.use(cors({
  origin: '*',  // ← ACCEPTE TOUTES LES ORIGINES
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

/* 
// ✅ SOLUTION 2 : CORS SPÉCIFIQUE (À UTILISER APRÈS)
app.use(cors({
  origin: [
    'https://zartissam.com',
    'https://www.zartissam.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
*/

// ✅ MIDDLEWARE POUR LES PREFLIGHT REQUESTS
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MIDDLEWARE POUR AJOUTER LES HEADERS MANUELLEMENT (BACKUP)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ MIDDLEWARE POUR NETTOYER LES DOUBLES SLASH
app.use((req, res, next) => {
  // Si l'URL commence par //, enlever un slash
  if (req.url.startsWith('//')) {
    req.url = req.url.substring(1);
    console.log(`🔄 URL corrigée: ${req.url}`);
  }
  next();
});

// Routes principales
app.use('/api', apiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ✅ ROUTES PUBLIQUES CORRIGÉES
app.get('/api/public/vijing', (req, res) => {
  try {
    console.log('📡 Route /api/public/vijing appelée');
    
    const vijingPath = path.join(__dirname, 'data', 'vijing.json');
    
    if (!fs.existsSync(vijingPath)) {
      return res.json({ success: true, vijingProjects: [] });
    }
    
    const data = fs.readFileSync(vijingPath, 'utf8');
    let vijingProjects = JSON.parse(data);
    
    // Filtrer projets actifs
    const activeProjects = Array.isArray(vijingProjects) 
      ? vijingProjects.filter(p => p.isActive !== false)
      : [];
    
    res.json({ success: true, vijingProjects: activeProjects });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/public/visual-albums', (req, res) => {
  try {
    console.log('📡 Route /api/public/visual-albums appelée');
    
    const albumsPath = path.join(__dirname, 'data', 'visual-albums.json');
    
    if (!fs.existsSync(albumsPath)) {
      return res.json({ success: true, albums: [] });
    }
    
    const data = fs.readFileSync(albumsPath, 'utf8');
    let albums = JSON.parse(data);
    
    const activeAlbums = Array.isArray(albums) 
      ? albums.filter(a => a.isActive !== false)
      : [];
    
    res.json({ success: true, albums: activeAlbums });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/partner-logos', (req, res) => {
  try {
    const logosDir = path.join(__dirname, 'uploads', 'logos');
    
    if (!fs.existsSync(logosDir)) {
      return res.json({ success: true, logos: [] });
    }
    
    const files = fs.readdirSync(logosDir);
    const baseUrl = process.env.BASE_URL || `https://zart.onrender.com`;
    
    const logos = files
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

    res.json({ success: true, logos });
    
  } catch (error) {
    console.error('❌ Erreur logos:', error);
    res.json({ success: true, logos: [] });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur fonctionnel',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    baseUrl: process.env.BASE_URL || 'https://zart.onrender.com'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio Backend API',
    version: '2.0.0',
    description: 'Backend pour portfolio',
    endpoints: {
      health: 'GET /api/health',
      admin: 'POST /api/admin/login',
      public: {
        designs: 'GET /api/admin/public/designs',
        vijing: 'GET /api/public/vijing',
        albums: 'GET /api/public/visual-albums',
        logos: 'GET /api/partner-logos'
      }
    }
  });
});

// Gestion 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route non trouvée' });
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    success: false,
    error: 'Erreur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Création des dossiers
const createFolders = () => {
  const dirs = [
    'data', 'uploads', 'uploads/logos', 'uploads/designs',
    'uploads/vijing', 'uploads/visual-albums', 'uploads/files'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Démarrer le serveur
createFolders();

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Backend démarré sur port ${PORT}`);
  console.log(`🌐 URL: https://zart.onrender.com`);
  console.log(`🔐 CORS: * (ouvert)`);
  console.log('='.repeat(60));
});