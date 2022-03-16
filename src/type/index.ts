import * as React from "react";

export class RouteOptions {
  path!: string;
  Component!: (props: any) => React.ReactElement;
  realPath?: string;
  children?: RouteOptions[];
  stores?: any[];
  params?: string[];
  redirect?: string;
  auth?: IAuth;
}

export class MapRoute<T = { [key: string]: { [key: string]: any } }, O = { [key: string]: { [key: string]: any } }> {
  path!: string;
  childrenRouter!: (params?: any) => React.ReactElement | null;
  location!: {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state: { [key: string]: any } | null | string;
    [key: string]: any
  };
  goto!: (to: string, options?: {
    replace?: boolean;
    state?: any;
    [key: string]: any;
  }) => any;
  params!: {
    [key: string]: string;
  };
  routers!: RouteOptions;
  searchParams!: {
    [key: string]: string;
  };
  $store!: T;

  $other!: O;

  [key: string]: any
}


export type StoreState = {
  [key: string]: string | number | boolean | { [key: string]: StoreState } | StoreState[]
}

export type StoreMap<T = any> = {
  namespace: string;
  state: StoreState;
  reducers?: {
    [key: string]: (state: StoreState, params: T) => StoreState
  }
}
export type StoreStores<T = any> = {
  [key: string]: {
    namespace: string;
    state: StoreState;
    reducers?: {
      [key: string]: (state: StoreState, params: T) => StoreState
    }
  };
};

export type StoreReducers<T = any> = {
  [key: string]: T
}

export type Dispatch<P = any, C = (payload: P) => void> = (
  action: {
    type: string;
    payload?: P;
    callback?: C;
    [key: string]: any;
  }
) => any;

export interface IReactHooksComponent<T = { [key: string]: any }> {
  (props: MapRoute & T): React.ReactElement;
}

export type IAuth = (Component: (props: { [key: string]: any }) => React.ReactElement) => ((props: { [key: string]: any }) => React.ReactElement)

export type Data = {
  [key: string]: number | string | undefined | null
}
