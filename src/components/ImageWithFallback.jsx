import { useState, useEffect, useMemo } from 'react'

// 默认海报图片
const DEFAULT_POSTER = '/default-poster.svg'

// 可用的代理服务列表
const PROXY_SERVICES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url) => `https://proxy.cors.sh/${url}`,
]

// 图片预加载缓存
const imageCache = new Map()

/**
 * 健壮的图片加载组件，支持多代理服务重试和错误处理
 * @param {string} src - 原始图片URL
 * @param {string} alt - 图片描述
 * @param {string} className - CSS类名
 * @param {object} props - 其他图片属性
 */
const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || DEFAULT_POSTER)
  const [retryCount, setRetryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 预处理URL：确保使用HTTPS，处理特殊字符
  const preprocessUrl = (url) => {
    if (!url || url === DEFAULT_POSTER) return DEFAULT_POSTER
    
    // 替换HTTP为HTTPS
    let processedUrl = url.replace(/^http:/, 'https:')
    
    // 处理特殊字符和编码
    try {
      // 如果是相对路径，直接返回
      if (processedUrl.startsWith('/')) return processedUrl
      
      // 检查URL是否有效
      new URL(processedUrl)
      return processedUrl
    } catch (error) {
      console.warn('Invalid URL:', processedUrl)
      return DEFAULT_POSTER
    }
  }

  // 检查图片是否已缓存
  const checkImageCache = (url) => {
    if (imageCache.has(url)) {
      return imageCache.get(url)
    }
    return null
  }

  // 图片加载错误处理
  const handleError = () => {
    console.log(`图片加载失败，尝试第${retryCount + 1}次重试`)
    
    // 如果还有代理服务可用，尝试下一个
    if (retryCount < PROXY_SERVICES.length) {
      const proxyService = PROXY_SERVICES[retryCount]
      const proxyUrl = proxyService(src)
      
      console.log(`尝试代理服务: ${proxyUrl}`)
      setCurrentSrc(proxyUrl)
      setRetryCount(prev => prev + 1)
      setHasError(false)
    } else {
      // 所有尝试都失败，使用默认图片
      console.log('所有代理服务都失败，使用默认图片')
      setCurrentSrc(DEFAULT_POSTER)
      setHasError(true)
      setIsLoading(false)
    }
  }

  // 图片加载成功处理
  const handleLoad = () => {
    console.log('图片加载成功')
    setIsLoading(false)
    setHasError(false)
    
    // 缓存成功加载的图片URL
    if (currentSrc && currentSrc !== DEFAULT_POSTER) {
      imageCache.set(currentSrc, true)
    }
  }

  // 监听src变化，重置状态
  useEffect(() => {
    if (src && src !== currentSrc) {
      const processedUrl = preprocessUrl(src)
      
      // 检查缓存
      const cached = checkImageCache(processedUrl)
      if (cached) {
        setIsLoading(false)
        setHasError(false)
      } else {
        setIsLoading(true)
        setHasError(false)
      }
      
      setCurrentSrc(processedUrl)
      setRetryCount(0)
    }
  }, [src])

  return (
    <div className={`image-container ${className || ''}`}>
      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      )}
      
      {/* 错误状态提示 */}
      {hasError && (
        <div className="image-error">
          <span>图片加载失败</span>
        </div>
      )}
      
      {/* 图片元素 */}
      <img
        src={currentSrc}
        alt={alt || '电影海报'}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          opacity: isLoading || hasError ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
        {...props}
      />
    </div>
  )
}

export default ImageWithFallback