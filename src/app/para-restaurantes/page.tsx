import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ChefHat, MessageCircle, Store, UtensilsCrossed } from 'lucide-react';
import './restaurant-landing.css';

export const metadata: Metadata = {
  title: 'Cardápio digital para restaurantes | FOODDF',
  description: 'Conheça o FOODDF, cadastre seu estabelecimento e organize seu cardápio para clientes da sua região.',
  alternates: { canonical: '/para-restaurantes' },
};

export default function RestaurantsLanding() {
  return <div className="business-page">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="business-header">
      <a className="business-brand" href="/" aria-label="FOODDF, início"><ChefHat size={28}/>FOODDF</a>
      <nav aria-label="Navegação"><a href="/">Encontrar restaurantes</a><a className="business-header-cta" href="/paineladministativo?cadastro=1">Cadastrar restaurante <ArrowRight size={16}/></a></nav>
    </header>
    <main id="conteudo" className="business-main">
      <section className="business-hero">
        <div>
          <p className="business-eyebrow">FOODDF PARA RESTAURANTES</p>
          <h1>Seu cardápio mais perto de quem tem fome.</h1>
          <p>Cadastre seu estabelecimento, organize seus produtos e apresente seu cardápio para clientes da sua região.</p>
          <a className="button primary" href="/paineladministativo?cadastro=1">Criar conta para meu restaurante <ArrowRight size={19}/></a>
          <a className="business-login" href="/paineladministativo">Já tenho uma conta</a>
        </div>
        <aside className="business-hero-card"><span><Store size={29}/></span><h2>Seu restaurante, do seu jeito.</h2><p>Uma página para apresentar seu cardápio, com informações de entrega, retirada e contato.</p><div><CheckCircle2 size={19}/> Seu estabelecimento no FOODDF</div><div><CheckCircle2 size={19}/> Produtos e categorias</div><div><CheckCircle2 size={19}/> Pedidos pelo WhatsApp</div></aside>
      </section>
      <section className="business-benefits" aria-labelledby="como-funciona">
        <p className="business-eyebrow">COMO FUNCIONA</p><h2 id="como-funciona">Comece com o que importa.</h2>
        <div className="business-benefit-grid">
          <article><span><Store size={23}/></span><h3>Cadastre sua loja</h3><p>Informe os dados do estabelecimento e escolha onde ele será encontrado.</p></article>
          <article><span><UtensilsCrossed size={23}/></span><h3>Organize seu cardápio</h3><p>Adicione produtos, fotos, categorias e preços no painel do restaurante.</p></article>
          <article><span><MessageCircle size={23}/></span><h3>Converse com o cliente</h3><p>O cliente revisa o pedido e o encaminha ao WhatsApp configurado pela loja.</p></article>
        </div>
      </section>
      <section className="business-information"><h2>Você acompanha o seu estabelecimento</h2><p>Cada restaurante possui acesso ao próprio painel. O estabelecimento é responsável por confirmar a disponibilidade, o pedido e o pagamento com o cliente.</p><p>Os recursos disponíveis e as condições do plano dependem da configuração da loja.</p><a className="button primary" href="/paineladministativo?cadastro=1">Começar cadastro <ArrowRight size={18}/></a></section>
    </main>
    <footer className="business-footer"><a className="business-brand" href="/">FOODDF</a><span>Sabores que aproximam. Pedidos que simplificam.</span><a href="/">Voltar ao FOODDF</a></footer>
  </div>;
}
