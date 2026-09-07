// src/App.jsx (updated)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BlogLayout from './pages/BlogLayout';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/blog" replace />} />
        <Route path="/blog" element={<BlogLayout />}>
          <Route index element={<BlogList />} />
          <Route path="post/:id" element={<BlogPost />} />
        </Route>
        {/* 404 Not Found */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/blog">← Back to Blog</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;