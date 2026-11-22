import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ChefHat, MessageCircle, Store, UtensilsCrossed } from 'lucide-react';
import { isFreePromotionActive } from '@/lib/promotion';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import './restaurant-landing.css';
import './restaurant-offer.css';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const free = isFreePromotionActive();
  const title = free ? 'Cardápio digital grátis para restaurantes' : 'Cardápio digital para restaurantes';
  const description = free
    ? 'Cadastre seu restaurante e use o cardápio digital FOODDF gratuitamente até 31 de dezembro de 2026. Apresente seus produtos e receba pedidos pelo WhatsApp.'
    : 'Conheça o FOODDF, cadastre seu estabelecimento e organize seu cardápio para clientes da sua região.';
  return {
    title,
    description,
    keywords: ['cardápio digital grátis', 'cadastrar restaurante', 'pedidos pelo WhatsApp', 'FOODDF para restaurantes'],
    alternates: { canonical: '/para-restaurantes' },
    robots: indexableRobots,
    openGraph: ogDefaults('/para-restaurantes', title, description),
    twitter: twitterDefaults,
  };
}

export default function RestaurantsLanding() {
  const free = isFreePromotionActive();
  const faqItems = [
    ...(free ? [{ '@type': 'Question' as const, name: 'O FOODDF é gratuito para restaurantes?', acceptedAnswer: { '@type': 'Answer' as const, text: 'O cadastro e o uso são gratuitos até 31 de dezembro de 2026. As condições após essa data serão informadas quando definidas.' } }] : []),
    { '@type': 'Question' as const, name: 'Que tipos de estabelecimento podem se cadastrar?', acceptedAnswer: { '@type': 'Answer' as const, text: 'Restaurantes, lanchonetes, pizzarias, cafeterias, hamburguerias e outros estabelecimentos de alimentação podem iniciar o cadastro.' } },
    { '@type': 'Question' as const, name: 'Como recebo os pedidos?', acceptedAnswer: { '@type': 'Answer' as const, text: 'O cliente monta e revisa o pedido, depois escolhe enviá-lo pelo WhatsApp informado pela sua loja. A confirmação é feita pelo estabelecimento.' } },
    { '@type': 'Question' as const, name: 'Como os clientes encontram meu restaurante?', acceptedAnswer: { '@type': 'Answer' as const, text: 'Depois que o estabelecimento estiver publicado, os clientes podem encontrá-lo pela seleção de estado e cidade do FOODDF e acessar seu cardápio.' } },
  ];
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Para restaurantes' },
    ],
  };
  return <div className="business-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, breadcrumbSchema]).replace(/</g, '\\u003c') }} />
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="business-header">
      <a className="business-brand" href="/" aria-label="FOODDF, início"><ChefHat size={28}/>FOODDF</a>
      <nav aria-label="Navegação"><a href="/">Encontrar restaurantes</a><a className="business-header-cta" href="/painel?cadastro=1">Cadastrar restaurante <ArrowRight size={16}/></a></nav>
    </header>
    <main id="conteudo" className="business-main">
      <section className="business-hero">
        <div>
          <p className="business-eyebrow">FOODDF PARA RESTAURANTES</p>
          {free && <div className="business-offer-badge"><CheckCircle2 size={16}/> Cadastro e uso grátis até 31/12/2026</div>}
          <h1>Seu cardápio mais perto de quem tem fome.</h1>
          <p>Cadastre seu estabelecimento, organize seus produtos e apresente seu cardápio para clientes da sua região. O cliente escolhe os itens e encaminha o pedido para o WhatsApp da sua loja.</p>
          <a className="button primary" href="/painel?cadastro=1">{free?'Cadastrar meu restaurante grátis':'Criar conta para meu restaurante'} <ArrowRight size={19}/></a>
          <a className="business-login" href="/painel">Já tenho uma conta</a>
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
      <section className="business-information"><h2>Você acompanha o seu estabelecimento</h2><p>Cada restaurante possui acesso ao próprio painel. O estabelecimento é responsável por confirmar a disponibilidade, o pedido e o pagamento com o cliente.</p>{free?<p><strong>Cadastro e uso gratuitos até 31 de dezembro de 2026.</strong> As condições após essa data serão informadas quando definidas.</p>:<p>Consulte as condições e os recursos disponíveis para seu estabelecimento.</p>}<a className="button primary" href="/painel?cadastro=1">{free?'Começar meu cadastro grátis':'Começar cadastro'} <ArrowRight size={18}/></a></section>
      <section className="business-faq" aria-labelledby="perguntas-frequentes"><p className="business-eyebrow">TIRE SUAS DÚVIDAS</p><h2 id="perguntas-frequentes">Perguntas frequentes</h2><div className="business-faq-grid">
        {free&&<article><h3>O FOODDF é gratuito para restaurantes?</h3><p>O cadastro e o uso são gratuitos até 31 de dezembro de 2026. As condições após essa data serão informadas quando definidas.</p></article>}
        <article><h3>Que tipos de estabelecimento podem se cadastrar?</h3><p>Restaurantes, lanchonetes, pizzarias, cafeterias, hamburguerias e outros estabelecimentos de alimentação podem iniciar o cadastro.</p></article>
        <article><h3>Como recebo os pedidos?</h3><p>O cliente monta e revisa o pedido, depois escolhe enviá-lo pelo WhatsApp informado pela sua loja. A confirmação é feita pelo estabelecimento.</p></article>
        <article><h3>Como os clientes encontram meu restaurante?</h3><p>Depois que o estabelecimento estiver publicado, os clientes podem encontrá-lo pela seleção de estado e cidade do FOODDF e acessar seu cardápio.</p></article>
      </div></section>
    </main>
    <footer className="business-footer"><a className="business-brand" href="/">FOODDF</a><span>Sabores que aproximam. Pedidos que simplificam.</span><a href="/">Voltar ao FOODDF</a></footer>
  </div>;
}
