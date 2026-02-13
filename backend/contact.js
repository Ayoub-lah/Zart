// backend/contact.js - Version avec Hostinger

const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Configuration du transporteur pour Hostinger
// Cette partie doit être présente (elle l'est probablement déjà)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true pour 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration email Hostinger:', error.message);
  } else {
    console.log('✅ Configuration email Hostinger OK - Prêt à envoyer');
  }
});

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact API fonctionnelle',
    emailConfigured: true,
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    timestamp: new Date().toISOString()
  });
});

// Route principale pour envoyer les emails
router.post('/send', async (req, res) => {
  console.log('📩 Requête de contact reçue:', {
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const { firstName, lastName, email, phone, service, message } = req.body;

    // Validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires (nom, email, message)'
      });
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email invalide'
      });
    }

    // Configuration de l'email
    const mailOptions = {
      from: `"Portfolio Zartissam" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Vous recevez l'email
      replyTo: email, // Pour répondre directement à l'expéditeur
      subject: `📧 Nouveau message de ${firstName} ${lastName} - Portfolio`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee; }
            .info-item { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .message-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>📬 Nouveau message de contact</h2>
            <p>Portfolio Zartissam</p>
          </div>
          <div class="content">
            <div class="info-item">
              <span class="label">👤 Nom:</span> ${firstName} ${lastName}
            </div>
            <div class="info-item">
              <span class="label">📧 Email:</span> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="info-item">
              <span class="label">📱 Téléphone:</span> ${phone || 'Non fourni'}
            </div>
            <div class="info-item">
              <span class="label">🎯 Service demandé:</span> ${service || 'Non spécifié'}
            </div>
            
            <div class="message-box">
              <div class="label">💬 Message:</div>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="footer">
              <p>📅 Reçu le: ${new Date().toLocaleString('fr-FR')}</p>
              <p>🔗 Envoyé depuis: Portfolio Zartissam</p>
              <p>⚠️ Ce message a été envoyé via le formulaire de contact du portfolio</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
NOUVEAU CONTACT PORTFOLIO
==========================

Nom: ${firstName} ${lastName}
Email: ${email}
Téléphone: ${phone || 'Non fourni'}
Service: ${service || 'Non spécifié'}

Message:
${message}

---
Envoyé le: ${new Date().toLocaleString('fr-FR')}
Depuis: Portfolio Zartissam
      `
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email envoyé avec succès via Hostinger:', {
      messageId: info.messageId,
      to: info.envelope.to,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès ! Je te répondrai dans les 24h.'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route pour obtenir la configuration
router.get('/config', (req, res) => {
  res.json({
    emailConfigured: true,
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    user: process.env.EMAIL_USER ? '✓ Configuré' : '✗ Non configuré',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;