import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, HeartIcon, UserIcon, MenuIcon, XIcon } from 'lucide-react';
import NotificationsDropdown from '../common/NotificationsDropdown';
import "../../header.css";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();

  // Authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    setIsAuthenticated(!!token);
    if (storedUser) {
      console.log('User data:', JSON.parse(storedUser));
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fermer le menu "Mon compte" si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Supprimer les informations d'authentification du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Mettre à jour l'état local
    setIsAuthenticated(false);
    setCurrentUser(null);
    // Rediriger vers la page de connexion
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-500">HomeFit</Link>

          {/* Navigation principale */}
          <nav className="ajust flex-grow mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des meubles..."
                className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button className="absolute right-3 top-2 text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="text-gray-600 hover:text-blue-500">
                  <HeartIcon className="w-6 h-6" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="text-gray-600 hover:text-blue-500"
                  >
                    <BellIcon className="w-6 h-6" />
                    {currentUser?.unread_notifications_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {currentUser.unread_notifications_count}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && <NotificationsDropdown />}
                </div>

                {/* Menu Mon Compte */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setIsAccountMenuOpen(prev => !prev)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
                  >
                    <UserIcon className="w-6 h-6" />
                    <span>{currentUser?.name || 'Mon compte'}</span>
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Tableau de bord</Link>
                      <Link to="/listings/create" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Créer une annonce</Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsAccountMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                Bonjour tout le monde
                <Link to="/login" className="text-gray-600 hover:text-blue-500">Connexion</Link>
                <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Inscription</Link>
              </>
            )}
          </nav>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation mobile */}
        {mobileMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 py-2">Tableau de bord</Link>
                  <Link to="/favorites" className="text-gray-600 py-2">Mes favoris</Link>
                  <Link to="/listings/create" className="text-gray-600 py-2">Créer une annonce</Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-600 py-2"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 py-2">Connexion</Link>
                  <Link to="/register" className="text-gray-600 py-2">Inscription</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
