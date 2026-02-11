const jwt = require('jsonwebtoken');
const FileStorage = require('../utils/fileStorage');

const usersStorage = new FileStorage('users.json');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Accès refusé. Token manquant.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Vérifier si l'utilisateur existe encore
    const user = usersStorage.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé.'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré.'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Droits administrateur requis.'
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };