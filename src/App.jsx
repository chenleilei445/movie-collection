import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MoviesList from './pages/MoviesList'
import MovieDetail from './pages/MovieDetail'
import AddMovie from './pages/AddMovie'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav style={{ backgroundColor: '#f0f0f0', padding: '1rem' }}>
          <a href="/" style={{ marginRight: '1rem', textDecoration: 'none', color: 'black' }}>电影列表</a>
          <a href="/add-movie" style={{ textDecoration: 'none', color: 'black' }}>添加电影</a>
        </nav>
        <Routes>
          <Route path="/" element={<MoviesList />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/add-movie" element={<AddMovie />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App