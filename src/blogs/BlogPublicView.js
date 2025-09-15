import { useParams } from "react-router-dom";
import { mockBlogPosts } from "../utility/mockData";
import { renderMarkdownToHtml } from "../utility/renderMarkdownToHtml";

// Public Blog View Component (for published posts)
export const BlogPublicView = () => {
  const { slug } = useParams();
  // Find blog post by slug
  const post = mockBlogPosts.find(p => p.slug === slug && p.status === 'published');
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog yazısı bulunamadı</h1>
            <p className="text-gray-600">Aradığınız blog yazısı bulunamadı veya yayından kaldırılmış.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                {post.category}
              </span>
              <span>•</span>
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span>•</span>
              <span>{post.author}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="px-6 pb-8 sm:px-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content) }}
            />
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 sm:px-8 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <span>
                    Son güncelleme: {new Date(post.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL panoya kopyalandı!');
                  }}
                  className="inline-flex items-center text-gray-600 hover:text-primary-600"
                >
                  🔗 Paylaş
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};