export interface AppResponseError {
  dateTime: string;
  status: number;
  errorCode: string;
  message: string;
  details: Record<string, string>;
}

export interface ParsedApiError {
  status: number;
  errorCode?: string;
  message: string;
  fieldErrors: Record<string, string>;
}
