const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'release_date.asc', label: 'Oldest' },
];

export function FilterBar({ genres, selectedGenre, onGenreChange, sort, onSortChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__chips">
        <button
          className={`chip ${!selectedGenre ? 'chip--active' : ''}`}
          onClick={() => onGenreChange('')}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            className={`chip ${String(selectedGenre) === String(g.id) ? 'chip--active' : ''}`}
            onClick={() => onGenreChange(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>
      <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="filter-bar__sort">
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
