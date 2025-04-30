// src/components/ui/Icons.jsx
// Ce fichier regroupe toutes les icônes de l'application en utilisant lucide-react
// Il sert de point central pour la gestion des icônes et permet d'assurer la cohérence visuelle
// ainsi que de faciliter la maintenance

import React from 'react';
import {
  // Navigation et Menu
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Home,
  
  // Actions utilisateur
  Heart,
  HeartOff,
  Bell,
  LogIn,
  LogOut,
  UserCircle,
  User,
  UserPlus,
  Settings,
  Edit,
  Trash,
  
  // Communication
  MessageCircle,
  Send,
  Mail,
  Phone,
  Share,
  Flag,
  
  // Annonces et Produits
  Image,
  Camera,
  Upload,
  Tag,
  DollarSign,
  ShoppingBag,
  Package,
  Eye,
  
  // Localisation et Filtres
  MapPin,
  Filter,
  SlidersHorizontal,
  
  // Statuts et Feedback
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  
  // UI
  PlusCircle,
  Plus,
  Minus,
  Copy,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

/**
 * Composant générique pour les icônes avec taille et couleur personnalisables
 * @param {string} name - Nom de l'icône à afficher
 * @param {number} size - Taille de l'icône (par défaut 20px)
 * @param {string} color - Couleur de l'icône (par défaut hérite de la couleur du texte)
 * @param {string} className - Classes CSS additionnelles
 * @param {object} props - Autres propriétés à passer à l'icône
 */
const Icon = ({ name, size = 20, color = "currentColor", className = "", ...props }) => {
  // Mapping des noms d'icônes vers les composants lucide-react
  const IconComponents = {
    // Navigation et Menu
    search: Search,
    menu: Menu,
    close: X,
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    chevronLeft: ChevronLeft,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    home: Home,
    
    // Actions utilisateur
    heart: Heart,
    heartOff: HeartOff,
    bell: Bell,
    login: LogIn,
    logout: LogOut,
    userCircle: UserCircle,
    user: User,
    userPlus: UserPlus,
    settings: Settings,
    edit: Edit,
    trash: Trash,
    
    // Communication
    message: MessageCircle,
    send: Send,
    mail: Mail,
    phone: Phone,
    share: Share,
    flag: Flag,
    
    // Annonces et Produits
    image: Image,
    camera: Camera,
    upload: Upload,
    tag: Tag,
    price: DollarSign,
    shoppingBag: ShoppingBag,
    package: Package,
    eye: Eye,
    
    // Localisation et Filtres
    location: MapPin,
    filter: Filter,
    sliders: SlidersHorizontal,
    
    // Statuts et Feedback
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    alert: AlertCircle,
    
    // UI
    plusCircle: PlusCircle,
    plus: Plus,
    minus: Minus,
    copy: Copy,
    externalLink: ExternalLink,
    help: HelpCircle
  };

  // Récupérer le composant d'icône correspondant au nom
  const IconComponent = IconComponents[name];

  // Si l'icône n'existe pas, afficher un message d'erreur en dev et rien en prod
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Icône "${name}" non trouvée.`);
      return <AlertCircle size={size} color="red" />;
    }
    return null;
  }

  // Rendu de l'icône avec les propriétés spécifiées
  return <IconComponent size={size} color={color} className={className} {...props} />;
};

/**
 * Section d'icônes pré-configurées pour différentes parties de l'application
 * Ces composants encapsulent le composant Icon avec des paramètres spécifiques
 */

// Icônes de navigation
export const NavIcon = ({ name, ...props }) => (
  <Icon name={name} size={24} {...props} />
);

// Icônes de boutons (plus petites)
export const ButtonIcon = ({ name, ...props }) => (
  <Icon name={name} size={18} {...props} />
);

// Icônes pour les listes d'annonces
export const ListingIcon = ({ name, ...props }) => (
  <Icon name={name} size={16} {...props} />
);

// Icônes de statut avec couleurs prédéfinies
export const StatusIcon = ({ status, ...props }) => {
  let iconName = "info";
  let iconColor = "currentColor";

  // Déterminer l'icône et la couleur en fonction du statut
  switch (status) {
    case "success":
      iconName = "success";
      iconColor = "#10B981"; // vert
      break;
    case "error":
      iconName = "error";
      iconColor = "#EF4444"; // rouge
      break;
    case "warning":
      iconName = "warning";
      iconColor = "#F59E0B"; // orange
      break;
    case "info":
      iconName = "info";
      iconColor = "#3B82F6"; // bleu
      break;
    default:
      iconName = "info";
      iconColor = "#6B7280"; // gris
  }

  return <Icon name={iconName} color={iconColor} {...props} />;
};

// Icône de favoris avec état actif/inactif
export const FavoriteIcon = ({ active = false, size = 20, ...props }) => (
  <Icon 
    name={active ? "heart" : "heart"} 
    size={size} 
    color={active ? "#EF4444" : "#9CA3AF"}
    fill={active ? "#EF4444" : "none"}
    {...props} 
  />
);

// Icône pour les formulaires et champs de saisie
export const FormIcon = ({ name, error = false, ...props }) => (
  <Icon 
    name={name} 
    size={18} 
    color={error ? "#EF4444" : "#6B7280"} 
    {...props} 
  />
);

// Exporter le composant Icon par défaut et d'autres composants spécifiques
export default Icon;

/**
 * Exemples d'utilisation:
 * 
 * Import basique:
 * import Icon from '@/components/ui/Icons';
 * <Icon name="search" />
 * 
 * Import de composants spécifiques:
 * import { NavIcon, FavoriteIcon } from '@/components/ui/Icons';
 * <NavIcon name="menu" />
 * <FavoriteIcon active={isFavorite} onClick={toggleFavorite} />
 */