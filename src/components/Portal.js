import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { canUseDOM, isReact16 } from '../utils';

export default class ReactFloaterPortal extends React.Component {
  constructor(props) {
    super(props);

    if (!canUseDOM) return;

    /**
     * Portal to an existing DOM node.
     */
    const { nodeId } = this.props;
    this.node = nodeId ? document.getElementById(nodeId) : document.createElement('div');
    if (props.id && !nodeId) {
      this.node.id = props.id;
    }
    if (props.zIndex) {
      this.node.style.zIndex = props.zIndex;
    }
    /**
     * Append DOM node only if it's a newly created one.
     */
    if (!nodeId) document.body.appendChild(this.node);
  }

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
    hasChildren: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nodeId: PropTypes.string,
    placement: PropTypes.string,
    setRef: PropTypes.func.isRequired,
    target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    zIndex: PropTypes.number,
  };

  componentDidMount() {
    if (!canUseDOM) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentDidUpdate() {
    if (!canUseDOM) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentWillUnmount() {
    if (!canUseDOM || !this.node) return;

    const { nodeId } = this.props;

    if (!isReact16 && !nodeId) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
    /**
     * If it's an existing DOM node, don't remove it.
     */
    if (!nodeId) document.body.removeChild(this.node);
  }

  renderPortal() {
    if (!canUseDOM) return null;

    const { children, setRef } = this.props;

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
