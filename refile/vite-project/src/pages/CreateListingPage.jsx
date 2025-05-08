// pages/CreateListingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig'; // Assurez-vous que le chemin est correct
import CitySelect from '../components/CitySelect';


const CreateListingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    condition_id: '',
    city_id: '',
    address: '',
    postal_code: '',
    whatsapp_number: '',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // Ajout d'un état pour suivre la ville sélectionnée
  const [debugInfo, setDebugInfo] = useState({
    categoriesLoaded: false,
    conditionsLoaded: false,
    subcategoriesLoaded: false,
    citySelected: false // Ajout d'un indicateur pour la sélection de ville
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupération des catégories
        try {
          const categoriesRes = await axios.get('/categories');
          console.log('Catégories reçues:', categoriesRes);

          // Vérifier la structure et transformer si nécessaire
          if (categoriesRes.data && Array.isArray(categoriesRes.data.data)) {
            setCategories(categoriesRes.data.data);
            setDebugInfo(prev => ({ ...prev, categoriesLoaded: true }));
          } else if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
            // Si les données sont directement dans data sans .data
            setCategories(categoriesRes.data);
            setDebugInfo(prev => ({ ...prev, categoriesLoaded: true }));
          } else {
            console.error('Format de données de catégories inattendu:', categoriesRes.data);
            setCategories([]);
          }
        } catch (catError) {
          console.error('Erreur lors du chargement des catégories:', catError);
          setCategories([]);
        }

        // Récupération des conditions
        try {
          const conditionsRes = await axios.get('/conditions');
          console.log('Conditions reçues:', conditionsRes.data);

          // Vérifier la structure et transformer si nécessaire
          if (conditionsRes.data && Array.isArray(conditionsRes.data.data)) {
            setConditions(conditionsRes.data.data);
            setDebugInfo(prev => ({ ...prev, conditionsLoaded: true }));
          } else if (conditionsRes.data && Array.isArray(conditionsRes.data)) {
            // Si les données sont directement dans data sans .data
            setConditions(conditionsRes.data);
            setDebugInfo(prev => ({ ...prev, conditionsLoaded: true }));
          } else {
            console.error('Format de données de conditions inattendu:', conditionsRes.data);
            setConditions([]);
          }
        } catch (condError) {
          console.error('Erreur lors du chargement des conditions:', condError);
          setConditions([]);
        }
      } catch (error) {
        console.error('Erreur générale lors du chargement des données:', error);
        setError('Impossible de charger les données nécessaires. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les sous-catégories lorsque la catégorie change
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.category_id) {
        try {
          console.log(`Chargement des sous-catégories pour la catégorie ID: ${formData.category_id}`);
          const response = await axios.get(`/subcategories/category_id=${formData.category_id}`);
          console.log('Sous-catégories reçues:', response.data);

          // Vérifier la structure et transformer si nécessaire
          if (response.data && Array.isArray(response.data.data)) {
            setSubcategories(response.data.data);
            setDebugInfo(prev => ({ ...prev, subcategoriesLoaded: true }));
          } else if (response.data && Array.isArray(response.data)) {
            // Si les données sont directement dans data sans .data
            setSubcategories(response.data);
            setDebugInfo(prev => ({ ...prev, subcategoriesLoaded: true }));
          } else {
            console.error('Format de données de sous-catégories inattendu:', response.data);
            setSubcategories([]);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des sous-catégories:', error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [formData.category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changement de ${name} à ${value}`);

    // S'il s'agit d'un changement de catégorie, réinitialiser la sous-catégorie
    if (name === 'category_id') {
      setFormData({
        ...formData,
        [name]: value,
        subcategory_id: '' // Réinitialiser la sous-catégorie
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCitySelect = (city) => {
    if (city) {
      console.log('Ville sélectionnée:', city);

      // Mettre à jour l'état de la ville sélectionnée
      setSelectedCity(city);

      // S'assurer que l'ID de la ville est bien un nombre ou une chaîne non vide
      const cityId = city.id ? city.id.toString() : '';

      // Vérifier si l'ID de la ville est valide
      if (!cityId) {
        console.error('ID de ville invalide ou manquant:', city);
      }

      setFormData({
        ...formData,
        city_id: cityId,
        postal_code: city.postal_code || formData.postal_code
      });

      // Mettre à jour l'info de débogage
      setDebugInfo(prev => ({ ...prev, citySelected: true }));

      console.log('FormData après sélection de ville:', {
        ...formData,
        city_id: cityId,
        postal_code: city.postal_code || formData.postal_code
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      console.log(`${fileList.length} images sélectionnées`);

      // Limiter à 5 images maximum
      const limitedFiles = fileList.slice(0, 5);
      setImages(limitedFiles);

      // Créer des URL pour la prévisualisation
      const previews = limitedFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification préalable que city_id est défini
    if (!formData.city_id) {
      setError('Veuillez sélectionner une ville avant de soumettre l\'annonce.');
      setLoading(false);
      return;
    }

    console.log('Données du formulaire à soumettre:', formData);

    try {
      // Créer un FormData pour envoyer les données et les images en une seule requête
      const formDataToSend = new FormData();

      // Convertir les valeurs en chaînes de caractères pour éviter les erreurs de type
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          // Convertir les valeurs numériques en chaînes si nécessaire
          const value =
            ['category_id', 'subcategory_id', 'condition_id', 'city_id', 'price'].includes(key) && formData[key]
              ? String(formData[key])
              : formData[key];

          formDataToSend.append(key, value);
        }
      });

      // Ajouter l'ID utilisateur depuis le localStorage
      const userId = localStorage.getItem('user_id');
      if (userId) {
        formDataToSend.append('user_id', userId);
      } else {
        throw new Error('ID utilisateur non trouvé. Veuillez vous reconnecter.');
      }

      // Ajouter les images
      if (images.length > 0) {
        // Pour les API qui attendent un tableau d'images
        images.forEach(image => {
          formDataToSend.append('images[]', image);
        });
      }

      console.log('Envoi du FormData avec images');

      // Journaliser les paires clé/valeur du FormData pour le débogage
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Envoyer la requête avec le bon header pour FormData
      const response = await axios.post('/listings', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      console.log('Réponse reçue:', response.data);

      // Récupérer l'ID de l'annonce créée
      const listingId = response.data?.data?.id || response.data?.id;

      if (!listingId) {
        throw new Error('ID de l\'annonce non reçu');
      }

      // Rediriger vers la page de détail de l'annonce
      navigate(`/listings/${listingId}`);

    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);

      // Afficher les détails de l'erreur pour mieux diagnostiquer
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response.data);

        // Afficher les erreurs de validation spécifiques si disponibles
        if (error.response.data && error.response.data.errors) {
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');

          setError(`Erreur de validation: \n${errorMessages}`);
        } else {
          setError(
            error.response.data.message ||
            'Une erreur est survenue lors de la création de l\'annonce. Veuillez réessayer.'
          );
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Afficher des informations de débogage si nécessaire
  const renderDebugInfo = () => {
    return (
      <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
        <h3 className="font-bold mb-2">Informations de débogage:</h3>
        <ul>
          <li>Catégories chargées: {debugInfo.categoriesLoaded ? 'Oui' : 'Non'} (Nombre: {categories.length})</li>
          <li>Conditions chargées: {debugInfo.conditionsLoaded ? 'Oui' : 'Non'} (Nombre: {conditions.length})</li>
          <li>Sous-catégories chargées: {debugInfo.subcategoriesLoaded ? 'Oui' : 'Non'} (Nombre: {subcategories.length})</li>
          <li>Catégorie sélectionnée: {formData.category_id || 'Aucune'}</li>
          <li>Sous-catégorie sélectionnée: {formData.subcategory_id || 'Aucune'}</li>
          <li>Condition sélectionnée: {formData.condition_id || 'Aucune'}</li>
          <li>Ville sélectionnée: {selectedCity ? `${selectedCity.name} (ID: ${formData.city_id})` : 'Aucune'}</li>
          <li>Nombre d'images sélectionnées: {images.length}</li>
        </ul>
      </div>
    );
  };

  if (loading && categories.length === 0) {
    return <div className="text-center p-10">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer une nouvelle annonce</h1>

      {/* Afficher les informations de débogage en développement */}
      {process.env.NODE_ENV === 'development' && renderDebugInfo()}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div>
          <label className="block mb-2 font-medium">Titre de l'annonce</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border rounded-md"
          ></textarea>
        </div>

        <div>
          <label className="block mb-2 font-medium">Prix (FCFA)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Catégories et état */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Catégorie</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Sélectionner une catégorie</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucune catégorie disponible</option>
              )}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Sous-catégorie</label>
            <select
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
              required={formData.category_id !== ''}
              disabled={!formData.category_id}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Sélectionner une sous-catégorie</option>
              {Array.isArray(subcategories) && subcategories.length > 0 ? (
                subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {formData.category_id ? "Aucune sous-catégorie disponible" : "Veuillez d'abord sélectionner une catégorie"}
                </option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">État</label>
          <select
            name="condition_id"
            value={formData.condition_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="">Sélectionner un état</option>
            {Array.isArray(conditions) && conditions.length > 0 ? (
              conditions.map(condition => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Aucun état disponible</option>
            )}
          </select>
        </div>

        {/* Localisation */}
        <div>
          <label className="block mb-2 font-medium">Ville <span className="text-red-500">*</span></label>
          <CitySelect
            value={selectedCity?.id || ''}
            onChange={handleCitySelect}
          />

          {selectedCity && (
            <p className="text-sm text-green-600 mt-1">
              Ville sélectionnée: {selectedCity.name}
            </p>
          )}
          {!selectedCity && formData.city_id === '' && (
            <p className="text-sm text-red-500 mt-1">
              Veuillez sélectionner une ville
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Adresse</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Code postal</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="3000"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block mb-2 font-medium">Numéro WhatsApp (optionnel)</label>
          <input
            type="text"
            name="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={handleChange}
            placeholder="+237000000000"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Images avec prévisualisation */}
        <div>
          <label className="block mb-2 font-medium">Photos (max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">Vous pouvez sélectionner jusqu'à 5 images.</p>

          {/* Prévisualisation des images */}
          {previewImages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Aperçu des images:</p>
              <div className="flex flex-wrap gap-2">
                {previewImages.map((preview, index) => (
                  <div key={index} className="w-20 h-20 relative">
                    <img
                      src={preview}
                      alt={`Aperçu ${index + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formData.city_id}
          className={`w-full py-2 px-4 rounded-md transition ${!formData.city_id
              ? 'bg-gray-400 cursor-not-allowed'
              : loading
                ? 'bg-blue-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;