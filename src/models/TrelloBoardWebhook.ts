export interface Card {
  id: string;
  name: string;
  due: undefined | null | Date;
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
  date: Date;
}

export interface BoardWebhook {
  action: Action;
}
