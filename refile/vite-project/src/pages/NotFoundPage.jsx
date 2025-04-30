import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage - Page 404 affichée lorsqu'une route n'est pas trouvée
 * 
 * Cette page offre une expérience utilisateur améliorée en cas d'URL invalide
 * avec des suggestions pour retourner vers des pages principales du site.
 */
const NotFoundPage = () => {
  // Suggestions de pages populaires pour aider l'utilisateur
  const popularPages = [
    { name: 'Accueil', path: '/' },
    { name: 'Toutes les annonces', path: '/listings' },
    { name: 'Dernières annonces', path: '/listings/latest' },
    { name: 'Mon compte', path: '/dashboard' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {/* Icône 404 */}
        <div className="text-blue-600 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-24 w-24 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        {/* Message principal */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl text-gray-700 mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-6">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        {/* Bouton pour retourner à l'accueil */}
        <Link 
          to="/" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors mb-6"
        >
          Retourner à l'accueil
        </Link>
        
        {/* Suggestions de pages populaires */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            Ou visitez une de nos pages populaires:
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {popularPages.map((page, index) => (
              <Link
                key={index}
                to={page.path}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Formulaire de recherche rapide */}
        <div className="mt-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const searchTerm = e.target.elements.search.value;
              if (searchTerm.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
              }
            }}
            className="flex"
          >
            <input
              type="text"
              name="search"
              placeholder="Rechercher un meuble..."
              className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact support */}
      <p className="mt-8 text-gray-500 text-sm">
        Vous ne trouvez toujours pas ce que vous cherchez ?{' '}
        <Link to="/contact" className="text-blue-600 hover:underline">
          Contactez-nous
        </Link>
      </p>
    </div>
  );
};

export default NotFoundPage;