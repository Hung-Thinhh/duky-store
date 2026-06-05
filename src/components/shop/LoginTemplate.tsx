'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/shop/GoogleLoginButton';

interface LoginTemplateProps {
  onSwitchToSignup?: () => void;
}

const LoginTemplate: React.FC<LoginTemplateProps> = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      const authErr = err as { EC?: number; EM?: string; message?: string };
      setError(authErr.EM || authErr.message || 'Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      {/* Header */}
      <div className="login-header">
        <h1 className="login-title">Đăng nhập</h1>
        <p className="login-subtitle">Tiếp tục mua sắm cùng Duky Store</p>
      </div>

      {/* Form */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Email/Phone Input */}
        <div className="input-group">
          <div className="input-icon">
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
        </div>

        {/* Password Input */}
        <div className="input-group">
          <div className="input-icon">
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="password-toggle"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Options */}
        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox-input"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="forgot-password">Quên mật khẩu?</a>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {/* Divider */}
      <div className="login-divider">
        <span className="divider-line"></span>
        <span className="divider-text">Hoặc tiếp tục với</span>
        <span className="divider-line"></span>
      </div>

      {/* Social Login */}
      <div className="social-login">
        <GoogleLoginButton onSuccess={() => router.push('/')} />
      </div>

      {/* Footer */}
      <div className="login-footer">
        <span>Chưa có tài khoản?</span>
        <Link href="/dang-ky" className="register-link" replace>Đăng ký ngay</Link>
      </div>

      <style jsx>{`
        .login-form-container {
          width: 100%;
          max-width: 440px;
          background: transparent;
          padding: 50px 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .login-header {
          text-align: center;
        }

        .login-title {
          font-family: var(--font-accent);
          font-size: 32px;
          color: var(--text-main);
          margin-bottom: 6px;
          font-weight: 700;
        }

        .login-subtitle {
          font-family: var(--font-main);
          font-size: 14px;
          color: #4b5563;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #4b5563;
          display: flex;
          align-items: center;
        }

        .login-input {
          width: 100%;
          padding: 12px 44px 12px 48px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--text-main);
          transition: var(--transition-fast);
          outline: none;
        }

        .login-input::placeholder {
          color: #bbbbbb;
        }

        .login-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .password-toggle {
          position: absolute;
          right: 0;
          height: 100%;
          width: 44px;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-main);
          font-size: 14px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-main);
          font-weight: 500;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-black);
          cursor: pointer;
        }

        .forgot-password {
          color: var(--text-main);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
        }

        .login-error {
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-sm);
          color: #dc2626;
          font-family: var(--font-main);
          font-size: 14px;
          line-height: 1.4;
        }

        .login-button {
          margin-top: 4px;
          padding: 12px;
          background: var(--accent-black);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-btn);
          font-family: var(--font-main);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .login-button:hover:not(:disabled) {
          background: #333333;
          transform: translateY(-2px);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 8px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-input);
          opacity: 0.6;
        }

        .divider-text {
          font-family: var(--font-main);
          font-size: 14px;
          color: #4b5563;
          white-space: nowrap;
        }

        .social-login {
          display: flex;
          gap: 16px;
        }

        .login-footer {
          text-align: center;
          font-family: var(--font-main);
          font-size: 15px;
          color: #4b5563;
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        :global(.register-link) {
          color: #000000 !important;
          text-decoration: underline !important;
          text-underline-offset: 4px;
          font-weight: 800 !important;
          transition: var(--transition-fast);
        }

        .register-link:hover {
          color: #333333;
        }

        @media (max-width: 480px) {
          .login-form-container {
            padding: 32px 16px !important;
            gap: 20px !important;
          }
          .login-title {
            font-size: 26px !important;
          }
          .login-options {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginTemplate;
