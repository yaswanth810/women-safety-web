import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const SOSAlert = () => {
  const { user, isAuthenticated } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchSOSAlerts();
  }, [isAuthenticated, user]);

  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        reject
      );
    });
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      return data.address?.city || data.address?.country || `${lat}, ${lng}`;
    } catch {
      return `${lat}, ${lng}`;
    }
  };

  const activateSOS = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const coords = await getLocation() as any;
      const name = await getLocationName(coords.lat, coords.lng);

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
          location_name: name,
          status: 'active'
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      setLocation(coords);
      setLocationName(name);
      setIsActive(true);

      if (user.emergency_contacts && Array.isArray(user.emergency_contacts)) {
        for (const contact of user.emergency_contacts) {
          await supabase
            .from('sos_notifications')
            .insert({
              sos_alert_id: data.id,
              recipient_email: contact.email,
              recipient_name: contact.name,
              status: 'pending'
            });
        }
      }

      setSuccessMessage('SOS Alert activated! Emergency contacts have been notified.');
      setTimeout(() => setSuccessMessage(''), 3000);

      await fetchSOSAlerts();
    } catch (err) {
      console.error('Error activating SOS:', err);
      alert('Failed to activate SOS. Please check your location settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateSOS = async () => {
    if (!alerts[0]) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('sos_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', alerts[0].id);

      if (error) throw error;

      setIsActive(false);
      setLocation(null);
      setLocationName('');
      setSuccessMessage('SOS Alert deactivated.');
      setTimeout(() => setSuccessMessage(''), 3000);

      await fetchSOSAlerts();
    } catch (err) {
      console.error('Error deactivating SOS:', err);
      alert('Failed to deactivate SOS.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSOSAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (error) throw error;
      setAlerts(data || []);
      setIsActive(data && data.length > 0);

      if (data && data.length > 0) {
        setLocation({ lat: data[0].latitude, lng: data[0].longitude });
        setLocationName(data[0].location_name);
      }
    } catch (err) {
      console.error('Error fetching SOS alerts:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to use the SOS emergency alert feature.</p>
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emergency SOS Alert</h1>
          <p className="text-xl text-gray-600">One-click emergency notification to your contacts</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
            {successMessage}
          </div>
        )}

        {/* Active Alert Section */}
        {isActive && location && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border-2 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={28} className="text-red-600 animate-pulse" />
              <h2 className="text-2xl font-bold text-red-600">ALERT ACTIVE</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-red-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg text-gray-900">{locationName}</p>
                  <p className="text-sm text-gray-500">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-red-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                  <p className="text-lg text-gray-900">
                    {user?.emergency_contacts && Array.isArray(user.emergency_contacts) ? user.emergency_contacts.length : 0} contacts
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={deactivateSOS}
              disabled={isLoading}
              className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Deactivating...' : 'Deactivate Alert'}
            </button>
          </div>
        )}

        {/* Activate Button */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <AlertTriangle size={64} className="text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Activate Emergency Alert</h3>
            <p className="text-gray-600 mb-8">
              Send your location and alert to all your emergency contacts immediately.
            </p>
            <button
              onClick={activateSOS}
              disabled={isActive || isLoading}
              className={`w-full px-8 py-4 text-white rounded-lg font-bold text-xl transition-colors ${
                isActive
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
            >
              {isLoading ? 'Activating...' : isActive ? 'Alert Already Active' : 'ACTIVATE SOS'}
            </button>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={24} />
            Emergency Contacts
          </h3>
          {user?.emergency_contacts && Array.isArray(user.emergency_contacts) && user.emergency_contacts.length > 0 ? (
            <div className="space-y-3">
              {user.emergency_contacts.map((contact: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No emergency contacts added. <a href="/profile" className="text-blue-600 hover:underline">Add contacts now</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
