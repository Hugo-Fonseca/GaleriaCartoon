import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header/header';
import HeroPage from './Components/Hero/hero';
//import Billy
import Ben10Page from './Components/Ben10/ben10-2005';
import Footer from './Components/Footer/footer';
//import Jake from './pages/Jake';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/Ben10/ben10-2005" element={<Ben10Page />} />
        {/* Redirección por defecto si alguien entra a una ruta no existente */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
    
  );
}

export default App;
