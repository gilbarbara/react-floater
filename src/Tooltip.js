import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { canUseDOM, isReact16 } from './utils';

export default class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    if (!canUseDOM) return;

    this.node = document.createElement('div');
    if (props.id) {
      this.node.id = props.id;
    }

    document.body.appendChild(this.node);
  }

  static propTypes = {
    children: PropTypes.node,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    placement: PropTypes.string,
    setRef: PropTypes.func.isRequired,
    status: PropTypes.string,
    target: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
    tooltip: PropTypes.element.isRequired,
    wrapper: PropTypes.element.isRequired,
  };

  componentDidMount() {
    if (!canUseDOM) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentWillReceiveProps(prevProps) {
    if (!canUseDOM) return;

    const { placement, status } = this.props;

    if (
      !isReact16
      && (prevProps.status !== status || prevProps.placement !== placement)
    ) {
      this.renderPortal();
    }
  }

  componentWillUnmount() {
    if (!canUseDOM || !this.node) return;

    if (!isReact16) {
      ReactDOM.unmountComponentAtNode(this.node);
    }

    document.body.removeChild(this.node);
  }

  renderPortal() {
    if (!canUseDOM) return null;

    const { tooltip, setRef } = this.props;

    if (isReact16) {
      return ReactDOM.createPortal(
        tooltip,
        this.node,
      );
    }

    const portal = ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      tooltip,
      this.node,
    );

    setRef(portal);

    return null;
  }

  renderReact15() {
    const { children, wrapper } = this.props;

    if (!children) {
      return null;
    }

    return wrapper;
  }

  renderReact16() {
    const { children, placement, target, wrapper } = this.props;

    if (!children) {
      if ((target || placement === 'center')) {
        return this.renderPortal();
      }

      return null;
    }

    return ([
      wrapper,
      this.renderPortal()
    ]);
  }

  render() {
    if (!isReact16) {
      return this.renderReact15();
    }

    return this.renderReact16();
  }
}
