'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  User,
  Image as ImageIcon,
  Film
} from 'lucide-react'
import FileUpload from '@/components/FileUpload'

interface NewsPost {
  id: number
  title_en: string
  title_ge: string
  content_en: string
  content_ge: string
  excerpt_en?: string
  excerpt_ge?: string
  featured_image?: string
  media_files?: string
  is_published: number
  published_at?: string
  created_at: string
  username: string
}

export default function AdminNewsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const router = useRouter()
  
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)

  const [formData, setFormData] = useState({
    title_en: '',
    title_ge: '',
    content_en: '',
    content_ge: '',
    excerpt_en: '',
    excerpt_ge: '',
    featured_image: '',
    media_files: [] as string[],
    is_published: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/news')
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPost ? `/api/news/${editingPost.id}` : '/api/news'
      const method = editingPost ? 'PUT' : 'POST'
      
      // Prepare data with media_files as JSON string
      const submitData = {
        ...formData,
        media_files: JSON.stringify(formData.media_files)
      }
      
      console.log('Submitting news post with data:', submitData)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchPosts()
        resetForm()
        setShowNewPostForm(false)
        setEditingPost(null)
      } else {
        alert(result.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Failed to save post:', error)
      alert('Failed to save post')
    }
  }

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post)
    setFormData({
      title_en: post.title_en,
      title_ge: post.title_ge,
      content_en: post.content_en,
      content_ge: post.content_ge,
      excerpt_en: post.excerpt_en || '',
      excerpt_ge: post.excerpt_ge || '',
      featured_image: post.featured_image || '',
      media_files: post.media_files ? JSON.parse(post.media_files) : [],
      is_published: post.is_published === 1
    })
    setShowNewPostForm(true)
  }

  const handleDelete = async (postId: number) => {
    if (!confirm(language === 'ge' ? 'დარწმუნებული ხართ?' : 'Are you sure?')) {
      return
    }

    try {
      const response = await fetch(`/api/news/${postId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchPosts()
      } else {
        alert(result.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const togglePublication = async (postId: number) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchPosts()
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to toggle publication:', error)
      alert('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ge: '',
      content_en: '',
      content_ge: '',
      excerpt_en: '',
      excerpt_ge: '',
      featured_image: '',
      media_files: [],
      is_published: false
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ge' ? 'ka-GE' : 'en-US')
  }

  const getTitle = (post: NewsPost) => language === 'ge' ? post.title_ge : post.title_en

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {language === 'ge' ? 'სიახლეების მართვა' : 'News Management'}
        </h1>
        <button
          onClick={() => {
            resetForm()
            setEditingPost(null)
            setShowNewPostForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {language === 'ge' ? 'სიახლის დამატება' : 'New Post'}
        </button>
      </div>

      {/* New/Edit Post Form */}
      {showNewPostForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPost 
              ? (language === 'ge' ? 'სიახლის რედაქტირება' : 'Edit Post')
              : (language === 'ge' ? 'სიახლის დამატება' : 'New Post')
            }
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Georgian)
                </label>
                <input
                  type="text"
                  value={formData.title_ge}
                  onChange={(e) => setFormData({ ...formData, title_ge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (English)
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Georgian)
                </label>
                <textarea
                  value={formData.content_ge}
                  onChange={(e) => setFormData({ ...formData, content_ge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (English) - Optional
                </label>
                <textarea
                  value={formData.excerpt_en}
                  onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (Georgian) - Optional
                </label>
                <textarea
                  value={formData.excerpt_ge}
                  onChange={(e) => setFormData({ ...formData, excerpt_ge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  name="featured_image_url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://example.com/image.jpg or upload below"
                  autoComplete="off"
                />
                <div className="text-sm text-gray-500 text-center">OR</div>
                <FileUpload
                  id="featured-image-upload"
                  onUpload={(url) => setFormData({ ...formData, featured_image: url })}
                  accept="image/*"
                  multiple={false}
                  label="Upload Featured Image"
                  existingFiles={formData.featured_image ? [formData.featured_image] : []}
                  onRemove={() => setFormData({ ...formData, featured_image: '' })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Media Files
              </label>
              <FileUpload
                id="additional-media-upload"
                onUpload={(url) => {
                  const newFiles = [...formData.media_files, url]
                  setFormData({ ...formData, media_files: newFiles })
                }}
                onRemove={(url) => {
                  const newFiles = formData.media_files.filter(f => f !== url)
                  setFormData({ ...formData, media_files: newFiles })
                }}
                accept="image/*,video/*"
                multiple={true}
                label="Upload Images and Videos"
                existingFiles={formData.media_files}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publish"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-orange-600"
              />
              <label htmlFor="publish" className="text-sm font-medium text-gray-700">
                {language === 'ge' ? 'დაუყოვნებლივ გამოქვეყნება' : 'Publish immediately'}
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingPost 
                  ? (language === 'ge' ? 'განახლება' : 'Update')
                  : (language === 'ge' ? 'შექმნა' : 'Create')
                }
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewPostForm(false)
                  setEditingPost(null)
                  resetForm()
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {language === 'ge' ? 'გაუქმება' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ge' ? 'სათაური' : 'Title'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ge' ? 'სტატუსი' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ge' ? 'თარიღი' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ge' ? 'მოქმედებები' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.featured_image && (
                        <ImageIcon className="w-4 h-4 text-gray-400 mr-2" />
                      )}
                      {post.media_files && (
                        <Film className="w-4 h-4 text-gray-400 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTitle(post)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'ge' ? 'ავტორი:' : 'By:'} {post.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.is_published 
                        ? (language === 'ge' ? 'გამოქვეყნებული' : 'Published')
                        : (language === 'ge' ? 'მონახაზი' : 'Draft')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublication(post.id)}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          post.is_published ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={post.is_published ? 'Hide' : 'Publish'}
                      >
                        {post.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-1 rounded hover:bg-gray-100 text-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1 rounded hover:bg-gray-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {language === 'ge' ? 'სიახლეები ჯერ არ არის შექმნილი' : 'No news posts created yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}