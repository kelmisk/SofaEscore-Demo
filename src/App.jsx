import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import './App.css';

function Home() {
  return <h1>Inicio</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
