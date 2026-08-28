interface LoadingProps {
  readonly texto?: string;
}

export function Loading({ texto = 'Carregando...' }: LoadingProps) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}
