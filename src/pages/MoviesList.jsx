import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

function MoviesList() {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // 获取电影数据（关联分类）
        const { data: moviesData, error: moviesError } = await supabase
          .from('movies')
          .select(`
            *,
            movie_categories (
              category_id,
              categories (name)
            )
          `)
          .order('created_at', { ascending: false })
        
        if (moviesError) throw new Error(`获取电影失败：${moviesError.message}`)

        // 获取所有分类
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
        
        if (categoriesError) throw new Error(`获取分类失败：${categoriesError.message}`)

        // 整理电影数据
        const formattedMovies = moviesData?.map(movie => {
          const movieCategories = movie.movie_categories 
            ? movie.movie_categories
                .filter(mc => mc.categories?.name)
                .map(mc => mc.categories.name)
            : []

          return { 
            ...movie, 
            categories: movieCategories,
            // 设置默认海报
            poster_url: movie.poster_url || 'https://via.placeholder.com/300x450?text=暂无海报'
          }
        }) || []

        setMovies(formattedMovies)
        setCategories(categoriesData || [])
      } catch (err) {
        setError(err.message)
        console.error('加载数据出错：', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) return <div className="loading">加载中...</div>
  if (error) return <div className="error">❌ {error}</div>
  if (movies.length === 0) return <div className="no-movies">暂无收藏的电影，快去添加吧！</div>

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>我的电影收藏清单</h1>
      
      {/* 电影网格布局 */}
      <div className="movies-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '25px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {movies.map(movie => (
          <div 
            key={movie.id} 
            className="movie-card" 
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* 海报图片 */}
            <div className="movie-poster" style={{
              height: '375px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5'
            }}>
              <img 
                src={movie.poster_url} 
                alt={`${movie.title} 海报`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
                onLoad={(e) => {
                  e.target.style.opacity = 1
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x450?text=海报加载失败'
                  e.target.style.opacity = 1
                }}
              />
            </div>

            {/* 电影信息 */}
            <div className="movie-info" style={{
              padding: '15px',
              fontSize: '14px'
            }}>
              <h3 style={{
                margin: '0 0 10px 0',
                fontSize: '18px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <Link 
                  to={`/movie/${movie.id}`} 
                  style={{ color: '#333', textDecoration: 'none' }}
                  onMouseOver={(e) => e.target.style.color = '#007bff'}
                  onMouseOut={(e) => e.target.style.color = '#333'}
                >
                  {movie.title}
                </Link>
              </h3>
              
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>年份：</span>
                <span>{movie.release_year || '未知'}</span>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>评分：</span>
                <span style={{ color: '#ff9800' }}>{movie.rating || '暂无'}</span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>状态：</span>
                <span style={{
                  color: movie.status === 'want' ? '#2196f3' : 
                         movie.status === 'watching' ? '#4caf50' : '#9c27b0'
                }}>
                  {movie.status === 'want' ? '想看' : 
                   movie.status === 'watching' ? '在看' : '已看'}
                </span>
              </div>
              
              {/* 分类标签 */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {movie.categories.map((category, idx) => (
                  <span 
                    key={idx} 
                    className="category-tag" 
                    style={{
                      backgroundColor: '#f0f5ff',
                      color: '#007bff',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MoviesList