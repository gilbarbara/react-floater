import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Popper from 'popper.js';
import deepmerge from 'deepmerge';

import stylesDefault from './styles';

const devNull = () => {};

export default class ReactTooltips extends React.Component {
  constructor(props) {
    super(props);

    this.portal = document.createElement('div');
    this.state = {
      isActive: false,
      currentPlacement: props.placement,
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
    placement: PropTypes.oneOf([
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
      'auto'
    ]),
    showOverlay: PropTypes.bool,
    styles: PropTypes.object,
  };

  static defaultProps = {
    animate: true,
    autoShow: false,
    callback: devNull,
    event: 'click',
    lazyHover: false,
    onClick: devNull,
    onHover: devNull,
    placement: 'top',
    showOverlay: false,
    styles: {},
  };

  componentDidMount() {
    const { placement } = this.props;

    document.body.appendChild(this.portal);

    this.popper = new Popper(this.target, this.tooltip, {
      placement,
      modifiers: {
        arrow: {
          element: this.arrow,
        },
        offset: {
          offset: 10,
        },
      },
      onCreate: (instance) => {
        console.log(instance);
        if (instance.placement !== this.state.currentPlacement) {
          this.setState({ currentPlacement: instance.placement });
        }
      },
      onUpdate: (instance) => {
        if (instance.placement !== this.state.currentPlacement) {
          this.setState({ currentPlacement: instance.placement });
        }
      }
    });

    console.log(this.popper);
  }

  componentWillUnmount() {
    document.body.removeChild(this.portal);
  }

  get styles() {
    const { styles } = this.props;

    return deepmerge(stylesDefault, styles);
  }

  get tooltipLayout() {
    const { currentPlacement } = this.state;
    let padding;

    if (currentPlacement.startsWith('top')) {
      padding = `0 0 ${this.styles.arrow.height}px`;
    }
    else if (currentPlacement.startsWith('bottom')) {
      padding = `${this.styles.arrow.height}px 0 0`;
    }
    else if (currentPlacement.startsWith('left')) {
      padding = `0 ${this.styles.arrow.height}px 0 0`;
    }
    else if (currentPlacement.startsWith('right')) {
      padding = `0 0 0 ${this.styles.arrow.height}px`;
    }

    return {
      ...this.styles.tooltip,
      padding,
    };
  }

  get arrowLayout() {
    const { currentPlacement } = this.state;
    let styles = {};
    console.log('arrowLayout');
    if (currentPlacement.startsWith('top')) {
      styles = {
        bottom: this.styles.arrow.height,
        left: 0,
        right: 0,
      };
    }
    else if (currentPlacement.startsWith('bottom')) {
      styles = {
        top: 0,
        left: 0,
        right: 0,
      };
    }
    else if (currentPlacement.startsWith('left')) {
      styles = {
        right: this.styles.arrow.height,
        top: 0,
        bottom: 0,
      };
    }
    else if (currentPlacement.startsWith('right')) {
      styles = {
        left: this.styles.arrow.height,
        top: 0,
      };
    }

    return {
      ...this.styles.arrowWrapper,
      ...styles,
    };
  }

  get arrowIcon() {
    const { currentPlacement } = this.state;
    const { arrow } = this.styles;

    const { height, width } = arrow;
    const scale = width / 16;
    let rotate = '0';
    let x = width;
    let y = height;

    if (currentPlacement.startsWith('bottom')) {
      rotate = '180 8 4';
    }
    else if (currentPlacement.startsWith('left')) {
      y = width;
      x = height;
      rotate = '270 8 8';
    }
    else if (currentPlacement.startsWith('right')) {
      y = width;
      x = height;
      rotate = '90 4 4';
    }

    return (
      <span ref={c => (this.arrow = c)} style={{ position: 'absolute' }}>
        <svg
          width={x}
          height={y}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg">
          <polygon points="0, 0 8, 8 16,0" fill={arrow.color} transform={`scale(${scale}) rotate(${rotate})`} />
        </svg>
      </span>
    );
  }

  renderTooltip() {
    const { data = {} } = this.props;

    return (
      <div
        ref={c => (this.tooltip = c)}
        className="__tooltip"
        style={this.tooltipLayout}>
        <div className="__tooltip__content" style={this.styles.content}>
          {data.content}
        </div>
        <div

          className="__tooltip__arrow"
          style={this.arrowLayout}>
          {this.arrowIcon}
        </div>
      </div>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <span className="react__tooltips" ref={c => (this.target = c)} style={{ position: 'relative' }}>
        {children}
        {
          ReactDOM.createPortal(
            this.renderTooltip(),
            this.portal,
          )
        }
      </span>
    );
  }
}
