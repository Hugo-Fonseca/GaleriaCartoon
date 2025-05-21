import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header/header';
import Footer from './Components/Footer/footer';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="./Billy/billy-2001" element={<div>Contenido de Billy - 2001</div>} />
        <Route path="./Ben10/ben10-2005" element={<div>Contenido de Ben 10 - 2005</div>} />
        <Route path="./Jake/jake-2010" element={<div>Contenido de Jake - 2010</div>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
