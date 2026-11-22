import type { Metadata } from 'next';
import { ChefHat, Cookie, ShieldCheck, Check } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Política de Cookies e Gestão de Preferências';
const description = 'Entenda como o FOODDF utiliza cookies e tecnologias semelhantes para garantir o funcionamento do cardápio digital e da sacola de pedidos.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['cookies FOODDF', 'política de cookies', 'gestão de privacidade', 'consentimento cookies', 'FOODDF'],
  alternates: { canonical: '/cookies' },
  robots: indexableRobots,
  openGraph: ogDefaults('/cookies', title, description),
  twitter: twitterDefaults,
};

export default function CookiesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Cookies' },
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
          <a href="/" className="institutional-brand"><img src="/images/fooddf-logo.png" alt="FOODDF" style={{ height: "36px", width: "auto", display: "inline-block", verticalAlign: "middle" }} /></a>
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
          <span>Cookies</span>
        </nav>

        <p className="institutional-kicker">TRANSPARÊNCIA E NAVEGAÇÃO</p>
        <h1 className="institutional-title">Política de Cookies</h1>
        <p className="institutional-lead">
          Transparência sobre quais dados são gravados no seu dispositivo enquanto você navega pelos cardápios do FOODDF e como você pode gerenciar suas preferências a qualquer momento.
        </p>

        <div className="institutional-content">
          <h2>1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo quando você acessa uma página na internet. Eles permitem que o site reconheça seu aparelho, lembre suas preferências (como a cidade selecionada ou os itens adicionados na sua sacola) e assegure o correto funcionamento técnico da aplicação.
          </p>

          <h2>2. Categorias de Cookies Utilizados no FOODDF</h2>
          <div className="institutional-card-box">
            <h3>A. Cookies Estritamente Necessários (Sempre Ativos)</h3>
            <p>
              Estes cookies e itens de armazenamento local (localStorage) são essenciais para o funcionamento básico da plataforma. Sem eles, o site não opera corretamente.
            </p>
            <ul>
              <li><strong>Sacola de Pedidos:</strong> Mantém os produtos, quantidades e adicionais selecionados enquanto você navega entre categorias.</li>
              <li><strong>Sessão Administrativa:</strong> Mantém a segurança do login de proprietários de restaurantes no painel administrativo.</li>
              <li><strong>Preferência de Consentimento:</strong> Lembra se você já respondeu ao aviso de cookies para não exibir o banner repetidamente.</li>
            </ul>
          </div>

          <div className="institutional-card-box">
            <h3>B. Cookies de Medição e Desempenho (Analíticos)</h3>
            <p>
              Coletam informações estatísticas anônimas sobre quais páginas são mais acessadas, tempos de carregamento e taxas de erro técnico, permitindo aprimorar a velocidade e a estabilidade da plataforma.
            </p>
          </div>

          <div className="institutional-card-box">
            <h3>C. Cookies de Publicidade e Parceiros (Desativados por padrão)</h3>
            <p>
              No momento, a infraestrutura de anúncios encontra-se <strong>desligada por padrão</strong>. Caso a plataforma venha a veicular anúncios patrocinados através do Google AdSense, esses parceiros poderão utilizar cookies para medição de impressões e prevenção de tráfego inválido, sempre respeitando as opções de consentimento do usuário.
            </p>
          </div>

          <h2>3. Como Gerenciar ou Desativar Cookies no seu Navegador</h2>
          <p>
            Você pode configurar seu navegador para recusar todos os cookies ou alertar quando um cookie estiver sendo enviado. Caso opte por desativar cookies estritamente necessários, funções como adicionar pratos à sacola podem não funcionar adequadamente.
          </p>
          <ul>
            <li><strong>Google Chrome:</strong> Configurações › Privacidade e segurança › Cookies de terceiros.</li>
            <li><strong>Mozilla Firefox:</strong> Opções › Privacidade e Segurança › Cookies e dados de sites.</li>
            <li><strong>Apple Safari:</strong> Preferências › Privacidade › Bloquear todos os cookies.</li>
            <li><strong>Microsoft Edge:</strong> Configurações › Cookies e permissões de site.</li>
          </ul>

          <h2>4. Dúvidas</h2>
          <p>
            Se você tiver qualquer dúvida sobre nossa política de cookies ou sobre como tratamos seus dados pessoais, entre em contato através de nossa página de <a href="/contato">Contato</a> ou consulte nossa <a href="/privacidade">Política de Privacidade</a>.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
