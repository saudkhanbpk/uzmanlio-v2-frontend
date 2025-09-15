import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mockBlogPosts } from "../utility/mockData";

// Blog Edit Component
export const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const categories = ["Psikoloji", "Kişisel Gelişim", "Spor", "Beslenme", "Teknoloji", "Business", "Tasarım", "Lifestyle"];
  
  // Find the blog post by ID (in real app, this would be an API call)
  const existingPost = mockBlogPosts.find(post => post.id === parseInt(id));
  
  const [formData, setFormData] = useState({
    title: existingPost?.title || '',
    content: existingPost?.content || '',
    category: existingPost?.category || '',
    keywords: existingPost?.keywords?.join(', ') || '',
    status: existingPost?.status || 'draft'
  });

  if (!existingPost) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      alert('Lütfen zorunlu alanları doldurun.');
      return;
    }

    console.log('Blog yazısı güncellendi:', {
      ...existingPost,
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      updatedAt: new Date().toISOString().split('T')[0]
    });
    
    alert('Blog yazısı başarıyla güncellendi!');
    navigate('/dashboard/blog');
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
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {formData.status === 'published' ? 'Güncelle ve Yayınla' : 'Taslak Olarak Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};