import * as React from 'react';
import { createPortal } from 'react-dom';
import is from 'is-lite';

import { canUseDOM, portalId } from '../modules/helpers';
import { useMount, useSingleton, useUnmount } from '../modules/hooks';
import { PlacementOptions, SelectorOrElement } from '../types';

interface Props {
  children: React.ReactNode;
  hasChildren: boolean;
  placement: PlacementOptions;
  portalElement?: SelectorOrElement;
  target?: SelectorOrElement;
  zIndex: string | number;
}

function ReactFloaterPortal(props: Props): JSX.Element | null {
  const { children, hasChildren, placement, portalElement, target, zIndex } = props;
  const node = React.useRef<HTMLElement | null>(null);

  const initialize = React.useCallback(() => {
    if (!canUseDOM) {
      return;
    }

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
        node.current.style.zIndex = `${zIndex}`;

        document.body.appendChild(node.current);
      }
    }
  }, [portalElement, zIndex]);

  useSingleton(initialize);

  useMount(() => {
    if (!portalElement && !document.getElementById(portalId)) {
      if (node.current) {
        document.body.appendChild(node.current);
      } else {
        initialize();
      }
    }
  });

  useUnmount(() => {
    if (!canUseDOM || !node.current) {
      return;
    }

    try {
      if (node.current.id === portalId && node.current.childElementCount === 0) {
        if (document.body.contains(node.current)) {
          document.body.removeChild(node.current);
          node.current = null;
        }
      }
    } catch {
      node.current = null;
    }
  });

  if (node.current) {
    if (!hasChildren && !target && placement !== 'center') {
      return null;
    }

    return createPortal(children, node.current);
  }

  return null;
}

export default ReactFloaterPortal;
