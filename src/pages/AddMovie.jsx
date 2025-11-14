import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function AddMovie() {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    poster_url: '',
    release_year: '',
    rating: '',
    status: 'want',
    category_ids: [],
  })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) console.error(error)
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value)
    setFormData(prev => ({ ...prev, category_ids: selectedIds }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 插入电影到movies表
    const { data: movieData, error: movieError } = await supabase
      .from('movies')
      .insert([{
        title: formData.title,
        poster_url: formData.poster_url,
        release_year: parseInt(formData.release_year),
        rating: parseFloat(formData.rating),
        status: formData.status,
      }])
      .select()
    if (movieError) {
      console.error(movieError)
      setLoading(false)
      return
    }

    // 插入电影-分类关联数据
    const categoryRelations = formData.category_ids.map(categoryId => ({
      movie_id: movieData[0].id,
      category_id: categoryId,
    }))
    await supabase.from('movie_categories').insert(categoryRelations)

    setLoading(false)
    navigate('/')
  }

  return (
    // 替换原来的表单布局
<div className="container">
  <h1>添加电影</h1>
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="title">电影名称</label>
      <input
        type="text"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="poster_url">海报链接</label>
      <input
        type="url"
        id="poster_url"
        name="poster_url"
        value={formData.poster_url}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="release_year">上映年份</label>
      <input
        type="number"
        id="release_year"
        name="release_year"
        value={formData.release_year}
        onChange={handleChange}
        required
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="rating">评分</label>
      <input
        type="number"
        id="rating"
        name="rating"
        step="0.1"
        value={formData.rating}
        onChange={handleChange}
        required
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="status">状态</label>
      <select
        id="status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="form-control"
      >
        <option value="want">想看</option>
        <option value="watching">在看</option>
        <option value="watched">已看</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="category_ids">电影分类</label>
      <select
        id="category_ids"
        name="category_ids"
        multiple
        onChange={handleCategoryChange}
        className="form-control"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
    </div>

    <button 
      type="submit" 
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? '提交中...' : '添加电影'}
    </button>
  </form>
</div>
  )
}

export default AddMovie