import type { Metadata } from 'next';
import { ChefHat, ArrowRight, Store, CheckCircle2 } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Como montar um cardápio digital grátis para delivery — Passo a Passo';
const description = 'Aprenda a estruturar um cardápio digital profissional, organizar categorias, definir adicionais lucrativos e receber pedidos pelo WhatsApp sem pagar comissão.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['como montar cardápio digital', 'cardápio digital grátis', 'cardápio online para restaurante', 'pedidos whatsapp delivery', 'FOODDF'],
  alternates: { canonical: '/guias/como-montar-cardapio-digital-gratis' },
  robots: indexableRobots,
  openGraph: ogDefaults('/guias/como-montar-cardapio-digital-gratis', title, description),
  twitter: twitterDefaults,
};

export default function GuiaCardapioDigitalPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O cadastro no FOODDF é gratuito para restaurantes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! O cadastro e a utilização do cardápio digital no FOODDF são 100% gratuitos até 31 de dezembro de 2026. Condições comerciais após essa data serão anunciadas com ampla antecedência.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quantos produtos posso cadastrar no cardápio digital?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você pode cadastrar quantas categorias e produtos desejar, incluindo fotos, descrições detalhadas e opções de adicionais com valores extras.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como o cliente faz o pedido no cardápio digital?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O cliente acessa o link do seu restaurante pelo celular ou computador, adiciona os pratos na sacola, escolhe a forma de entrega e pagamento, e clica em Enviar Pedido pelo WhatsApp. A mensagem chega formatada e pronta na sua conversa.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Guias', item: `${siteOrigin}/guias` },
      { '@type': 'ListItem', position: 3, name: 'Como montar um cardápio digital grátis' },
    ],
  };

  return (
    <div className="institutional-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, breadcrumbSchema]).replace(/</g, '\\u003c') }}
      />
      <header className="institutional-header">
        <div className="institutional-header-inner">
          <a href="/" className="institutional-brand"><ChefHat size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: '#ff5900' }} />FOOD<span>DF</span></a>
          <nav className="institutional-nav">
            <a href="/para-restaurantes">Para Restaurantes</a>
            <a href="/painel">Entrar no Painel</a>
            <a href="/painel?cadastro=1" className="institutional-cta">Cadastrar Grátis</a>
          </nav>
        </div>
      </header>

      <main className="institutional-main">
        <nav className="institutional-breadcrumbs" aria-label="Navegação estrutural">
          <a href="/">Início</a>
          <span>›</span>
          <a href="/para-restaurantes">Para Restaurantes</a>
          <span>›</span>
          <span>Como Montar Cardápio Digital</span>
        </nav>

        <p className="institutional-kicker">GESTÃO GASTRONÔMICA E VENDAS</p>
        <h1 className="institutional-title">Como montar um cardápio digital grátis para delivery em 2026</h1>
        <p className="institutional-lead">
          Ter um cardápio digital próprio e intuitivo é o divisor de águas entre restaurantes que dependem exclusivamente de plataformas que cobram comissões predatórias e aqueles que constroem uma base sólida de clientes fiéis e lucrativos.
        </p>

        <div className="institutional-content">
          <h2>1. Por que ter um cardápio digital próprio?</h2>
          <p>
            Muitos restaurantes começam enviando arquivos PDF pesados ou imagens estáticas no WhatsApp. Essa abordagem gera atrito: o cliente precisa baixar arquivos no celular, não consegue somar valores automaticamente, não sabe se há opções de personalização e frequentemente desiste da compra.
          </p>
          <p>
            Um cardápio digital moderno baseado em web, como o oferecido gratuitamente pelo <strong>FOODDF</strong>, resolve esse problema: carrega instantaneamente no navegador do cliente sem exigir download de aplicativos pesados, é adaptado para qualquer tamanho de tela e formata o pedido com precisão para o WhatsApp da sua loja.
          </p>

          <h2>2. Estruturação inteligente de categorias para aumentar o ticket médio</h2>
          <p>
            A forma como os pratos são organizados influencia diretamente o comportamento do consumidor. Recomendamos a seguinte ordem de categorias:
          </p>
          <ul>
            <li><strong>Combos e Promoções do Dia no topo:</strong> Clientes com fome tendem a escolher a primeira opção de bom custo-benefício que encontram. Combos de prato principal acompanhado de bebida ou sobremesa elevam o ticket médio da loja.</li>
            <li><strong>Pratos Principais e Mais Vendidos:</strong> Destaque os carros-chefe da cozinha, descrevendo os ingredientes principais e o tamanho da porção (ex.: serve 1 ou 2 pessoas).</li>
            <li><strong>Acompanhamentos e Porções:</strong> Batatas, saladas, molhos especiais ou entradas.</li>
            <li><strong>Bebidas e Sobremesas:</strong> Colocadas estrategicamente para que o cliente adicione itens rápidos antes de finalizar a compra.</li>
          </ul>

          <h2>3. O poder dos adicionais (extras) personalizáveis</h2>
          <p>
            Permitir que o cliente personalize o prato é uma das ferramentas mais eficazes para gerar receita extra:
          </p>
          <div className="institutional-card-box">
            <h3>Exemplos de adicionais lucrativos:</h3>
            <ul>
              <li><strong>Para Hamburguerias:</strong> Bacon crocante extra, queijo cheddar duplo, hambúrguer adicional de 180g, maionese artesanal da casa.</li>
              <li><strong>Para Pizzarias:</strong> Borda recheada de catupiry ou cheddar, massa integral, queijo extra, orégano fresco.</li>
              <li><strong>Para Marmitas e Refeições:</strong> Ovo frito, farofa especial, porção extra de proteína, vinagrete fresco.</li>
            </ul>
          </div>

          <h2>4. Fotografias reais e descrições que abrem o apetite</h2>
          <p>
            No delivery, o cliente come primeiro com os olhos. Não é necessário contratar fotógrafos caros: fotos tiradas com o smartphone sob boa iluminação natural (próximo a uma janela durante o dia) com foco nítido no prato já superam imagens genéricas de banco de imagens. Evite textos grandes colados sobre a foto; deixe o texto descritivo no campo apropriado do cardápio.
          </p>

          <h2>5. Como aproveitar o cadastro grátis do FOODDF até 31/12/2026</h2>
          <p>
            O FOODDF nasceu com o compromisso de apoiar restaurantes locais sem cobrança de comissões por venda. Até 31 de dezembro de 2026, você cadastra seu estabelecimento, configura logotipo, foto de capa, horários de funcionamento, áreas de entrega, chave Pix e cardápio completo com custo zero de adesão ou mensalidade.
          </p>

          <div className="institutional-faq-block">
            <h2>Perguntas frequentes sobre o cardápio digital FOODDF</h2>
            <div className="institutional-faq-item">
              <h3>O cadastro no FOODDF é gratuito para restaurantes?</h3>
              <p>Sim! O cadastro e a utilização do cardápio digital no FOODDF são 100% gratuitos até 31 de dezembro de 2026. Condições comerciais após essa data serão anunciadas com ampla antecedência.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>Quantos produtos posso cadastrar no cardápio digital?</h3>
              <p>Você pode cadastrar quantas categorias e produtos desejar, incluindo fotos, descrições detalhadas e opções de adicionais com valores extras.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>Como o cliente faz o pedido no cardápio digital?</h3>
              <p>O cliente acessa o link do seu restaurante pelo celular ou computador, adiciona os pratos na sacola, escolhe a forma de entrega e pagamento, e clica em Enviar Pedido pelo WhatsApp. A mensagem chega formatada e pronta na sua conversa.</p>
            </div>
          </div>

          <div className="institutional-cta-banner">
            <h2>Comece a vender com cardápio digital hoje mesmo</h2>
            <p>Leve menos de 5 minutos para criar sua conta, cadastrar seus primeiros produtos e compartilhar o link do seu restaurante.</p>
            <a href="/painel?cadastro=1" className="button primary" style={{ background: '#ff5900', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
              Criar Cardápio Grátis para Meu Restaurante <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
