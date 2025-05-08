// ListingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { FaHeart, FaRegHeart, FaEye, FaWhatsapp, FaFlag, FaCopy } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';

/**
 * Page de détail d'une annonce
 * Affiche toutes les informations d'une annonce spécifique
 * Permet de contacter le vendeur, ajouter aux favoris, signaler l'annonce
 * Et aussi de dupliquer l'annonce pour le vendeur
 */
const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Récupération des détails de l'annonce
  const { data: listing, isLoading, error } = useQuery(['listing', id], async () => {
    const response = await axios.get(`/api/listings/${id}`);
    // S'assurer que les images sont correctement formatées
    if (response.data && response.data.images) {
      // Si images est une chaîne JSON, la parser
      if (typeof response.data.images === 'string') {
        try {
          response.data.images = JSON.parse(response.data.images);
        } catch (e) {
          // Si ce n'est pas un JSON valide, considérer comme une seule URL
          response.data.images = [response.data.images];
        }
      } else if (!Array.isArray(response.data.images)) {
        // Si ce n'est pas un array, le convertir en array
        response.data.images = response.data.images ? [response.data.images] : [];
      }
    } else {
      response.data.images = [];
    }
    return response.data;
  });

  // Définir le titre par défaut pour la duplication lors du chargement de l'annonce
  useEffect(() => {
    if (listing && listing.title) {
      setDuplicateTitle(listing.title);
    }
  }, [listing]);

  // Incrémentation du compteur de vues
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await axios.post(`/api/listings/${id}/view`);
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues', error);
      }
    };

    incrementViews();
  }, [id]);

  // Mutation pour ajouter/retirer des favoris
  const toggleFavoriteMutation = useMutation(
    async () => {
      if (listing.isFavorite) {
        await axios.delete(`/api/listings/${id}/favorite`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`/api/listings/${id}/favorite`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['listing', id]);
        queryClient.invalidateQueries('favorites');
        showNotification(listing.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 'success');
      }
    }
  );

  // Mutation pour envoyer un message
  const sendContactMessageMutation = useMutation(
    async () => {
      await axios.post(`/api/listings/${id}/contact`, { message: contactMessage }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    },
    {
      onSuccess: () => {
        setContactMessage('');
        setIsContactModalOpen(false);
        showNotification('Message envoyé avec succès', 'success');
      },
      onError: (error) => {
        showNotification('Erreur lors de l\'envoi du message', 'error');
      }
    }
  );

  // Mutation pour signaler une annonce
  const reportListingMutation = useMutation(
    async () => {
      await axios.post(`/api/listings/${id}/report`, { reason: reportReason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    },
    {
      onSuccess: () => {
        setReportReason('');
        setIsReportModalOpen(false);
        showNotification('Signalement envoyé, merci', 'success');
      },
      onError: (error) => {
        showNotification('Erreur lors du signalement', 'error');
      }
    }
  );

  // Mutation pour dupliquer une annonce
  const duplicateListingMutation = useMutation(
    async () => {
      // Récupérer les détails complets de l'annonce
      const response = await axios.get(`/api/listings/${id}/duplicate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Créer une nouvelle annonce avec les mêmes détails mais titre modifié si nécessaire
      const listingData = {
        ...response.data,
        title: duplicateTitle || response.data.title, // Utiliser le nouveau titre ou l'ancien
        user_id: user.id
      };
      
      // Envoyer la requête de création
      const newListingResponse = await axios.post(`/api/listings/duplicate`, listingData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      return newListingResponse.data;
    },
    {
      onSuccess: (data) => {
        setIsDuplicateModalOpen(false);
        showNotification('Annonce dupliquée avec succès', 'success');
        // Rediriger vers la nouvelle annonce
        const newListingId = data?.id || data?.data?.id;
        if (newListingId) {
          navigate(`/listings/${newListingId}`);
        }
      },
      onError: (error) => {
        showNotification('Erreur lors de la duplication de l\'annonce', 'error');
      }
    }
  );

  // Gestion des notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><p>Chargement...</p></div>;
  if (error) return <div className="text-red-600 p-4">Erreur: L'annonce n'a pas pu être chargée</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Retour aux annonces
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Galerie d'images */}
          <div className="md:w-1/2 p-4">
            <div className="relative h-80 mb-4 bg-gray-100 rounded-md overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[activeImage]} 
                  alt={listing.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Aucune image disponible</p>
                </div>
              )}
            </div>
            
            {listing.images && listing.images.length > 1 && (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {listing.images.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                      activeImage === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations de l'annonce */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
              {user && (
                <button 
                  onClick={() => toggleFavoriteMutation.mutate()}
                  className="text-xl"
                  aria-label={listing.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {listing.isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              )}
            </div>

            <p className="text-2xl font-bold text-blue-600 mb-4">{listing.price} FCFA</p>
            
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">
                Publié le {new Date(listing.createdAt).toLocaleDateString()} à {listing.location}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <FaEye className="mr-1" /> {listing.views} vues
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{listing.description}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              {listing.category && (
                <div>
                  <span className="text-sm text-gray-500">Catégorie</span>
                  <p>{listing.category}</p>
                </div>
              )}
              {listing.condition && (
                <div>
                  <span className="text-sm text-gray-500">État</span>
                  <p>{listing.condition}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {user && user.id !== listing.userId && (
                <>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <FaWhatsapp className="mr-2" /> Contacter le vendeur
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center"
                  >
                    <FaFlag className="mr-2" /> Signaler l'annonce
                  </button>
                </>
              )}
              
              {/* Option de duplication pour le vendeur */}
              {user && user.id === listing.userId && (
                <button
                  onClick={() => setIsDuplicateModalOpen(true)}
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Dupliquer cette annonce
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Contacter le vendeur</h2>
            <p className="mb-4">Votre message sera envoyé au vendeur de "{listing.title}"</p>
            
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full p-2 border rounded-md h-32 mb-4"
              placeholder="Écrivez votre message ici..."
            ></textarea>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => sendContactMessageMutation.mutate()}
                disabled={!contactMessage.trim() || sendContactMessageMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {sendContactMessageMutation.isLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de signalement */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Signaler cette annonce</h2>
            <p className="mb-4">Merci de nous indiquer pourquoi vous souhaitez signaler cette annonce.</p>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 border rounded-md h-32 mb-4"
              placeholder="Décrivez le problème..."
            ></textarea>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => reportListingMutation.mutate()}
                disabled={!reportReason.trim() || reportListingMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
              >
                {reportListingMutation.isLoading ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de duplication */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Dupliquer cette annonce</h2>
            <p className="mb-4">Créez une nouvelle annonce avec les mêmes informations. Vous pouvez modifier le titre si vous le souhaitez.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => duplicateListingMutation.mutate()}
                disabled={duplicateListingMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
              >
                {duplicateListingMutation.isLoading ? 'Duplication...' : 'Dupliquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;