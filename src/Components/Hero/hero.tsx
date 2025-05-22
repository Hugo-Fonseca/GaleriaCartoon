// src/Components/Hero/HeroPage.tsx
//import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white text-center p-4">
      <h1 
        className="display-3 fw-bold mb-4 text-warning"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Cartoon Museum
      </h1>
      <p className="lead col-md-8">
        Bienvenido al Museo de los dibujos animados de Cartoon Network. Aquí podrás explorar modelos 3D interactivos y conocer sobre tus personajes favoritos por año de lanzamiento.
      </p>
    </div>
  );
};

export default HeroPage;
