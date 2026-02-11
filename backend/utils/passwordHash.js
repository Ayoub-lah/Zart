const crypto = require('crypto');

class PasswordHash {
  static hash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  static verify(password, storedHash) {
    if (!password || !storedHash) return false;
    
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    return hash === originalHash;
  }

  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = PasswordHash;