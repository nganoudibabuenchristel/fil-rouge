// components/CustomDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Sélectionner", 
  name,
  disabled = false,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Trouver l'option sélectionnée actuelle
  const selectedOption = options.find(option => option.value.toString() === value?.toString());

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        className={`flex items-center justify-between w-full px-4 py-2 border rounded-md cursor-pointer ${
          disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
        } ${isOpen ? 'border-blue-500' : 'border-gray-300'}`}
        onClick={handleToggle}
      >
        <span className={!selectedOption ? 'text-gray-400' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                  option.value.toString() === value?.toString() ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">Aucune option disponible</div>
          )}
        </div>
      )}
      
      {/* Input caché pour la compatibilité avec la validation de formulaire */}
      <input 
        type="hidden" 
        name={name} 
        value={value || ''} 
        required={required} 
      />
    </div>
  );
};

export default CustomDropdown;