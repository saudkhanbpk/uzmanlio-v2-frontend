import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mockBlogPosts } from "../utility/mockData";
import { blogService } from "../services/blogService";
import { SimpleRichTextEditor } from "../richTextEditor";
import Swal from "sweetalert2";

// Blog Edit Component
export const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') // Mock user ID for development
  const categories = ["Psikoloji", "Kişisel Gelişim", "Spor", "Beslenme", "Teknoloji", "Business", "Tasarım", "Lifestyle"];

  const [existingPost, setExistingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    keywords: '',
    status: 'draft'
  });

  // Load blog data on component mount
  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const blog = await blogService.getBlog(userId, id);
      setExistingPost(blog);
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        category: blog.category || '',
        keywords: Array.isArray(blog.keywords) ? blog.keywords.join(', ') : blog.keywords || '',
        status: blog.status || 'draft'
      });
    } catch (err) {
      setError('Blog yazısı yüklenirken bir hata oluştu.');
      console.error('Error loading blog:', err);
      // Fallback to mock data
      const mockPost = mockBlogPosts.find(post => post.id === parseInt(id));
      if (mockPost) {
        setExistingPost(mockPost);
        setFormData({
          title: mockPost.title || '',
          content: mockPost.content || '',
          category: mockPost.category || '',
          keywords: mockPost.keywords?.join(', ') || '',
          status: mockPost.status || 'draft'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/blog"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Geri
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Blog Yazısını Düzenle</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Blog yazısı yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!existingPost && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/blog"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Geri
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Blog Yazısı Bulunamadı</h1>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">Düzenlemek istediğiniz blog yazısı bulunamadı.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      alert('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Format data for API
      const blogData = blogService.formatBlogData(formData);

      // Update blog
      await blogService.updateBlog(userId, id, blogData);

      // alert('Blog yazısı başarıyla güncellendi!');
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Blog başarıyla güncellendi.',
        showConfirmButton: false,
        timer: 1500
      });

      navigate('/dashboard/blog');
    } catch (err) {
      setError(err.message || 'Blog yazısı güncellenirken bir hata oluştu.');
      console.error('Error updating blog:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard/blog"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Blog Yazısını Düzenle</h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yazı Başlığı *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Blog yazısının başlığını girin..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınla</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anahtar Kelimeler
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="Virgülle ayırarak anahtar kelimeleri girin (örn: psikoloji, sağlık, gelişim)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik *</h3>
          <SimpleRichTextEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Blog yazısının içeriğini buraya yazın... Markdown formatını kullanabilirsiniz."
            className="min-h-[300px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-16">
          <Link
            to="/dashboard/blog"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors"
          >
            {saving
              ? 'Güncelleniyor...'
              : (formData.status === 'published' ? 'Güncelle ve Yayınla' : 'Taslak Olarak Kaydet')
            }
          </button>
        </div>
      </form>
    </div>
  );
};