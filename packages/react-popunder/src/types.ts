export interface PopunderConfig {
  template: string;
  unitid: string;
  target?: string;
  every?: string;
  everyDirect?: number;
  ignoreFilter?: string;
  categories?: string;
  cookieName?: string;
  cookieDomain?: string;
  mode?: string;
  param1?: string;
  param2?: string;
  param3?: string;
}

export interface AdPopunderProps {
  config: PopunderConfig;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
