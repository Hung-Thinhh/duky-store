'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { resetPasswordWithOtp } from '@/lib/auth-api';

const DatLaiMatKhauTemplate: React.FC = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form validations
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (!email || !token) {
      setError('Thiếu thông tin xác thực (email hoặc token). Vui lòng thực hiện lại từ trang Quên mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithOtp(email, token, password, confirmPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="reset-password-container text-center">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={48} className="success-icon" />
        </div>
        <h1 className="title">Thành công!</h1>
        <p className="subtitle">
          Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.
        </p>
        <Link href="/dang-nhap" className="login-btn-link">
          <span>Đăng nhập ngay</span>
          <ArrowRight size={16} />
        </Link>

        <style jsx>{`
          .reset-password-container {
            width: 100%;
            max-width: 440px;
            padding: 50px 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .success-icon-wrapper {
            width: 80px;
            height: 80px;
            background: #f0fdf4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }

          :global(.success-icon) {
            color: #16a34a;
          }

          .title {
            font-family: var(--font-accent);
            font-size: 32px;
            color: var(--text-main);
            font-weight: 700;
          }

          .subtitle {
            font-family: var(--font-main);
            font-size: 14px;
            color: #4b5563;
            line-height: 1.6;
            text-align: center;
            margin-bottom: 12px;
          }

          :global(.login-btn-link) {
            margin-top: 10px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 28px;
            background: var(--accent-black);
            color: #ffffff !important;
            border-radius: var(--radius-btn);
            font-family: var(--font-main);
            font-size: 15px;
            font-weight: 600;
            transition: var(--transition-fast);
          }

          .login-btn-link:hover {
            background: #333333 !important;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      {/* Header */}
      <div className="reset-header">
        <h1 className="title">Đặt lại mật khẩu</h1>
        <p className="subtitle">
          Nhập mật khẩu mới cho tài khoản của bạn để tiếp tục mua sắm.
        </p>
      </div>

      {/* Form */}
      <form className="reset-form" onSubmit={handleSubmit}>
        {/* Password Input */}
        <div className="input-group">
          <div className="input-icon">
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            className="reset-input"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="input-group">
          <div className="input-icon">
            <Lock size={20} />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            className="reset-input"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle"
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="reset-error" role="alert">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>

      {/* Footer */}
      <div className="reset-footer">
        <Link href="/dang-nhap" className="back-link">
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>

      <style jsx>{`
        .reset-password-container {
          width: 100%;
          max-width: 440px;
          background: transparent;
          padding: 50px 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .reset-header {
          text-align: center;
        }

        .title {
          font-family: var(--font-accent);
          font-size: 32px;
          color: var(--text-main);
          margin-bottom: 8px;
          font-weight: 700;
        }

        .subtitle {
          font-family: var(--font-main);
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
        }

        .reset-form {
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

        .reset-input {
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

        .reset-input::placeholder {
          color: #bbbbbb;
        }

        .reset-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .reset-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
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

        .reset-error {
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-sm);
          color: #dc2626;
          font-family: var(--font-main);
          font-size: 14px;
          line-height: 1.4;
        }

        .submit-button {
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

        .submit-button:hover:not(:disabled) {
          background: #333333;
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reset-footer {
          text-align: center;
          display: flex;
          justify-content: center;
        }

        :global(.back-link) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main) !important;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          text-decoration: underline !important;
          text-underline-offset: 4px;
          transition: var(--transition-fast);
        }

        .back-link:hover {
          color: #333333 !important;
        }

        @media (max-width: 480px) {
          .reset-password-container {
            padding: 32px 16px !important;
            gap: 20px !important;
          }
          .title {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DatLaiMatKhauTemplate;
