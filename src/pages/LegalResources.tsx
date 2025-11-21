import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = [
  { value: 'rights', label: 'Know Your Rights' },
  { value: 'filing_complaints', label: 'Filing Complaints' },
  { value: 'restraining_orders', label: 'Restraining Orders' },
  { value: 'domestic_violence', label: 'Domestic Violence' },
  { value: 'workplace_harassment', label: 'Workplace Harassment' },
  { value: 'cyberstalking', label: 'Cyberstalking' }
];

export const LegalResources = () => {
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchResources();
  }, [isAuthenticated]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_resources')
        .select('*')
        .order('category', { ascending: true })
        .order('order', { ascending: true });

      if (error) throw error;
      setResources(data || []);

      // Initialize with first category
      if (data && data.length > 0) {
        setSelectedCategory(data[0].category);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access legal resources.</p>
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login Now
          </a>
        </div>
      </div>
    );
  }

  const filteredResources = resources.filter(r => {
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = filteredResources.filter(r => r.category === cat.value);
    return acc;
  }, {} as any);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Legal Resources</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Comprehensive information to help you understand your rights and options
        </p>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-300 hover:border-blue-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <button
                  onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {CATEGORIES.find(c => c.value === resource.category)?.label}
                    </p>
                  </div>
                  {expandedResource === resource.id ? (
                    <ChevronUp size={24} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {expandedResource === resource.id && (
                  <div className="px-6 pb-6 border-t">
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                      {resource.content}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
