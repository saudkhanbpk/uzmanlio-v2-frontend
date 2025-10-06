// Blog Service - API calls for blog management
const API_BASE_URL = 'http://localhost:4000/api/expert';

export const blogService = {
  // Get all blogs for a user
  async getBlogs(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.blogs || [];
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get blogs by status
  async getBlogsByStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.blogs || [];
    } catch (error) {
      console.error('Error fetching blogs by status:', error);
      throw error;
    }
  },

  // Get blogs by category
  async getBlogsByCategory(userId, category) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.blogs || [];
    } catch (error) {
      console.error('Error fetching blogs by category:', error);
      throw error;
    }
  },

  // Get single blog by ID
  async getBlog(userId, blogId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/${blogId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  // Get blog by slug (for public view)
  async getBlogBySlug(userId, slug) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/slug/${slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      throw error;
    }
  },

  // Create new blog
  async createBlog(userId, blogData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  async updateBlog(userId, blogId, blogData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Update blog status
  async updateBlogStatus(userId, blogId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/${blogId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('Error updating blog status:', error);
      throw error;
    }
  },

  // Delete blog
  async deleteBlog(userId, blogId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Get blog statistics
  async getBlogStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/blogs/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  },

  // Helper function to format blog data for API
  formatBlogData(formData) {
    return {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      keywords: typeof formData.keywords === 'string' 
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        : formData.keywords || [],
      status: formData.status || 'draft',
      author: formData.author
    };
  },

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  },

  // Get share URL for blog
  getShareUrl(blog) {
    return `${window.location.origin}/blog/${blog.slug}`;
  },

  // Copy share URL to clipboard
  async copyShareUrl(blog) {
    try {
      const url = this.getShareUrl(blog);
      await navigator.clipboard.writeText(url);
      return url;
    } catch (error) {
      console.error('Error copying URL:', error);
      throw error;
    }
  }
};

export default blogService;
