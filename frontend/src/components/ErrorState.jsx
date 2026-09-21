export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-message state-message--error">
      <p className="state-message__title">⚠ {message}</p>
      {onRetry && (
        <button className="btn btn--retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
