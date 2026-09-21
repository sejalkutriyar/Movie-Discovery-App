export function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <div className="state-message">
      <p className="state-message__title">{title}</p>
      {subtitle && <p className="state-message__subtitle">{subtitle}</p>}
    </div>
  );
}
