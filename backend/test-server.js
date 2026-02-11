// backend/test-server.js
require('dotenv').config();

console.log('🔍 Vérification de la configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Configuré' : '✗ Manquant');
console.log('PORT:', process.env.PORT || 5000);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes !');
  console.log('👉 Vérifie ton fichier .env dans le dossier backend/');
} else {
  console.log('✅ Configuration OK');
}