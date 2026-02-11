const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const FileStorage = require('../utils/fileStorage');
const PasswordHash = require('../utils/passwordHash');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialiser les stockages
const usersStorage = new FileStorage('users.json');
const logosStorage = new FileStorage('logos.json');
const designsStorage = new FileStorage('designs.json');

// ==================== CONFIGURATION MULTER ====================

// Configuration du stockage pour les logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/logos/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, SVG, WebP'));
    }
  }
});

// Configuration du stockage pour les images de designs
const designStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/designs/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});

const uploadDesign = multer({
  storage: designStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP, GIF'));
    }
  }
});

// ==================== INITIALISATION ====================
// Créer un admin par défaut si nécessaire
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
    
    console.log('👑 Admin par défaut créé');
    console.log('📝 Identifiants: admin / admin123');
    console.log('⚠️ Changez le mot de passe immédiatement!');
  }
};

// Appeler l'initialisation
initDefaultAdmin();

// ==================== ROUTES PUBLIQUES ====================

// Route de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier les champs requis
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = usersStorage.findOne({ username });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = PasswordHash.verify(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Mettre à jour la dernière connexion
    usersStorage.update(user.id, { lastLogin: new Date().toISOString() });

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur de login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

router.get('/public/designs', (req, res) => {
  try {
    console.log('📡 Route /admin/public/designs appelée');
    
    const designs = designsStorage.read();
    
    console.log('🌐 Designs envoyés au frontend:', {
      posters: designs.posters?.length || 0,
      banners: designs.banners?.length || 0,
      brochures: designs.brochures?.length || 0,
      posts: designs.posts?.length || 0,
      logos: designs.logos?.length || 0,
      brands: designs.brands?.length || 0
    });
    
    // Si c'est vide, retourner une structure par défaut
    if (!designs || Object.keys(designs).length === 0) {
      return res.json({
        success: true,
        designs: {
          posters: [],
          banners: [],
          brochures: [],
          posts: [],
          logos: [],
          brands: []
        }
      });
    }
    
    res.json({
      success: true,
      designs
    });
  } catch (error) {
    console.error('❌ Erreur route publique designs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de chargement des designs'
    });
  }
});

// Vérifier l'authentification
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==================== ROUTES PROTÉGÉES ====================
router.use(authMiddleware);

// Obtenir les statistiques
router.get('/stats', adminMiddleware, (req, res) => {
  try {
    const allLogos = logosStorage.findAll();
    const activeLogos = allLogos.filter(logo => logo.isActive);
    const allUsers = usersStorage.findAll();
    const recentLogos = allLogos
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5)
      .map(logo => ({
        ...logo,
        uploadedBy: usersStorage.findById(logo.uploadedBy)?.username || 'admin'
      }));

    res.json({
      success: true,
      stats: {
        totalLogos: allLogos.length,
        activeLogos: activeLogos.length,
        totalUsers: allUsers.length,
        recentLogos
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// ==================== GESTION DES DESIGNS ====================

// Obtenir tous les designs
router.get('/designs', adminMiddleware, (req, res) => {
  try {
    const designs = designsStorage.read();
    res.json({
      success: true,
      designs
    });
  } catch (error) {
    console.error('Erreur récupération designs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Ajouter un nouveau design
router.post('/designs/upload', adminMiddleware, uploadDesign.array('images', 10), async (req, res) => {
  try {
    const { category, title, description, link } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image uploadée'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie requise'
      });
    }

    const validCategories = ['posters', 'banners', 'brochures', 'posts', 'logos', 'brands'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie invalide'
      });
    }

    // Lire les designs actuels
    const designs = designsStorage.read();

    // Préparer les nouveaux designs
    const newDesigns = files.map((file, index) => {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      
      return {
        id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9),
        title: title || `Design ${index + 1}`,
        description: description || '',
        image: `${baseUrl}/uploads/designs/${file.filename}`,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        category: category,
        link: link || null,
        uploadedBy: req.user.id,
        uploadedAt: new Date().toISOString(),
        order: (designs[category]?.length || 0) + index
      };
    });

    // Ajouter aux designs existants
    if (!designs[category]) {
      designs[category] = [];
    }
    
    designs[category].push(...newDesigns);

    // Sauvegarder
    designsStorage.write(designs);

    console.log('✅ Designs sauvegardés:', {
      category,
      count: newDesigns.length,
      files: newDesigns.map(d => d.image)
    });

    res.json({
      success: true,
      message: `${files.length} design(s) ajouté(s) avec succès`,
      designs: newDesigns,
      category
    });

  } catch (error) {
    console.error('Erreur upload design:', error);
    
    // Nettoyer les fichiers en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload'
    });
  }
});

// Mettre à jour un design
router.put('/designs/:category/:id', adminMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;
    const updates = req.body;

    const designs = designsStorage.read();

    if (!designs[category]) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    const designIndex = designs[category].findIndex(design => design.id === id);
    if (designIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Design non trouvé'
      });
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['title', 'description', 'link', 'order'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        designs[category][designIndex][field] = updates[field];
      }
    });

    designs[category][designIndex].updatedAt = new Date().toISOString();

    designsStorage.write(designs);

    res.json({
      success: true,
      message: 'Design mis à jour',
      design: designs[category][designIndex]
    });

  } catch (error) {
    console.error('Erreur mise à jour design:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Supprimer un design
router.delete('/designs/:category/:id', adminMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;

    const designs = designsStorage.read();

    if (!designs[category]) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    const designIndex = designs[category].findIndex(design => design.id === id);
    if (designIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Design non trouvé'
      });
    }

    const design = designs[category][designIndex];

    // Supprimer le fichier physique
    if (fs.existsSync(design.path)) {
      fs.unlinkSync(design.path);
    }

    // Supprimer de la liste
    designs[category].splice(designIndex, 1);

    designsStorage.write(designs);

    res.json({
      success: true,
      message: 'Design supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression design:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Réorganiser les designs
router.put('/designs/reorder/:category', adminMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const { order } = req.body; // [{id: '...', order: 0}, ...]

    const designs = designsStorage.read();

    if (!designs[category]) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    order.forEach(item => {
      const designIndex = designs[category].findIndex(d => d.id === item.id);
      if (designIndex !== -1) {
        designs[category][designIndex].order = item.order;
      }
    });

    // Trier par ordre
    designs[category].sort((a, b) => a.order - b.order);

    designsStorage.write(designs);

    res.json({
      success: true,
      message: 'Ordre mis à jour'
    });

  } catch (error) {
    console.error('Erreur réorganisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// ==================== GESTION DES LOGOS ====================

// Upload un nouveau logo
router.post('/logos/upload', adminMiddleware, uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier uploadé'
      });
    }

    const { name, category, url } = req.body;

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

    // Construire l'URL d'accès
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const logoUrl = `${baseUrl}/uploads/logos/${logo.filename}`;

    res.json({
      success: true,
      message: 'Logo uploadé avec succès',
      logo: {
        ...logo,
        url: logoUrl
      }
    });

  } catch (error) {
    console.error('Erreur upload logo:', error);
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload'
    });
  }
});

// Obtenir tous les logos
router.get('/logos', (req, res) => {
  try {
    const { category, active } = req.query;
    
    let logos = logosStorage.findAll();
    
    // Filtrer par catégorie
    if (category) {
      logos = logos.filter(logo => logo.category === category);
    }
    
    // Filtrer par statut actif
    if (active !== undefined) {
      const isActive = active === 'true';
      logos = logos.filter(logo => logo.isActive === isActive);
    }
    
    // Trier par ordre puis par date
    logos.sort((a, b) => a.order - b.order || new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    // Ajouter les URLs et les infos utilisateur
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    const logosWithDetails = logos.map(logo => {
      const uploadedByUser = usersStorage.findById(logo.uploadedBy);
      return {
        ...logo,
        _id: logo.id,
        url: logo.url || `${baseUrl}/uploads/logos/${logo.filename}`,
        uploadedBy: uploadedByUser ? {
          id: uploadedByUser.id,
          username: uploadedByUser.username
        } : { username: 'admin' }
      };
    });

    res.json({
      success: true,
      logos: logosWithDetails
    });

  } catch (error) {
    console.error('Erreur récupération logos:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Mettre à jour un logo
router.put('/logos/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const logo = logosStorage.findById(id);
    if (!logo) {
      return res.status(404).json({
        success: false,
        error: 'Logo non trouvé'
      });
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['name', 'category', 'url', 'order', 'isActive'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const updatedLogo = logosStorage.update(id, updateData);

    res.json({
      success: true,
      message: 'Logo mis à jour',
      logo: updatedLogo
    });

  } catch (error) {
    console.error('Erreur mise à jour logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Supprimer un logo
router.delete('/logos/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const logo = logosStorage.findById(id);
    if (!logo) {
      return res.status(404).json({
        success: false,
        error: 'Logo non trouvé'
      });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(logo.path)) {
      fs.unlinkSync(logo.path);
    }

    // Supprimer de la base de données
    logosStorage.delete(id);

    res.json({
      success: true,
      message: 'Logo supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Réorganiser les logos
router.put('/logos/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body; // [{id: '...', order: 0}, ...]

    order.forEach(item => {
      logosStorage.update(item.id, { order: item.order });
    });

    res.json({
      success: true,
      message: 'Ordre mis à jour'
    });

  } catch (error) {
    console.error('Erreur réorganisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// ==================== GESTION DES UTILISATEURS ====================

// Obtenir tous les utilisateurs
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = usersStorage.findAll().map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Créer un nouvel utilisateur
router.post('/users', adminMiddleware, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = usersStorage.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur déjà utilisé'
      });
    }

    // Hash du mot de passe
    const hashedPassword = PasswordHash.hash(password);

    // Créer l'utilisateur
    const user = usersStorage.create({
      username,
      password: hashedPassword,
      email,
      role: role || 'editor',
      createdAt: new Date().toISOString(),
      lastLogin: null
    });

    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Changer son propre mot de passe
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Trouver l'utilisateur
    const user = usersStorage.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = PasswordHash.verify(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    // Hash du nouveau mot de passe
    const hashedPassword = PasswordHash.hash(newPassword);

    // Mettre à jour
    usersStorage.update(userId, { password: hashedPassword });

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Mettre à jour le profil
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, currentPassword, newPassword } = req.body;

    // Trouver l'utilisateur
    const user = usersStorage.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Préparer les mises à jour
    const updates = {};

    // Mettre à jour le nom d'utilisateur si fourni
    if (username && username !== user.username) {
      // Vérifier si le nom d'utilisateur est déjà pris
      const existingUser = usersStorage.findOne({ username });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Ce nom d\'utilisateur est déjà utilisé'
        });
      }
      updates.username = username;
    }

    // Mettre à jour l'email si fourni
    if (email && email !== user.email) {
      updates.email = email;
    }

    // Gestion du changement de mot de passe
    if (currentPassword && newPassword) {
      // Vérifier le mot de passe actuel
      const isMatch = PasswordHash.verify(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Mot de passe actuel incorrect'
        });
      }

      // Hash du nouveau mot de passe
      updates.password = PasswordHash.hash(newPassword);
    }

    // Si aucun changement
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune modification à apporter'
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = usersStorage.update(userId, updates);

    // Retourner les informations sans le mot de passe
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Dashboard info
router.get('/dashboard', adminMiddleware, (req, res) => {
  try {
    const allLogos = logosStorage.findAll();
    const activeLogos = allLogos.filter(logo => logo.isActive);
    const allUsers = usersStorage.findAll();
    const designs = designsStorage.read();
    
    // Compter les designs par catégorie
    const designStats = {};
    let totalDesigns = 0;
    for (const category in designs) {
      designStats[category] = designs[category]?.length || 0;
      totalDesigns += designStats[category];
    }
    
    // Logos récents
    const recentLogos = allLogos
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);
    
    // Utilisateurs récents
    const recentUsers = allUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      dashboard: {
        totalLogos: allLogos.length,
        activeLogos: activeLogos.length,
        inactiveLogos: allLogos.length - activeLogos.length,
        totalUsers: allUsers.length,
        totalDesigns,
        designStats,
        recentLogos,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// ==================== GESTION DES VIJING MAPPING ====================

// Configuration du stockage pour les images de vjing mapping
const vijingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/vijing/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});

const uploadVijing = multer({
  storage: vijingStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP, GIF'));
    }
  }
});

// Initialiser le stockage pour vijing mapping
const vijingStorageFile = new FileStorage('vijing.json');

// Route publique pour récupérer les projets vijing
// Route publique pour récupérer les projets vijing
// Route publique pour récupérer les projets vijing avec pagination
router.get('/public/vijing', (req, res) => {
  try {
    const vijingStorageFile = new FileStorage('vijing.json');
    const allProjects = vijingStorageFile.findAll();
    
    // Filtrer seulement les projets actifs
    const activeProjects = allProjects.filter(project => 
      project.isActive !== false
    );
    
    // Trier par ordre
    const sortedProjects = activeProjects.sort((a, b) => 
      (a.order || 0) - (b.order || 0)
    );
    
    // Compter par type
    const countByType = {};
    sortedProjects.forEach(project => {
      const type = project.type || 'Other';
      countByType[type] = (countByType[type] || 0) + 1;
    });
    
    res.json({
      success: true,
      vijingProjects: sortedProjects,
      stats: {
        total: sortedProjects.length,
        byType: countByType
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur route publique vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de chargement des projets vijing'
    });
  }
});

// backend/routes/admin.js - AJOUTER CES ROUTES

// ==================== GESTION DES VISUAL ALBUMS ====================

// Configuration du stockage pour les visual albums
const visualAlbumStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/visual-albums/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});

const uploadVisualAlbum = multer({
  storage: visualAlbumStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP, GIF'));
    }
  }
});

// Initialiser le stockage pour visual albums
const visualAlbumsStorage = new FileStorage('visual-albums.json');

// Obtenir tous les visual albums
router.get('/visual-albums', adminMiddleware, (req, res) => {
  try {
    const albums = visualAlbumsStorage.findAll();
    
    res.json({
      success: true,
      albums: albums.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    console.error('Erreur récupération albums:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Route publique pour visual albums
// ==================== ROUTES PUBLIQUES POUR VISUAL ALBUMS ====================

// Route publique pour récupérer les visual albums (accessible sans auth)
router.get('/public/visual-albums', (req, res) => {
  try {
    console.log('📡 Route /public/visual-albums appelée (publique)');
    
    const visualAlbumsStorage = new FileStorage('visual-albums.json');
    const allAlbums = visualAlbumsStorage.findAll();
    
    console.log(`📊 ${allAlbums.length} albums trouvés dans visual-albums.json`);
    
    // Filtrer seulement les albums actifs
    const activeAlbums = allAlbums.filter(album => 
      album.isActive === true || album.isActive === undefined
    );
    
    // Trier par ordre
    const sortedAlbums = activeAlbums.sort((a, b) => 
      (a.order || 0) - (b.order || 0)
    );
    
    // Formatter les URLs si nécessaire
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const formattedAlbums = sortedAlbums.map(album => {
      // S'assurer que l'URL de l'image est complète
      if (album.image && !album.image.startsWith('http')) {
        return {
          ...album,
          image: `${baseUrl}${album.image.startsWith('/') ? '' : '/'}${album.image}`
        };
      }
      return album;
    });
    
    console.log(`📊 ${formattedAlbums.length} albums actifs après filtrage`);
    
    res.json({
      success: true,
      albums: formattedAlbums
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération albums:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Upload un nouvel album
// Upload un nouvel album
router.post('/visual-albums/upload', adminMiddleware, uploadVisualAlbum.single('image'), async (req, res) => {
  try {
    console.log('📤 Début upload visual album');
    console.log('📝 Body:', req.body);
    console.log('📁 Fichier:', req.file);
    console.log('👤 Utilisateur:', req.user);

    const { title, artist, year, type, description, genre, link, featured, order } = req.body;
    const file = req.file;

    if (!file) {
      console.log('❌ Aucun fichier reçu');
      return res.status(400).json({
        success: false,
        error: 'Aucune image uploadée'
      });
    }

    if (!title || !artist) {
      console.log('❌ Titre ou artiste manquant');
      return res.status(400).json({
        success: false,
        error: 'Titre et artiste sont requis'
      });
    }

    console.log('📊 Validation des données passée');

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    console.log('🌐 Base URL:', baseUrl);
    
    const newAlbum = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      artist,
      year: parseInt(year) || new Date().getFullYear(),
      type: type || 'album',
      description: description || '',
      genre: genre || '',
      link: link || null,
      featured: featured === 'true',
      image: `${baseUrl}/uploads/visual-albums/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      isActive: true,
      order: parseInt(order) || visualAlbumsStorage.findAll().length
    };

    console.log('📝 Nouvel album créé:', newAlbum);

    const album = visualAlbumsStorage.create(newAlbum);
    
    console.log('✅ Album sauvegardé:', album);

    res.json({
      success: true,
      message: 'Album ajouté avec succès',
      album
    });

  } catch (error) {
    console.error('❌ Erreur upload album:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 Nettoyage du fichier:', req.file.path);
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mettre à jour un album
router.put('/visual-albums/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const album = visualAlbumsStorage.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['title', 'artist', 'year', 'type', 'description', 'genre', 'link', 'featured', 'order', 'isActive'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const updatedAlbum = visualAlbumsStorage.update(id, updateData);

    res.json({
      success: true,
      message: 'Album mis à jour',
      album: updatedAlbum
    });

  } catch (error) {
    console.error('Erreur mise à jour album:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Toggle featured status
router.put('/visual-albums/:id/featured', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const album = visualAlbumsStorage.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }

    const updatedAlbum = visualAlbumsStorage.update(id, { featured });

    res.json({
      success: true,
      message: `Album ${featured ? 'ajouté aux' : 'retiré des'} favoris`,
      album: updatedAlbum
    });

  } catch (error) {
    console.error('Erreur toggle featured:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Supprimer un album
router.delete('/visual-albums/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const album = visualAlbumsStorage.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(album.path)) {
      fs.unlinkSync(album.path);
    }

    // Supprimer de la base de données
    visualAlbumsStorage.delete(id);

    res.json({
      success: true,
      message: 'Album supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression album:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Réorganiser les albums
router.put('/visual-albums/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body; // [{id: '...', order: 0}, ...]

    order.forEach(item => {
      visualAlbumsStorage.update(item.id, { order: item.order });
    });

    res.json({
      success: true,
      message: 'Ordre mis à jour'
    });

  } catch (error) {
    console.error('Erreur réorganisation albums:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Rendre cette route publique (enlevez adminMiddleware)
router.get('/vijing', (req, res) => {  // ← Pas de adminMiddleware
  try {
    console.log('📡 Route /vijing appelée (publique)');
    
    const vijingStorageFile = new FileStorage('vijing.json');
    const allProjects = vijingStorageFile.findAll();
    
    console.log(`📊 ${allProjects.length} projets trouvés dans vijing.json`);
    
    // Filtrer seulement les projets actifs
    const activeProjects = allProjects.filter(project => 
      project.isActive === true || project.isActive === undefined
    );
    
    // Trier par ordre
    const sortedProjects = activeProjects.sort((a, b) => 
      (a.order || 0) - (b.order || 0)
    );
    
    console.log(`📊 ${sortedProjects.length} projets actifs après filtrage`);
    
    res.json({
      success: true,
      vijingProjects: sortedProjects
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Ajouter un nouveau projet vijing
router.post('/vijing/upload', adminMiddleware, uploadVijing.single('image'), async (req, res) => {
  try {
    const { name, venue, type, videoUrl, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image uploadée'
      });
    }

    if (!name || !venue || !type) {
      return res.status(400).json({
        success: false,
        error: 'Nom, lieu et type sont requis'
      });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    const newProject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      venue,
      type,
      description: description || '',
      videoUrl: videoUrl || null,
      image: `${baseUrl}/uploads/vijing/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      isActive: true,
      order: vijingStorageFile.findAll().length
    };

    const project = vijingStorageFile.create(newProject);

    res.json({
      success: true,
      message: 'Projet vijing ajouté avec succès',
      project: {
        ...project,
        url: `${baseUrl}/uploads/vijing/${project.filename}`
      }
    });

  } catch (error) {
    console.error('Erreur upload vijing:', error);
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload'
    });
  }
});

// Mettre à jour un projet vijing
router.put('/vijing/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = vijingStorageFile.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['name', 'venue', 'type', 'videoUrl', 'description', 'order', 'isActive'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const updatedProject = vijingStorageFile.update(id, updateData);

    res.json({
      success: true,
      message: 'Projet mis à jour',
      project: updatedProject
    });

  } catch (error) {
    console.error('Erreur mise à jour vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Supprimer un projet vijing
router.delete('/vijing/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const project = vijingStorageFile.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(project.path)) {
      fs.unlinkSync(project.path);
    }

    // Supprimer de la base de données
    vijingStorageFile.delete(id);

    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Réorganiser les projets vijing
router.put('/vijing/reorder', adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body; // [{id: '...', order: 0}, ...]

    order.forEach(item => {
      vijingStorageFile.update(item.id, { order: item.order });
    });

    res.json({
      success: true,
      message: 'Ordre mis à jour'
    });

  } catch (error) {
    console.error('Erreur réorganisation vijing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});



module.exports = router;