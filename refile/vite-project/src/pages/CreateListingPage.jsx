// CreateListingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Page de création d'une nouvelle annonce
 * Formulaire avec prévisualisation des images et validation
 */
const CreateListingPage = () => {
  // Initialisation du hook de navigation
  const navigate = useNavigate();

  // Définition de l'état initial du formulaire avec useState
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    image: null,
  });

  // Gestionnaire de changement pour les champs de texte et select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Gestionnaire spécifique pour le changement d'image
  const handleImageChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      image: e.target.files[0]
    }));
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    try {
      // Création d'un objet FormData pour envoyer les données multipart
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Envoi de la requête POST vers l'API
      // Récupère le token du localStorage ou du contexte d'authentification
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:8000/api/listings', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      // Redirection vers la page des annonces après succès
      navigate('/listings');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error("Erreurs de validation :", error.response.data.errors);
        // Tu peux aussi afficher ces erreurs à l'utilisateur
        alert("Erreur de validation : " + JSON.stringify(error.response.data.errors, null, 2));
      } else if (error.response && error.response.status === 401) {
        alert("Non autorisé. Vérifie ton token.");
      } else {
        console.error("Erreur inconnue :", error);
        alert("Une erreur est survenue. Voir la console.");
      }
    }
  };

  // Rendu du composant
  return (
    // Container principal avec une largeur maximale et un padding
    <div className="max-w-2xl mx-auto p-6">
      {/* Titre de la page */}
      <h1 className="text-3xl font-bold mb-6">Créer une nouvelle annonce</h1>

      {/* Formulaire de création d'annonce */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champ pour le titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Champ pour la description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Champ pour le prix */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Menu déroulant pour la catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            <option value="salon">Salon</option>
            <option value="chambre">Chambre</option>
            <option value="cuisine">Cuisine</option>
            <option value="bureau">Bureau</option>
            <option value="jardin">Jardin</option>
          </select>
        </div>

        {/* Menu déroulant pour l'état du meuble */}
        <div>
          <label className="block text-sm font-medium text-gray-700">État</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Sélectionnez l'état</option>
            <option value="neuf">Neuf</option>
            <option value="très bon">Très bon état</option>
            <option value="bon">Bon état</option>
            <option value="acceptable">État acceptable</option>
          </select>
        </div>

        {/* Champ pour l'upload d'image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="mt-1 block w-full"
            accept="image/*"
            required
          />
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Créer l'annonce
          </button>
        </div>
      </form>
    </div>
  );
};

// Export du composant
export default CreateListingPage;