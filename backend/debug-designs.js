const fs = require('fs');
const path = require('path');

const designsPath = path.join(__dirname, 'data', 'designs.json');

console.log('🔍 Vérification du fichier designs.json...');
console.log('📁 Chemin:', designsPath);

if (fs.existsSync(designsPath)) {
  try {
    const data = fs.readFileSync(designsPath, 'utf8');
    const designs = JSON.parse(data);
    
    console.log('✅ Fichier trouvé');
    console.log('📊 Structure:');
    console.log('- posters:', designs.posters?.length || 0, 'items');
    console.log('- banners:', designs.banners?.length || 0, 'items');
    console.log('- brochures:', designs.brochures?.length || 0, 'items');
    console.log('- posts:', designs.posts?.length || 0, 'items');
    console.log('- logos:', designs.logos?.length || 0, 'items');
    console.log('- brands:', designs.brands?.length || 0, 'items');
    
    console.log('\n📝 Détails posters:');
    if (designs.posters && designs.posters.length > 0) {
      designs.posters.forEach((design, i) => {
        console.log(`  ${i+1}. ${design.title || 'Sans titre'} - ${design.image || 'Pas d\'image'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lecture:', error.message);
  }
} else {
  console.log('❌ Fichier non trouvé');
  console.log('📁 Création structure par défaut...');
  
  const defaultDesigns = {
    posters: [],
    banners: [],
    brochures: [],
    posts: [],
    logos: [],
    brands: []
  };
  
  fs.writeFileSync(designsPath, JSON.stringify(defaultDesigns, null, 2));
  console.log('✅ Fichier créé');
}