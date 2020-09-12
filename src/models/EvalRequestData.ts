/* eslint functional/no-class: "off", functional/no-this-expression: "off" */
class EvalRequestData {
  readonly code: string;
  constructor(code: string) {
    this.code = code;
  }
}

export default EvalRequestData;
