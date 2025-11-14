import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, Link } from 'react-router-dom'

function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovie = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*, movie_categories!inner(category_id, categories(name))')
        .eq('id', id)
        .single()
      if (error) console.error(error)

      const categories = data?.movie_categories.map(mc => mc.categories.name)
      setMovie({ ...data, categories })
      setLoading(false)
    }

    fetchMovie()
  }, [id])

  if (loading) return <div>加载中...</div>
  if (!movie) return <div>电影不存在</div>

  return (
    // 替换原来的详情页布局
<div className="container">
  <Link to="/" className="btn btn-outline">返回列表</Link>
  <h1>{movie.title}</h1>
  <div className="movie-detail">
    <div className="movie-detail-poster">
      {movie.poster_url && <img src={movie.poster_url} alt={movie.title} />}
    </div>
    <div className="movie-detail-info">
      <p><span className="detail-label">导演：</span>暂无</p>
      <p><span className="detail-label">上映年份：</span>{movie.release_year}</p>
      <p><span className="detail-label">评分：</span>{movie.rating}</p>
      <p><span className="detail-label">状态：</span>{movie.status}</p>
      <p><span className="detail-label">分类：</span>{movie.categories.join('、')}</p>
      <div className="detail-actions">
        <button 
          onClick={async () => { /* 原有删除逻辑 */ }}
          className="btn btn-danger"
        >
          删除电影
        </button>
      </div>
    </div>
  </div>
</div>
  )
}

export default MovieDetail