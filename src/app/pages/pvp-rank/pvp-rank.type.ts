export const leagueValues = ['super', 'hyper'] as const;
export const formeValues = ['normal', 'obscur'] as const;

export type League = (typeof leagueValues)[number];
export type Forme = (typeof formeValues)[number];
