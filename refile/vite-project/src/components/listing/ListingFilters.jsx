// components/listing/ListingFilters.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';

const ListingFilters = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    subcategory_id: '',
    price_min: '',
    price_max: '',
    condition: '',
    location: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!filters.category_id) {
        setSubCategories([]);
        return;
      }

      try {
        const response = await axios.get(`/categories/${filters.category_id}/subcategories`);
        setSubCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
      }
    };

    fetchSubCategories();
  }, [filters.category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear subcategory if category changes
    if (name === 'category_id') {
      setFilters(prev => ({ 
        ...prev, 
        [name]: value,
        subcategory_id: '' 
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remove empty filter values
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    onFilterChange(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      category_id: '',
      subcategory_id: '',
      price_min: '',
      price_max: '',
      condition: '',
      location: ''
    });
    onFilterChange({});
  };

  if (loading) {
    return <div className="p-4">Chargement des filtres...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filtres</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              id="category_id"
              name="category_id"
              value={filters.category_id}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {filters.category_id && subCategories.length > 0 && (
            <div>
              <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700">
                Sous-catégorie
              </label>
              <select
                id="subcategory_id"
                name="subcategory_id"
                value={filters.subcategory_id}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Toutes les sous-catégories</option>
                {subCategories.map(subCategory => (
                  <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price_min" className="block text-sm font-medium text-gray-700">
                Prix min (€)
              </label>
              <input
                type="number"
                id="price_min"
                name="price_min"
                value={filters.price_min}
                onChange={handleChange}
                placeholder="Min"
                min="0"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="price_max" className="block text-sm font-medium text-gray-700">
                Prix max (€)
              </label>
              <input
                type="number"
                id="price_max"
                name="price_max"
                value={filters.price_max}
                onChange={handleChange}
                placeholder="Max"
                min="0"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              État
            </label>
            <select
              id="condition"
              name="condition"
              value={filters.condition}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous</option>
              <option value="new">Neuf</option>
              <option value="like_new">Comme neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">État moyen</option>
              <option value="poor">Mauvais état</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Localisation
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Ville, département..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ListingFilters;