import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import is from 'is-lite';

import { canUseDOM, portalId } from '../modules/helpers';
import { useMount, useUnmount } from '../modules/hooks';
import { Placement, SelectorOrElement } from '../types';

interface Props {
  children: ReactNode;
  hasChildren: boolean;
  internalId: string;
  placement: Placement;
  portalElement?: SelectorOrElement;
  target?: SelectorOrElement;
  zIndex: string | number;
}

export default function ReactFloaterPortal(props: Props) {
  const { children, hasChildren, internalId, placement, portalElement, target, zIndex } = props;
  const node = useRef<HTMLElement | null>(null);

  const initialize = useCallback(() => {
    if (!canUseDOM()) {
      return;
    }

    if (portalElement) {
      node.current = is.string(portalElement)
        ? (document.querySelector(portalElement) as HTMLElement)
        : portalElement;
    }

    if (!portalElement || !node.current) {
      const portal = document.getElementById(portalId);

      if (portal) {
        const ids: string[] = portal.dataset.ids?.split(',').filter(Boolean) ?? [];

        if (!ids.includes(internalId) && internalId) {
          ids.push(internalId);
        }

        portal.dataset.ids = ids.join(',');
        node.current = portal;
      } else {
        node.current = document.createElement('div');
        node.current.id = portalId;
        node.current.dataset.ids = internalId;
        node.current.style.zIndex = `${zIndex}`;

        document.body.appendChild(node.current);
      }
    }

    if (!portalElement && !document.getElementById(portalId)) {
      if (node.current) {
        document.body.appendChild(node.current);
      }
    }
  }, [internalId, portalElement, zIndex]);

  useMount(() => {
    if (!canUseDOM) {
      return;
    }

    initialize();
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useUnmount(() => {
    if (!canUseDOM() || !node.current) {
      return;
    }

    try {
      if (node.current.id === portalId) {
        const ids: string[] = node.current.dataset.ids?.split(',') ?? [];

        if (ids.includes(internalId)) {
          node.current.dataset.ids = ids.filter(id => id !== internalId).join(',');
        }

        if (ids.length <= 1) {
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
