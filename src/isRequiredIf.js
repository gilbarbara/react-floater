const VALIDATOR_ARG_ERROR_MESSAGE =
  'The typeValidator argument must be a function ' +
  'with the signature function(props, propName, componentName).';

const MESSAGE_ARG_ERROR_MESSAGE =
  'The error message is optional, but must be a string if provided.';

function propIsRequired(condition, props, propName, componentName) {
  if (typeof condition === 'boolean') {
    return condition;
  }
  if (typeof condition === 'function') {
    return condition(props, propName, componentName);
  }
  if (Boolean(condition) === true) {
    return Boolean(condition);
  }

  return false;
}

function propExists(props, propName) {
  return Object.hasOwnProperty.call(props, propName);
}

function missingPropError(props, propName, componentName, message) {
  if (message) {
    return new Error(message);
  }

  return new Error(
    `Required ${props[propName]} \`${propName}\` was not specified in \`${componentName}\`.`,
  );
}

function guardAgainstInvalidArgTypes(typeValidator, message) {
  if (typeof typeValidator !== 'function') {
    throw new TypeError(VALIDATOR_ARG_ERROR_MESSAGE);
  }

  if (Boolean(message) && typeof message !== 'string') {
    throw new TypeError(MESSAGE_ARG_ERROR_MESSAGE);
  }
}

export default function isRequiredIf(typeValidator, condition, message) {
  guardAgainstInvalidArgTypes(typeValidator, message);

  return (props, propName, componentName, ...rest) => {
    if (propIsRequired(condition, props, propName, componentName)) {
      if (propExists(props, propName)) {
        return typeValidator(props, propName, componentName, ...rest);
      }

      return missingPropError(props, propName, componentName, message);
    }

    // Is not required, so just run typeValidator.
    return typeValidator(props, propName, componentName, ...rest);
  };
}
