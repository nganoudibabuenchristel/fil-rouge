// pages/HomePage.jsx
// Import du composant principal

import { Link } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { Search, Filter, MapPin, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const HomePage = () => {
  const videoRef = useRef(null);

  const [latestListings, setLatestListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageBaseUrl, setImageBaseUrl] = useState('http://localhost:8000'); // URL par défaut

  // Récupérer les dernières annonces et catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les dernières annonces
        const listingsResponse = await axios.get('/listings');
        
        // Si le backend fournit une URL de base pour les images, l'utiliser
        if (listingsResponse.data.image_base_url) {
          setImageBaseUrl(listingsResponse.data.image_base_url);
        }
        
        setLatestListings(listingsResponse.data.data);

        // Récupérer les catégories
        const categoriesResponse = await axios.get('/categories');
        setCategories(categoriesResponse.data.data);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pour la vidéo
  useEffect(() => {
    // Autocplay de la vidéo lorsqu'elle est chargée
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setVideoLoaded(true);
        videoRef.current.play().catch(error => {
          console.error("Autoplay was prevented:", error);
        });
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', () => {});
      }
    };
  }, []);

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    // Rediriger vers la page de recherche avec la requête
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // Fonction pour construire correctement l'URL de l'image
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    
    // Si l'image est déjà une URL complète
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    
    // Construire l'URL avec le chemin correct (les images sont dans public/listings)
    return `${imageBaseUrl}/listings/${imageName}`;
  };

  // Gestionnaire d'erreur pour les images qui ne se chargent pas
  const handleImageError = (e) => {
    e.target.onerror = null; // Éviter les boucles infinies
    e.target.src = '/images/placeholder-furniture.png'; // Image par défaut
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Bannière principale avec vidéo */}
      <div className="relative overflow-hidden rounded-lg mb-8 h-96">
        {/* Vidéo d'arrière-plan */}
        <video 
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          loop
          muted
          playsInline
        >
          <source src="/videos/furniture-video.mp4" type="video/mp4" />
          Votre navigateur ne prend pas en charge les vidéos HTML5.
        </video>
        
        {/* Overlay foncé pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        {/* Contenu de la bannière */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">
              Trouvez le mobilier parfait pour votre intérieur
            </h1>
            <p className="mb-6">
              Des milliers de meubles d'occasion et neufs à prix abordables,
              livrés chez vous ou à récupérer près de chez vous.
            </p>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-3 rounded-l-md text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gray-900 px-4 py-3 rounded-r-md hover:bg-gray-800 flex items-center"
              >
                <Search size={20} />
                <span className="ml-2">Rechercher</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Parcourir par catégorie</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="relative overflow-hidden rounded-lg h-32 group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60 group-hover:opacity-80"></div>
                {category.image ? (
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">{category.name}</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 text-white font-bold">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dernières annonces */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dernières annonces</h2>
          <Link to="/search" className="text-blue-600 hover:underline">
            Voir tout
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={getImageUrl(listing.images[0])}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">Pas d'image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100">
                      <Heart size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-lg mb-1 truncate">{listing.title}</div>
                  <div className="text-blue-600 font-bold mb-2">{listing.price} €</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} />
                    <span className="ml-1 truncate">{listing.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="mb-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Comment ça marche</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Recherchez</h3>
            <p className="text-gray-600">Parcourez notre large sélection de meubles et trouvez ce qui vous plaît.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Contactez</h3>
            <p className="text-gray-600">Discutez avec le vendeur pour poser vos questions et organiser la transaction.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Achetez</h3>
            <p className="text-gray-600">Récupérez votre meuble en personne ou faites-le livrer chez vous.</p>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Pourquoi nous choisir</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Prix abordables</h3>
              <p className="text-gray-600">Économisez jusqu'à 70% par rapport aux prix du neuf et trouvez des pièces uniques à prix réduit.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Local et pratique</h3>
              <p className="text-gray-600">Achetez auprès de vendeurs locaux et récupérez vos achats rapidement, sans attendre des semaines de livraison.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Sécurisé et fiable</h3>
              <p className="text-gray-600">Système de notation des vendeurs, paiement sécurisé et assistance client pour vous assurer une expérience sans souci.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Écologique</h3>
              <p className="text-gray-600">Contribuez à la réduction des déchets en donnant une seconde vie aux meubles plutôt que d'en acheter des neufs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Ce que disent nos utilisateurs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h3 className="font-bold">Sophie L.</h3>
                <div className="flex text-yellow-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">"J'ai trouvé une table à manger magnifique à un prix incroyable. Le vendeur était très sympa et la transaction s'est faite sans problème. Je recommande !"</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h3 className="font-bold">Marc D.</h3>
                <div className="flex text-yellow-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">"En tant que vendeur, j'ai pu me débarrasser de mon ancien canapé rapidement et sans tracas. La plateforme est vraiment facile à utiliser."</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h3 className="font-bold">Lucie B.</h3>
                <div className="flex text-yellow-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">"J'ai pu meubler mon nouvel appartement pour moins de la moitié du prix que j'aurais payé en magasin. Mes amis ne peuvent pas croire que tout est d'occasion !"</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Prêt à vendre ou acheter ?</h2>
        <p className="mb-6 max-w-2xl mx-auto">Rejoignez notre communauté de passionnés de mobilier et d'aménagement intérieur. C'est gratuit et facile !</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/auth/register" className="bg-white text-yellow-600 px-6 py-3 rounded-md font-bold hover:bg-gray-100">
            S'inscrire gratuitement
          </Link>
          <Link to="/listings/create" className="bg-yellow-800 text-white px-6 py-3 rounded-md font-bold hover:bg-yellow-900">
            Déposer une annonce
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;