import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useSelector } from 'react-redux';
// import ImageUpload from '../components/ImageUpload';
// import CategorySelect from '../components/CategorySelect';
// import LocationSelect from '../components/LocationSelect';
// import PriceInput from '../components/PriceInput';
// import StatusSelect from '../components/StatusSelect';
// import LoadingSpinner from '../components/LoadingSpinner';
// import ErrorAlert from '../components/ErrorAlert';

/**
 * EditListingPage - Page pour créer ou modifier une annonce de meuble
 * 
 * Cette page gère à la fois la création et l'édition d'annonces en fonction de la présence
 * d'un ID dans les paramètres d'URL. Elle récupère les données de l'annonce existante si
 * nécessaire et gère l'envoi du formulaire vers l'API.
 */
const EditListingPage = () => {
  // Récupération de l'ID de l'annonce depuis l'URL (undefined si création)
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Récupération du token d'authentification depuis Redux
  const { token, user } = useSelector(state => state.auth);
  
  // États pour gérer les données du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    status: 'available',
    location: '',
    images: []
  });
  
  // États pour gérer le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  const isEditing = !!id; // Vérification si on est en mode édition
  const pageTitle = isEditing ? 'Modifier l\'annonce' : 'Créer une nouvelle annonce';

  // Effet pour charger les données de l'annonce si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      fetchListingData();
    }
  }, [id]);

  /**
   * Récupère les données de l'annonce depuis l'API pour le mode édition
   */
  const fetchListingData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Vérification que l'utilisateur est bien le propriétaire de l'annonce
      if (response.data.user_id !== user.id) {
        setError('Vous n\'êtes pas autorisé à modifier cette annonce.');
        navigate('/dashboard');
        return;
      }
      
      // Mise à jour du formulaire avec les données de l'annonce
      const listing = response.data;
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category_id: listing.category_id,
        subcategory_id: listing.subcategory_id || '',
        status: listing.status,
        location: listing.location,
        images: []
      });
      
      // Chargement des images existantes pour prévisualisation
      if (listing.images && listing.images.length > 0) {
        setPreviewImages(listing.images.map(img => ({
          id: img.id,
          url: img.url,
          isExisting: true
        })));
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'annonce:', err);
      setError('Impossible de charger les données de l\'annonce. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Gère l'ajout de nouvelles images
   */
  const handleImageAdd = (files) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    
    // Création d'URLs pour la prévisualisation
    const newPreviews = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      isExisting: false
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  /**
   * Gère la suppression d'images
   */
  const handleImageDelete = (index) => {
    // Si c'est une image existante, on la marque pour suppression lors de la soumission
    if (previewImages[index].isExisting) {
      setImagesToDelete(prev => [...prev, previewImages[index].id]);
    }
    
    // Mise à jour des états pour retirer l'image
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    if (!previewImages[index].isExisting) {
      const newImages = [...formData.images];
      newImages.splice(index, 0);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Création d'un objet FormData pour l'envoi des fichiers
      const data = new FormData();
      
      // Ajout des champs texte du formulaire
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          data.append(key, formData[key]);
        }
      });
      
      // Ajout des images
      formData.images.forEach(image => {
        data.append('images[]', image);
      });
      
      // Ajout des IDs d'images à supprimer (si mode édition)
      if (isEditing && imagesToDelete.length > 0) {
        imagesToDelete.forEach(id => {
          data.append('delete_images[]', id);
        });
      }
      
      let response;
      
      // Envoi à l'API en fonction du mode (création ou édition)
      if (isEditing) {
        // En mode édition, on utilise la méthode PUT
        data.append('_method', 'PUT'); // Laravel nécessite _method pour simuler PUT avec FormData
        response = await axios.post(`/api/listings/${id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // En mode création, on utilise la méthode POST
        response = await axios.post('/api/listings', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Redirection vers la page de détail de l'annonce
      navigate(`/listings/${response.data.id}`);
      
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de l\'enregistrement de votre annonce. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage d'un spinner pendant le chargement initial
  if (isLoading) {
    return <LoadingSpinner message="Chargement de l'annonce..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">{pageTitle}</h1>
      
      {error && <ErrorAlert message={error} />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre de l'annonce */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre de l'annonce *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Ex: Table basse en chêne massif"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Décrivez votre meuble en détail (état, dimensions, matériaux...)"
          />
        </div>
        
        {/* Upload d'images */}
        <ImageUpload
          onImageAdd={handleImageAdd}
          onImageDelete={handleImageDelete}
          previewImages={previewImages}
          maxImages={5}
        />
        
        {/* Sélection de catégorie */}
        <CategorySelect
          categoryId={formData.category_id}
          subcategoryId={formData.subcategory_id}
          onChange={handleChange}
        />
        
        {/* Prix */}
        <PriceInput
          value={formData.price}
          onChange={handleChange}
        />
        
        {/* Localisation */}
        <LocationSelect
          value={formData.location}
          onChange={handleChange}
        />
        
        {/* État du produit */}
        <StatusSelect
          value={formData.status}
          onChange={handleChange}
        />
        
        {/* Boutons d'action */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier l\'annonce' : 'Publier l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingPage;