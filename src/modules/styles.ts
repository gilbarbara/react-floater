import { deepmerge } from 'deepmerge-ts';
import { PartialDeep } from 'type-fest';

import { Styles } from '../types';

const defaultOptions = {
  zIndex: 100,
};

export default function getStyles(styles?: PartialDeep<Styles>): Styles {
  const { options = {}, ...rest } = styles || {};

  return deepmerge(
    {
      arrow: {
        color: '#fff',
        display: 'inline-flex',
        length: 16,
        position: 'absolute',
        spread: 32,
      },
      close: {
        backgroundColor: 'transparent',
        border: 0,
        borderRadius: 0,
        color: '#555',
        fontSize: 0,
        height: 15,
        outline: 'none',
        padding: 10,
        position: 'absolute',
        right: 0,
        top: 0,
        width: 15,
        WebkitAppearance: 'none',
      },
      container: {
        backgroundColor: '#fff',
        color: '#666',
        minHeight: 60,
        minWidth: 200,
        padding: 20,
        position: 'relative',
        zIndex: 10,
      },
      content: {
        fontSize: 15,
      },
      footer: {
        borderTop: '1px solid #ccc',
        fontSize: 13,
        marginTop: 10,
        paddingTop: 5,
      },
      floater: {
        display: 'inline-block',
        filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))',
        maxWidth: 300,
        opacity: 0,
        position: 'relative',
        transition: 'opacity 0.3s',
        visibility: 'hidden',
        zIndex: options.zIndex,
      },
      floaterCentered: {
        left: '50%',
        position: 'fixed',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      },
      floaterClosing: {
        opacity: 0,
        visibility: 'visible',
      },
      floaterOpening: {
        opacity: 1,
        visibility: 'visible',
      },
      floaterWithComponent: {
        maxWidth: '100%',
      },
      title: {
        borderBottom: '1px solid #555',
        color: '#555',
        fontSize: 18,
        marginBottom: 5,
        paddingBottom: 6,
        paddingRight: 18,
      },
      wrapper: {
        cursor: 'help',
        zIndex: options.zIndex,
      },
      wrapperPosition: {
        left: -1000,
        position: 'absolute',
        top: -1000,
        visibility: 'hidden',
      },
      options: deepmerge(defaultOptions, options),
    },
    rest,
  ) as Styles;
}
