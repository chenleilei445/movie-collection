import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, Link, useNavigate } from 'react-router-dom'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*, movie_categories!inner(category_id, categories(name))')
        .eq('id', id)
        .single()
      if (error) console.error(error)

      const categories = data?.movie_categories.map(mc => mc.categories.name)
      setMovie({ 
        ...data, 
        categories,
        // 设置默认海报
        poster_url: data?.poster_url || 'https://via.placeholder.com/300x450?text=暂无海报'
      })
      setLoading(false)
    }

    fetchMovie()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这部电影吗？此操作不可恢复！')) {
      return
    }

    setDeleteLoading(true)
    try {
      // 1. 先删除关联的分类关系
      const { error: relationError } = await supabase
        .from('movie_categories')
        .delete()
        .eq('movie_id', id)
      
      if (relationError) throw relationError

      // 2. 再删除电影本身
      const { error: movieError } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)
      
      if (movieError) throw movieError

      // 3. 删除成功后返回列表页
      navigate('/')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败: ' + error.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>
  if (!movie) return <div>电影不存在</div>

  return (
    <div className="container">
      <Link to="/" className="btn btn-outline">返回列表</Link>
      <h1>{movie.title}</h1>
      <div className="movie-detail">
        <div className="movie-detail-poster">
          <img 
            src={movie.poster_url} 
            alt={movie.title} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=海报加载失败'
            }}
          />
        </div>
        <div className="movie-detail-info">
          <p><span className="detail-label">导演：</span>暂无</p>
          <p><span className="detail-label">上映年份：</span>{movie.release_year}</p>
          <p><span className="detail-label">评分：</span>{movie.rating}</p>
          <p><span className="detail-label">状态：</span>{movie.status}</p>
          <p><span className="detail-label">分类：</span>{movie.categories.join('、')}</p>
          <div className="detail-actions">
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="btn btn-danger"
            >
              {deleteLoading ? '删除中...' : '删除电影'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail