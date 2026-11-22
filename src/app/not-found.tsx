export default function NotFound() {
  return (
    <main className="not-found-page">
      <a href="/" className="not-found-logo">FOODDF</a>
      <div>
        <p>OPS! NÃO ENCONTRAMOS ESSA PÁGINA (404)</p>
        <h1>Esse caminho não está no cardápio.</h1>
        <p>A página que você procura pode ter mudado de endereço ou não existe mais. Navegue pelos nossos cardápios ou conheça mais sobre a plataforma:</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '22px' }}>
          <a className="button primary" href="/">Ir para o início</a>
          <a className="button outline" href="/cidades">Ver cidades e estados</a>
          <a className="button outline" href="/para-restaurantes">Para restaurantes</a>
          <a className="button outline" href="/como-funciona">Como funciona</a>
        </div>
      </div>
    </main>
  );
}
