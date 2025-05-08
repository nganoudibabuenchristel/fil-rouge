import React from 'react';
import axios from '../api/axiosConfig';
import { useQuery } from '@tanstack/react-query';

const CitySelect = ({ value, onChange, className = '', required = false, disabled = false }) => {
    const { data: cities, isLoading, error } = useQuery({
      queryKey: ['cities'],
      queryFn: async () => {
        const response = await axios.get('/cities');
        return response.data;
      }
    });
  
    const handleChange = (e) => {
      const selectedId = e.target.value;
      const selectedCity = cities.find(city => String(city.id) === selectedId);
      onChange(selectedCity || null); // Appelle handleCitySelect avec l’objet complet
    };
  
    if (error) {
      return <div className="text-red-500">Erreur lors du chargement des villes</div>;
    }
  
    return (
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
        <select
          id="city"
          name="city"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled || isLoading}
          required={required}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md ${className}`}
        >
          <option value="">Sélectionnez une ville</option>
          {isLoading ? (
            <option value="" disabled>Chargement...</option>
          ) : cities?.length > 0 ? (
            cities.map(city => (
              <option key={city.id} value={String(city.id)}>
                {city.name} ({city.postal_code})
              </option>
            ))
          ) : (
            <option value="">Aucune ville disponible</option>
          )}
        </select>
      </div>
    );
  };
  

export default CitySelect;