'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/shop/GoogleLoginButton';
import { fbqEvent } from '@/components/analytics/FacebookPixel';
import { gaEvent } from '@/components/analytics/GoogleAnalytics';

const SignUpTemplate: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!agreeToTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không đúng định dạng');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (password.length > 72) {
      setError('Mật khẩu không được vượt quá 72 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await auth.register(email, password, confirmPassword);
      fbqEvent('CompleteRegistration');
      gaEvent('sign_up', { method: 'email' });
      router.push('/');
    } catch (err: unknown) {
      const authErr = err as { EM?: string };
      setError(authErr.EM || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      {/* Header */}
      <div className="signup-header">
        <h2 className="signup-title">Đăng ký tài khoản</h2>
        <p className="signup-subtitle">Tạo tài khoản để trải nghiệm cùng Duky Store</p>
      </div>

      {/* Form Fields */}
      <form className="signup-form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="input-group">
          <div className="input-icon">
            <Mail size={20} />
          </div>
          <input 
            type="text" 
            className="signup-input" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <div className="input-icon">
            <Lock size={20} />
          </div>
          <input 
            type={showPassword ? "text" : "password"} 
            className="signup-input" 
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <div className="input-icon">
            <Lock size={20} />
          </div>
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            className="signup-input" 
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiển thị mật khẩu xác nhận"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Terms and Conditions */}
        <div className="terms-options">
          <label className="terms-checkbox">
            <input 
              type="checkbox" 
              className="checkbox-input" 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <span className="terms-text">
              Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button 
          type="submit" 
          className="signup-button"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>

      {/* Divider */}
      <div className="signup-divider">
        <div className="divider-line"></div>
        <span className="divider-text">Hoặc đăng ký với</span>
        <div className="divider-line"></div>
      </div>

      {/* Social Login */}
      <div className="social-signup">
        <GoogleLoginButton onSuccess={() => router.push('/')} />
      </div>

      {/* Footer */}
      <div className="signup-footer">
        <p>
          Đã có tài khoản? <Link href="/dang-nhap" className="login-link" replace>Đăng nhập</Link>
        </p>
      </div>

      <style jsx>{`
        .signup-form-container {
          width: 100%;
          max-width: 440px;
          background: transparent;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .signup-header {
          text-align: center;
        }

        .signup-title {
          font-family: var(--font-accent);
          font-size: 28px;
          color: var(--text-main);
          margin-bottom: 4px;
          font-weight: 700;
        }

        .signup-subtitle {
          font-family: var(--font-main);
          font-size: 14px;
          color: #4b5563;
        }

        .signup-form {
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
          justify-content: center;
        }

        .signup-input {
          width: 100%;
          padding: 14px 44px 14px 48px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--text-main);
          transition: var(--transition-fast);
          outline: none;
        }

        .signup-input::placeholder {
          color: #bbbbbb;
        }

        .signup-input:focus {
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
          transition: var(--transition-fast);
        }

        .password-toggle:hover {
          color: var(--text-main);
        }

        .terms-options {
          display: flex;
          align-items: flex-start;
          font-family: var(--font-main);
          font-size: 13px;
          margin-top: 4px;
        }

        .terms-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          color: var(--text-main);
          line-height: 1.5;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          accent-color: var(--accent-black);
          cursor: pointer;
        }

        .terms-text a {
          color: var(--text-main);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .error-message {
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-sm);
          color: #dc2626;
          font-family: var(--font-main);
          font-size: 13px;
          line-height: 1.4;
        }

        .signup-button {
          margin-top: 8px;
          padding: 14px;
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

        .signup-button:hover:not(:disabled) {
          background: #333333;
          transform: translateY(-2px);
        }

        .signup-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 6px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-input);
          opacity: 0.6;
        }

        .divider-text {
          font-family: var(--font-main);
          font-size: 13px;
          color: #4b5563;
          white-space: nowrap;
        }

        .social-signup {
          display: flex;
          gap: 16px;
        }

        .signup-footer {
          text-align: center;
          font-family: var(--font-main);
          font-size: 15px;
          color: #4b5563;
          margin-top: 8px;
        }

        :global(.login-link) {
          color: #000000 !important;
          font-weight: 800 !important;
          text-decoration: underline !important;
          text-underline-offset: 4px;
          transition: var(--transition-fast);
        }

        .login-link:hover {
          color: #333333;
        }

        @media (max-width: 480px) {
          .signup-form-container {
            padding: 24px 16px !important;
            gap: 18px !important;
          }
          .signup-title {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpTemplate;
