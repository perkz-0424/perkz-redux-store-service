import {getParamsToSearch} from "../../common";
import {Data} from "../../type";


export class Service<T = any> {
  // 请求体参数
  private options: RequestInit = {
    credentials: "include"
  };

  // 定时器
  private timer: NodeJS.Timeout | null = null;

  private controller = new AbortController();

  constructor(private headers: HeadersInit = {}, private timeout: number = 10000) {
    this.options.headers = headers;
  }

  private timeOut = () => new Promise((resolve, reject) => {
    this.timer = setTimeout(() => {
      this.abort();
      reject();
    }, this.timeout);
  });

  private fetch = (url: string, options: RequestInit) => {
    return new Promise((resolve, reject) => {
      fetch(url, {
        ...options,
        signal: this.controller.signal
      }).then((res) => {
        this.timer && clearTimeout(this.timer);
        try {
          res.json().then((res: T) => resolve(res));
        } catch (e) {
          return reject(e);
        }
      }).catch((e) => {
        this.timer && clearTimeout(this.timer);
        return reject(e);
      });
    });
  };

  // 参数在url上
  private modeA = (method: string, url: string, data: Data) => {
    const search = getParamsToSearch(data);
    const _url = search ? `${url}?${search}` : url;
    return Promise.race([
      this.fetch(_url, {...this.options, method}),
      this.timeOut()
    ]);
  };

  // 参数在body
  private modeB = (method: string, url: string, data: Data) => {
    return Promise.race([this.fetch(url, {...this.options, method, body: JSON.stringify(data)}),  this.timeOut()])
  };

  // get请求
  public get = (url: string, data: Data) => this.modeA("GET", url, data);

  // post请求
  public post = (url: string, data: Data) => this.modeB("POST", url, data);

  // put 请求
  public put = (url: string, data: Data) => this.modeB("PUT", url, data);

  // delete请求
  public delete = (url: string, data: Data) => this.modeA("DELETE", url, data);

  // 终止请求
  public abort = () => {
    this.controller.abort();
    this.controller = new AbortController();
    return this;
  };
}


