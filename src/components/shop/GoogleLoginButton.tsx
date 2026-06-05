'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleLogin, CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buttonWidth, setButtonWidth] = useState(380);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      const padding = 88; // margin/padding of parent containers on mobile
      const calculated = window.innerWidth - padding;
      const finalWidth = Math.max(200, Math.min(380, calculated));
      setButtonWidth(finalWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        const msg = 'Đăng nhập Google thất bại: không nhận được token';
        setErrorMessage(msg);
        onError?.(msg);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        await googleLogin(idToken);
        onSuccess?.();
      } catch (err: unknown) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : 'Đăng nhập Google thất bại';
        setErrorMessage(msg);
        onError?.(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [googleLogin, onSuccess, onError]
  );

  const handleError = useCallback(() => {
    // Google popup was dismissed or errored — re-enable without showing error
    // The GoogleLogin component handles re-enabling internally
    // We only show errors from our API call, not from popup dismissal
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="google-login-wrapper">
        {isLoading && (
          <div className="google-login-overlay">
            <span className="google-login-loading">Đang xử lý...</span>
          </div>
        )}
        {isMounted && (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="outline"
            size="large"
            width={buttonWidth.toString()}
            text="continue_with"
            shape="rectangular"
            logo_alignment="center"
          />
        )}
        {errorMessage && (
          <p className="google-login-error">{errorMessage}</p>
        )}

        <style jsx>{`
          .google-login-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }

          .google-login-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.8);
            border-radius: var(--radius-btn);
            z-index: 10;
            pointer-events: all;
          }

          .google-login-loading {
            font-family: var(--font-main);
            font-size: 14px;
            color: var(--text-muted);
          }

          .google-login-error {
            margin-top: 8px;
            font-family: var(--font-main);
            font-size: 13px;
            color: #dc2626;
            text-align: center;
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
