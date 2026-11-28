'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { adminClient, formatContactPhone } from '@/lib/admin';
import { states } from '@/lib/domain';

type Mode = 'login' | 'signup' | 'forgot' | 'recovery';

const CATEGORIES = ['Restaurante', 'Lanchonete', 'Pizzaria', 'Cafeteria', 'Hamburgueria', 'Outros'] as const;

export function AuthScreen({ recovery, onRecoveryDone }: { recovery: boolean; onRecoveryDone: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [company, setCompany] = useState({
    name: '',
    cuisine: 'Restaurante',
    address: '',
    postal_code: '',
    complement: '',
    whatsapp: '',
    state: 'DF',
    city: '',
  });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('cadastro') === '1') {
      setMode('signup');
    }
  }, []);

  const current = recovery ? 'recovery' : mode;
  const isSignup = current === 'signup';

  function change(next: Mode) {
    setMode(next);
    setMessage('');
    setError('');
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
    if (typeof window !== 'undefined' && !recovery) {
      const targetUrl = next === 'signup' ? `${window.location.pathname}?cadastro=1` : window.location.pathname;
      window.history.replaceState({}, '', targetUrl);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const db = adminClient();
      const redirectTo = window.location.origin + '/';

      if (current === 'login') {
        const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw Error('E-mail ou senha inválidos. Confira seus dados e se o e-mail foi confirmado.');
      }

      if (current === 'forgot') {
        const { error } = await db.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) throw error;
        setMessage('Se houver uma conta para este e-mail, você receberá um link para alterar a senha.');
      }

      if (current === 'signup') {
        if (password !== confirm) throw Error('As senhas não coincidem.');
        if (!/^\d{8}$/.test(company.postal_code.replace(/\D/g, ''))) throw Error('Informe um CEP válido.');
        if (!/^\d{10,11}$/.test(company.whatsapp.replace(/\D/g, ''))) throw Error('Informe o WhatsApp com DDD.');
        const { error } = await db.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo, data: { fooddf_signup: company } },
        });
        if (error) throw error;
        setMessage('Confira seu e-mail para confirmar a conta. Depois, entre para concluir o cadastro do estabelecimento.');
      }

      if (current === 'recovery') {
        if (password !== confirm) throw Error('As senhas não coincidem.');
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        await db.auth.signOut();
        onRecoveryDone();
        change('login');
        setMessage('Senha alterada. Entre com a nova senha.');
      }
    } catch (err) {
      setError((err as Error).message || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  const update = (key: keyof typeof company, value: string) => setCompany(c => ({ ...c, [key]: value }));

  return (
    <div className="auth-page-shell">
      {/* Barra Superior */}
      <header className="auth-topbar">
        <div className="auth-topbar-inner">
          <div className="auth-topbar-left">
            <a href="/" className="auth-brand-link" aria-label="FOODDF, início">
              <Image
                src="/images/home/fooddf-logo-hd.webp"
                alt="FOODDF"
                width={168}
                height={45}
                quality={95}
                preload
                className="auth-brand-logo"
              />
            </a>
            <span className="auth-topbar-divider" aria-hidden="true" />
            <a href="/para-restaurantes" className="auth-topbar-context">
              Para restaurantes
            </a>
          </div>

          <a href="/" className="auth-topbar-back">
            Voltar ao FOODDF
          </a>
        </div>
      </header>

      {/* Conteúdo Dividido: Fotografia à esquerda + Formulário à direita */}
      <div className="auth-split-layout">
        <aside className="auth-visual-pane" aria-hidden="true">
          <Image
            key={isSignup ? 'register-photo' : 'login-photo'}
            src={isSignup ? '/images/auth/auth-register-chef.webp' : '/images/auth/auth-login-chef.webp'}
            alt={
              isSignup
                ? 'Chef preparando hambúrguer artesanal na cozinha do restaurante'
                : 'Chef gerenciando o cardápio do restaurante pelo tablet'
            }
            fill
            sizes="(max-width: 960px) 100vw, 44vw"
            quality={90}
            preload
            className="auth-visual-img"
          />
          <div className="auth-visual-shade" />
          <div className="auth-visual-copy">
            {isSignup ? (
              <h2>
                Seu restaurante
                <br />
                no mapa.
              </h2>
            ) : (
              <h2>
                Seu restaurante,
                <br />
                do seu jeito.
              </h2>
            )}
          </div>
        </aside>

        <main className={`auth-form-pane ${isSignup ? 'is-signup' : 'is-login'}`}>
          <section key={current} className="auth-form-container admin-section-transition">
            <header className="auth-heading-block">
              <h1>
                {current === 'login'
                  ? 'Acesse seu painel'
                  : current === 'signup'
                    ? 'Cadastre seu restaurante'
                    : current === 'forgot'
                      ? 'Recuperar senha'
                      : 'Crie uma nova senha'}
              </h1>
              <p>
                {current === 'login'
                  ? 'Entre para gerenciar o cardápio do seu restaurante.'
                  : current === 'signup'
                    ? 'Crie sua conta grátis e monte seu cardápio digital.'
                    : current === 'forgot'
                      ? 'Informe seu e-mail para receber o link de redefinição.'
                      : 'Escolha uma nova senha segura para acessar sua conta.'}
              </p>
            </header>

            {error && (
              <div className="admin-alert auth-feedback" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="admin-tip auth-feedback" role="status">
                {message}
              </div>
            )}

            <form onSubmit={submit} className="auth-form">
              {isSignup ? (
                <>
                  {/* Grupo 1: Dados da loja */}
                  <div className="auth-section-title">
                    <h2>Dados da loja</h2>
                    <span aria-hidden="true" />
                  </div>

                  <div className="auth-row auth-row-store">
                    <label className="auth-field">
                      <span className="auth-label">
                        Nome da empresa <em aria-hidden="true">*</em>
                      </span>
                      <input
                        required
                        minLength={2}
                        maxLength={120}
                        placeholder="Nome da empresa"
                        value={company.name}
                        onChange={e => update('name', e.target.value)}
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">
                        Categoria <em aria-hidden="true">*</em>
                      </span>
                      <div className="auth-select-box">
                        <select value={company.cuisine} onChange={e => update('cuisine', e.target.value)}>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={17} strokeWidth={2.3} aria-hidden="true" />
                      </div>
                    </label>
                  </div>

                  <label className="auth-field">
                    <span className="auth-label">
                      WhatsApp <em aria-hidden="true">*</em>
                    </span>
                    <input
                      required
                      type="tel"
                      placeholder="(61) 99999-9999"
                      value={company.whatsapp}
                      onChange={e => update('whatsapp', formatContactPhone(e.target.value))}
                    />
                  </label>

                  {/* Grupo 2: Localização */}
                  <div className="auth-section-title">
                    <h2>Localização</h2>
                    <span aria-hidden="true" />
                  </div>

                  <div className="auth-row auth-row-address">
                    <label className="auth-field">
                      <span className="auth-label">
                        Endereço <em aria-hidden="true">*</em>
                      </span>
                      <input
                        required
                        maxLength={300}
                        placeholder="Rua, avenida, número e complemento"
                        value={company.address}
                        onChange={e => update('address', e.target.value)}
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">
                        CEP <em aria-hidden="true">*</em>
                      </span>
                      <input
                        required
                        inputMode="numeric"
                        placeholder="00000-000"
                        value={company.postal_code}
                        onChange={e => {
                          const d = e.target.value.replace(/\D/g, '').slice(0, 8);
                          update('postal_code', d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d);
                        }}
                      />
                    </label>
                  </div>

                  <div className="auth-row auth-row-region">
                    <label className="auth-field">
                      <span className="auth-label">
                        Estado <em aria-hidden="true">*</em>
                      </span>
                      <div className="auth-select-box">
                        <select value={company.state} onChange={e => update('state', e.target.value)}>
                          {states.map(([uf, name]) => (
                            <option value={uf} key={uf}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={17} strokeWidth={2.3} aria-hidden="true" />
                      </div>
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">
                        Cidade <em aria-hidden="true">*</em>
                      </span>
                      <input
                        required
                        minLength={2}
                        maxLength={100}
                        placeholder="Digite a cidade"
                        value={company.city}
                        onChange={e => update('city', e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="auth-field">
                    <span className="auth-label">Ponto de referência</span>
                    <input
                      maxLength={100}
                      placeholder="Ex.: Próximo ao metrô, em frente à praça"
                      value={company.complement}
                      onChange={e => update('complement', e.target.value)}
                    />
                  </label>

                  {/* Grupo 3: Acesso ao painel */}
                  <div className="auth-section-title">
                    <h2>Acesso ao painel</h2>
                    <span aria-hidden="true" />
                  </div>

                  <label className="auth-field">
                    <span className="auth-label">
                      E-mail de acesso <em aria-hidden="true">*</em>
                    </span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </label>

                  <div className="auth-row auth-row-passwords">
                    <div className="auth-field">
                      <label htmlFor="signup-password" className="auth-label">
                        Senha <em aria-hidden="true">*</em>
                      </label>
                      <div className="auth-password-box">
                        <input
                          id="signup-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          minLength={10}
                          autoComplete="new-password"
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <small className="auth-field-hint">Use pelo menos 10 caracteres.</small>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="signup-confirm" className="auth-label">
                        Confirmar senha <em aria-hidden="true">*</em>
                      </label>
                      <div className="auth-password-box">
                        <input
                          id="signup-confirm"
                          required
                          type={showConfirm ? 'text' : 'password'}
                          minLength={10}
                          autoComplete="new-password"
                          placeholder="Confirme sua senha"
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowConfirm(v => !v)}
                          aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {current !== 'recovery' && (
                    <label className="auth-field auth-field-lg">
                      <span className="auth-label">E-mail de acesso</span>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </label>
                  )}

                  {current !== 'forgot' && (
                    <div className="auth-field auth-field-lg">
                      <label htmlFor="login-password" className="auth-label">
                        {current === 'recovery' ? 'Nova senha' : 'Senha'}
                      </label>
                      <div className="auth-password-box auth-password-lg">
                        <input
                          id="login-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          minLength={current === 'login' ? 1 : 10}
                          autoComplete={current === 'login' ? 'current-password' : 'new-password'}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {current === 'recovery' && (
                    <div className="auth-field auth-field-lg">
                      <label htmlFor="recovery-confirm" className="auth-label">
                        Confirmar senha
                      </label>
                      <div className="auth-password-box auth-password-lg">
                        <input
                          id="recovery-confirm"
                          required
                          type={showConfirm ? 'text' : 'password'}
                          minLength={10}
                          autoComplete="new-password"
                          placeholder="Confirme sua senha"
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowConfirm(v => !v)}
                          aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                        >
                          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <small className="auth-field-hint">Use pelo menos 10 caracteres.</small>
                    </div>
                  )}
                </>
              )}

              <button className={`auth-submit-btn ${isSignup ? '' : 'is-lg'}`} disabled={busy} type="submit">
                {busy
                  ? 'Aguarde…'
                  : current === 'login'
                    ? 'Entrar no painel'
                    : current === 'signup'
                      ? 'Criar conta grátis'
                      : current === 'forgot'
                        ? 'Enviar instruções'
                        : 'Salvar nova senha'}
              </button>
            </form>

            {current === 'login' && (
              <div className="auth-footer-prompts">
                <p className="auth-switch-prompt">
                  Ainda não tem uma conta?{' '}
                  <button type="button" className="auth-inline-link orange" onClick={() => change('signup')}>
                    Cadastre-se grátis
                  </button>
                </p>
                <button type="button" className="auth-forgot-link" onClick={() => change('forgot')}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            {current === 'signup' && (
              <p className="auth-switch-prompt">
                Já tem uma conta?{' '}
                <button type="button" className="auth-inline-link plum" onClick={() => change('login')}>
                  Entrar
                </button>
              </p>
            )}

            {current === 'forgot' && (
              <p className="auth-switch-prompt">
                <button type="button" className="auth-back-inline" onClick={() => change('login')}>
                  <ArrowLeft size={15} />
                  Voltar ao acesso
                </button>
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
