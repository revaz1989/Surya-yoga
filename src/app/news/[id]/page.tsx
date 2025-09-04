'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Calendar, User, ArrowLeft, Share2, MessageCircle, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface NewsPost {
  id: number
  title_en: string
  title_ge: string
  content_en: string
  content_ge: string
  featured_image?: string
  media_files?: string
  published_at: string
  username: string
}

interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  is_approved: number
  created_at: string
  updated_at: string
  username: string
}

export default function NewsPostPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const params = useParams()
  const postId = params.id as string
  
  const [post, setPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [mediaFiles, setMediaFiles] = useState<string[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
    checkAuth()
  }, [postId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/news/${postId}`)
      const data = await response.json()
      if (data.success) {
        setPost(data.post)
        if (data.post.media_files) {
          try {
            const parsedFiles = JSON.parse(data.post.media_files)
            // Ensure we always have an array
            if (Array.isArray(parsedFiles)) {
              setMediaFiles(parsedFiles)
            } else {
              // If it's a single item, wrap it in an array
              setMediaFiles([parsedFiles])
            }
          } catch (e) {
            console.error('Error parsing media files on detail page:', e)
            setMediaFiles([])
          }
        } else {
          setMediaFiles([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch news post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/news/${postId}/comments`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const submitComment = async () => {
    if (!user || !newComment.trim()) return

    setCommentLoading(true)
    try {
      const response = await fetch(`/api/news/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewComment('')
        fetchComments() // Refresh comments
      } else {
        alert(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('Failed to post comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!confirm(language === 'ge' ? 'ნამდვილად გსურთ კომენტარის წაშლა?' : 'Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchComments() // Refresh comments
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ge' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTitle = (post: NewsPost) => language === 'ge' ? post.title_ge : post.title_en
  const getContent = (post: NewsPost) => language === 'ge' ? post.content_ge : post.content_en

  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post ? getTitle(post) : '',
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert(language === 'ge' ? 'ლინკი დაკოპირებულია' : 'Link copied to clipboard')
    }
  }

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sun-500 mx-auto"></div>
          <p className="mt-4 text-earth-600">
            {language === 'ge' ? 'იტვირთება...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-earth-800 mb-4">
            {language === 'ge' ? 'სიახლე ვერ მოიძებნა' : 'Post not found'}
          </h1>
          <Link 
            href="/news"
            className="inline-flex items-center gap-2 text-sun-600 hover:text-sun-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ge' ? 'სიახლეებზე დაბრუნება' : 'Back to News'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Link */}
      <Link 
        href="/news"
        className="inline-flex items-center gap-2 text-sun-600 hover:text-sun-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'ge' ? 'სიახლეებზე დაბრუნება' : 'Back to News'}
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          {/* Meta Info */}
          <div className="flex items-center justify-between gap-4 text-sm text-black font-medium mb-6" style={{ color: '#000000', opacity: 1 }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.username}</span>
              </div>
            </div>
            
            {/* Share Button */}
            <button
              onClick={sharePost}
              className="flex items-center gap-1 text-black hover:text-gray-800 transition-colors font-semibold"
              style={{ color: '#000000', opacity: 1 }}
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'ge' ? 'გაზიარება' : 'Share'}</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-earth-800 mb-6">
            {getTitle(post)}
          </h1>

          {/* Featured Image */}
          {post.featured_image && (
            <div 
              className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(post.featured_image!)}
            >
              <Image
                src={post.featured_image}
                alt={getTitle(post)}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-black leading-relaxed text-lg font-semibold"
            style={{ color: '#000000', opacity: 1 }}
            dangerouslySetInnerHTML={{ 
              __html: getContent(post).replace(/\n/g, '<br>') 
            }}
          />
        </div>

        {/* Media Files */}
        {mediaFiles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-black mb-6 text-center" style={{ color: '#000000', opacity: 1 }}>
              {language === 'ge' ? 'მედია ფაილები' : 'Media Files'}
            </h3>
            <div className="flex flex-col items-center gap-8">
              {Array.isArray(mediaFiles) && mediaFiles.map((file, index) => (
                <div key={index} className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden card-shadow border border-earth-200">
                  {isVideo(file) ? (
                    <video 
                      controls 
                      className="w-full h-auto"
                      preload="metadata"
                    >
                      <source src={file} />
                      {language === 'ge' 
                        ? 'თქვენი ბრაუზერი არ აწყობს ვიდეო ფორმატს'
                        : 'Your browser does not support the video format'
                      }
                    </video>
                  ) : (
                    <div 
                      className="relative w-full bg-gray-100 border-2 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity" 
                      style={{ aspectRatio: '16/10' }}
                      onClick={() => setSelectedImage(file)}
                    >
                      <img
                        src={file}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.log('Image failed to load:', file);
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', file);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-earth-200">
          <h3 className="text-xl font-semibold text-earth-800 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {language === 'ge' ? 'კომენტარები' : 'Comments'} ({comments.length})
          </h3>

          {/* Comment Form */}
          {user ? (
            <div className="mb-8 bg-earth-50 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-sun-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={language === 'ge' ? 'კომენტარის დაწერა...' : 'Write a comment...'}
                    className="w-full p-3 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={submitComment}
                      disabled={!newComment.trim() || commentLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed border border-orange-500"
                      style={{ minWidth: '140px', minHeight: '40px' }}
                    >
                      <Send className="w-4 h-4" />
                      {commentLoading 
                        ? (language === 'ge' ? 'იგზავნება...' : 'Posting...') 
                        : (language === 'ge' ? 'კომენტარის გაგზავნა' : 'Post Comment')
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 text-center bg-earth-50 rounded-lg p-6">
              <p className="text-earth-600">
                {language === 'ge' 
                  ? 'კომენტარის დასაწერად გჭირდებათ ავტორიზაცია' 
                  : 'Please sign in to leave a comment'
                }
              </p>
              <Link 
                href="/login" 
                className="inline-block mt-3 text-sun-600 hover:text-sun-700 font-medium"
              >
                {language === 'ge' ? 'შესვლა' : 'Sign In'}
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-earth-500 py-8">
                {language === 'ge' ? 'კომენტარები ჯერ არ არის' : 'No comments yet'}
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4 card-shadow border border-earth-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-sun-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-earth-800">{comment.username}</span>
                          <span className="text-sm text-earth-500 ml-2">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        {user && user.is_admin === 1 && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1"
                            title={language === 'ge' ? 'კომენტარის წაშლა' : 'Delete comment'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-earth-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Social Share */}
        <div className="mt-12 pt-8 border-t border-earth-200">
          <div className="text-center">
            <p className="text-black mb-4 font-medium" style={{ color: '#000000', opacity: 1 }}>
              {language === 'ge' ? 'მოგწონს ეს სიახლე?' : 'Enjoyed this post?'}
            </p>
            <button
              onClick={sharePost}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black rounded-full font-semibold hover:bg-orange-600 transition-colors border-2 border-black"
              style={{ color: '#000000', backgroundColor: '#f97316' }}
            >
              <Share2 className="w-4 h-4" />
              {language === 'ge' ? 'მეგობრებთან გაზიარება' : 'Share with friends'}
            </button>
          </div>
        </div>
      </article>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}