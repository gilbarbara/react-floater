import { forwardRef, useEffect } from 'react';
import Floater from 'react-floater';

const Target = forwardRef<HTMLDivElement, any>(({ onMount }, ref) => {
  useEffect(() => {
    onMount();
  }, [onMount]);

  return (
    <div ref={ref} className="target" style={{ height: 64, width: 64, margin: '0 auto' }}>
      <Floater content="I have a click event to my repo!" event="hover" placement="top">
        <a
          className="inline-flex h-16 w-16"
          href="https://github.com/gilbarbara/react-floater"
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            alt="GitHub"
            className="github"
            height={64}
            src="https://cdn.svgporn.com/logos/github-icon.svg"
            width={64}
          />
        </a>
      </Floater>
    </div>
  );
});

export default Target;
