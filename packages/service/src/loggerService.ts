import { Axiom } from '@axiomhq/js';

const axiom = process.env.AXIOM_TOKEN
  ? new Axiom({ token: process.env.AXIOM_TOKEN })
  : null;

export const logEvent = (
  dataset: string,
  payload: Record<string, unknown>,
): void => {
  if (axiom) {
    axiom.ingest(dataset, [payload]);
  } else {
    console.log(`[${dataset}]`, payload);
  }
};
