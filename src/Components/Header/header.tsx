import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-black py-3 shadow">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="m-0">
          <Link to="/" className="text-white text-decoration-none">Cartoon Museum</Link>
        </h1>
        <nav>
          <Link to="/Billy/billy-2001" className="btn btn-outline-light cartoon-btn billy mx-1">Billy - 2001</Link>
          <Link to="/Ben10/ben10-2005" className="btn btn-outline-light cartoon-btn ben10 mx-1">Ben 10 - 2005</Link>
          <Link to="/Jake-the-dog/jake-2010" className="btn btn-outline-light cartoon-btn jake mx-1">Jake - 2010</Link>
          <Link to="/juego" className="btn btn-outline-light cartoon-btn juego mx-1">Juego</Link>
          <Link to ="/flappy-fuego" className="btn btn-outline-light cartoon-btn flappy mx-1">Flappy Fuego</Link>
          
        </nav>
      </div>
    </header>
  );
}

export default Header;
