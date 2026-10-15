export type ParseErrorCode = "empty" | "header" | "noData" | "granularity";

export class ParseError extends Error {
  constructor(
    /** i18n key suffix (`error.<code>`) */
    readonly code: ParseErrorCode,
  ) {
    super(code);
    this.name = "ParseError";
  }
}
