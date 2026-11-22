import React from 'react';

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-global-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-columns">
          {/* Coluna 1: Marca e Posicionamento */}
          <div className="footer-col brand-col">
            <a href="/" className="footer-brand" aria-label="FOODDF - Início">
              <img src="/images/fooddf-logo-white.png" alt="FOODDF" className="footer-brand-logo-img" />
            </a>
            <p className="footer-tagline">
              Plataforma de cardápios digitais para restaurantes locais. Encontre pratos, monte sua sacola e envie seu pedido diretamente pelo WhatsApp.
            </p>
            <div className="footer-social-wrapper" style={{ marginBottom: '16px' }}>
              <a
                href="https://www.instagram.com/fooddfoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <InstagramIcon size={16} />
                <span>Siga @fooddfoficial</span>
              </a>
            </div>
            <div className="footer-transparency-pill">
              <span>✓ Pedidos combinados direto com o restaurante</span>
            </div>
          </div>

          {/* Coluna 2: Navegação e Catálogo */}
          <div className="footer-col">
            <h3 className="footer-heading">Explorar</h3>
            <ul className="footer-links">
              <li><a href="/">Página Inicial</a></li>
              <li><a href="/buscas">Buscar Restaurantes</a></li>
              <li><a href="/cidades">Cidades e Estados</a></li>
              <li><a href="/cidades/df/brasilia">Restaurantes em Brasília</a></li>
              <li><a href="/restaurantes/brasa-burger">Cardápio Modelo (Demonstração)</a></li>
            </ul>
          </div>

          {/* Coluna 3: Para Estabelecimentos */}
          <div className="footer-col">
            <h3 className="footer-heading">Para Restaurantes</h3>
            <ul className="footer-links">
              <li><a href="/para-restaurantes">Cadastrar Estabelecimento</a></li>
              <li><a href="/como-funciona">Como Funciona o Serviço</a></li>
              <li><a href="/painel">Acessar Painel do Restaurante</a></li>
              <li><a href="/politica-de-restaurantes">Diretrizes para Restaurantes</a></li>
            </ul>
          </div>

          {/* Coluna 4: Guias Editoriais */}
          <div className="footer-col">
            <h3 className="footer-heading">Guias e Segurança</h3>
            <ul className="footer-links">
              <li><a href="/guias/como-pedir-pelo-whatsapp-com-seguranca">Como Pedir pelo WhatsApp com Segurança</a></li>
              <li><a href="/guias/pagamento-por-pix-direto-ao-restaurante">Como Funciona o Pagamento por Pix</a></li>
              <li><a href="/guias/como-montar-cardapio-digital-gratis">Como Montar um Cardápio Digital</a></li>
              <li><a href="/llms.txt">Documentação para IAs (llms.txt)</a></li>
            </ul>
          </div>

          {/* Coluna 5: Institucional e LGPD */}
          <div className="footer-col">
            <h3 className="footer-heading">Institucional e Privacidade</h3>
            <ul className="footer-links">
              <li><a href="/sobre">Sobre o FOODDF</a></li>
              <li><a href="/contato">Contato e Suporte</a></li>
              <li><a href="/privacidade">Política de Privacidade (LGPD)</a></li>
              <li><a href="/cookies">Preferências de Cookies</a></li>
              <li><a href="/termos">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória e Rodapé Inferior */}
        <div className="footer-bottom-bar">
          <p className="footer-legal-notice">
            Aviso de Transparência: O FOODDF é uma plataforma de divulgação e pedidos via WhatsApp. Os preços, preparo, prazo de entrega e confirmação de pagamento via Pix, dinheiro ou cartão são de responsabilidade exclusiva de cada restaurante cadastrado.
          </p>
          <div className="footer-copyright-row">
            <span>© {currentYear} FOODDF — Todos os direitos reservados.</span>
            <span>
              Operado por{' '}
              <a
                href="https://www.instagram.com/capital_informatica"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#ff8a4c',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  textUnderlineOffset: '3px',
                }}
              >
                Capital Informática
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
