const fs = require('fs');
const path = require('path');

console.log('📁 Création des dossiers...');

const directories = [
  'data', 'uploads', 'uploads/logos', 'uploads/designs',
  'uploads/vijing', 'uploads/visual-albums', 'uploads/files'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

console.log('✅ Dossiers créés');