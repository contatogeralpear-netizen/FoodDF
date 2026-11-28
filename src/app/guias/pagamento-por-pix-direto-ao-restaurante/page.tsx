import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Como funciona o pagamento por Pix direto ao restaurante — Guia Prático';
const description = 'Descubra como o Pix direto agiliza pedidos de comida, elimina intermediários financeiros e quais cuidados tomar na conferência de dados bancários.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['pix restaurante', 'pagamento pix delivery', 'pix copia e cola comida', 'pix direto', 'FOODDF'],
  alternates: { canonical: '/guias/pagamento-por-pix-direto-ao-restaurante' },
  robots: indexableRobots,
  openGraph: ogDefaults('/guias/pagamento-por-pix-direto-ao-restaurante', title, description),
  twitter: twitterDefaults,
};

export default function GuiaPixRestaurantePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O dinheiro do Pix passa pela conta do FOODDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não. O FOODDF não retém valores nem atua como intermediário financeiro. A chave Pix configurada no cardápio pertence diretamente à conta bancária do restaurante.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona o Pix Copia e Cola no cardápio digital?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ao escolher pagar com Pix, o sistema gera uma chave dinâmica (BR Code) já com o valor exato do pedido. Basta clicar em Copiar Código Pix e colar na opção Pix Copia e Cola do aplicativo do seu banco.',
        },
      },
      {
        '@type': 'Question',
        name: 'Por que preciso anexar o comprovante na conversa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O comprovante permite que a equipe da cozinha identifique rapidamente a entrada do valor em seu extrato bancário e inicie o preparo da refeição sem atrasos.',
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
      { '@type': 'ListItem', position: 3, name: 'Pagamento por Pix direto ao restaurante' },
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
          <a href="/" className="institutional-brand" aria-label="FOODDF, início"><Image src="/images/home/fooddf-logo-hd.webp" alt="FOODDF" width={156} height={42} quality={95} preload className="brand-logo-img" /></a>
          <nav className="institutional-nav">
            <a href="/buscas">Restaurantes</a>
            <a href="/como-funciona">Como Funciona</a>
            <a href="/buscas" className="institutional-cta">Pedir Agora</a>
          </nav>
        </div>
      </header>

      <main className="institutional-main">
        <nav className="institutional-breadcrumbs" aria-label="Navegação estrutural">
          <a href="/">Início</a>
          <span>›</span>
          <a href="/como-funciona">Guias</a>
          <span>›</span>
          <span>Pagamento por Pix Direto</span>
        </nav>

        <p className="institutional-kicker">FINANÇAS E TECNOLOGIA PARA DELIVERY</p>
        <h1 className="institutional-title">Pagamento por Pix direto ao restaurante: Entenda como funciona</h1>
        <p className="institutional-lead">
          O Pix revolucionou as transações comerciais no Brasil pela instantaneidade e ausência de taxas para pessoas físicas. No setor de alimentação, pagar diretamente para o restaurante traz vantagens comprovadas em velocidade, controle e preços mais acessíveis.
        </p>

        <div className="institutional-content">
          <h2>1. A diferença entre pagamento direto e intermediação bancária</h2>
          <p>
            Em aplicativos tradicionais de delivery de refeições, o cliente paga dentro da plataforma e a operadora do aplicativo retém o dinheiro por dias ou semanas antes de repassá-lo ao restaurante, descontando tarifas financeiras e comissões que variam entre 12% e 27%. Esse custo acaba sendo embutido nos preços dos pratos.
          </p>
          <p>
            No modelo do <strong>FOODDF</strong>, a proposta é completamente diferente: o pagamento é <strong>direto e ponta a ponta</strong>. A chave Pix exibida na finalização pertence exclusivamente ao restaurante. O valor cai na mesma hora na conta do comerciante, sem descontos de intermediação.
          </p>

          <h2>2. O padrão BR Code (Pix Copia e Cola) no cardápio digital</h2>
          <p>
            Para evitar que o cliente precise digitar manualmente a chave Pix, o número da agência ou conferir centavos, o FOODDF utiliza a tecnologia de padrão <strong>BR Code</strong> estabelecida pelo Banco Central do Brasil:
          </p>
          <ul>
            <li><strong>Valor exato embutido:</strong> O código gerado inclui automaticamente o subtotal somado à taxa de entrega (ou já considerando Frete Grátis quando o frete for zerado).</li>
            <li><strong>Código de cópia com um clique:</strong> O cliente apenas toca em <em>Copiar código Pix</em> e cola diretamente no app de sua instituição financeira na função <em>Pix Copia e Cola</em>.</li>
            <li><strong>Identificação do pedido:</strong> O identificador do pedido facilita o batimento de caixa pelo restaurante.</li>
          </ul>

          <div className="institutional-card-box">
            <h3>Etapas recomendadas para pagar seu pedido via Pix:</h3>
            <ol>
              <li>Monte seus itens na sacola do restaurante escolhido no FOODDF.</li>
              <li>Na etapa de pagamento, selecione a opção <strong>Pix</strong>.</li>
              <li>Copie a chave Pix ou escaneie o QR Code no seu aplicativo bancário.</li>
              <li>Confira o nome do destinatário antes de confirmar com a senha do banco.</li>
              <li>Envie o comprovante na conversa do WhatsApp para liberação imediata na cozinha.</li>
            </ol>
          </div>

          <h2>3. Cuidados de segurança para quem paga e quem recebe</h2>
          <p>
            A segurança do Pix depende da verificação atenta dos dados bancários. Recomendamos sempre seguir estas boas práticas:
          </p>
          <ul>
            <li><strong>Para clientes:</strong> Antes de autorizar a transferência, confira se o nome exibido na tela do banco condiz com o restaurante ou com a razão social informada. Caso surja alguma dúvida, envie uma mensagem no WhatsApp do estabelecimento para confirmar a titularidade.</li>
            <li><strong>Para restaurantes:</strong> A equipe do restaurante deve sempre conferir a notificação oficial do banco ou o extrato bancário em tempo real antes de despachar o entregador com o pedido, evitando ser vítima de comprovantes adulterados ou falsificados.</li>
          </ul>

          <h2>4. Benefícios econômicos do Pix para o comércio local</h2>
          <p>
            Cada pedido pago diretamente ao comerciante ajuda a fortalecer pequenos negócios da sua comunidade: pizzarias de bairro, hamburguerias artesanais, confeitarias e marmitarias familiares. Sem a sangria de comissões abusivas sobre cada prato vendido, os estabelecimentos locais conseguem manter preços mais competitivos e investir na qualidade dos ingredientes e no atendimento ao cliente.
          </p>

          <div className="institutional-faq-block">
            <h2>Perguntas frequentes sobre Pix no FOODDF</h2>
            <div className="institutional-faq-item">
              <h3>O dinheiro do Pix passa pela conta do FOODDF?</h3>
              <p>Não. O FOODDF não retém valores nem atua como intermediário financeiro. A chave Pix configurada no cardápio pertence diretamente à conta bancária do restaurante.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>Como funciona o Pix Copia e Cola no cardápio digital?</h3>
              <p>Ao escolher pagar com Pix, o sistema gera uma chave dinâmica (BR Code) já com o valor exato do pedido. Basta clicar em Copiar Código Pix e colar na opção Pix Copia e Cola do aplicativo do seu banco.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>Por que preciso anexar o comprovante na conversa?</h3>
              <p>O comprovante permite que a equipe da cozinha identifique rapidamente a entrada do valor em seu extrato bancário e inicie o preparo da refeição sem atrasos.</p>
            </div>
          </div>

          <div className="institutional-cta-banner">
            <h2>Valorize quem produz na sua cidade</h2>
            <p>Conheça os cardápios digitais disponíveis e faça seu pedido direto pelo WhatsApp com Pix rápido e seguro.</p>
            <a href="/buscas" className="button primary" style={{ background: '#ff5900', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
              Ver Restaurantes Disponíveis <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
