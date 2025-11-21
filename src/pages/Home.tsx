import { AlertCircle, ShieldAlert, Users, BookOpen, BarChart3, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: AlertCircle,
      title: 'SOS Emergency Alert',
      description: 'One-click emergency alert with real-time location sharing to your contacts'
    },
    {
      icon: ShieldAlert,
      title: 'Incident Reporting',
      description: 'Report incidents anonymously or publicly with evidence attachments'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with others, share experiences, and build support networks'
    },
    {
      icon: BookOpen,
      title: 'Legal Resources',
      description: 'Comprehensive guides on rights, procedures, and legal actions'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track safety patterns and get actionable insights (Admin)'
    },
    {
      icon: Zap,
      title: '24/7 Accessibility',
      description: 'Access help and resources whenever you need them'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Safety Matters
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            SafetyHub is your comprehensive platform for personal safety, incident reporting, and community support.
          </p>
          {!isAuthenticated ? (
            <div className="flex justify-center gap-4">
              <a
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Login
              </a>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <a
                href="/sos"
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <AlertCircle size={20} />
                Emergency SOS
              </a>
              <a
                href="/report"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Report Incident
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
            Comprehensive Safety Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <feature.icon size={40} className="text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Stay Safe?
          </h2>
          <p className="text-lg mb-8">
            Join thousands of users who trust SafetyHub for their personal safety
          </p>
          {!isAuthenticated && (
            <a
              href="/signup"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Your Account Today
            </a>
          )}
        </div>
      </section>
    </div>
  );
};
