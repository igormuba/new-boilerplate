export interface DynamicProps {
  hivePerMVests: number;
  base: number;
  quote: number;
  fundRecentClaims: number;
  fundRewardBalance: number;
}

export type State = DynamicProps;

export enum ActionTypes {
    FETCHED = "@dynamic-props/FETCHED",
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  props: DynamicProps;
}

export type Actions = FetchedAction; // |..|..æ 
