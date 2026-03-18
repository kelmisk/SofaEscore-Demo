import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import League from './pages/League';
import Champions from './pages/Champions';
import Search from './pages/Search';
import Team from './pages/Team';
import Standings from './pages/Standings';
import Debug from './pages/Debug';
import { getAllTeams } from './services/api';

function App() {
  // Precargar equipos en segundo plano tras 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      getAllTeams();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/liga/:leagueKey" element={<League />} />
          <Route path="/liga/:leagueKey/clasificacion" element={<Standings />} />
          <Route path="/champions" element={<Champions />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/equipo/:teamId" element={<Team />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
