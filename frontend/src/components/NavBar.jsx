import { NavLink } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export function NavBar() {
  const { items } = useWishlist();
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__logo">🎬 MovieDiscover</NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>Home</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'is-active' : ''}>Search</NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'is-active' : ''}>
          Wishlist {items.length > 0 && <span className="navbar__badge">{items.length}</span>}
        </NavLink>
      </nav>
    </header>
  );
}
