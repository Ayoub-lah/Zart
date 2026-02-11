// backend/scripts/init-data.js
const fs = require('fs');
const path = require('path');

// Créer le dossier data
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Dossier data créé');
}

// Fichiers à créer
const files = [
  {
    name: 'designs.json',
    content: {
      posters: [],
      banners: [],
      brochures: [],
      posts: [],
      logos: [],
      brands: []
    }
  },
  {
    name: 'users.json',
    content: []
  },
  {
    name: 'logos.json',
    content: []
  },
  {
    name: 'transfers.json',
    content: []
  }
];

// Créer chaque fichier
files.forEach(file => {
  const filePath = path.join(dataDir, file.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(file.content, null, 2));
    console.log(`✅ ${file.name} créé`);
  } else {
    console.log(`📁 ${file.name} existe déjà`);
  }
});

console.log('\n🎉 Structure de données initialisée avec succès!');