// backend/utils/fileStorage.js
const fs = require('fs');
const path = require('path');

class FileStorage {
  constructor(filename) {
    // Le chemin doit être relatif au dossier backend, pas utils
    this.filePath = path.join(__dirname, '..', 'data', filename);
    this.ensureFileExists();
  }

  ensureFileExists() {
    const dirPath = path.dirname(this.filePath);
    
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Dossier créé: ${dirPath}`);
    }
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(this.filePath)) {
      // Pour designs.json, créer une structure spécifique
      if (path.basename(this.filePath) === 'designs.json') {
        const initialDesigns = {
          posters: [],
          banners: [],
          brochures: [],
          posts: [],
          logos: [],
          brands: []
        };
        fs.writeFileSync(this.filePath, JSON.stringify(initialDesigns, null, 2));
        console.log(`✅ Fichier designs.json créé avec structure initiale`);
      } else {
        // Pour les autres fichiers, créer un tableau vide
        fs.writeFileSync(this.filePath, JSON.stringify([]));
        console.log(`✅ Fichier ${path.basename(this.filePath)} créé`);
      }
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      
      // Pour designs.json, s'assurer que c'est un objet
      if (path.basename(this.filePath) === 'designs.json') {
        const parsed = JSON.parse(data);
        
        // Si c'est un tableau par erreur, le convertir en objet
        if (Array.isArray(parsed)) {
          console.log(`⚠️  designs.json est un tableau, conversion en objet...`);
          const converted = {
            posters: [],
            banners: [],
            brochures: [],
            posts: [],
            logos: [],
            brands: []
          };
          this.write(converted);
          return converted;
        }
        
        // S'assurer que toutes les catégories existent
        const categories = ['posters', 'banners', 'brochures', 'posts', 'logos', 'brands'];
        categories.forEach(category => {
          if (!parsed[category]) {
            parsed[category] = [];
          }
        });
        
        return parsed;
      }
      
      // Pour les autres fichiers, retourner le tableau
      return JSON.parse(data);
      
    } catch (error) {
      console.error(`❌ Erreur lecture ${path.basename(this.filePath)}:`, error.message);
      
      // Pour designs.json, retourner une structure par défaut
      if (path.basename(this.filePath) === 'designs.json') {
        const initialDesigns = {
          posters: [],
          banners: [],
          brochures: [],
          posts: [],
          logos: [],
          brands: []
        };
        this.write(initialDesigns);
        return initialDesigns;
      }
      
      // Pour les autres fichiers, retourner un tableau vide
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`❌ Erreur écriture ${path.basename(this.filePath)}:`, error);
      return false;
    }
  }

  findById(id) {
    const data = this.read();
    
    // Pour designs.json, chercher dans toutes les catégories
    if (path.basename(this.filePath) === 'designs.json') {
      for (const category in data) {
        const item = data[category].find(item => item.id === id);
        if (item) {
          return { ...item, category }; // Inclure la catégorie dans le résultat
        }
      }
      return null;
    }
    
    // Pour les autres fichiers (tableaux)
    return data.find(item => item.id === id);
  }

  findOne(query) {
    const data = this.read();
    
    // Pour designs.json, chercher dans toutes les catégories
    if (path.basename(this.filePath) === 'designs.json') {
      for (const category in data) {
        const item = data[category].find(item => {
          for (const key in query) {
            if (item[key] !== query[key]) return false;
          }
          return true;
        });
        if (item) {
          return { ...item, category };
        }
      }
      return null;
    }
    
    // Pour les autres fichiers
    return data.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  create(item) {
    const data = this.read();
    
    // Pour designs.json, ajouter à la catégorie spécifiée
    if (path.basename(this.filePath) === 'designs.json') {
      const category = item.category || 'posters';
      delete item.category; // Supprimer category du item pour éviter duplication
      
      const newItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...item
      };
      
      if (!data[category]) {
        data[category] = [];
      }
      
      data[category].push(newItem);
      this.write(data);
      return { ...newItem, category };
    }
    
    // Pour les autres fichiers
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...item
    };
    
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  update(id, updates) {
    const data = this.read();
    
    // Pour designs.json, mettre à jour dans la catégorie
    if (path.basename(this.filePath) === 'designs.json') {
      for (const category in data) {
        const index = data[category].findIndex(item => item.id === id);
        if (index !== -1) {
          data[category][index] = {
            ...data[category][index],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          this.write(data);
          return { ...data[category][index], category };
        }
      }
      return null;
    }
    
    // Pour les autres fichiers
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.write(data);
    return data[index];
  }

  delete(id) {
    const data = this.read();
    
    // Pour designs.json, supprimer de la catégorie
    if (path.basename(this.filePath) === 'designs.json') {
      for (const category in data) {
        const index = data[category].findIndex(item => item.id === id);
        if (index !== -1) {
          data[category].splice(index, 1);
          this.write(data);
          return true;
        }
      }
      return false;
    }
    
    // Pour les autres fichiers
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    data.splice(index, 1);
    this.write(data);
    return true;
  }

  findAll(query = {}) {
    let data = this.read();
    
    // Pour designs.json, retourner l'objet complet
    if (path.basename(this.filePath) === 'designs.json') {
      // Si des critères de recherche sont spécifiés, filtrer
      if (Object.keys(query).length > 0) {
        const filtered = {};
        for (const category in data) {
          filtered[category] = data[category].filter(item => {
            for (const key in query) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
        }
        return filtered;
      }
      return data;
    }
    
    // Pour les autres fichiers (tableaux)
    if (Object.keys(query).length > 0) {
      data = data.filter(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    }
    
    return data;
  }

  // Méthode spécifique pour designs.json - obtenir par catégorie
  findByCategory(category) {
    if (path.basename(this.filePath) === 'designs.json') {
      const data = this.read();
      return data[category] || [];
    }
    return [];
  }

  // Méthode spécifique pour designs.json - mettre à jour une catégorie entière
  updateCategory(category, items) {
    if (path.basename(this.filePath) === 'designs.json') {
      const data = this.read();
      data[category] = items;
      return this.write(data);
    }
    return false;
  }
}

module.exports = FileStorage;