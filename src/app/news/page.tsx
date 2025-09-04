'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Calendar, Clock, User, ChevronRight, Heart, MessageCircle, Share2, Play, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  published_at: string
  username: string
  comment_count?: number
}

export default function NewsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // Load liked posts from localStorage on component mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('surya-yoga-liked-posts')
    if (savedLikes) {
      try {
        const parsedLikes = JSON.parse(savedLikes)
        setLikedPosts(new Set(parsedLikes))
      } catch (error) {
        console.error('Error loading liked posts:', error)
      }
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch news posts:', error)
    } finally {
      setLoading(false)
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
  const getExcerpt = (post: NewsPost) => {
    const excerpt = language === 'ge' ? post.excerpt_ge : post.excerpt_en
    if (excerpt) return excerpt
    
    // Fallback to truncated content
    const content = getContent(post)
    return content.length > 300 ? content.substring(0, 300) + '...' : content
  }

  const getMediaFiles = (post: NewsPost): string[] => {
    if (!post.media_files) return []
    try {
      const parsed = JSON.parse(post.media_files)
      // Ensure we always return an array
      if (Array.isArray(parsed)) {
        return parsed
      } else {
        // If it's a single item, wrap it in an array
        return [parsed]
      }
    } catch (e) {
      console.error('Error parsing media files:', e)
      return []
    }
  }

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext))
  }

  const handleLike = (postId: number) => {
    const newLikedPosts = new Set(likedPosts)
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId)
    } else {
      newLikedPosts.add(postId)
    }
    setLikedPosts(newLikedPosts)
    
    // Save to localStorage
    try {
      localStorage.setItem('surya-yoga-liked-posts', JSON.stringify(Array.from(newLikedPosts)))
    } catch (error) {
      console.error('Error saving liked posts:', error)
    }
  }

  const handleShare = async (post: NewsPost) => {
    const url = `${window.location.origin}/news/${post.id}`
    const title = getTitle(post)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(url)
      alert(language === 'ge' ? 'ლინკი დაკოპირებულია' : 'Link copied to clipboard')
    }
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

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Header */}
      <div className="bg-white border-b border-earth-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-earth-800">
            {language === 'ge' ? 'სიახლეები' : 'News'}
          </h1>
          <p className="text-earth-600 mt-1">
            {language === 'ge' 
              ? 'გაეცანით სურია იოგას სიახლეებს, ღონისძიებებს და განახლებებს'
              : 'Stay updated with the latest news, events, and updates from Surya Yoga'
            }
          </p>
        </div>
      </div>

      {/* News Feed */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg card-shadow p-8 text-center border border-earth-200">
            <p className="text-earth-600">
              {language === 'ge' ? 'სიახლეები ჯერ არ არის გამოქვეყნებული' : 'No news posts published yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => {
              const mediaFiles = getMediaFiles(post)
              // Ensure mediaFiles is always an array
              const safeMediaFiles = Array.isArray(mediaFiles) ? mediaFiles : []
              return (
                <Link key={post.id} href={`/news/${post.id}`}>
                  <article className="bg-white rounded-lg card-shadow border border-earth-200 cursor-pointer hover:shadow-lg transition-shadow mb-8">
                  {/* Post Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-sun-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-earth-800">{post.username}</div>
                        <div className="text-sm text-earth-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </div>
                      </div>
                    </div>

                    {/* Post Title */}
                    <h2 className="text-xl font-semibold text-earth-800 mb-3">
                      {getTitle(post)}
                    </h2>

                    {/* Post Content Preview */}
                    <p className="text-earth-700 leading-relaxed mb-4">
                      {getExcerpt(post)}
                    </p>
                  </div>

                  {/* Featured Image */}
                  {post.featured_image && (
                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                      <Image
                        src={post.featured_image}
                        alt={getTitle(post)}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Media Gallery Preview */}
                  {safeMediaFiles.length > 0 && (
                    <div className="px-4 py-3">
                      {safeMediaFiles.length === 1 ? (
                        // Single media file - show larger
                        <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
                          {isVideo(safeMediaFiles[0]) ? (
                            <div className="w-full h-full bg-earth-200 flex items-center justify-center">
                              <Play className="w-12 h-12 text-earth-500" />
                            </div>
                          ) : (
                            <img
                              src={safeMediaFiles[0]}
                              alt="Media"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('News page image failed to load:', safeMediaFiles[0]);
                                const parent = e.currentTarget.parentElement?.parentElement;
                                if (parent) parent.style.display = 'none';
                              }}
                              onLoad={() => {}}
                            />
                          )}
                        </div>
                      ) : (
                        // Multiple media files - show grid
                        <div className="grid grid-cols-2 gap-3">
                          {safeMediaFiles.slice(0, 4).map((file, index) => (
                            <div key={index} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                              {isVideo(file) ? (
                                <div className="w-full h-full bg-earth-200 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-earth-500" />
                                </div>
                              ) : (
                                <img
                                  src={file}
                                  alt={`Media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('Grid image failed to load:', file);
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) parent.style.display = 'none';
                                  }}
                                  onLoad={() => {}}
                                />
                              )}
                              {index === 3 && safeMediaFiles.length > 4 && (
                                <div className="absolute inset-0 bg-earth-800/70 flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    +{safeMediaFiles.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-earth-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLike(post.id)
                          }}
                          className={`flex items-center gap-2 transition-colors ${
                            likedPosts.has(post.id) 
                              ? 'text-red-600' 
                              : 'text-black hover:text-red-500'
                          }`}
                          style={likedPosts.has(post.id) ? { color: '#dc2626' } : { color: '#000000' }}
                        >
                          <Heart 
                            className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} 
                            style={likedPosts.has(post.id) ? { fill: '#dc2626', color: '#dc2626' } : {}}
                          />
                          <span className="text-sm font-medium">{language === 'ge' ? 'მოწონება' : 'Like'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.location.href = `/news/${post.id}`
                          }}
                          className="flex items-center gap-2 text-black hover:text-blue-600 transition-colors"
                          style={{ color: '#000000' }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {language === 'ge' ? 'კომენტარი' : 'Comment'}
                            {post.comment_count !== undefined && post.comment_count > 0 && (
                              <span className="ml-1">({post.comment_count})</span>
                            )}
                          </span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleShare(post)
                          }}
                          className="flex items-center gap-2 text-black hover:text-green-600 transition-colors"
                          style={{ color: '#000000' }}
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">{language === 'ge' ? 'გაზიარება' : 'Share'}</span>
                        </button>
                      </div>
                      <span className="text-black hover:text-orange-600 font-bold text-sm" style={{ color: '#000000' }}>
                        {language === 'ge' ? 'სრულად წაკითხვა' : 'Read more'}
                      </span>
                    </div>
                  </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}