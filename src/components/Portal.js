import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { canUseDOM, isReact16 } from '../utils';

export default class ReactFloaterPortal extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
    hasChildren: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placement: PropTypes.string,
    setRef: PropTypes.func.isRequired,
    target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    zIndex: PropTypes.number,
  };

  componentDidMount() {
    if (!canUseDOM()) return;

    if (!this.node) {
      this.appendNode();
    }

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentDidUpdate() {
    if (!canUseDOM()) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentWillUnmount() {
    if (!canUseDOM() || !this.node) return;

    if (!isReact16) {
      ReactDOM.unmountComponentAtNode(this.node);
    }

    if (this.node && this.node.parentNode === document.body) {
      document.body.removeChild(this.node);
      this.node = undefined;
    }
  }

  appendNode() {
    const { id, zIndex } = this.props;

    if (!this.node) {
      this.node = document.createElement('div');

      /* istanbul ignore else */
      if (id) {
        this.node.id = id;
      }

      if (zIndex) {
        this.node.style.zIndex = zIndex;
      }

      document.body.appendChild(this.node);
    }
  }

  renderPortal() {
    if (!canUseDOM()) return null;

    const { children, setRef } = this.props;

    if (!this.node) {
      this.appendNode();
    }

    /* istanbul ignore else */
    if (isReact16) {
      return ReactDOM.createPortal(children, this.node);
    }

    const portal = ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      children.length > 1 ? <div>{children}</div> : children[0],
      this.node,
    );

    setRef(portal);

    return null;
  }

  renderReact16() {
    const { hasChildren, placement, target } = this.props;

    if (!hasChildren) {
      if (target || placement === 'center') {
        return this.renderPortal();
      }

      return null;
    }

    return this.renderPortal();
  }

  render() {
    if (!isReact16) {
      return null;
    }

    return this.renderReact16();
  }
}
