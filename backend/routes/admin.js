const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const FileStorage = require('../utils/fileStorage');
const PasswordHash = require('../utils/passwordHash');

// IMPORTER LES MIDDLEWARES APRÈS LES AVOIR DÉFINIS
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Initialiser les stockages
const usersStorage = new FileStorage('users.json');
const logosStorage = new FileStorage('logos.json');
const designsStorage = new FileStorage('designs.json');
const vijingStorageFile = new FileStorage('vijing.json');
const visualAlbumsStorage = new FileStorage('visual-albums.json');

// ==================== CONFIGURATION MULTER ====================
// ... (garde tout ton code Multer ici, inchangé)
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/logos/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});
const uploadLogo = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 } });

const designStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/designs/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});
const uploadDesign = multer({ storage: designStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const vijingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/vijing/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});
const uploadVijing = multer({ storage: vijingStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const visualAlbumStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/visual-albums/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});
const uploadVisualAlbum = multer({ storage: visualAlbumStorage, limits: { fileSize: 20 * 1024 * 1024 } });

// ==================== INITIALISATION ADMIN ====================
const initDefaultAdmin = () => {
  const adminExists = usersStorage.findOne({ username: 'admin' });
  if (!adminExists) {
    const adminPassword = PasswordHash.hash('admin123');
    usersStorage.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@zartissam.com',
      role: 'admin',
      lastLogin: null,
      createdAt: new Date().toISOString()
    });
    console.log('👑 Admin par défaut créé - admin/admin123');
  }
};
initDefaultAdmin();

// ==================== 1. ROUTES 100% PUBLIQUES (SANS AUTH) ====================

/**
 * 🟢 LOGIN - Accessible sans authentification
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('📡 Tentative login:', username);
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Champs requis' });
    }

    const user = usersStorage.findOne({ username });
    if (!user || !PasswordHash.verify(password, user.password)) {
      return res.status(401).json({ success: false, error: 'Identifiants invalides' });
    }

    usersStorage.update(user.id, { lastLogin: new Date().toISOString() });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🟢 VERIFY TOKEN - Accessible sans authentification (le middleware vérifie le token)
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
  }
});

/**
 * 🟢 DESIGNS PUBLICS
 */
router.get('/public/designs', (req, res) => {
  try {
    console.log('📡 Route /public/designs appelée');
    const designs = designsStorage.read();
    
    // Structure par défaut si vide
    if (!designs || Object.keys(designs).length === 0) {
      return res.json({
        success: true,
        designs: { posters: [], banners: [], brochures: [], posts: [], logos: [], brands: [] }
      });
    }
    
    res.json({ success: true, designs });
  } catch (error) {
    console.error('❌ Erreur designs publics:', error);
    res.status(500).json({ success: false, error: 'Erreur de chargement' });
  }
});

/**
 * 🟢 VIJING PUBLIC
 */
router.get('/public/vijing', (req, res) => {
  try {
    console.log('📡 Route /public/vijing appelée');
    const allProjects = vijingStorageFile.findAll();
    const activeProjects = allProjects.filter(p => p.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json({ success: true, vijingProjects: activeProjects });
  } catch (error) {
    console.error('❌ Erreur vijing public:', error);
    res.status(500).json({ success: false, error: 'Erreur de chargement' });
  }
});

/**
 * 🟢 VISUAL ALBUMS PUBLIC
 */
router.get('/public/visual-albums', (req, res) => {
  try {
    console.log('📡 Route /public/visual-albums appelée');
    const allAlbums = visualAlbumsStorage.findAll();
    const activeAlbums = allAlbums.filter(a => a.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Formatter les URLs
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const formattedAlbums = activeAlbums.map(album => ({
      ...album,
      image: album.image?.startsWith('http') ? album.image : `${baseUrl}${album.image?.startsWith('/') ? '' : '/'}${album.image || ''}`
    }));
    
    res.json({ success: true, albums: formattedAlbums });
  } catch (error) {
    console.error('❌ Erreur albums public:', error);
    res.status(500).json({ success: false, error: 'Erreur de chargement' });
  }
});

/**
 * 🟢 LOGOS PUBLICS (pour partenaires)
 */
router.get('/logos', (req, res) => {
  try {
    const { category, active } = req.query;
    let logos = logosStorage.findAll();
    
    if (category) logos = logos.filter(l => l.category === category);
    if (active !== undefined) logos = logos.filter(l => l.isActive === (active === 'true'));
    
    logos.sort((a, b) => a.order - b.order || new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const logosWithDetails = logos.map(logo => ({
      ...logo,
      _id: logo.id,
      url: logo.url || `${baseUrl}/uploads/logos/${logo.filename}`,
      uploadedBy: usersStorage.findById(logo.uploadedBy)?.username || 'admin'
    }));

    res.json({ success: true, logos: logosWithDetails });
  } catch (error) {
    console.error('Erreur logos:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ==================== 2. MIDDLEWARE D'AUTHENTIFICATION ====================
// TOUTES LES ROUTES APRÈS CETTE LIGNE NÉCESSITENT UN TOKEN VALIDE
router.use(authMiddleware);

// ==================== 3. ROUTES PROTÉGÉES (NÉCESSITENT AUTH) ====================

/**
 * 🔵 DASHBOARD - Admin uniquement
 */
router.get('/dashboard', adminMiddleware, (req, res) => {
  try {
    const allLogos = logosStorage.findAll();
    const activeLogos = allLogos.filter(l => l.isActive);
    const allUsers = usersStorage.findAll();
    const designs = designsStorage.read();
    
    let totalDesigns = 0;
    const designStats = {};
    for (const category in designs) {
      designStats[category] = designs[category]?.length || 0;
      totalDesigns += designStats[category];
    }
    
    res.json({
      success: true,
      dashboard: {
        totalLogos: allLogos.length,
        activeLogos: activeLogos.length,
        totalUsers: allUsers.length,
        totalDesigns,
        designStats,
        recentLogos: allLogos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5),
        recentUsers: allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 DESIGNS - Admin uniquement
 */
router.get('/designs', adminMiddleware, (req, res) => {
  try {
    res.json({ success: true, designs: designsStorage.read() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/designs/upload', adminMiddleware, uploadDesign.array('images', 10), async (req, res) => {
  try {
    const { category, title, description, link } = req.body;
    const files = req.files;
    
    if (!files?.length) return res.status(400).json({ success: false, error: 'Aucune image' });
    
    const designs = designsStorage.read();
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    const newDesigns = files.map((file, index) => ({
      id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9),
      title: title || `Design ${index + 1}`,
      description: description || '',
      image: `${baseUrl}/uploads/designs/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      category,
      link: link || null,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      order: (designs[category]?.length || 0) + index
    }));
    
    if (!designs[category]) designs[category] = [];
    designs[category].push(...newDesigns);
    designsStorage.write(designs);
    
    res.json({ success: true, message: `${files.length} design(s) ajouté(s)`, designs: newDesigns, category });
  } catch (error) {
    console.error('Erreur upload design:', error);
    if (req.files) req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    res.status(500).json({ success: false, error: 'Erreur upload' });
  }
});

router.put('/designs/:category/:id', adminMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;
    const designs = designsStorage.read();
    
    if (!designs[category]) return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
    
    const index = designs[category].findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Design non trouvé' });
    
    ['title', 'description', 'link', 'order'].forEach(field => {
      if (req.body[field] !== undefined) designs[category][index][field] = req.body[field];
    });
    
    designs[category][index].updatedAt = new Date().toISOString();
    designsStorage.write(designs);
    
    res.json({ success: true, message: 'Design mis à jour', design: designs[category][index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/designs/:category/:id', adminMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;
    const designs = designsStorage.read();
    
    if (!designs[category]) return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
    
    const index = designs[category].findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Design non trouvé' });
    
    const design = designs[category][index];
    if (fs.existsSync(design.path)) fs.unlinkSync(design.path);
    
    designs[category].splice(index, 1);
    designsStorage.write(designs);
    
    res.json({ success: true, message: 'Design supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/designs/reorder/:category', adminMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const { order } = req.body;
    const designs = designsStorage.read();
    
    if (!designs[category]) return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
    
    order.forEach(item => {
      const d = designs[category].find(d => d.id === item.id);
      if (d) d.order = item.order;
    });
    
    designs[category].sort((a, b) => a.order - b.order);
    designsStorage.write(designs);
    
    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 LOGOS - Admin uniquement (upload, update, delete, reorder)
 */
router.post('/logos/upload', adminMiddleware, uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Aucun fichier' });
    
    const { name, category, url } = req.body;
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    const logo = logosStorage.create({
      name: name || req.file.originalname.replace(/\.[^/.]+$/, ""),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: category || 'partner',
      url: url || null,
      order: logosStorage.findAll().length,
      isActive: true,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Logo uploadé', logo: { ...logo, url: `${baseUrl}/uploads/logos/${logo.filename}` } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: 'Erreur upload' });
  }
});

router.put('/logos/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    ['name', 'category', 'url', 'order', 'isActive'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    const updated = logosStorage.update(id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Logo non trouvé' });
    
    res.json({ success: true, message: 'Logo mis à jour', logo: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/logos/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const logo = logosStorage.findById(id);
    if (!logo) return res.status(404).json({ success: false, error: 'Logo non trouvé' });
    
    if (fs.existsSync(logo.path)) fs.unlinkSync(logo.path);
    logosStorage.delete(id);
    
    res.json({ success: true, message: 'Logo supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/logos/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body;
    order.forEach(item => logosStorage.update(item.id, { order: item.order }));
    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 VIJING - Admin uniquement (upload, update, delete, reorder)
 */
router.post('/vijing/upload', adminMiddleware, uploadVijing.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Aucune image' });
    if (!req.body.name || !req.body.venue || !req.body.type) {
      return res.status(400).json({ success: false, error: 'Nom, lieu et type requis' });
    }
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const newProject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: req.body.name,
      venue: req.body.venue,
      type: req.body.type,
      description: req.body.description || '',
      videoUrl: req.body.videoUrl || null,
      image: `${baseUrl}/uploads/vijing/${req.file.filename}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      isActive: true,
      order: vijingStorageFile.findAll().length
    };
    
    const project = vijingStorageFile.create(newProject);
    res.json({ success: true, message: 'Projet ajouté', project });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: 'Erreur upload' });
  }
});

router.put('/vijing/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    ['name', 'venue', 'type', 'videoUrl', 'description', 'order', 'isActive'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    const updated = vijingStorageFile.update(id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    
    res.json({ success: true, message: 'Projet mis à jour', project: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/vijing/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const project = vijingStorageFile.findById(id);
    if (!project) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    
    if (fs.existsSync(project.path)) fs.unlinkSync(project.path);
    vijingStorageFile.delete(id);
    
    res.json({ success: true, message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/vijing/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body;
    order.forEach(item => vijingStorageFile.update(item.id, { order: item.order }));
    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 VISUAL ALBUMS - Admin uniquement
 */
router.get('/visual-albums', adminMiddleware, (req, res) => {
  try {
    const albums = visualAlbumsStorage.findAll().sort((a, b) => a.order - b.order);
    res.json({ success: true, albums });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/visual-albums/upload', adminMiddleware, uploadVisualAlbum.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Aucune image' });
    if (!req.body.title || !req.body.artist) {
      return res.status(400).json({ success: false, error: 'Titre et artiste requis' });
    }
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const newAlbum = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: req.body.title,
      artist: req.body.artist,
      year: parseInt(req.body.year) || new Date().getFullYear(),
      type: req.body.type || 'album',
      description: req.body.description || '',
      genre: req.body.genre || '',
      link: req.body.link || null,
      featured: req.body.featured === 'true',
      image: `${baseUrl}/uploads/visual-albums/${req.file.filename}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      isActive: true,
      order: parseInt(req.body.order) || visualAlbumsStorage.findAll().length
    };
    
    const album = visualAlbumsStorage.create(newAlbum);
    res.json({ success: true, message: 'Album ajouté', album });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: 'Erreur upload' });
  }
});

router.put('/visual-albums/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    ['title', 'artist', 'year', 'type', 'description', 'genre', 'link', 'featured', 'order', 'isActive'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    const updated = visualAlbumsStorage.update(id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Album non trouvé' });
    
    res.json({ success: true, message: 'Album mis à jour', album: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/visual-albums/:id/featured', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    const updated = visualAlbumsStorage.update(id, { featured });
    if (!updated) return res.status(404).json({ success: false, error: 'Album non trouvé' });
    
    res.json({ success: true, message: `Album ${featured ? 'ajouté aux' : 'retiré des'} favoris`, album: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/visual-albums/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const album = visualAlbumsStorage.findById(id);
    if (!album) return res.status(404).json({ success: false, error: 'Album non trouvé' });
    
    if (fs.existsSync(album.path)) fs.unlinkSync(album.path);
    visualAlbumsStorage.delete(id);
    
    res.json({ success: true, message: 'Album supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/visual-albums/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body;
    order.forEach(item => visualAlbumsStorage.update(item.id, { order: item.order }));
    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 UTILISATEURS - Admin uniquement
 */
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = usersStorage.findAll().map(({ id, username, email, role, createdAt, lastLogin }) => ({
      id, username, email, role, createdAt, lastLogin
    }));
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/users', adminMiddleware, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, error: 'Tous les champs requis' });
    }
    
    if (usersStorage.findOne({ username })) {
      return res.status(400).json({ success: false, error: 'Nom d\'utilisateur déjà utilisé' });
    }
    
    const user = usersStorage.create({
      username,
      password: PasswordHash.hash(password),
      email,
      role: role || 'editor',
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
    
    res.json({
      success: true,
      message: 'Utilisateur créé',
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * 🔵 PROFIL - Utilisateur connecté
 */
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = usersStorage.findById(req.user.id);
    
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    if (!PasswordHash.verify(currentPassword, user.password)) {
      return res.status(400).json({ success: false, error: 'Mot de passe actuel incorrect' });
    }
    
    usersStorage.update(req.user.id, { password: PasswordHash.hash(newPassword) });
    res.json({ success: true, message: 'Mot de passe changé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = usersStorage.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    
    const updates = {};
    
    if (username && username !== user.username) {
      const existing = usersStorage.findOne({ username });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ success: false, error: 'Nom d\'utilisateur déjà utilisé' });
      }
      updates.username = username;
    }
    
    if (email && email !== user.email) updates.email = email;
    
    if (currentPassword && newPassword) {
      if (!PasswordHash.verify(currentPassword, user.password)) {
        return res.status(400).json({ success: false, error: 'Mot de passe actuel incorrect' });
      }
      updates.password = PasswordHash.hash(newPassword);
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune modification' });
    }
    
    const updated = usersStorage.update(req.user.id, updates);
    const { password, ...userWithoutPassword } = updated;
    
    res.json({ success: true, message: 'Profil mis à jour', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;