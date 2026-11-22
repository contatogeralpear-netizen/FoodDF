import type { Metadata } from 'next';
import { ChefHat, ShieldCheck, Lock, FileText } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Política de Privacidade e Proteção de Dados (LGPD)';
const description = 'Saiba como o FOODDF coleta, utiliza e protege seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['política de privacidade', 'LGPD FOODDF', 'proteção de dados delivery', 'privacidade dados pessoais', 'FOODDF'],
  alternates: { canonical: '/privacidade' },
  robots: indexableRobots,
  openGraph: ogDefaults('/privacidade', title, description),
  twitter: twitterDefaults,
};

export default function PrivacidadePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Privacidade' },
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
          <a href="/" className="institutional-brand"><ChefHat size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: '#ff5900' }} />FOOD<span>DF</span></a>
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
          <span>Privacidade</span>
        </nav>

        <p className="institutional-kicker">CONFORMIDADE LEGAL E SEGURANÇA</p>
        <h1 className="institutional-title">Política de Privacidade (LGPD)</h1>
        <p className="institutional-lead">
          Esta Política de Privacidade descreve de maneira transparente como o FOODDF coleta, armazena, trata e protege os dados pessoais de usuários e estabelecimentos cadastrados, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 — LGPD).
        </p>

        <div className="institutional-content">
          <div className="institutional-highlight-box">
            <strong>Resumo Essencial:</strong> O FOODDF coleta apenas os dados estritamente necessários para permitir que você monte sua sacola e envie seu pedido ao restaurante. Não vendemos seus dados para terceiros e não monitoramos conversas privadas no WhatsApp.
          </div>

          <h2>1. Quem é o Controlador dos Dados</h2>
          <p>
            O controlador dos dados pessoais tratados nesta plataforma é:<br />
            <strong>Capital Informática (operadora do FOODDF)</strong> (<a href="https://www.instagram.com/capital_informatica" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5900' }}>Instagram: @capital_informatica</a>)<br />
            CNPJ: [PREENCHER: Número do CNPJ]<br />
            Endereço: [PREENCHER: Endereço completo da sede]<br />
            Encarregado pelo Tratamento de Dados Pessoais (DPO): [PREENCHER: Nome do DPO / e-mail: dpo@fooddf.com.br]
          </p>

          <h2>2. Quais Dados Pessoais Coletamos</h2>
          <p>
            Dependendo da forma como você interage com o FOODDF, podemos coletar:
          </p>
          <ul>
            <li><strong>Para Clientes que realizam pedidos:</strong>
              <ul>
                <li>Nome completo (para identificação na comanda);</li>
                <li>Número de telefone celular / WhatsApp (para contato do restaurante e envio do resumo do pedido);</li>
                <li>Endereço completo de entrega (rua, número, complemento e bairro), quando selecionada a modalidade de entrega;</li>
                <li>Observações alimentares ou de preparo informadas voluntariamente.</li>
              </ul>
            </li>
            <li><strong>Para Restaurantes e Comerciantes:</strong>
              <ul>
                <li>Nome do proprietário ou responsável legal, e-mail de acesso e senha criptografada;</li>
                <li>Nome fantasia, razão social, CNPJ, endereço físico do estabelecimento e telefone de contato;</li>
                <li>Dados bancários para recebimento via Pix (chave Pix, nome do titular e cidade).</li>
              </ul>
            </li>
            <li><strong>Dados de Navegação Técnica:</strong>
              <ul>
                <li>Endereço IP, tipo de navegador, identificadores de dispositivo e dados de desempenho (necessários para segurança, combate a fraudes e garantia de disponibilidade do serviço).</li>
              </ul>
            </li>
          </ul>

          <h2>3. Finalidades e Bases Legais do Tratamento</h2>
          <p>
            Tratamos seus dados pessoais amparados nas seguintes bases legais da LGPD (Art. 7º):
          </p>
          <ul>
            <li><strong>Execução de Contrato e Procedimentos Preliminares (Art. 7º, V):</strong> Viabilizar a criação do pedido, cálculo de valores e encaminhamento da comanda ao restaurante escolhido.</li>
            <li><strong>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):</strong> Manutenção de registros de acesso a aplicações de internet em conformidade com o Marco Civil da Internet (Lei nº 12.965/2014).</li>
            <li><strong>Legítimo Interesse do Controlador (Art. 7º, IX):</strong> Prevenção a fraudes, garantia da segurança da plataforma e melhorias contínuas na usabilidade dos cardápios.</li>
          </ul>

          <h2>4. Como Funciona o Encaminhamento para o WhatsApp</h2>
          <p>
            Ao clicar em <em>Enviar pedido pelo WhatsApp</em>, o FOODDF estrutura uma mensagem com os dados que você preencheu e abre o aplicativo oficial do WhatsApp no seu aparelho. A partir desse momento, a comunicação ocorre diretamente entre o seu dispositivo e o número de telefone do restaurante, protegida pela criptografia de ponta a ponta do próprio WhatsApp. O FOODDF não tem acesso, não grava e não intercepta as mensagens trocadas nessa conversa.
          </p>

          <h2>5. Compartilhamento de Dados com Terceiros</h2>
          <p>
            O FOODDF <strong>não comercializa</strong> nem compartilha dados pessoais com corretores de dados. O compartilhamento ocorre exclusivamente com:
          </p>
          <ul>
            <li><strong>O restaurante selecionado:</strong> Recebe os dados necessários para produzir e entregar sua refeição.</li>
            <li><strong>Provedores de infraestrutura e hospedagem:</strong> Plataforma de hospedagem Vercel Inc. e banco de dados Supabase Inc., que adotam rígidos padrões internacionais de segurança da informação (ISO 27001, SOC 2).</li>
            <li><strong>Autoridades públicas:</strong> Quando houver ordem judicial fundamentada ou exigência legal.</li>
          </ul>

          <h2>6. Cookies e Tecnologias de Medição</h2>
          <p>
            Utilizamos cookies estritamente necessários para manter os itens na sua sacola enquanto você navega e para gerenciar sessões do painel administrativo. Não utilizamos cookies invasivos para rastreamento sem o seu consentimento. Consulte nossa <a href="/cookies">Política de Cookies</a> para detalhes e controle de preferências.
          </p>

          <h2>7. Publicidade e Google AdSense</h2>
          <p>
            A plataforma pode vir a exibir publicidade digital não invasiva de parceiros certificados, como o Google AdSense. Nenhuma publicidade direcionada é veiculada sem conformidade com as diretrizes do Google e com as leis de privacidade aplicáveis. Quando anúncios personalizados forem disponibilizados, o usuário poderá gerenciar seu consentimento a qualquer momento.
          </p>

          <h2>8. Direitos do Titular de Dados Pessoais</h2>
          <p>
            Você, na condição de titular de dados pessoais, tem o direito de solicitar a qualquer momento, de forma facilitada e gratuita (Art. 18 da LGPD):
          </p>
          <ul>
            <li>Confirmação da existência de tratamento de dados;</li>
            <li>Acesso aos seus dados cadastrais;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
            <li>Revogação do consentimento concedido anteriormente.</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, basta enviar uma mensagem para o nosso Encarregado de Proteção de Dados pelo e-mail <strong>[PREENCHER: dpo@fooddf.com.br ou canal de privacidade oficial]</strong>.
          </p>

          <h2>9. Atualizações desta Política</h2>
          <p>
            Esta política poderá ser atualizada periodicamente para refletir melhorias em nossos serviços ou adequações regulatórias. A data da última modificação constará sempre no topo desta página.
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
