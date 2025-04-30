// DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

/**
 * Page Tableau de bord utilisateur
 * Affiche les annonces de l'utilisateur et ses favoris
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myListings');
  const [user, setUser] = useState(null);
  
  // Vérifier la présence du token et de l'utilisateur lors du chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      // Rediriger vers la page de connexion si pas de token
      navigate('/login');
      return;
    }
    
    // Si un utilisateur est stocké, l'utiliser
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Récupération des annonces de l'utilisateur - SYNTAXE MISE À JOUR POUR REACT QUERY V5
  const { data: myListings, isLoading: loadingListings } = useQuery({
    queryKey: ['myListings', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/me/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("voici mes annonces", data)
      return response.data;
    },
    enabled: !!user
  });

  // Récupération des favoris de l'utilisateur - SYNTAXE MISE À JOUR POUR REACT QUERY V5
  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/me/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!user
  });
  
  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Si le composant est toujours affiché mais que l'utilisateur n'est pas encore chargé
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <button 
          onClick={handleLogout}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
        >
          Déconnexion
        </button>
      </div>
      
      <div className="flex mb-6">
        <button 
          className={`px-4 py-2 mr-2 rounded-t-md ${activeTab === 'myListings' ? 'bg-blue-100 border-b-2 border-blue-600' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('myListings')}
        >
          Mes annonces
        </button>
        <button 
          className={`px-4 py-2 rounded-t-md ${activeTab === 'favorites' ? 'bg-blue-100 border-b-2 border-blue-600' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('favorites')}
        >
          Mes favoris
        </button>
      </div>

      {activeTab === 'myListings' && (
        <div className="bg-white p-4 rounded-md shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Mes annonces</h2>
            <Link to="/create-listing" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Créer une annonce
            </Link>
          </div>

          {loadingListings ? (
            <p>Chargement...</p>
          ) : myListings?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.data.map(listing => ( 
                <div key={listing.id} className="border rounded-md p-4">
                  <div className="h-40 bg-gray-200 mb-2 relative">
                    {listing.images && listing.images[0] && (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs text-white ${
                      listing.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {listing.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{listing.price} €</p>
                  <div className="flex mt-2">
                    <Link to={`/edit-listing/${listing.id}`} className="text-sm bg-gray-200 px-3 py-1 rounded-md mr-2">
                      Modifier
                    </Link>
                    <Link to={`/listing/${listing.id}`} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">Vous n'avez pas encore d'annonces</p>
              <Link to="/create-listing" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Créer ma première annonce
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Mes favoris</h2>

          {loadingFavorites ? (
            <p>Chargement...</p>
          ) : favorites?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(listing => (
                <div key={listing.id} className="border rounded-md p-4">
                  <div className="h-40 bg-gray-200 mb-2">
                    {listing.images && listing.images[0] && (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{listing.price} €</p>
                  <div className="flex mt-2">
                    <button className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-md mr-2">
                      Retirer des favoris
                    </button>
                    <Link to={`/listing/${listing.id}`} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">Vous n'avez pas encore de favoris</p>
              <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Parcourir les annonces
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;