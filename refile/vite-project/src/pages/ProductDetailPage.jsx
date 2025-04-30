// ProductDetailPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { HeartIcon, EyeIcon, Share2Icon, AlertTriangleIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // Contexte d'authentification

const ProductDetailPage = () => {
  const { id } = useParams(); // Récupère l'ID de l'annonce depuis l'URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useContext(AuthContext); // Récupère l'utilisateur connecté

  // Récupération des détails de l'annonce
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Appel API pour récupérer les détails de l'annonce
        const response = await axios.get(`/api/listings/${id}`);
        setProduct(response.data);
        
        // Vérifier si le produit est dans les favoris de l'utilisateur
        if (user) {
          const favResponse = await axios.get('/api/me/favorites');
          setIsFavorite(favResponse.data.some(fav => fav.id === id));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails:', err);
        setError('Impossible de charger les détails de cette annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, user]);

  // Gestion des vues
  useEffect(() => {
    // Incrémenter le compteur de vues lors du chargement de la page
    const incrementViewCount = async () => {
      try {
        await axios.post(`/api/listings/${id}/view`);
      } catch (err) {
        console.error('Erreur lors de l\'incrémentation du compteur de vues:', err);
      }
    };

    if (product) {
      incrementViewCount();
    }
  }, [product, id]);

  // Toggle favoris
  const toggleFavorite = async () => {
    if (!user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/api/listings/${id}/favorite`);
      } else {
        await axios.post(`/api/listings/${id}/favorite`);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Erreur lors de la modification des favoris:', err);
    }
  };

  // Signaler une annonce
  const reportListing = async () => {
    if (!user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      return;
    }
    
    // Ouvrir une boîte de dialogue de confirmation
    if (window.confirm('Voulez-vous signaler cette annonce?')) {
      try {
        await axios.post(`/api/listings/${id}/report`);
        alert('Annonce signalée avec succès');
      } catch (err) {
        console.error('Erreur lors du signalement:', err);
        alert('Erreur lors du signalement de l\'annonce');
      }
    }
  };

  // Navigation entre les images
  const nextImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) return <div className="flex justify-center p-8">Chargement des détails...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;
  if (!product) return <div className="p-8">Aucune annonce trouvée</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Fil d'Ariane */}
      <nav className="text-sm mb-6">
        <ol className="flex flex-wrap">
          <li className="text-gray-500">
            <Link to="/" className="hover:text-blue-600">Accueil</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-500">
            <Link to={`/category/${product.category}`} className="hover:text-blue-600">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="font-medium text-gray-900">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galerie d'images */}
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[currentImageIndex]} 
                alt={`${product.title} - Image ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">Aucune image disponible</span>
              </div>
            )}
          </div>
          
          {/* Navigation des images */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <button 
                  onClick={prevImage} 
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                >
                  &lt;
                </button>
                <div className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
                <button 
                  onClick={nextImage} 
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                >
                  &gt;
                </button>
              </div>
              
              {/* Miniatures des images */}
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden ${
                      currentImageIndex === idx ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Miniature ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informations du produit */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold text-blue-600">
              {product.price} €
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <EyeIcon size={16} />
              <span>{product.viewCount || 0} vues</span>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {product.location} · Publié le {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm">
                État: <span className="font-medium">{product.condition}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Description</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={toggleFavorite}
              className={`flex items-center px-4 py-2 rounded-md ${
                isFavorite 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HeartIcon 
                size={18} 
                className={isFavorite ? 'fill-red-600' : ''} 
              />
              <span className="ml-2">{isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}</span>
            </button>
            
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Share2Icon size={18} />
              <span className="ml-2">Partager</span>
            </button>
            
            <button 
              onClick={reportListing}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <AlertTriangleIcon size={18} />
              <span className="ml-2">Signaler</span>
            </button>
          </div>

          {/* Contact vendeur */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-2">Contacter le vendeur</h3>
            <div className="mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  {product.seller?.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{product.seller?.name || "Vendeur"}</div>
                  <div className="text-sm text-gray-500">Membre depuis {product.seller?.memberSince || "récemment"}</div>
                </div>
              </div>
            </div>
            
            <Link
              to={`/contact/${id}`}
              className="block w-full text-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Contacter
            </Link>
            
            {product.whatsapp && (
              <a
                href={`https://wa.me/${product.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-green-600 text-white font-medium py-2 px-4 rounded-md mt-2 hover:bg-green-700"
              >
                Contacter par WhatsApp
              </a>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-500">
              Référence: {id}
            </div>
          </div>
        </div>
      </div>

      {/* Annonces similaires ou recommandées - À implémenter si nécessaire */}
    </div>
  );
};

export default ProductDetailPage;