'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RefreshCw, Crown, MapPin, X } from 'lucide-react';
import SignUpTemplate from '../SignUpTemplate';

const SignUpSection: React.FC = () => {
  const router = useRouter();

  return (
    <div className="signup-section-container animate-in fade-in zoom-in duration-1000">
      {/* Left Panel - Brand Visual */}
      <div className="brand-panel">
        <div className="brand-content">
          <div className="logo-wrapper">
            <Image 
              src="/assets/logo_header.png" 
              alt="Duky Store Logo" 
              width={120} 
              height={60} 
              className="brand-logo"
            />
          </div>
          
          <h2 className="welcome-title">Welcome to Duky</h2>
          <p className="welcome-desc">
            Tạo tài khoản để nhận nhiều ưu đãi hấp dẫn và theo dõi hành trình mua sắm của bạn.
          </p>

          <div className="product-visual">
            <Image 
              src="/assets/login.png" 
              alt="Premium Boots" 
              width={260} 
              height={340} 
              className="product-image"
            />
          </div>

          {/* Floating Badges */}
          <div className="badge-float badge-1">
            <div className="badge-icon"><RefreshCw size={18} /></div>
            <div className="badge-text">
              <span>Đổi size</span>
              <span>3 ngày</span>
            </div>
          </div>

          <div className="badge-float badge-2">
            <div className="badge-icon"><Crown size={18} /></div>
            <div className="badge-text">
              <span>Ưu đãi</span>
              <span>thành viên</span>
            </div>
          </div>

          <div className="badge-float badge-3">
            <div className="badge-icon"><MapPin size={18} /></div>
            <div className="badge-text">
              <span>Có sẵn tại</span>
              <span>Cần Thơ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - SignUp Form */}
      <div className="form-panel">
        <button className="close-button-top" onClick={() => router.back()}>
          <X size={20} />
        </button>
        <div className="form-card animate-in fade-in slide-in-from-right duration-700 delay-300">
          <SignUpTemplate />
        </div>
      </div>

      <style jsx>{`
        .signup-section-container {
          display: flex;
          width: 100%;
          max-width: 940px;
          min-height: 580px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .brand-panel {
          flex: 1;
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(237,237,239,0.5) 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .brand-content {
          width: 100%;
          max-width: 400px;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .logo-wrapper {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .brand-logo {
          object-fit: contain;
        }

        .welcome-title {
          font-family: var(--font-accent);
          font-size: 36px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .welcome-desc {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .product-visual {
          position: relative;
          margin-top: 20px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          height: 350px;
        }

        .product-image {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 20px 30px rgba(0,0,0,0.15));
          transform: translateY(-20px);
          transition: transform 0.5s ease;
        }

        .signup-section-container:hover .product-image {
          transform: translateY(-30px) scale(1.02);
        }

        /* Floating Badges */
        .badge-float {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          padding: 12px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
          transition: all 0.4s ease;
          z-index: 3;
        }

        .badge-float:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 12px 25px rgba(0,0,0,0.1);
        }

        .badge-icon {
          width: 36px;
          height: 36px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .badge-text {
          display: flex;
          flex-direction: column;
          text-align: left;
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.2;
        }

        .badge-1 { top: 300px; left: -20px; }
        .badge-2 { top: 340px; right: -20px; }
        .badge-3 { bottom: 60px; right: 20px; }

        /* Right Panel */
        .form-panel {
          flex: 1;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 30px;
        }

        .form-card {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          transform: translateY(0);
          transition: transform 0.4s ease;
        }

        .form-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
        }

        .close-button-top {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5f5f7;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          z-index: 10;
        }

        .close-button-top:hover {
          background: #eeeeee;
          color: var(--text-main);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .brand-panel {
            display: none;
          }
          .signup-section-container {
            width: 100%;
            max-width: 440px;
            min-height: auto;
            border-radius: 24px;
          }
          .form-panel {
            padding: 16px !important;
          }
          .form-card {
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpSection;
