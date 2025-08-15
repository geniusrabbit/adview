import { AdLoadState } from "../types";

export const matchExpectedState = (expectState?: AdLoadState, state?: AdLoadState) => {
  return !expectState || (
    (expectState.isInitial === undefined || expectState.isInitial === state?.isInitial) &&
    (expectState.isLoading === undefined || expectState.isLoading === state?.isLoading) &&
    (expectState.isError === undefined || expectState.isError === state?.isError) &&
    (expectState.isComplete === undefined || expectState.isComplete === state?.isComplete)
  );
};
