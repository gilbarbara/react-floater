export default {
  wrapper: {
    cursor: 'help',
    display: 'inline-block',
  },
  tooltip: {
    display: 'inline-block',
    filter: 'drop-shadow(-1px -2px 3px rgba(0, 0, 0, 0.3)) drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.3))',
    maxWidth: 300,
    opacity: 0,
    position: 'relative',
    transition: 'opacity 0.3s',
    visibility: 'hidden',
    zIndex: 1000,
  },
  tooltipOpening: {
    opacity: 1,
    visibility: 'visible',
  },
  tooltipAnimate: {
    transition: 'opacity 3s, transform 0.2s',
    opacity: 1,
    visibility: 'visible',
  },
  tooltipClosing: {
    opacity: 0,
    visibility: 'visible',
  },
  title: {
    borderBottom: '1px solid #f04',
    color: '#555',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 6,
    paddingRight: 18,
  },
  content: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    fontSize: 15,
    color: '#666',
    minHeight: 60,
    minWidth: 200,
    padding: 20
  },
  footer: {
    borderTop: '1px solid #ccc',
    marginTop: 10,
    paddingTop: 5,
  },
  arrow: {
    color: '#f7f7f7',
    display: 'inline-flex',
    position: 'absolute',
    length: 16,
    spread: 32,
  },
};
