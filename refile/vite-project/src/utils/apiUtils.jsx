// utils/apiUtils.js

// Configuration de base d'Axios avec des intercepteurs pour gérer les problèmes courants
import axios from 'axios';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  config => {
    // Ajouter des en-têtes d'authentification, par exemple
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  response => {
    // Gérer les réponses normales
    return response;
  },
  error => {
    // Gérer les erreurs de réponse
    if (error.response) {
      // La requête a été effectuée et le serveur a répondu avec un code d'état hors de la plage 2xx
      console.error('Erreur de réponse API:', error.response.status, error.response.data);
      
      // Gérer les problèmes d'authentification
      if (error.response.status === 401) {
        // Rediriger vers la page de connexion ou rafraîchir le token
        console.log('Session expirée, redirection vers la page de connexion');
        // window.location.href = '/login';
      }
      
      // Vérifie si la réponse est du HTML au lieu du JSON attendu
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Réponse HTML reçue au lieu de JSON:', error.response.data);
        return Promise.reject(new Error('Format de réponse incorrect reçu du serveur'));
      }
    } else if (error.request) {
      // La requête a été effectuée mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Données de secours pour les catégories
export const fallbackCategories = [
  { id: 1, name: "Meubles" },
  { id: 2, name: "Électroménager" },
  { id: 3, name: "Décoration" },
  { id: 4, name: "Jardin & Extérieur" },
  { id: 5, name: "Électronique" }
];

// Données de secours pour les conditions
export const fallbackConditions = [
  { id: 1, name: "Neuf" },
  { id: 2, name: "Comme neuf" },
  { id: 3, name: "Bon état" },
  { id: 4, name: "État moyen" },
  { id: 5, name: "À rénover" }
];

// Données de secours pour les sous-catégories
export const fallbackSubcategories = {
  '1': [ // Meubles
    { id: 101, name: "Canapés & Fauteuils" },
    { id: 102, name: "Tables & Chaises" },
    { id: 103, name: "Lits & Matelas" },
    { id: 104, name: "Armoires & Rangements" }
  ],
  '2': [ // Électroménager
    { id: 201, name: "Réfrigérateurs" },
    { id: 202, name: "Lave-linge" },
    { id: 203, name: "Cuisine" },
    { id: 204, name: "Petit électroménager" }
  ],
  '3': [ // Décoration
    { id: 301, name: "Luminaires" },
    { id: 302, name: "Tapis" },
    { id: 303, name: "Miroirs" },
    { id: 304, name: "Objets déco" }
  ],
  '4': [ // Jardin & Extérieur
    { id: 401, name: "Mobilier de jardin" },
    { id: 402, name: "Outils de jardinage" },
    { id: 403, name: "Barbecues" },
    { id: 404, name: "Piscines & Accessoires" }
  ],
  '5': [ // Électronique
    { id: 501, name: "TV & Audio" },
    { id: 502, name: "Ordinateurs" },
    { id: 503, name: "Smartphones" },
    { id: 504, name: "Accessoires" }
  ]
};

// Fonction utilitaire pour charger les catégories avec gestion des erreurs
export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error('Format de données inattendu');
  } catch (error) {
    console.error('Erreur lors du chargement des catégories, utilisation des données de secours', error);
    return fallbackCategories;
  }
};

// Fonction utilitaire pour charger les conditions avec gestion des erreurs
export const fetchConditions = async () => {
  try {
    const response = await api.get('/conditions');
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error('Format de données inattendu');
  } catch (error) {
    console.error('Erreur lors du chargement des conditions, utilisation des données de secours', error);
    return fallbackConditions;
  }
};

// Fonction utilitaire pour charger les sous-catégories avec gestion des erreurs
export const fetchSubcategories = async (categoryId) => {
  if (!categoryId) return [];
  
  try {
    const response = await api.get(`/subcategories?category_id=${categoryId}`);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error('Format de données inattendu');
  } catch (error) {
    console.error(`Erreur lors du chargement des sous-catégories pour la catégorie ${categoryId}, utilisation des données de secours`, error);
    return fallbackSubcategories[categoryId.toString()] || [];
  }
};

export default api;