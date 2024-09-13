import { isValidElement, ReactNode } from 'react';
import is from 'is-lite';

import { CloseFunction, Styles } from '../../types';

import CloseButton from './CloseButton';

interface Props {
  content: ReactNode;
  footer?: ReactNode;
  onClick: CloseFunction<HTMLButtonElement>;
  open?: boolean;
  positionWrapper: boolean;
  showCloseButton?: boolean;
  styles: Styles;
  title?: ReactNode;
}

export default function FloaterContainer(props: Props) {
  const { content, footer, onClick, open, positionWrapper, showCloseButton, styles, title } = props;

  const output: Record<string, ReactNode> = {
    content: isValidElement(content) ? (
      content
    ) : (
      <div className="__floater__content" style={styles.content}>
        {content}
      </div>
    ),
  };

  if (title) {
    output.title = isValidElement(title) ? (
      title
    ) : (
      <div className="__floater__title" style={styles.title}>
        {title}
      </div>
    );
  }

  if (footer) {
    output.footer = isValidElement(footer) ? (
      footer
    ) : (
      <div className="__floater__footer" style={styles.footer}>
        {footer}
      </div>
    );
  }

  if ((showCloseButton || positionWrapper) && !is.boolean(open)) {
    output.close = <CloseButton onClick={onClick} styles={styles.close} />;
  }

  return (
    <div className="__floater__container" style={styles.container}>
      {output.close}
      {output.title}
      {output.content}
      {output.footer}
    </div>
  );
}
