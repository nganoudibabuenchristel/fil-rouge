// components/common/NotificationsDropdown.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/notifications');
        setNotifications(response.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Impossible de charger les notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20">
      <div className="px-4 py-2 font-semibold border-b border-gray-100">Notifications</div>
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Aucune notification</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read_at ? 'bg-blue-50' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <Link to={notification.data.url || '#'} className="block">
                <div className="font-medium text-sm">{notification.data.title}</div>
                <div className="text-xs text-gray-500">{notification.data.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
      <Link to="/notifications" className="block text-center text-blue-500 text-sm py-2 hover:bg-gray-50">
        Voir toutes les notifications
      </Link>
    </div>
  );
};

export default NotificationsDropdown;
