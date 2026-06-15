'use client';

import React, { useState } from 'react';
import { Ruler, ShieldCheck, Truck, Headphones, CreditCard } from 'lucide-react';
import CalcSize from '@/components/shop/CalcSize';

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface ProductFeature {
  title: string;
  description: string;
}

interface ProductSpec {
  label: string;
  value: string;
}

interface SizeGuideRow {
  size: number;
  length: number;
  width: number | string;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

interface DetailData {
  title: string;
  description: string;
  features: ProductFeature[];
  specs: ProductSpec[];
  sizeGuide: SizeGuideRow[];
  reviews: ReviewItem[];
  commitments: { icon: React.ReactNode; title: string; description: string }[];
}

const MOCK_DETAIL: DetailData = {
  title: 'Derby Mũi Tròn – Phong Cách Tối Giản, Lịch Lãm',
  description:
    'Derby Mũi Tròn DKB082 là sự kết hợp hoàn hảo giữa thiết kế cổ điển và chất liệu cao cấp, mang đến vẻ đẹp lịch lãm, dễ phối đồ cho mọi quý ông.',
  features: [
    {
      title: 'Thiết kế cổ điển',
      description: 'Form dáng chuẩn, ôm chân, tôn lên phong thái nam tính.',
    },
    {
      title: 'Chất liệu cao cấp',
      description: 'Da PU mềm mại, bền đẹp, dễ dàng vệ sinh và bảo quản.',
    },
    {
      title: 'Đế cao su chống trượt',
      description: 'Đế cao 4cm, chống trượt, tăng chiều cao tự nhiên.',
    },
    {
      title: 'Dễ dàng phối đồ',
      description: 'Phù hợp với quần tây, jeans, kaki trong nhiều dịp.',
    },
  ],
  specs: [
    { label: 'Chất da', value: 'Da PU cao cấp' },
    { label: 'Chiều cao đế', value: '4cm' },
    { label: 'Màu sắc', value: 'Đen' },
    { label: 'Xuất xứ', value: 'Trung Quốc' },
    { label: 'Bảo hành', value: 'Keo trọn đời' },
    { label: 'Đổi trả', value: '7 ngày' },
  ],
  sizeGuide: [
    { size: 34, length: 22, width: '8-8.5' },
    { size: 35, length: 22.5, width: '8.5' },
    { size: 36, length: 23, width: '8.5-9' },
    { size: 37, length: 23.5, width: '9' },
    { size: 38, length: 24, width: '9-9.5' },
    { size: 39, length: 24.5, width: '9.5' },
    { size: 40, length: 25, width: '9.5-10' },
    { size: 41, length: 25.5, width: '10' },
    { size: 42, length: 26, width: '10-10.5' },
    { size: 43, length: 26.5, width: '10.5' },
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Nguyễn Văn A',
      rating: 5,
      date: '15/01/2025',
      content: 'Giày đẹp, đúng size, giao hàng nhanh. Sẽ ủng hộ shop tiếp!',
    },
    {
      id: 'r2',
      author: 'Trần Minh B',
      rating: 4,
      date: '10/01/2025',
      content: 'Chất lượng tốt so với giá tiền, da mềm, đi êm chân.',
    },
    {
      id: 'r3',
      author: 'Lê Hoàng C',
      rating: 5,
      date: '05/01/2025',
      content: 'Mẫu này phối đồ công sở rất đẹp, đồng nghiệp khen nhiều.',
    },
  ],
  commitments: [],
};

const COMMITMENTS = [
  {
    icon: <ShieldCheck size={24} />,
    title: '1. Sản phẩm chính hãng',
    description: 'Cam kết 100% hàng chính hãng DUKY STORE.',
  },
  {
    icon: <Truck size={24} />,
    title: '2. Giao hàng nhanh chóng',
    description: 'Giao hàng toàn quốc, nhận hàng từ 1-3 ngày.',
  },
  {
    icon: <Headphones size={24} />,
    title: '3. Hỗ trợ tận tình',
    description: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7.',
  },
  {
    icon: <CreditCard size={24} />,
    title: '4. Thanh toán linh hoạt',
    description: 'Nhiều hình thức thanh toán an toàn, tiện lợi.',
  },
];

// ─── Tabs ───────────────────────────────────────────────────────────────────

type TabKey = 'description' | 'additional';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'MÔ TẢ SẢN PHẨM' },
  { key: 'additional', label: 'THÔNG TIN BỔ SUNG' },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface DetailSectionProps {
  data?: DetailData;
  description?: string;
}

const DetailSection: React.FC<DetailSectionProps> = ({ data = MOCK_DETAIL, description }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [showSizeCalc, setShowSizeCalc] = useState(false);

  const renderDescription = () => {
    if (!description) {
      return <p className="detail-desc-text">{data.description}</p>;
    }

    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(description);
    if (hasHtml) {
      return (
        <div
          className="detail-desc-text html-content"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }

    return <p className="detail-desc-text">{description}</p>;
  };

  return (
    <section className="detail-section">
      {/* Tabs */}
      <div className="detail-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`detail-tab ${activeTab === tab.key ? 'detail-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="detail-tab-content">
        {activeTab === 'description' && (
          <div className="detail-description-layout">
            {/* Left: Description & Features */}
            <div className="detail-desc-left">
              {!description && <h3 className="detail-desc-title">{data.title}</h3>}
              {renderDescription()}

              <div className="detail-features">
                {data.features.map((feature, index) => (
                  <div key={index} className="detail-feature-item">
                    <div className="detail-feature-icon">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="detail-feature-content">
                      <span className="detail-feature-title">{feature.title}</span>
                      <span className="detail-feature-desc">{feature.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Size Guide */}
            <div className="detail-desc-right">
              <h4 className="detail-size-title">HƯỚNG DẪN CHỌN SIZE</h4>
              <div className="detail-size-table-wrapper">
              <table className="detail-size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chiều dài (cm)</th>
                    <th>Chiều ngang (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sizeGuide.map((row, index) => (
                    <tr key={index}>
                      <td>{row.size}</td>
                      <td>{row.length}</td>
                      <td>{row.width}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <button className="detail-size-guide-btn" onClick={() => setShowSizeCalc(!showSizeCalc)}>
                <Ruler size={16} />
                <span>ĐO SIZE CỦA BẠN</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="detail-additional">
            <table className="detail-specs-table detail-specs-table-full">
              <tbody>
                {data.specs.map((spec, index) => (
                  <tr key={index} className="detail-specs-row">
                    <td className="detail-specs-label">{spec.label}</td>
                    <td className="detail-specs-value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Size Calculator */}
      {showSizeCalc && (
        <div className="detail-size-calc">
          <CalcSize />
        </div>
      )}

      {/* Commitments Strip */}
      <div className="detail-commitments">
        {COMMITMENTS.map((item, index) => (
          <div key={index} className="detail-commitment-item">
            <div className="detail-commitment-icon">{item.icon}</div>
            <div className="detail-commitment-content">
              <span className="detail-commitment-title">{item.title}</span>
              <span className="detail-commitment-desc">{item.description}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .detail-section {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem;
        }

        /* ─── Tabs ─── */
        .detail-tabs {
          display: flex;
          align-items: center;
          gap: 0;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 32px;
        }

        .detail-tab {
          padding: 14px 28px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-fast);
          text-transform: uppercase;
        }
        .detail-tab:hover {
          color: var(--text-main);
        }
        .detail-tab-active {
          color: var(--text-main);
          border-bottom-color: var(--accent-black);
        }

        /* ─── Tab Content ─── */
        .detail-tab-content {
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 32px;
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        /* ─── Description Layout (stacked vertically) ─── */
        .detail-description-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Left Column */
        .detail-desc-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-desc-title {
          font-family: var(--font-accent);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.3;
        }

        .detail-desc-text {
          font-family: var(--font-main);
          font-size: 15px;
          color: #2d2d2d;
          line-height: 1.9;
        }

        :global(.html-content h1) {
          font-family: var(--font-accent) !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          color: var(--text-main) !important;
          line-height: 1.35 !important;
          margin-top: 0 !important;
          margin-bottom: 20px !important;
        }

        :global(.html-content h2) {
          font-family: var(--font-accent) !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          color: var(--text-main) !important;
          line-height: 1.4 !important;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
        }

        :global(.html-content h3) {
          font-family: var(--font-accent) !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          color: var(--text-main) !important;
          line-height: 1.4 !important;
          margin-top: 24px !important;
          margin-bottom: 12px !important;
        }

        :global(.html-content p) {
          font-family: var(--font-main) !important;
          font-size: 15px !important;
          color: #2d2d2d !important;
          line-height: 1.9 !important;
          margin-bottom: 18px !important;
        }

        :global(.html-content figure) {
          max-width: 480px !important;
          width: 100% !important;
          margin: 28px auto !important;
          float: none !important;
        }

        :global(.html-content img) {
          max-width: 480px !important;
          width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
          border-radius: 12px !important;
        }

        :global(.html-content figcaption) {
          margin-top: 10px !important;
          text-align: center !important;
          font-size: 13px !important;
          color: var(--text-muted) !important;
          font-style: italic !important;
        }

        :global(.html-content ul) {
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin-bottom: 18px !important;
        }

        :global(.html-content ol) {
          list-style-type: decimal !important;
          padding-left: 24px !important;
          margin-bottom: 18px !important;
        }

        :global(.html-content li) {
          font-family: var(--font-main) !important;
          font-size: 15px !important;
          color: #2d2d2d !important;
          line-height: 1.9 !important;
          margin-bottom: 8px !important;
        }

        :global(.html-content li p) {
          margin-bottom: 0 !important;
          display: inline !important;
        }

        .detail-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }

        .detail-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          flex-shrink: 0;
        }

        .detail-feature-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-feature-title {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }

        .detail-feature-desc {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }



        .detail-specs-title {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--text-main);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .detail-specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .detail-specs-table-full {
          max-width: 600px;
        }

        .detail-specs-row td {
          padding: 10px 0;
          border-bottom: 1px solid var(--border-subtle);
          font-family: var(--font-main);
          font-size: 13px;
        }

        .detail-specs-label {
          color: var(--text-muted);
          font-weight: 500;
          width: 40%;
        }

        .detail-specs-value {
          color: var(--text-main);
          font-weight: 600;
        }

        /* Right Column - Size Guide (stacked below description) */
        .detail-desc-right {
          border-top: 1px solid var(--border-subtle);
          padding-top: 32px;
        }

        .detail-size-title {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--text-main);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .detail-size-table {
          width: 100%;
          border-collapse: collapse;
        }

        .detail-size-table-wrapper {
          max-width: 600px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 20px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
        }

        .detail-size-table th {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: center;
          padding: 8px 4px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .detail-size-table td {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          text-align: center;
          padding: 8px 4px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .detail-size-guide-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: 1.5px solid var(--text-main);
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .detail-size-guide-btn:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }

        /* ─── Additional Tab ─── */
        .detail-additional {
          padding: 8px 0;
        }

        /* ─── Reviews Tab ─── */
        .detail-reviews {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-review-item {
          padding: 16px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .detail-review-item:last-child {
          border-bottom: none;
        }

        .detail-review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .detail-review-author {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .detail-review-date {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--text-label);
        }

        .detail-review-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 8px;
        }

        .star-filled {
          color: #f4b400;
          font-size: 14px;
        }
        .star-empty {
          color: var(--border-subtle);
          font-size: 14px;
        }

        .detail-review-text {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* ─── Size Calculator ─── */
        .detail-size-calc {
          margin-top: 16px;
        }

        /* ─── Commitments Strip ─── */
        .detail-commitments {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 32px;
          padding: 24px;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        .detail-commitment-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-commitment-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          flex-shrink: 0;
        }

        .detail-commitment-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .detail-commitment-title {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }

        .detail-commitment-desc {
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .detail-description-layout {
            gap: 24px;
          }
          .detail-desc-right {
            padding-top: 24px;
          }
          .detail-commitments {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .detail-section {
            padding: 24px 1rem;
          }
          .detail-tabs {
            overflow-x: auto;
          }
          .detail-tab {
            padding: 12px 16px;
            font-size: 12px;
            white-space: nowrap;
          }
          .detail-tab-content {
            padding: 20px 16px;
          }
          .detail-commitments {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default DetailSection;
