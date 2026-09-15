import { useEffect, useRef } from "react";

export default function CalendlyBooking() {
  const container = useRef(null);
  useEffect(() => {
    let active = true;
    const initialize = () => {
      if (!active || !container.current || !window.Calendly) return;
      container.current.replaceChildren();
      window.Calendly.initInlineWidget({
        url: "https://calendly.com/moneze-support/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=07163d&primary_color=087be5",
        parentElement: container.current,
      });
    };
    let script = document.querySelector('script[data-calendly-widget]');
    if (window.Calendly) initialize();
    else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        script.dataset.calendlyWidget = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", initialize);
    }
    return () => { active = false; script?.removeEventListener("load", initialize); };
  }, []);
  return <div ref={container} className="calendly-frame" aria-label="Book a Moneze financial consultation" />;
}
