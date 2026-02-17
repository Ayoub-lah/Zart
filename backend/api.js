const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const archiver = require('archiver');
const FileStorage = require('./utils/fileStorage');

const router = express.Router();

// Initialiser le stockage des transferts
const transfersStorage = new FileStorage('transfers.json');

// Configuration du stockage (inchangé)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/files/';
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


const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB par fichier
    files: 50 // Maximum 50 fichiers
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Route d'upload (modifiée pour utiliser FileStorage)
router.post('/upload', upload.array('files'), (req, res) => {
  try {
    const { expiryDays = 7, requireCode = 'true', email } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun fichier uploadé' 
      });
    }

    // AUGMENTER LA TAILLE TOTALE À 50GB
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024 * 1024) { // 50GB max total
      // Supprimer les fichiers uploadés
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        success: false,
        error: 'La taille totale dépasse 50GB'
      });
    }

    // Générer un ID unique
    const downloadId = crypto.randomBytes(16).toString('hex');
    const accessCode = requireCode === 'true' ? 
      crypto.randomBytes(3).toString('hex').toUpperCase() : 
      null;

    // Date d'expiration
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

    // Sauvegarder dans le stockage fichier
    const transfer = transfersStorage.create({
      downloadId,
      files: files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        path: file.path,
        mimetype: file.mimetype,
        uploadDate: new Date().toISOString()
      })),
      accessCode,
      expiresAt: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
      downloads: 0,
      maxDownloads: 50,
      email: email || null,
      totalSize: totalSize
    });

    // URL de base
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    res.json({
      success: true,
      downloadId,
      accessCode,
      expiresAt: expiryDate.toISOString(),
      downloadUrl: `${baseUrl}/download/${downloadId}`,
      files: files.map(file => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      })),
      totalSize,
      message: 'Fichiers uploadés avec succès'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
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

// Route de vérification (modifiée)
router.post('/verify/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    // Trouver le transfert
    const transfers = transfersStorage.findAll();
    const transfer = transfers.find(t => t.downloadId === id);

    if (!transfer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lien introuvable ou expiré' 
      });
    }

    // Vérifier l'expiration
    if (new Date(transfer.expiresAt) < new Date()) {
      // Nettoyer les fichiers expirés
      transfer.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      transfersStorage.delete(transfer.id);
      
      return res.status(410).json({ 
        success: false, 
        error: 'Le lien a expiré' 
      });
    }

    // Vérifier le code
    if (transfer.accessCode && transfer.accessCode !== code) {
      return res.status(403).json({ 
        success: false, 
        error: 'Code incorrect' 
      });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    res.json({
      success: true,
      files: transfer.files.map(file => ({
        name: file.originalName,
        size: file.size,
        type: file.mimetype,
        downloadUrl: `${baseUrl}/api/download/${id}/${file.filename}`,
        directDownload: `${baseUrl}/api/download-direct/${id}/${file.filename}`
      })),
      expiresAt: transfer.expiresAt,
      uploader: 'Zartissam',
      remainingDownloads: transfer.maxDownloads - transfer.downloads,
      totalSize: transfer.totalSize,
      fileCount: transfer.files.length
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de vérification' 
    });
  }
});

// Route pour télécharger un fichier individuel (modifiée)
router.get('/download/:id/:filename', (req, res) => {
  try {
    const { id, filename } = req.params;
    const { code } = req.query;
    
    const transfers = transfersStorage.findAll();
    const transfer = transfers.find(t => t.downloadId === id);

    if (!transfer) {
      return res.status(404).send('Fichier non trouvé');
    }

    // Vérifier le code si nécessaire
    if (transfer.accessCode && transfer.accessCode !== code) {
      return res.status(403).send('Accès refusé');
    }

    const file = transfer.files.find(f => f.filename === filename);
    if (!file) {
      return res.status(404).send('Fichier non trouvé');
    }

    // Vérifier si le fichier existe physiquement
    if (!fs.existsSync(file.path)) {
      return res.status(404).send('Fichier non disponible');
    }

    // Incrémenter le compteur de téléchargements
    transfer.downloads++;
    transfersStorage.update(transfer.id, { downloads: transfer.downloads });

    // Supprimer si trop de téléchargements
    if (transfer.downloads >= transfer.maxDownloads) {
      transfer.files.forEach(f => {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
      transfersStorage.delete(transfer.id);
    }

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size);

    // Stream le fichier
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Erreur de téléchargement');
  }
});

// backend/api.js - MODIFIER LA ROUTE ZIP

// Route pour télécharger tous les fichiers en ZIP
router.get('/download-all/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;
    
    // Trouver le transfert
    const transfers = transfersStorage.findAll();
    const transfer = transfers.find(t => t.downloadId === id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      });
    }

    // Vérifier l'expiration
    if (new Date(transfer.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Link expired'
      });
    }

    // Vérifier le code si nécessaire
    if (transfer.accessCode && transfer.accessCode !== code) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Vérifier s'il reste des téléchargements
    if (transfer.downloads >= transfer.maxDownloads) {
      return res.status(410).json({
        success: false,
        error: 'Download limit reached'
      });
    }

    // Vérifier que les fichiers existent physiquement
    const missingFiles = transfer.files.filter(file => !fs.existsSync(file.path));
    if (missingFiles.length > 0) {
      return res.status(404).json({
        success: false,
        error: 'Some files are missing'
      });
    }

    // Créer un ZIP avec tous les fichiers
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    });

    // Nom du fichier ZIP avec date
    const currentDate = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    const zipName = `shared_by_zartissam_${currentDate}.zip`;
    
    // Configurer les headers de réponse
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('X-Filename', zipName); // Header personnalisé pour le frontend

    // Gérer les erreurs d'archive
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        error: 'Error creating archive'
      });
    });

    // Gérer la fin de l'archive
    archive.on('end', () => {
      console.log(`ZIP archive created: ${zipName} (${archive.pointer()} bytes)`);
    });

    // Ajouter chaque fichier à l'archive
    transfer.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        archive.file(file.path, { name: file.originalName });
      }
    });

    // Finaliser l'archive et envoyer
    archive.pipe(res);
    await archive.finalize();

    // Incrémenter le compteur de téléchargements
    transfer.downloads++;
    transfersStorage.update(transfer.id, { downloads: transfer.downloads });

    // Supprimer si trop de téléchargements
    if (transfer.downloads >= transfer.maxDownloads) {
      transfer.files.forEach(f => {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
      transfersStorage.delete(transfer.id);
    }

  } catch (error) {
    console.error('ZIP download error:', error);
    res.status(500).json({
      success: false,
      error: 'Error downloading files'
    });
  }
});



router.get('/transfer/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Trouver le transfert
    const transfers = transfersStorage.findAll();
    const transfer = transfers.find(t => t.downloadId === id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      });
    }

    // Vérifier l'expiration
    if (new Date(transfer.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Link expired'
      });
    }

    res.json({
      success: true,
      uploader: transfer.email || 'Zartissam',
      expiresAt: transfer.expiresAt,
      downloads: transfer.downloads,
      maxDownloads: transfer.maxDownloads,
      fileCount: transfer.files.length,
      totalSize: transfer.totalSize
    });

  } catch (error) {
    console.error('Transfer info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ... (les autres routes restent similaires avec modifications pour utiliser FileStorage)

// Nettoyage automatique des transferts expirés
setInterval(() => {
  const now = new Date();
  const transfers = transfersStorage.findAll();
  
  transfers.forEach(transfer => {
    if (new Date(transfer.expiresAt) < now) {
      // Supprimer les fichiers physiques
      transfer.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }
      });
      // Supprimer de la base de données
      transfersStorage.delete(transfer.id);
      console.log(`Transfer ${transfer.downloadId} nettoyé`);
    }
  });
}, 3600000); // Toutes les heures

module.exports = router;