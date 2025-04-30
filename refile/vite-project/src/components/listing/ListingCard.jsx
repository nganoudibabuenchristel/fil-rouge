// components/listing/ListingCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { HeartIcon } from 'lucide-react';
import { toggleFavorite } from '../../api/listingService';
import { useAuth } from '../../context/AuthContext';

const ListingCard = ({ listing }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    setIsLoading(true);
    try {
      await toggleFavorite(listing.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/listings/${listing.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <img 
          src={listing.images && listing.images.length > 0 ? listing.images[0].url : '/api/placeholder/300/200'} 
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <button 
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`absolute top-2 right-2 p-2 rounded-full ${isFavorite ? 'bg-red-50' : 'bg-white/70'}`}
        >
          <HeartIcon 
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
        {listing.views_count > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {listing.views_count} {listing.views_count === 1 ? 'vue' : 'vues'}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{listing.title}</h3>
        <p className="text-blue-600 font-bold">{listing.price.toLocaleString()} €</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">{listing.location}</span>
          <span className="text-xs text-gray-400">{new Date(listing.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
