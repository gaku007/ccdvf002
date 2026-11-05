import { StrictMode, useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Page = 'login' | 'success' | 'mysite';
const SESSION_KEY = 'login-poc-user';

function readSession() {
  try { return sessionStorage.getItem(SESSION_KEY) === 'user'; }
  catch { return false; }
}

function currentPage(authenticated: boolean): Page {
  if (!authenticated) return 'login';
  return window.location.hash === '#/success' ? 'success' : 'mysite';
}

function App() {
  const [authenticated, setAuthenticated] = useState(readSession);
  const [page, setPage] = useState<Page>(() => currentPage(readSession()));
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = () => {
      const next = currentPage(authenticated);
      setPage(next);
      if (window.location.hash !== `#/${next}`) {
        window.history.replaceState(null, '', `#/${next}`);
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, [authenticated]);

  useEffect(() => {
    document.title = `${{ login: 'ログイン', success: 'ログイン成功', mysite: 'マイサイト' }[page]} | My Site`;
    document.querySelector<HTMLElement>('h1')?.focus();
  }, [page]);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (id !== 'user' || password !== 'pass') {
      setError('IDまたはパスワードが正しくありません。');
      return;
    }
    try { sessionStorage.setItem(SESSION_KEY, 'user'); } catch { /* メモリ上でログインを継続 */ }
    setError('');
    setPassword('');
    window.history.replaceState(null, '', '#/success');
    setAuthenticated(true);
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* メモリ上の状態も破棄 */ }
    setAuthenticated(false);
    setId('');
    setPassword('');
    setError('');
    window.history.replaceState(null, '', '#/login');
  }

  return (
    <div className="app">
      <header className="header">
        <span className="brand"><span className="brand-icon" aria-hidden="true">M</span> My Site <span className="badge">PoC</span></span>
        {authenticated && <button className="text-button" onClick={logout}>ログアウト</button>}
      </header>
      <main>
        {page === 'login' && (
          <section className="card" aria-labelledby="heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h1 id="heading" tabIndex={-1}>ログイン</h1>
            <p className="description">アカウント情報を入力して、はじめましょう。</p>
            <form onSubmit={login}>
              <label htmlFor="user-id">ID</label>
              <input id="user-id" name="username" autoComplete="username" placeholder="IDを入力" value={id} onChange={event => { setId(event.target.value); setError(''); }} required aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} />
              <label htmlFor="password">パスワード</label>
              <input id="password" name="password" type="password" autoComplete="current-password" placeholder="パスワードを入力" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} required aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} />
              {error && <p id="login-error" className="error" role="alert">{error}</p>}
              <button className="primary" type="submit">ログイン <span aria-hidden="true">→</span></button>
            </form>
            <div className="demo-note"><strong>お試し用アカウント</strong><span>ID：<code>user</code> ／ Pass：<code>pass</code></span></div>
          </section>
        )}
        {page === 'success' && (
          <section className="card centered" aria-labelledby="heading">
            <div className="success-icon" aria-hidden="true">✓</div>
            <p className="eyebrow">YOU’RE ALL SET</p>
            <h1 id="heading" tabIndex={-1}>ログイン成功</h1>
            <p className="description">ようこそ、userさん。<br />マイサイトをご利用いただけます。</p>
            <a className="primary" href="#/mysite">マイサイトへ <span aria-hidden="true">→</span></a>
          </section>
        )}
        {page === 'mysite' && (
          <section className="card" aria-labelledby="heading">
            <p className="eyebrow">YOUR PERSONAL SPACE</p>
            <h1 id="heading" tabIndex={-1}>マイサイト</h1>
            <p className="description">こんにちは、userさん。</p>
            <div className="profile"><span className="avatar" aria-hidden="true">U</span><div><strong>user</strong><p>ログイン中</p></div><span className="status-dot" aria-hidden="true" /></div>
            <div className="site-content"><h2>あなたのスペースへようこそ</h2><p>ここはログインしたユーザー専用のサンプル画面です。PoCの機能をここから追加できます。</p></div>
            <button className="secondary" onClick={logout}>ログアウト</button>
          </section>
        )}
      </main>
      <footer>My Site · ログイン機能のPoCサンプル</footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
