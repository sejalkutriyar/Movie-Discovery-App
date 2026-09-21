import { NavLink } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../hooks/useTheme';

export function NavBar() {
  const { items } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__logo">🎬 MovieDiscover</NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>Home</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'is-active' : ''}>Search</NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'is-active' : ''}>
          Wishlist {items.length > 0 && <span className="navbar__badge">{items.length}</span>}
        </NavLink>
        <button className="navbar__theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
}