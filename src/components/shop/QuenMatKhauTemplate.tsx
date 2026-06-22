'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyOtp } from '@/lib/auth-api';

const QuenMatKhauTemplate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!isSuccess || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (!verificationCode.trim()) {
      setVerificationError('Vui lòng nhập mã xác thực.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, verificationCode.trim());
      router.push(`/dat-lai-mat-khau?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationCode.trim())}`);
    } catch (err: any) {
      setVerificationError(err?.message || 'mã xác thực không hợp lệ vui lòng nhập lại mã mới');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-container text-center">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={48} className="success-icon" />
        </div>
        <h1 className="title">Thành công!</h1>
        <p className="subtitle">
          Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email: <strong>{email}</strong>.
          Vui lòng kiểm tra hộp thư của bạn.
        </p>

        {/* Verification Code Form */}
        <form onSubmit={handleVerifyCode} className="verification-form">
          <div className="input-group">
            <div className="input-icon">
              <KeyRound size={20} />
            </div>
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                if (verificationError) setVerificationError('');
              }}
              className="forgot-input"
            />
          </div>
          
          {verificationError && (
            <div className="forgot-error" role="alert">
              {verificationError}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Đang xác thực...' : 'Tiếp tục đặt lại mật khẩu'}
          </button>

          <div className="resend-wrapper">
            {resendCount >= 3 ? (
              <p className="resend-limit-error">
                Bạn đã gửi lại mã 3 lần. Vui lòng kiểm tra kỹ hòm thư hoặc thử lại sau.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    if (countdown > 0 || resendCount >= 3) return;
                    setVerificationError('');
                    setIsLoading(true);
                    try {
                      await forgotPassword(email);
                      setResendCount((prev) => prev + 1);
                      setCountdown(30);
                      alert('Mã xác thực mới đã được gửi đến email của bạn.');
                    } catch (err: any) {
                      setVerificationError(err?.message || 'Không thể gửi lại mã xác thực.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="resend-button"
                  disabled={isLoading || countdown > 0}
                >
                  {countdown > 0
                    ? `Gửi lại mã mới sau (${countdown}s)`
                    : 'Gửi lại mã xác thực mới'}
                </button>
                <div className="resend-remaining-text">
                  (Còn {3 - resendCount} lần gửi lại)
                </div>
              </>
            )}
          </div>
        </form>

        <Link href="/dang-nhap" className="back-link">
          <ArrowLeft size={16} />
          <span>Quay lại Đăng nhập</span>
        </Link>

        <style jsx>{`
          .forgot-password-container {
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

          .verification-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 16px 0 8px;
          }

          .input-group {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
          }

          .input-icon {
            position: absolute;
            left: 16px;
            color: #4b5563;
            display: flex;
            align-items: center;
          }

          .forgot-input {
            width: 100%;
            padding: 12px 16px 12px 48px;
            border: 1px solid var(--border-input);
            border-radius: var(--radius-sm);
            font-family: var(--font-main);
            font-size: 15px;
            color: var(--text-main);
            transition: var(--transition-fast);
            outline: none;
          }

          .forgot-input::placeholder {
            color: #bbbbbb;
          }

          .forgot-input:focus {
            border-color: var(--text-main);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
          }

          .forgot-error {
            padding: 10px 14px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: var(--radius-sm);
            color: #dc2626;
            font-family: var(--font-main);
            font-size: 14px;
            line-height: 1.4;
            text-align: left;
          }

          .submit-button {
            width: 100%;
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

          .submit-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .resend-wrapper {
            text-align: center;
            margin-top: 8px;
          }

          .resend-button {
            background: none;
            border: none;
            color: #c9a96e;
            font-family: var(--font-main);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 2px;
            transition: var(--transition-fast);
          }

          .resend-button:hover:not(:disabled) {
            color: var(--text-main);
          }

          .resend-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .resend-limit-error {
            color: #dc2626;
            font-family: var(--font-main);
            font-size: 13px;
            margin: 8px 0 0;
            font-weight: 500;
            line-height: 1.5;
          }

          .resend-remaining-text {
            color: #888888;
            font-family: var(--font-main);
            font-size: 11px;
            margin-top: 4px;
          }

          .submit-button:hover {
            background: #333333;
            transform: translateY(-2px);
          }

          :global(.back-link) {
            margin-top: 10px;
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      {/* Header */}
      <div className="forgot-header">
        <h1 className="title">Quên mật khẩu</h1>
        <p className="subtitle">
          Nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email.
        </p>
      </div>

      {/* Form */}
      <form className="forgot-form" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="input-group">
          <div className="input-icon">
            <Mail size={20} />
          </div>
          <input
            type="email"
            placeholder="Địa chỉ email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            className="forgot-input"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="forgot-error" role="alert">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu reset'}
        </button>
      </form>

      {/* Footer */}
      <div className="forgot-footer">
        <Link href="/dang-nhap" className="back-link">
          <ArrowLeft size={16} />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>

      <style jsx>{`
        .forgot-password-container {
          width: 100%;
          max-width: 440px;
          background: transparent;
          padding: 50px 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .forgot-header {
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

        .forgot-form {
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

        .forgot-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--text-main);
          transition: var(--transition-fast);
          outline: none;
        }

        .forgot-input::placeholder {
          color: #bbbbbb;
        }

        .forgot-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .forgot-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .forgot-error {
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

        .forgot-footer {
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
          .forgot-password-container {
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

export default QuenMatKhauTemplate;
