import type { Metadata } from 'next';
import Image from 'next/image';
import { FileText, CheckCircle2 } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Termos de Uso e Condições Gerais';
const description = 'Leia os Termos de Uso do FOODDF. Conheça as condições de utilização da plataforma de cardápios digitais para clientes e restaurantes.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['termos de uso', 'condições gerais FOODDF', 'regras delivery', 'FOODDF'],
  alternates: { canonical: '/termos' },
  robots: indexableRobots,
  openGraph: ogDefaults('/termos', title, description),
  twitter: twitterDefaults,
};

export default function TermosPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Termos de Uso' },
    ],
  };

  return (
    <div className="institutional-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
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
          <span>Termos de Uso</span>
        </nav>

        <p className="institutional-kicker">CONTRATO E REGRAS DE USO</p>
        <h1 className="institutional-title">Termos de Uso da Plataforma</h1>
        <p className="institutional-lead">
          Bem-vindo ao FOODDF. Ao acessar ou utilizar nossa plataforma web, você concorda com as disposições e diretrizes estipuladas nestes Termos de Uso.
        </p>

        <div className="institutional-content">
          <h2>1. Objeto e Natureza do Serviço</h2>
          <p>
            O <strong>FOODDF</strong> é uma plataforma de software na modalidade SaaS e catálogo online de estabelecimentos gastronômicos. A plataforma disponibiliza tecnologia para que restaurantes publiquem seus cardápios com fotos, descrições, preços e horários, permitindo que consumidores montem suas sacolas e enviem o pedido estruturado diretamente para o WhatsApp do restaurante.
          </p>

          <h2>2. Independência dos Restaurantes e Isenção de Responsabilidade</h2>
          <p>
            O FOODDF <strong>não é</strong> um restaurante, não produz alimentos, não realiza entregas físicas e não atua como instituição de pagamento ou fiador das transações comerciais. Portanto:
          </p>
          <ul>
            <li><strong>Qualidade e Higiene:</strong> O preparo, acondicionamento, prazo de validade, rotulagem e conformidade com normas da Vigilância Sanitária (Anvisa) são de responsabilidade única e exclusiva de cada restaurante cadastrado.</li>
            <li><strong>Preços e Disponibilidade:</strong> Os valores dos produtos e taxas de entrega exibidos são definidos diretamente pelos proprietários dos estabelecimentos.</li>
            <li><strong>Entrega e Logística:</strong> O prazo, a rota e o transporte das refeições são executados pelo restaurante ou por entregadores contratados por ele.</li>
            <li><strong>Pagamentos:</strong> A quitação de pedidos (seja por Pix, dinheiro ou máquina de cartão) é realizada diretamente ao estabelecimento comercial. O FOODDF não recebe, custodia ou processa os pagamentos.</li>
          </ul>

          <h2>3. Cadastro e Período Promocional Gratuito</h2>
          <p>
            O cadastro de estabelecimentos e a utilização dos recursos padrão de cardápio digital do FOODDF são <strong>gratuitos até 31 de dezembro de 2026</strong>.
          </p>
          <p>
            As condições comerciais para períodos posteriores a 31/12/2026 serão anunciadas publicamente pela administração da plataforma com antecedência razoável, assegurando total previsibilidade aos comerciantes parceiros, sem cobranças automáticas não autorizadas.
          </p>

          <h2>4. Obrigações dos Usuários (Clientes)</h2>
          <p>
            Ao utilizar o FOODDF para realizar pedidos, o usuário compromete-se a:
          </p>
          <ul>
            <li>Fornecer dados verídicos e atualizados de nome, contato e endereço de entrega;</li>
            <li>Agir com boa-fé, honrando os pedidos encaminhados e confirmados com os restaurantes;</li>
            <li>Não praticar atos de fraude, trotes ou envio de comprovantes falsos de pagamento.</li>
          </ul>

          <h2>5. Propriedade Intelectual</h2>
          <p>
            A marca FOODDF, o logotipo, o código-fonte, o design visual e a arquitetura de software pertencem exclusivamente ao operador da plataforma. É vedada a cópia, engenharia reversa ou reprodução sem autorização prévia por escrito.
          </p>

          <h2>6. Foro e Legislação Aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial o Código de Defesa do Consumidor (Lei nº 8.078/1990) e o Marco Civil da Internet (Lei nº 12.965/2014). Fica eleito o foro da comarca da sede da operadora para dirimir eventuais controvérsias decorrentes deste contrato.
          </p>
          <p style={{ fontSize: '13px', color: '#8c7384', marginTop: '16px' }}>
            Última atualização: 22 de novembro de 2026.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
