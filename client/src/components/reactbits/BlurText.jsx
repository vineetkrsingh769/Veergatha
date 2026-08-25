import { useEffect, useRef, useState } from "react";

/**
 * BlurText - Respectful, smooth character/word blur-and-fade text reveal.
 * ReactBits component tailored for solemn hero headings.
 */
export default function BlurText({
  text = "",
  className = "",
  delay = 150,
  animateBy = "words", // "words" or "letters"
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {elements.map((element, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            filter: inView ? "blur(0px)" : "blur(8px)",
            transform: inView ? "translateY(0px)" : "translateY(10px)",
            transitionDelay: `${index * delay}ms`,
            marginRight: animateBy === "words" ? "0.3em" : "0.05em",
          }}
        >
          {element}
        </span>
      ))}
    </span>
  );
}
