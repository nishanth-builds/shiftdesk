

export default function Dots({ step, total }) {
  return (
    <div className="dots" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < step ? "on" : ""} />)}
      <span>Step {step} of {total}</span>
    </div>
  );
}

