import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { canUseDOM } from '../utils';

import { PlacementOptions, SelectorOrElement } from '../types';

interface Props {
  children: React.ReactNode;
  hasChildren: boolean;
  id?: string;
  placement: PlacementOptions;
  target?: SelectorOrElement;
  zIndex: string | number;
}

export default class ReactFloaterPortal extends React.PureComponent<Props> {
  readonly node?: HTMLDivElement;

  constructor(props: Props) {
    super(props);

    if (!canUseDOM) return;

    this.node = document.createElement('div');

    if (props.id) {
      this.node.id = props.id;
    }

    if (props.zIndex) {
      this.node.style.zIndex = `${props.zIndex}`;
    }

    document.body.appendChild(this.node);
  }

  componentWillUnmount(): void {
    if (!canUseDOM || !this.node) return;

    document.body.removeChild(this.node);
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
