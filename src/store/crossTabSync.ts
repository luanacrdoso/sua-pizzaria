// Os dados "do negócio" (pedidos, cardápio, mesas, chamados) ficam em
// localStorage — compartilhado entre todas as abas da mesma origem. Só que
// o Zustand só reage a mudanças feitas na PRÓPRIA aba; se a cozinha atualiza
// um pedido numa aba, o garçom em outra aba não veria a mudança sem dar
// refresh manual.
//
// Para resolver isso, escutamos o evento nativo `storage` (disparado pelo
// navegador em todas as OUTRAS abas quando o localStorage muda) e forçamos
// cada store a reidratar a partir do localStorage atualizado. Isso faz o
// status do pedido, a fila de chamados, etc. aparecerem em tempo real em
// qualquer aba/perfil aberto — sem precisar de um backend real.

interface StoreComPersistRehydrate {
  readonly persist: {
    readonly rehydrate: () => void;
  };
}

export function ativarSincronizacaoEntreAbas(stores: readonly StoreComPersistRehydrate[]) {
  window.addEventListener('storage', (evento) => {
    // evento.key é a chave do localStorage que mudou; como não sabemos ao
    // certo qual store usa qual chave sem importar cada uma, simplesmente
    // reidratamos todas as stores compartilhadas a cada mudança — é uma
    // operação barata (só lê do localStorage e atualiza o estado em memória).
    if (evento.storageArea !== localStorage) return;
    stores.forEach((store) => store.persist.rehydrate());
  });
}
