import type { Metadata } from 'next';
import { ChefHat, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Como pedir comida pelo WhatsApp com segurança — Guia Prático';
const description = 'Aprenda o passo a passo para fazer pedidos de comida pelo WhatsApp com total segurança, conferir dados de Pix e evitar golpes.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['como pedir comida pelo WhatsApp', 'segurança pedidos WhatsApp', 'pix restaurante', 'delivery seguro', 'FOODDF'],
  alternates: { canonical: '/guias/como-pedir-pelo-whatsapp-com-seguranca' },
  robots: indexableRobots,
  openGraph: ogDefaults('/guias/como-pedir-pelo-whatsapp-com-seguranca', title, description),
  twitter: twitterDefaults,
};

export default function GuiaWhatsappSeguroPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O FOODDF cobra taxa extra do cliente pelo pedido no WhatsApp?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não. O FOODDF não cobra taxas de serviço ou intermediação de quem pede. O valor pago pelos pratos e entrega é exatamente o acordado com o restaurante.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como conferir se o WhatsApp pertence mesmo ao restaurante?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ao acessar o cardápio oficial pelo FOODDF, o botão de pedido direciona para o número de WhatsApp cadastrado e validado pelo próprio estabelecimento.',
        },
      },
      {
        '@type': 'Question',
        name: 'O que fazer se o Pix tiver nome diferente do restaurante?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'É comum estabelecimentos individuais usarem conta de pessoa física do proprietário ou razão social diferente do nome fantasia. Sempre confirme na conversa do WhatsApp antes de concluir a transferência.',
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
      { '@type': 'ListItem', position: 3, name: 'Como pedir pelo WhatsApp com segurança' },
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
          <span>Segurança no WhatsApp</span>
        </nav>

        <p className="institutional-kicker">GUIA DE SEGURANÇA E CONSUMO</p>
        <h1 className="institutional-title">Como pedir comida pelo WhatsApp com segurança: Guia definitivo</h1>
        <p className="institutional-lead">
          Pedir refeições diretamente pelo WhatsApp se tornou um dos hábitos mais práticos do dia a dia. Saiba como tirar proveito dessa agilidade mantendo seus dados protegidos, conferindo pagamentos e garantindo que sua refeição chegue com total tranquilidade.
        </p>

        <div className="institutional-content">
          <h2>1. O crescimento dos pedidos diretos pelo WhatsApp</h2>
          <p>
            Nos últimos anos, o WhatsApp se consolidou no Brasil como o canal preferido de comunicação entre pequenos e médios restaurantes e sua clientela. Ao eliminar intermediários que cobram comissões abusivas de 20% a 30% dos restaurantes, a relação direta beneficia ambos os lados: o restaurante preserva sua margem financeira e o cliente tem um atendimento personalizado e ágil.
          </p>
          <p>
            Plataformas como o <strong>FOODDF</strong> surgiram justamente para organizar esse ecossistema: permitindo que o cliente navegue por um cardápio digital moderno, selecione adicionais, calcule totais e monte uma mensagem estruturada que é enviada ao WhatsApp oficial da loja com apenas um clique.
          </p>

          <h2>2. Cuidados essenciais antes de enviar seu pedido</h2>
          <p>
            Embora o processo seja simples, alguns cuidados garantem que a experiência seja impecável do início ao fim:
          </p>
          <ul>
            <li><strong>Verifique a procedência do link do cardápio:</strong> Sempre inicie seus pedidos através de fontes confiáveis, como a plataforma oficial do FOODDF ou as redes sociais oficiais verificadas do estabelecimento.</li>
            <li><strong>Confira o endereço completo de entrega:</strong> Certifique-se de informar pontos de referência, número de apartamento ou bloco, garantindo que o entregador localize seu endereço sem atrasos.</li>
            <li><strong>Confirme o tempo estimado e taxa de entrega:</strong> A taxa de entrega e o prazo são informados pelo cardápio e devem ser confirmados na conversa antes da preparação do prato.</li>
          </ul>

          <div className="institutional-highlight-box">
            <strong>Dica de ouro FOODDF:</strong> Se o restaurante oferecer retirada no local, você tem custo zero de taxa de entrega e pode buscar seu prato recém-preparado com rapidez.
          </div>

          <h2>3. Pagamento por Pix: Como evitar divergências e fraudes</h2>
          <p>
            O Pix é o meio mais rápido e utilizado em pedidos diretos. No entanto, golpistas podem tentar se passar por estabelecimentos em canais não oficiais. Para garantir segurança total:
          </p>
          <ol>
            <li><strong>Confira sempre o nome do beneficiário:</strong> No aplicativo do seu banco, antes de confirmar a senha, confira se o nome exibido corresponde à Razão Social, ao Nome Fantasia ou ao proprietário do restaurante cadastrado.</li>
            <li><strong>Utilize o Pix Copia e Cola gerado no cardápio:</strong> O FOODDF gera o código Pix exato com o valor do pedido, evitando digitação manual de quantias incorretas.</li>
            <li><strong>Envie o comprovante na própria conversa:</strong> Após pagar, anexe o comprovante bancário com data, horário e número de autenticação diretamente na janela do WhatsApp do restaurante.</li>
          </ol>

          <h2>4. Pagamento em dinheiro ou cartão na entrega</h2>
          <p>
            Se você prefere pagar no momento do recebimento:
          </p>
          <ul>
            <li><strong>Para dinheiro em espécie:</strong> Avise previamente no cardápio se precisará de troco e para quanto (por exemplo: troco para R$ 50,00 ou R$ 100,00), permitindo que o motoboy já leve as notas certas.</li>
            <li><strong>Para maquininha de cartão:</strong> Ao receber a maquininha na entrega, confira o valor exibido no visor antes de aproximar ou inserir o cartão e digitar a senha. Nunca aceite pagar em maquininhas com visor quebrado ou que não mostre o valor exato.</li>
          </ul>

          <h2>5. Direitos do consumidor e cancelamentos</h2>
          <p>
            Por se tratar de produtos perecíveis preparados sob encomenda, o Código de Defesa do Consumidor brasileiro estabelece regras claras para delivery de alimentos. Se houver atraso injustificado além do prazo razoável combinado, item divergente do cardápio ou problema de qualidade no prato, entre em contato imediatamente com o restaurante pelo próprio WhatsApp para solicitar reenvio ou estorno do valor pago.
          </p>

          <div className="institutional-faq-block">
            <h2>Perguntas frequentes sobre pedidos no WhatsApp</h2>
            <div className="institutional-faq-item">
              <h3>O FOODDF cobra taxa extra do cliente pelo pedido no WhatsApp?</h3>
              <p>Não. O FOODDF não cobra taxas de serviço ou intermediação de quem pede. O valor pago pelos pratos e entrega é exatamente o acordado com o restaurante.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>Como conferir se o WhatsApp pertence mesmo ao restaurante?</h3>
              <p>Ao acessar o cardápio oficial pelo FOODDF, o botão de pedido direciona para o número de WhatsApp cadastrado e validado pelo próprio estabelecimento.</p>
            </div>
            <div className="institutional-faq-item">
              <h3>O que fazer se o Pix tiver nome diferente do restaurante?</h3>
              <p>É comum estabelecimentos individuais usarem conta de pessoa física do proprietário ou razão social diferente do nome fantasia. Sempre confirme na conversa do WhatsApp antes de concluir a transferência.</p>
            </div>
          </div>

          <div className="institutional-cta-banner">
            <h2>Bateu a fome? Peça direto de quem faz</h2>
            <p>Conheça os restaurantes locais disponíveis na sua cidade e experimente pedir de forma rápida, transparente e segura.</p>
            <a href="/buscas" className="button primary" style={{ background: '#ff5900', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
              Explorar Restaurantes Agora <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
