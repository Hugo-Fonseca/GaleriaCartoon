import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header/header';
import HeroPage from './Components/Hero/hero';
import BillyPage from "./Components/Billy/billy-2001";
import Ben10Page from './Components/Ben10/ben10-2005';
import Footer from './Components/Footer/footer';
import GameCanvas from './Components/Game/GameCanvas';
import JakePage from './Components/Jake-the-dog/jake-2010';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/Ben10/ben10-2005" element={<Ben10Page />} />
        <Route path="/Jake-the-dog/jake-2010" element={<JakePage />} />
        <Route path="/Billy/billy-2001" element={<BillyPage/>}/>
        {/* Redirección por defecto si alguien entra a una ruta no existente */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/juego" element={<GameCanvas />} />
      </Routes>
      <Footer />
    </Router>
    
  );
}

export default App;
