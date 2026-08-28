interface MensagemErroProps {
  readonly titulo?: string;
  readonly mensagem: string;
  readonly onTentarNovamente?: () => void;
}

export function MensagemErro({ titulo = 'Algo deu errado', mensagem, onTentarNovamente }: MensagemErroProps) {
  return (
    <div className="mensagem-erro-box" role="alert">
      <span className="mensagem-erro-icone" aria-hidden="true">⚠️</span>
      <h3>{titulo}</h3>
      <p>{mensagem}</p>
      {onTentarNovamente && (
        <button type="button" onClick={onTentarNovamente} className="btn-tentar-novamente">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
