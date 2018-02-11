import React from 'react';
import PropTypes from 'prop-types';

export default class Wrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    handleClick: PropTypes.func.isRequired,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    setChildRef: PropTypes.func.isRequired,
    setWrapperRef: PropTypes.func.isRequired,
    style: PropTypes.object,
    styles: PropTypes.object.isRequired,
  };

  render() {
    const {
      children,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
      setChildRef,
      setWrapperRef,
      style,
      styles,
    } = this.props;
    let element;

    /* istanbul ignore else */
    if (children) {
      if (React.Children.count(children) === 1) {
        if (!React.isValidElement(children)) {
          element = <span>{children}</span>;
        }
        else {
          const refProp = typeof children.type === 'function' ? 'innerRef' : 'ref';
          element = React.cloneElement(React.Children.only(children), {
            [refProp]: setChildRef
          });
        }
      }
      else {
        element = children;
      }
    }

    if (!element) {
      return null;
    }

    return (
      <span
        ref={setWrapperRef}
        style={{ ...styles, ...style }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {element}
      </span>
    );
  }
}
