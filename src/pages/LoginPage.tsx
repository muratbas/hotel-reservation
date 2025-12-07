import React, { useState } from 'react';
import TitleBar from '../components/TitleBar';

interface LoginPageProps {
  onLogin: (manager: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await window.electronAPI.login(email, password);
      
      if (result.success && result.manager) {
        
        localStorage.setItem('managerId', result.manager.ManagerId.toString());
        onLogin(result.manager);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark">
      <TitleBar title="Otel Rezervasyon Sistemi - Giriş" />
      
      <div className="flex-1 flex items-center justify-center">
      {}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md px-6">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">hotel</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Otel Yönetim Sistemi</h1>
          <p className="text-text-secondary">Hesabınıza giriş yapın</p>
        </div>

        {}
        <div className="bg-card-dark border border-border-color rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-secondary text-xl">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-hover-dark border border-border-color rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all [color-scheme:dark]"
                  placeholder="admin@hotel.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-secondary text-xl">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-hover-dark border border-border-color rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all [color-scheme:dark]"
                  placeholder="Şifrenizi girin"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-text-primary font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          {}
          <div className="mt-6 pt-6 border-t border-border-color">
            <p className="text-xs text-text-secondary text-center">
              Varsayılan bilgiler: <span className="text-primary">admin@hotel.com</span> / <span className="text-primary">admin123</span>
            </p>
          </div>
        </div>

        {}
        <p className="text-center text-text-secondary text-sm mt-6">
          © 2025 Otel Rezervasyon Sistemi
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
