import * as React from 'react';
import is from 'is-lite';

import CloseButton from './CloseButton';

import { CloseFunction, Styles } from '../../types';

interface Props {
  content: React.ReactNode;
  footer?: React.ReactNode;
  onClick: CloseFunction<HTMLButtonElement>;
  open?: boolean;
  positionWrapper: boolean;
  showCloseButton?: boolean;
  styles: Styles;
  title?: React.ReactNode;
}

export default function FloaterContainer(props: Props) {
  const { content, footer, onClick, open, positionWrapper, showCloseButton, styles, title } = props;

  const output: Record<string, React.ReactNode> = {
    content: React.isValidElement(content) ? (
      content
    ) : (
      <div className="__floater__content" style={styles.content}>
        {content}
      </div>
    ),
  };

  if (title) {
    output.title = React.isValidElement(title) ? (
      title
    ) : (
      <div className="__floater__title" style={styles.title}>
        {title}
      </div>
    );
  }

  if (footer) {
    output.footer = React.isValidElement(footer) ? (
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
