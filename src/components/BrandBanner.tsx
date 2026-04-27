import { PHOENIX_MOTTO, PHOENIX_TITLE } from "../version";

type BrandBannerProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export default function BrandBanner({
  eyebrow,
  title,
  subtitle,
  compact = false,
}: BrandBannerProps) {
  return (
    <section
      className={`phoenix-banner phoenix-banner-with-watermark ${
        compact ? "phoenix-banner-compact" : ""
      }`}
    >
      <div className="phoenix-banner-inner phoenix-banner-grid">
        <div>
          <p className="phoenix-kicker">{eyebrow}</p>
          <h1 className="phoenix-title">{title}</h1>
          {subtitle ? <p className="phoenix-subtitle">{subtitle}</p> : null}
        </div>

        <div className="banner-watermark-block" aria-hidden="true">
          <div className="banner-watermark-title">{PHOENIX_TITLE}</div>
          <div className="banner-watermark-motto">{PHOENIX_MOTTO}</div>
        </div>
      </div>
    </section>
  );
}