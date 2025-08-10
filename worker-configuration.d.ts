interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
}

declare global {
  const console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  };
  
  function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  function btoa(str: string): string;
  function atob(str: string): string;
  
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }
  
  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first(): Promise<any>;
    run(): Promise<D1Result>;
    all(): Promise<D1Result>;
  }
  
  interface D1Result {
    results?: any[];
    success: boolean;
    meta: {
      last_row_id?: number;
      changed_rows?: number;
    };
  }

  interface RequestInfo {}
  interface RequestInit {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
  
  interface Response {
    ok: boolean;
    status: number;
    json(): Promise<any>;
    text(): Promise<string>;
  }
}
