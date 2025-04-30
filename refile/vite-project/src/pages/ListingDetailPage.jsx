// ListingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { FaHeart, FaRegHeart, FaEye, FaWhatsapp, FaFlag } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

/**
 * Page de détail d'une annonce
 * Affiche toutes les informations d'une annonce spécifique
 * Permet de contacter le vendeur, ajouter aux favoris, signaler l'annonce
 */
const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [reportReason, setReportReason] = useState('');

  // Récupération des détails de l'annonce
  const { data: listing, isLoading, error } = useQuery(['listing', id], async () => {
    const response = await axios.get(`/api/listings/${id}`);
    return response.data;
  });

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
      }
    }
  );

  if (isLoading) return <div className="flex justify-center items-center h-64"><p>Chargement...</p></div>;
  if (error) return <div className="text-red-600 p-4">Erreur: L'annonce n'a pas pu être chargée</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
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

            <p className="text-2xl font-bold text-blue-600 mb-4">{listing.price} €</p>
            
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

            {user && user.id !== listing.userId && (
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <FaWhatsapp className="mr-2" /> Contacter le vendeur
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-red-600 text-sm flex items-center justify-center"
                >
                  <FaFlag className="mr-1" /> Signaler cette annonce
                </button>
              </div>
            )}

            {user && user.id === listing.userId && (
              <div className="flex space-x-2">
                <Link 
                  to={`/edit-listing/${listing.id}`}
                  className="bg-gray-200 px-4 py-2 rounded-md flex-1 text-center"
                >
                  Modifier
                </Link>
                <button 
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-md flex-1"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Contacter le vendeur</h2>
            <p className="mb-4">Envoyez un message au vendeur concernant "{listing.title}"</p>
            
            <div className="mb-4">
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                className="w-full border rounded-md p-2"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Je suis intéressé(e) par votre annonce..."
              ></textarea>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 border rounded-md flex-1"
              >
                Annuler
              </button>
              <button 
                onClick={() => sendContactMessageMutation.mutate()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex-1"
                disabled={!contactMessage.trim()}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de signalement */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Signaler l'annonce</h2>
            <p className="mb-4">Veuillez indiquer la raison du signalement :</p>
            
            <div className="mb-4">
              <select
                className="w-full border rounded-md p-2"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Sélectionnez une raison</option>
                <option value="fake">Annonce frauduleuse</option>
                <option value="inappropriate">Contenu inapproprié</option>
                <option value="duplicate">Annonce en double</option>
                <option value="other">Autre raison</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 border rounded-md flex-1"
              >
                Annuler
              </button>
              <button 
                onClick={() => reportListingMutation.mutate()}
                className="bg-red-600 text-white px-4 py-2 rounded-md flex-1"
                disabled={!reportReason}
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;