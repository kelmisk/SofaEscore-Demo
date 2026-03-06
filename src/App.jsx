import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import League from './pages/League';
import Search from './pages/Search';
import Team from './pages/Team';
import Debug from './pages/Debug';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/liga/:leagueKey" element={<League />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/equipo/:teamId" element={<Team />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
