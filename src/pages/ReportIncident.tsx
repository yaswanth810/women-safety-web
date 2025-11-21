import { useState, useEffect } from 'react';
import { FileText, MapPin, Lock, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'assault', label: 'Assault' },
  { value: 'stalking', label: 'Stalking' },
  { value: 'domestic_violence', label: 'Domestic Violence' },
  { value: 'workplace_harassment', label: 'Workplace Harassment' },
  { value: 'cyberstalking', label: 'Cyberstalking' },
  { value: 'other', label: 'Other' }
];

export const ReportIncident = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    incident_type: '',
    title: '',
    description: '',
    is_anonymous: false
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchIncidents();
    }
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

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const coords = await getLocation() as any;
      const name = await getLocationName(coords.lat, coords.lng);
      setLocation(coords);
      setLocationName(name);
      setUseCurrentLocation(true);
    } catch (err) {
      alert('Unable to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.incident_type || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const incident = {
        user_id: user.id,
        incident_type: formData.incident_type,
        title: formData.title,
        description: formData.description,
        is_anonymous: formData.is_anonymous,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        location_name: locationName || null,
        status: 'new'
      };

      const { error } = await supabase
        .from('incidents')
        .insert(incident);

      if (error) throw error;

      setSuccessMessage('Incident reported successfully!');
      setFormData({ incident_type: '', title: '', description: '', is_anonymous: false });
      setLocation(null);
      setLocationName('');
      setUseCurrentLocation(false);

      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchIncidents();
    } catch (err) {
      console.error('Error reporting incident:', err);
      alert('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FileText size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to report an incident.</p>
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Report Incident</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Document what happened. Your safety and privacy matter.
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type *
                </label>
                <select
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an incident type</option>
                  {INCIDENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title of the incident"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what happened in detail"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Location
                </h3>
                {useCurrentLocation && location && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Current Location</p>
                    <p className="text-gray-900">{locationName}</p>
                    <p className="text-sm text-gray-600">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                >
                  {loading ? 'Getting Location...' : useCurrentLocation ? 'Update Location' : 'Add Current Location'}
                </button>
              </div>

              <div className="border-t pt-6">
                <label className="flex items-center gap-3">
                  <Lock size={20} className="text-gray-600" />
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Report Anonymously</span>
                </label>
                <p className="text-sm text-gray-600 ml-8 mt-2">
                  Your identity will be hidden from public view
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Reports</h3>
            {incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.slice(0, 5).map(incident => (
                  <div key={incident.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900 text-sm">{incident.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: <span className="font-semibold capitalize">{incident.status}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No reports yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
