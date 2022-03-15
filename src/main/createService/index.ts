import {getParamsToSearch} from "../../common";

type Data = {
  [key: string]: number | string | undefined | null
}

type Headers = {
  "Content-Type"?: string,
  "Authorization"?: string,
}


export class Service<T = any> {
  private options: RequestInit = {credentials: "include"};

  private controller = new AbortController();

  constructor(private headers: Headers = {}) {
    this.options.headers = headers;
  }


  private f = (url: string, options: RequestInit) => new Promise((resolve, reject) => {
    fetch(url, {
      ...options,
      signal: this.controller.signal
    }).then((res) => {
      try {
        res.json().then((res:T) => {
          return resolve(res);
        });
      } catch (e) {
        return reject(e);
      }
    }).catch((e) => {
      return reject(e);
    });
  });

  private a = (method: string, url: string, data: Data) => {
    const search = getParamsToSearch(data);
    const _url = search ? `${url}?${search}` : url;
    const _option: RequestInit = {...this.options, method: "GET"};
    return this.f(_url, _option);
  };

  private b = (method: string, url: string, data: Data) => {
    const _url = url;
    const _option: RequestInit = {...this.options, method: "POST"};
    _option.body = JSON.stringify(data);
    return this.f(_url, _option);
  };

  public get = (url: string, data: Data) => {
    return this.a("GET", url, data);
  };

  public post = (url: string, data: Data) => {
    return this.b("POST", url, data);
  };

  public put = (url: string, data: Data) => {
    return this.b("PUT", url, data);
  };

  public delete = (url: string, data: Data) => {
    return this.a("DELETE", url, data);
  };

  public abort = () => {
    this.controller.abort();
  };
}


