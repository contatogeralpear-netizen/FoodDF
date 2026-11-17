import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ChefHat, MapPin, MessageCircle, Search, ShoppingBag } from 'lucide-react';
import './how-it-works.css';

export const metadata: Metadata = {
  title: 'Como funciona o FOODDF | Cardápios e pedidos',
  description: 'Entenda como encontrar restaurantes por região, consultar cardápios e encaminhar seu pedido pelo WhatsApp.',
  alternates: { canonical: '/como-funciona' },
};

export default function HowItWorks() {
  return <div className="how-page">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="how-header"><a className="how-brand" href="/" aria-label="FOODDF, início"><ChefHat size={28}/>FOODDF</a><nav aria-label="Navegação"><a href="/">Encontrar restaurantes</a><a href="/para-restaurantes">Para restaurantes</a></nav></header>
    <main id="conteudo" className="how-main">
      <a className="how-back" href="/"><ArrowLeft size={16}/> Voltar ao início</a>
      <div className="how-intro"><p className="how-kicker">COMO FUNCIONA</p><h1>Da sua cidade para a sua mesa.</h1><p>O FOODDF reúne cardápios de estabelecimentos por localização. Você escolhe o que deseja e conversa diretamente com o restaurante para confirmar seu pedido.</p></div>
      <section aria-labelledby="passos"><h2 id="passos">Como fazer um pedido</h2><div className="how-grid">
        <article><span><MapPin size={22}/></span><h3>1. Escolha sua região</h3><p>Selecione o estado e a cidade para conhecer os restaurantes disponíveis no FOODDF.</p></article>
        <article><span><Search size={22}/></span><h3>2. Explore os cardápios</h3><p>Abra o restaurante desejado e confira os produtos, preços e informações de entrega ou retirada.</p></article>
        <article><span><ShoppingBag size={22}/></span><h3>3. Monte sua sacola</h3><p>Escolha os itens e informe os dados necessários para entrega ou retirada e a forma de pagamento disponível.</p></article>
        <article><span><MessageCircle size={22}/></span><h3>4. Confira no WhatsApp</h3><p>Revise o resumo e confirme o envio na conversa. O restaurante confirma disponibilidade, prazo, pedido e pagamento.</p></article>
      </div></section>
      <section className="how-faq" aria-labelledby="duvidas"><p className="how-kicker">DÚVIDAS FREQUENTES</p><h2 id="duvidas">Informações importantes</h2>
        <div><h3>O FOODDF confirma o pagamento automaticamente?</h3><p>Não. Quando o restaurante oferece Pix, confirme os dados do recebedor antes de pagar. A conferência do pagamento é feita pelo estabelecimento.</p></div>
        <div><h3>Como acompanho um pedido?</h3><p>Quando um pedido for registrado com número de acompanhamento, use a opção “Acompanhar” na página inicial e informe o número e o WhatsApp utilizado na compra. A disponibilidade depende da configuração do serviço e do restaurante.</p></div>
        <div><h3>O Brasa Burger é um restaurante real?</h3><p>Não. O Brasa Burger é uma demonstração fictícia: preços, prazos e pedidos são exemplos. Não faça pagamentos para testar o modelo.</p></div>
        <div><h3>Como cadastrar meu estabelecimento?</h3><p>Conheça a página <a href="/para-restaurantes">FOODDF para restaurantes</a> e use a opção de criar conta para iniciar o cadastro.</p></div>
      </section>
      <div className="how-actions"><a className="button primary" href="/">Encontrar restaurantes <ArrowRight size={18}/></a><a className="button outline" href="/para-restaurantes">Conhecer o FOODDF para restaurantes</a></div>
    </main>
    <footer className="how-footer"><a className="how-brand" href="/">FOODDF</a><span>Sabores que aproximam. Pedidos que simplificam.</span><a href="/para-restaurantes">Para restaurantes</a></footer>
  </div>;
}
