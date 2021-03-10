export interface Card {
  id: string;
  name: string;
  idList: string;
  due: undefined | null | string;
}

export interface List {
  id: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
  shortLink: string;
}

export interface ActionData {
  card: Card | undefined;
  list: List | undefined;
  board: Board;
}

export interface Action {
  id: string;
  data: ActionData;
  type: string;
  date: string;
}

export interface BoardWebhook {
  action: Action;
}

export interface CustomField {
  id: string;
  name: string;
}

export interface CustomFieldItems {
  id: string;
  value: any;
  idCustomField: string;
}
