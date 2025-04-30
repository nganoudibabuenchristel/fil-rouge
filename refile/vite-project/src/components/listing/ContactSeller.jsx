// ContactSellerPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Contexte d'authentification

const ContactSellerPage = () => {
  const { id } = useParams(); // ID de l'annonce
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Récupérer les détails de l'annonce pour afficher les informations pertinentes
  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError('Impossible de charger les détails de cette annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  // Gérer les changements de champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // Envoyer le message au vendeur via l'API
      await axios.post(`/api/listings/${id}/contact`, formData);
      
      setSubmitSuccess(true);
      
      // Rediriger après quelques secondes pour laisser le temps de voir le message de succès
      setTimeout(() => {
        navigate(`/listings/${id}`);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setSubmitError('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Chargement...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;
  if (!listing) return <div className="p-8">Annonce introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Fil d'Ariane */}
      <nav className="text-sm mb-6">
        <ol className="flex flex-wrap">
          <li className="text-gray-500">
            <Link to="/" className="hover:text-blue-600">Accueil</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-500">
            <Link to={`/listings/${id}`} className="hover:text-blue-600">
              {listing.title}
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="font-medium text-gray-900">Contacter le vendeur</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* En-tête avec détails de l'annonce */}
        <div className="p-6 bg-blue-50 flex items-center">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500 text-xs">Pas d'image</span>
            </div>
          )}
          
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
            <div className="text-lg font-semibold text-blue-600">{listing.price} €</div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contacter {listing.seller?.name || "le vendeur"}</h2>
          
          {submitSuccess ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div>
                  <p className="text-green-700">
                    Votre message a été envoyé avec succès! Le vendeur vous répondra bientôt.
                  </p>
                  <p className="text-green-700 mt-2">
                    Vous allez être redirigé vers l'annonce...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div>
                      <p className="text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Champs nom */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Champs email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Champs téléphone (optionnel) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Champs message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Bonjour, je suis intéressé(e) par votre ${listing.title}. Est-il toujours disponible ?`}
                    required
                  />
                </div>

                {/* Message à propos de la protection contre les arnaques */}
                <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                  <p className="font-medium">Conseils de sécurité :</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Ne payez jamais par virement bancaire ou Western Union avant d'avoir vu l'article</li>
                    <li>Privilégiez les rencontres en personne dans un lieu public</li>
                    <li>N'envoyez jamais d'argent ou d'informations sensibles</li>
                  </ul>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3">
                  <Link
                    to={`/listings/${id}`}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      submitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Lien WhatsApp si disponible */}
          {listing.whatsapp && !submitSuccess && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-3">
                  Vous préférez discuter directement via WhatsApp ?
                </p>
                <a
                  href={`https://wa.me/${listing.whatsapp}?text=Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" à ${listing.price}€`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Contacter par WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSellerPage;