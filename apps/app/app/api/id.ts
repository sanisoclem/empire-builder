import * as slugid from 'slugid';

export const genCompressedId = (): string => slugid.nice();
export const toCompressedId = (x: string) => slugid.encode(x);
export const fromCompressedId = (x: string) => slugid.decode(x);
