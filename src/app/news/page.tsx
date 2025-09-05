'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Calendar, Clock, User, ChevronRight, ChevronLeft, Heart, MessageCircle, Share2, Play, Image as ImageIcon } from 'lucide-react'
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
    if (post.media_files === '[]') return []
    try {
      let parsed = JSON.parse(post.media_files)
      // Handle double-encoded JSON strings
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed)
        } catch (e) {
          // If second parse fails, treat the first parsed string as a single file
          return parsed.trim() ? [parsed] : []
        }
      }
      
      // Ensure we always return an array
      if (Array.isArray(parsed)) {
        return parsed.filter(file => file && typeof file === 'string' && file.trim() !== '')
      } else if (parsed && typeof parsed === 'string') {
        // If it's a single item, wrap it in an array
        return [parsed]
      }
      return []
    } catch (e) {
      console.error('Error parsing media files:', e, 'Raw:', post.media_files)
      return []
    }
  }

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext))
  }

  // Media Carousel Component
  const MediaCarousel = ({ files }: { files: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % files.length)
    }

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length)
    }

    if (files.length === 0) return null

    return (
      <div className="relative">
        {/* Main Media Display */}
        <div className="relative w-full rounded-lg overflow-hidden bg-earth-100" style={{ aspectRatio: '16/10' }}>
          {isVideo(files[currentIndex]) ? (
            <div className="w-full h-full bg-earth-200 flex items-center justify-center">
              <Play className="w-12 h-12 text-earth-500" />
            </div>
          ) : (
            <img
              src={files[currentIndex]}
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.log('Carousel image failed to load:', files[currentIndex]);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          {/* Navigation Arrows - only show if more than 1 file */}
          {files.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          {/* Dots indicator - only show if more than 1 file */}
          {files.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {files.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Counter - only show if more than 1 file */}
        {files.length > 1 && (
          <div className="text-center mt-2 text-sm text-earth-600">
            {currentIndex + 1} / {files.length}
          </div>
        )}
      </div>
    )
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
                <article key={post.id} className="bg-sun-50 rounded-lg card-shadow border border-earth-200 hover:shadow-lg transition-shadow mb-8">
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
                        className="object-contain bg-earth-100"
                      />
                    </div>
                  )}

                  {/* Media Gallery Preview */}
                  {safeMediaFiles.length > 0 && (
                    <div className="px-4 py-3">
                      <MediaCarousel files={safeMediaFiles} />
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
                        <Link
                          href={`/news/${post.id}`}
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
                        </Link>
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
                      <Link 
                        href={`/news/${post.id}`}
                        className="text-black hover:text-orange-600 font-bold text-sm transition-colors"
                        style={{ color: '#000000' }}
                      >
                        {language === 'ge' ? 'სრულად წაკითხვა' : 'Read more'}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}