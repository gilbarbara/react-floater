import React, { useEffect } from 'react';
import Floater from 'react-floater';
import { Anchor } from '@gilbarbara/components';

export default React.forwardRef<HTMLDivElement, any>(({ onMount }, ref) => {
  useEffect(() => {
    onMount();
  }, [onMount]);

  return (
    <div ref={ref} className="target">
      <Floater content="I have a click event to my repo!" event="hover" placement="top">
        <Anchor
          display="inline-flex"
          external
          height={64}
          href="https://github.com/gilbarbara/react-floater"
          width={64}
        >
          <img
            alt="GitHub"
            className="github"
            height={64}
            src="https://cdn.svgporn.com/logos/github-icon.svg"
            width={64}
          />
        </Anchor>
      </Floater>
    </div>
  );
});
