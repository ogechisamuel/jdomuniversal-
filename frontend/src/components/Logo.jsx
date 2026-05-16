import { Link } from "react-router-dom";
import { COMPANY } from "@/lib/company";

/**
 * JDOM logo component. Renders the real logo image on a white card
 * (so it pops on dark navy backgrounds where the logo's white bg blends in).
 *
 * Props:
 *  - size: tailwind size for the square wrapper (default h-10 w-10)
 *  - withWordmark: also show "JDOM UNIVERSAL CONCEPT LTD" text next to it
 *  - wordmarkClassName: classes for the wordmark
 *  - to: link target ("/" by default; pass null to render without a link)
 */
export default function Logo({
  size = "h-11 w-11",
  withWordmark = true,
  wordmarkClassName = "font-heading font-extrabold text-base tracking-wide text-white",
  to = "/",
  wrapperClassName = "",
  testId = "jdom-logo",
}) {
  const inner = (
    <span className={`flex items-center gap-3 ${wrapperClassName}`} data-testid={testId}>
      <span className={`${size} rounded-md bg-white p-1 flex items-center justify-center shadow-sm shrink-0`}>
        <img src={COMPANY.logo} alt={COMPANY.name} className="h-full w-full object-contain" />
      </span>
      {withWordmark && (
        <span className={wordmarkClassName}>
          JDOM <span className="text-gold">UNIVERSAL CONCEPT LTD</span>
        </span>
      )}
    </span>
  );
  if (to === null) return inner;
  return <Link to={to} className="inline-flex items-center group">{inner}</Link>;
}
