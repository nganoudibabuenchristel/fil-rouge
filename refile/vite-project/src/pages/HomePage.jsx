// pages/HomePage.jsx
// Import du composant principal

import { Link } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { Search, Filter, MapPin, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchListings } from '../api/listingService';
import ListingCard from '../components/listing/ListingCard';
import ListingFilters from '../components/listing/ListingFilters';
import Icon from '../components/ui/Icons';
import Header from '../components/layout/Header';


const HomePage = () => {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filters, setFilters] = useState({});
//   const [searchQuery, setSearchQuery] = useState('');

const [latestListings, setLatestListings] = useState([]);
const [categories, setCategories] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Récupérer les dernières annonces et catégories
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer les dernières annonces
      const listingsResponse = await axios.get('/listings?limit=8&sort=recent');
      setLatestListings(listingsResponse.data.data);

      // Récupérer les catégories
      const categoriesResponse = await axios.get('/categories');
      console.log(categoriesResponse.data.data);
      // console.log("bonjour");
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

// Gérer la recherche
const handleSearch = (e) => {
  e.preventDefault();
  // Rediriger vers la page de recherche avec la requête
  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
};

return (

  <div className="max-w-6xl mx-auto p-4">
    {/* Bannière principale */}
    <div className="bg-blue-600 rounded-lg p-8 mb-8 text-white">
      <div className="max-w-xl">
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
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
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
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Parcourez les annonces</h3>
            <p className="text-gray-600">
              Trouvez le meuble parfait parmi des milliers d'annonces à proximité ou dans toute la France.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Contactez le vendeur</h3>
            <p className="text-gray-600">
              Posez vos questions et organisez la rencontre via notre messagerie sécurisée ou par WhatsApp.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Finalisez l'achat</h3>
            <p className="text-gray-600">
              Récupérez votre meuble chez le vendeur ou faites-vous livrer directement à domicile.
            </p>
          </div>
        </div>
      </section>

      {/* Vendre un meuble */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-8 text-white">
          <div className="md:flex items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Vous avez des meubles à vendre ?</h2>
              <p className="max-w-md">
                Publiez gratuitement votre annonce en quelques clics et trouvez rapidement des acheteurs près de chez vous.
              </p>
            </div>
            <Link
              to="/create-listing"
              className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-md hover:bg-gray-100"
            >
              Déposer une annonce
            </Link>
          </div>
        </div>
      </section>
    </div>

  );
};

export default HomePage;