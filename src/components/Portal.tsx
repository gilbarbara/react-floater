import * as React from 'react';
import * as ReactDOM from 'react-dom';
import is from 'is-lite';
import { canUseDOM, portalId } from '../utils';

import { PlacementOptions, SelectorOrElement } from '../types';

interface Props {
  children: React.ReactNode;
  hasChildren: boolean;
  placement: PlacementOptions;
  portalElement?: SelectorOrElement;
  target?: SelectorOrElement;
  zIndex: string | number;
}

export default class ReactFloaterPortal extends React.PureComponent<Props> {
  readonly node?: HTMLElement;

  constructor(props: Props) {
    super(props);
    const { portalElement, zIndex } = props;

    if (!canUseDOM) return;

    if (portalElement) {
      this.node = is.string(portalElement)
        ? (document.querySelector(portalElement) as HTMLElement)
        : portalElement;
    }

    if (!portalElement || !this.node) {
      const portal = document.getElementById('react-floater-portal');

      if (portal) {
        this.node = portal;
      } else {
        this.node = document.createElement('div');
        this.node.id = portalId;

        if (zIndex) {
          this.node.style.zIndex = `${zIndex}`;
        }

        document.body.appendChild(this.node);
      }
    }
  }

  componentWillUnmount(): void {
    if (!canUseDOM || !this.node) return;

    if (this.node.id === portalId && this.node.childElementCount <= 1) {
      document.body.removeChild(this.node);
    }
  }

  render(): React.ReactPortal | null {
    const { children, hasChildren, placement, target } = this.props;

    if (this.node) {
      if (!hasChildren && !target && placement !== 'center') {
        return null;
      }

      return ReactDOM.createPortal(children, this.node);
    }

    return null;
  }
}
