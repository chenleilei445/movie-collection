import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import ImageWithFallback from '../components/ImageWithFallback'

function MoviesList() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      // 获取电影数据
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*, movie_categories!left(category_id, categories(name))')
        .order('created_at', { ascending: false })
      if (moviesError) {
        console.error('电影数据查询错误:', moviesError)
      } else {
        console.log('获取到的电影数据:', moviesData)
      }

      // 获取所有分类
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
      if (categoriesError) {
        console.error('分类数据查询错误:', categoriesError)
      } else {
        console.log('获取到的分类数据:', categoriesData)
      }

      // 整理电影数据（聚合分类）
      const formattedMovies = moviesData?.map(movie => {
        const movieCategories = movie.movie_categories?.map(mc => mc.categories.name) || []
        return { ...movie, categories: movieCategories }
      })

      setMovies(formattedMovies || [])
      setLoading(false)
    }

    fetchMovies()
  }, [])

  if (loading) return <div>加载中...</div>
  
  // 调试信息
  console.log('最终渲染的电影数据:', movies)
  
  // 调试信息
  console.log('最终渲染的电影数据:', movies)

  return (
    // 替换原来的网格容器和卡片
<div className="container">
  <h1>我的电影收藏清单</h1>
      <div className="movies-grid">
    {movies.map(movie => (
      <div key={movie.id} className="movie-card">
        <ImageWithFallback
          src={movie.poster_url}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
        />
        
        <div className="movie-info">
          <h3><Link to={`/movie/${movie.id}`}>{movie.title || '未知电影'}</Link></h3>
          <p><span className="detail-label">年份：</span>{movie.release_year || '未知'}</p>
          <p><span className="detail-label">评分：</span>{movie.rating || '0.0'}</p>
          <p><span className="detail-label">状态：</span>{movie.status || '未知'}</p>
          <div>
            {movie.categories && movie.categories.length > 0 ? (
              movie.categories.map((category, idx) => (
                <span key={idx} className="category-tag">{category}</span>
              ))
            ) : (
              <span className="category-tag">暂无分类</span>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  )
}

export default MoviesList