import * as React from 'react';
import * as ReactDOM from 'react-dom';
import is from 'is-lite';
import { canUseDOM, portalId, useSingleton } from '../utils';

import { PlacementOptions, SelectorOrElement } from '../types';

interface Props {
  children: React.ReactNode;
  hasChildren: boolean;
  placement: PlacementOptions;
  portalElement?: SelectorOrElement;
  target?: SelectorOrElement;
  zIndex: string | number;
}

function FloaterPortal(props: Props): JSX.Element | null {
  const { children, hasChildren, placement, portalElement, target, zIndex } = props;
  const node = React.useRef<HTMLElement | null>(null);

  const initialize = React.useCallback(() => {
    if (!canUseDOM) return;

    if (portalElement) {
      node.current = is.string(portalElement)
        ? (document.querySelector(portalElement) as HTMLElement)
        : portalElement;
    }

    if (!portalElement || !node.current) {
      const portal = document.getElementById('react-floater-portal');

      if (portal) {
        node.current = portal;
      } else {
        node.current = document.createElement('div');
        node.current.id = portalId;

        if (zIndex) {
          node.current.style.zIndex = `${zIndex}`;
        }

        document.body.appendChild(node.current);
      }
    }
  }, [portalElement, zIndex]);

  useSingleton(initialize);

  React.useEffect(() => {
    if (!portalElement && !document.getElementById(portalId)) {
      if (node.current) {
        document.body.appendChild(node.current);
      } else {
        initialize();
      }
    }
  });

  React.useEffect(() => {
    return () => {
      if (!canUseDOM || !node) return;
      try {
        if (node.current && node.current.id === portalId && node.current.childElementCount === 0) {
          if (document.body.contains(node.current)) {
            document.body.removeChild(node.current);
            node.current = null;
          }
        }
      } catch (error) {
        node.current = null;
      }
    };
  }, []);

  if (node.current) {
    if (!hasChildren && !target && placement !== 'center') {
      return null;
    }

    return ReactDOM.createPortal(children, node.current);
  }

  return null;
}

export default FloaterPortal;
