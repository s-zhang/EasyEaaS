/* eslint functional/no-class: "off", functional/no-this-expression: "off" */
class AppVersion {
  public readonly version: string;

  constructor(version: string) {
    this.version = version;
  }
}

export { AppVersion };
