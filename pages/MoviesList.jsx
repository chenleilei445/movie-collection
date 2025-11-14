import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

function MoviesList() {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      // 获取电影数据
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*, movie_categories!inner(category_id, categories(name))')
        .order('created_at', { ascending: false })
      if (moviesError) console.error(moviesError)

      // 获取所有分类
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
      if (categoriesError) console.error(categoriesError)

      // 整理电影数据（聚合分类）
      const formattedMovies = moviesData?.map(movie => {
        const movieCategories = movie.movie_categories.map(mc => mc.categories.name)
        return { ...movie, categories: movieCategories }
      })

      setMovies(formattedMovies || [])
      setCategories(categoriesData || [])
      setLoading(false)
    }

    fetchMovies()
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    // 替换原来的网格容器和卡片
<div className="container">
  <h1>我的电影收藏清单</h1>
  <div className="movies-grid">
    {movies.map(movie => (
      <div key={movie.id} className="movie-card">
        {movie.poster_url && (
          <img 
            src={movie.poster_url} 
            alt={movie.title} 
            className="movie-poster" 
          />
        )}
        <div className="movie-info">
          <h3><Link to={`/movie/${movie.id}`}>{movie.title}</Link></h3>
          <p><span className="detail-label">年份：</span>{movie.release_year}</p>
          <p><span className="detail-label">评分：</span>{movie.rating}</p>
          <p><span className="detail-label">状态：</span>{movie.status}</p>
          <div>
            {movie.categories.map((category, idx) => (
              <span key={idx} className="category-tag">{category}</span>
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