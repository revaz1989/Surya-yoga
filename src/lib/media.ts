// Media URL helper functions
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ''
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // If it's already using the API route, return as is
  if (path.startsWith('/api/media/')) {
    return path
  }
  
  // Convert old public URLs to API route
  if (path.startsWith('/uploads/')) {
    // Remove the /uploads/ prefix and use API route
    return `/api/media/${path.substring(9)}`
  }
  
  // For any other path, assume it needs the API route
  return `/api/media/${path}`
}

export function parseMediaFiles(mediaFiles: string | null | undefined): string[] {
  if (!mediaFiles) return []
  
  try {
    // Try to parse as JSON
    let parsed = JSON.parse(mediaFiles)
    
    // Handle double-encoded JSON
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch (e) {
        // If second parse fails, treat as single file
        return parsed.trim() ? [getMediaUrl(parsed)] : []
      }
    }
    
    // Ensure we return an array of URLs
    if (Array.isArray(parsed)) {
      return parsed
        .filter(file => file && typeof file === 'string' && file.trim() !== '')
        .map(file => getMediaUrl(file))
    } else if (parsed && typeof parsed === 'string') {
      return [getMediaUrl(parsed)]
    }
    
    return []
  } catch (e) {
    console.error('Error parsing media files:', e)
    return []
  }
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
  return videoExtensions.some(ext => filename.toLowerCase().includes(ext))
}