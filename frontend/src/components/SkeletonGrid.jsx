export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="movie-card movie-card--skeleton" key={i}>
          <div className="skeleton skeleton--poster" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
