class TrelloConfig {
  readonly selfMemberId: string;
  readonly key: string;
  readonly token: string;
  readonly oauthSecret: string;
  constructor(
    selfMemberId: string,
    key: string,
    token: string,
    oauthSecret: string
  ) {
    this.selfMemberId = selfMemberId;
    this.key = key;
    this.token = token;
    this.oauthSecret = oauthSecret;
  }
}

export default TrelloConfig;
