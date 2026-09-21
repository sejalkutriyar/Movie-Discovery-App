import { Routes, Route } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { MovieDetails } from './pages/MovieDetails';
import { Wishlist } from './pages/Wishlist';

function App() {
  return (
    <WishlistProvider>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>
    </WishlistProvider>
  );
}

export default App;
