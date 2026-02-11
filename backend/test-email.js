// backend/test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('📧 Test d\'envoi d\'email...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Vérifier la connexion
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie');
    
    // Envoyer un test
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test email depuis ton backend',
      text: 'Ceci est un test pour vérifier que ton backend fonctionne.'
    });
    
    console.log('✅ Email de test envoyé:', info.messageId);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Problème d\'authentification Gmail:');
      console.log('1. Active la validation en 2 étapes sur Google');
      console.log('2. Crée un mot de passe d\'application');
      console.log('3. Mets-le dans ton .env comme EMAIL_PASS');
    }
  }
}

testEmail();