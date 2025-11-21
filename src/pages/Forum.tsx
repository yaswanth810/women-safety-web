import { useState, useEffect } from 'react';
import { Users, MessageCircle, ThumbsUp, Send, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      // Fetch comments for each post
      for (const post of data || []) {
        fetchComments(post.id);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*, users:user_id(full_name, profile_picture)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostTitle || !newPostContent) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title: newPostTitle,
          content: newPostContent
        });

      if (error) throw error;

      setNewPostTitle('');
      setNewPostContent('');
      await fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComments[postId]) {
      alert('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComments[postId]
        });

      if (error) throw error;

      setNewComments(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', postId);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments(postId);
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Users size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the community forum.</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Community Forum</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Share experiences, support each other, and build community awareness
        </p>

        {/* New Post Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Start a Discussion</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              type="text"
              placeholder="Discussion title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Discussion'}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-800 mb-4 line-clamp-3">{post.content}</p>

                  <div className="flex items-center gap-4 border-t pt-4">
                    <button
                      onClick={() => handleUpvote(post.id, post.upvotes)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp size={18} />
                      <span>{post.upvotes}</span>
                    </button>
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span>{comments[post.id]?.length || 0} Comments</span>
                    </button>
                    {user && user.id === post.user_id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="ml-auto text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(comments[post.id] || []).map(comment => (
                          <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {comment.users?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-600">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {user && user.id === comment.user_id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id, post.id)}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComments[post.id] || ''}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
