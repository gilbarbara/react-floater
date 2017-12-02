import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Popper from 'popper.js';

const devNull = () => {};

export default class ReactTooltips extends React.Component {
  constructor(props) {
    super(props);

    this.tooltip = document.createElement('div');
    this.state = {
      isOpen: false,
    };
  }

  static propTypes = {
    animate: PropTypes.bool,
    autoOpen: PropTypes.bool,
    callback: PropTypes.func,
    children: PropTypes.node.isRequired,
    event: PropTypes.oneOf([
      'hover', 'click'
    ]),
    data: PropTypes.shape({
      title: PropTypes.node,
      content: PropTypes.node.isRequired,
      footer: PropTypes.node,
    }).isRequired,
    lazyHover: PropTypes.bool,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    position: PropTypes.oneOf([
      'top', 'top-left', 'top-right',
      'bottom', 'bottom-left', 'bottom-right',
      'right', 'left', 'center'
    ]),
    showOverlay: PropTypes.bool,
  };

  static defaultProps = {
    animate: true,
    autoShow: false,
    callback: devNull,
    event: 'click',
    lazyHover: false,
    onClick: devNull,
    onHover: devNull,
    position: 'bottom',
    showOverlay: false,
  };

  componentDidMount() {
    document.body.appendChild(this.tooltip);

    const tooltip = document.querySelector('.__tooltip');
    console.log(this.element.getBoundingClientRect());

    const position = new Popper(this.element, tooltip, {
      placement: 'bottom middle',
    });

    console.log(position);
  }

  componentWillUnmount() {
    document.body.removeChild(this.tooltip);
  }

  render() {
    const { children } = this.props;

    return (
      <span className="react__tooltips" ref={c => (this.element = c)} style={{ position: 'relative' }}>
        {children}
        lllll
        {
          ReactDOM.createPortal(
            <div className="__tooltip">portal</div>,
            this.tooltip,
          )
        }
      </span>
    );
  }
}
