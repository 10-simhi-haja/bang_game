class CustomError extends Error {
  constructor(code, message, sequence) {
    super(message);
    this.code = code;
    this.name = 'Custom Error';
    this.sequence = sequence;
  }
}

export default CustomError;
