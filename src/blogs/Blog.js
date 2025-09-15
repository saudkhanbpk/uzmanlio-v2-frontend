import { useState } from "react";
import { Link } from "react-router-dom";
import { mockBlogPosts } from "../utility/mockData";
import { renderMarkdownToHtml } from "../utility/renderMarkdownToHtml";
// Blog Main Component
export const Blog = () => {
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts);
  const [filter, setFilter] = useState('all');

  const categories = ["Psikoloji", "Kişisel Gelişim", "Spor", "Beslenme", "Teknoloji", "Business", "Tasarım", "Lifestyle"];

  const filteredPosts = filter === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter);

  const deleteBlogPost = (id) => {
    if (window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      setBlogPosts(posts => posts.filter(post => post.id !== id));
    }
  };

  const getShareUrl = (post) => {
    return `${window.location.origin}/blog/${post.slug}`;
  };

  const copyShareUrl = (post) => {
    const url = getShareUrl(post);
    navigator.clipboard.writeText(url);
    alert('URL panoya kopyalandı!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h1>
          <p className="text-gray-600 mt-1">Blog yazılarınızı oluşturun, düzenleyin ve yönetin</p>
        </div>
        <Link
          to="/dashboard/blog/create"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
        >
          <span className="mr-2">+</span>
          Yeni Blog Yazısı
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü ({blogPosts.length})
          </button>
          {categories.map(category => {
            const count = blogPosts.filter(post => post.category === category).length;
            return count > 0 ? (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === category 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({count})
              </button>
            ) : null;
          })}
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="grid gap-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz blog yazısı yok</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'İlk blog yazınızı oluşturmak için "Yeni Blog Yazısı" butonuna tıklayın.' 
                : `${filter} kategorisinde henüz yazı bulunmuyor.`
              }
            </p>
            <Link
              to="/dashboard/blog/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Yeni Blog Yazısı Oluştur
            </Link>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded mr-2">{post.category}</span>
                    <span>Oluşturulma: {new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                    {post.updatedAt !== post.createdAt && (
                      <span className="ml-2">• Güncelleme: {new Date(post.updatedAt).toLocaleDateString('tr-TR')}</span>
                    )}
                  </div>
                  <div
                    className="text-gray-600 text-sm line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content.substring(0, 150) + '...') }}
                  />
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">
                      <strong>Anahtar Kelimeler:</strong> {post.keywords.join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4">
                  {post.status === 'published' && (
                    <button
                      onClick={() => copyShareUrl(post)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="URL'yi Kopyala"
                    >
                      🔗 Paylaş
                    </button>
                  )}
                  <Link
                    to={`/dashboard/blog/edit/${post.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ✏️ Düzenle
                  </Link>
                  <button
                    onClick={() => deleteBlogPost(post.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
