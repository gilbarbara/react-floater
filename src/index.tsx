import is from 'is-lite';

import Floater from './components/Floater';
import Portal from './components/Portal';
import Wrapper from './components/Wrapper';
import { canUseDOM } from './modules/helpers';
import { useFloater } from './modules/useFloater';
import { Props } from './types';

function FloaterComponent(props: Props) {
  const {
    arrowElement,
    arrowRef,
    childRef,
    children,
    component,
    content,
    currentPlacement,
    currentStyles,
    floaterRef,
    footer,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleWrapperMount,
    hideArrow,
    id,
    internalId,
    open,
    portalElement,
    positionWrapper,
    showCloseButton,
    status,
    style,
    target,
    title,
    wrapperRef,
  } = useFloater(props);

  const wrapper = (
    <Wrapper
      childRef={childRef}
      id={id ?? internalId}
      isControlled={is.boolean(open)}
      onClick={handleClick}
      onMount={handleWrapperMount}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      status={status}
      style={style}
      styles={currentStyles.wrapper}
      wrapperRef={wrapperRef}
    >
      {children}
    </Wrapper>
  );

  return (
    <>
      <Portal
        hasChildren={!!children}
        internalId={internalId}
        placement={currentPlacement}
        portalElement={portalElement}
        target={target}
        zIndex={currentStyles.options.zIndex}
      >
        <Floater
          arrow={arrowElement}
          arrowRef={arrowRef}
          component={component}
          content={content}
          floaterRef={floaterRef}
          footer={footer}
          hideArrow={hideArrow || currentPlacement === 'center'}
          id={id ?? internalId}
          onClick={handleClick}
          placement={currentPlacement}
          positionWrapper={positionWrapper}
          showCloseButton={showCloseButton}
          status={status}
          styles={currentStyles}
          title={title}
        />
        {positionWrapper && wrapper}
      </Portal>
      {!positionWrapper && wrapper}
    </>
  );
}

export default function ReactFloater(props: Props) {
  if (!canUseDOM()) {
    return null;
  }

  return <FloaterComponent {...props} />;
}

export type {
  Action,
  CustomComponentProps,
  Placement,
  PopperInstance,
  Props,
  Styles,
} from './types';
