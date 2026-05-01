interface FloatingDotsProps {
  className?: string;
}

const dots = [
  { size: 10, top: "10%",  left: "8%",   delay: "0s",    opacity: 0.7 },
  { size: 7,  top: "25%",  left: "88%",  delay: "0.4s",  opacity: 0.5 },
  { size: 12, top: "60%",  left: "5%",   delay: "0.8s",  opacity: 0.6 },
  { size: 6,  top: "75%",  left: "90%",  delay: "1.2s",  opacity: 0.4 },
  { size: 9,  top: "45%",  left: "92%",  delay: "0.2s",  opacity: 0.55 },
  { size: 8,  top: "5%",   left: "70%",  delay: "1s",    opacity: 0.45 },
];

const FloatingDots = ({ className }: FloatingDotsProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className ?? ""}`}>
      {dots.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-km0-teal-500 animate-float"
          style={{
            width:  dot.size,
            height: dot.size,
            top:    dot.top,
            left:   dot.left,
            animationDelay:    dot.delay,
            animationDuration: `${3 + i * 0.4}s`,
            opacity: dot.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingDots;
