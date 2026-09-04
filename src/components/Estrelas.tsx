interface EstrelasProps {
  readonly media: number;
  readonly quantidade: number;
}

// Mostra 5 estrelas, preenchendo de acordo com a média de avaliações dos
// pedidos já avaliados pelos clientes.
export function Estrelas({ media, quantidade }: EstrelasProps) {
  const cheias = Math.round(media);

  return (
    <div className="estrelas-media" title={`${media.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < cheias ? 'estrela cheia' : 'estrela vazia'}>★</span>
      ))}
      <span className="estrelas-texto">
        {quantidade > 0 ? `${media.toFixed(1)} (${quantidade} avaliações)` : 'Ainda sem avaliações'}
      </span>
    </div>
  );
}
