import * as ECSYLib from 'ecsy';

// ECSY ships loose typings; the systems/components here rely on its dynamic
// `queries` / `schema` statics, so expose it untyped.
export const ECSY: any = ECSYLib;
