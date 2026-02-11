const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PasswordHash = require('../utils/passwordHash');

const resetDatabase = () => {
  console.log('🔄 Réinitialisation de la base de données...');
  
  const dataDir = path.join(__dirname, '..', 'data');
  
  // Créer le dossier data s'il n'existe pas
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Réinitialiser users.json
  const hashedPassword = PasswordHash.hash('admin123');
  const users = [{
    id: '1',
    username: 'admin',
    password: hashedPassword,
    email: 'admin@zartissam.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: null
  }];
  
  fs.writeFileSync(
    path.join(dataDir, 'users.json'),
    JSON.stringify(users, null, 2)
  );
  console.log('✅ users.json réinitialisé');
  
  // Réinitialiser logos.json
  fs.writeFileSync(
    path.join(dataDir, 'logos.json'),
    JSON.stringify([], null, 2)
  );
  console.log('✅ logos.json réinitialisé');
  
  // Réinitialiser transfers.json
  fs.writeFileSync(
    path.join(dataDir, 'transfers.json'),
    JSON.stringify([], null, 2)
  );
  console.log('✅ transfers.json réinitialisé');
  
  // Créer quelques logos de test
  const logosDir = path.join(__dirname, '..', 'uploads', 'logos');
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  // Logos de démonstration
  const demoLogos = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Tesla',
    'Adobe', 'Spotify', 'Netflix', 'Uber', 'Airbnb', 'Slack'
  ];
  
  console.log('📸 Création de logos de démonstration...');
  
  demoLogos.forEach((name, index) => {
    const logoPath = path.join(logosDir, `logo${index + 1}.png`);
    
    // Créer un fichier PNG simple (128x128 pixels avec le nom)
    const svgContent = `
      <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="#1a1a1a"/>
        <rect width="120" height="120" x="4" y="4" fill="#2d2d2d" rx="12"/>
        <text x="64" y="70" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">${name}</text>
        <text x="64" y="90" font-family="Arial" font-size="10" fill="#888888" text-anchor="middle">LOGO</text>
      </svg>
    `.trim();
    
    // Convertir SVG en base64 PNG (simulé)
    const base64Svg = Buffer.from(svgContent).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
    
    // Écrire un fichier texte avec l'URI (en pratique, vous utiliserez de vrais logos)
    fs.writeFileSync(logoPath, `Placeholder for ${name} logo\nActual logo should be placed here`);
    
    console.log(`  ✅ ${name}.png créé`);
  });
  
  console.log('\n🎉 Base de données réinitialisée avec succès!');
  console.log('='.repeat(50));
  console.log('👑 Admin: admin / admin123');
  console.log('📁 Data directory:', dataDir);
  console.log('📁 Logos directory:', logosDir);
  console.log('='.repeat(50));
  console.log('⚠️  N\'oubliez pas de changer le mot de passe admin!');
  console.log('='.repeat(50));
};

resetDatabase();