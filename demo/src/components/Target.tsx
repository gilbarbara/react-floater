import React, { useEffect } from 'react';
import Floater from 'react-floater';

export default React.forwardRef<HTMLDivElement, any>(({ onMount }, ref) => {
  useEffect(() => {
    onMount();
  }, [onMount]);

  return (
    <div ref={ref} className="target">
      <Floater content="I have a click event to my repo!" event="hover" placement="top">
        <a
          href="https://github.com/gilbarbara/react-floater"
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            alt="GitHub"
            className="github"
            src="https://cdn.svgporn.com/logos/github-icon.svg"
          />
        </a>
      </Floater>
    </div>
  );
});
