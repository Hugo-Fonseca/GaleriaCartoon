import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-black py-3 shadow">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="text-white m-0">Cartoon Museum</h1>
        <nav>
          <Link to="./Billy/billy-2001" className="btn btn-outline-light mx-1">Billy - 2001</Link>
          <Link to="./Ben10/ben10-2005" className="btn btn-outline-light mx-1">Ben 10 - 2005</Link>
          <Link to="./Jake/jake-2010" className="btn btn-outline-light mx-1">Jake - 2010</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;