import * as React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";

import {Provider, connect} from "react-redux";
import thunk from "redux-thunk";
import {createStore, combineReducers, applyMiddleware, Store} from "redux";

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

/*******路由******/


// search => params
const getSearchToParams = (search?: string) => {
  const params: any = {};
  if (search) {
    const a = (search.replace("?", "")).split("&");
    a.forEach((item) => {
      const keyValue = item.split("=");
      params[keyValue[0]] = decodeURI(keyValue[1]);
    });
  }
  return params;
};

// path 重写
const getPath = (item: RouteOptions) => {
  const {path, params} = item;
  const _params = params && params.length ? `:${params.join(":/")}` : "";
  const newPath = path.replace("/", "");
  return _params ? `${newPath}/${_params}/*` : `${newPath}/*`;
};

// router 重写
const getNewRouters = (array: Array<RouteOptions>): Array<RouteOptions> => {
  return array.map((o_o: any) => {
    return {
      ...o_o,
      realPath: o_o.path,
      path: getPath(o_o),
      children: o_o.children && o_o.children.length
        ? getNewRouters(o_o.children)
        : null,
    };
  });
};

// 私有的数据流库
const getStore = (stores: StoreMap[]) => {
  const items: StoreStores = {};
  stores.forEach((item) => {
    items[item.namespace] = item;
  });
  return createStores({...items});
};

// 默认权限
const AD: IAuth = (Component) => (props) => <Component {...props}/>;


// 递归路由
const renderRoutes = (o_o: Array<RouteOptions>, routers: Array<RouteOptions>, params?: any) => {
  const search = window.location.search;
  return <Routes>
    {o_o.map(
      ({Component, path, realPath, children, stores, auth}) => {
        const C = React.memo(connect(($store) => ({$store}))(Component));
        const Auth = auth ? auth : AD;
        const A = Auth((props) => {
          return <C
            {...props}
            goto={useNavigate()}
            location={useLocation()}
            params={useParams()}
            searchParams={getSearchToParams(useLocation().search)}
            routers={routers}
            childrenRouter={children ? (params?: StoreState) => renderRoutes(children, routers, params) : () => <></>}
            path={realPath}
            fatherRouterParams={params}
          />;
        });
        return <Route
          key={path}
          path={path}
          element={stores ? <Provider store={getStore(stores)}>{React.useMemo(() => <A/>, [])}</Provider> //eslint-disable-line react-hooks/exhaustive-deps
            : <>{React.useMemo(() => <A/>, [])}</>}//eslint-disable-line react-hooks/exhaustive-deps
        />;
      })}
    {o_o.map(({realPath, redirect}, index) => {
      return redirect ? <Route
        key={index}
        path={realPath}
        element={
          <Navigate to={`${redirect}${search}`}/>
        }/> : null;
    })}
  </Routes>;
};

// 创造路由
export const CreateRouter = (props: { routers: Array<RouteOptions> }) => {
  return (
    <React.Fragment>
      <BrowserRouter>
        {renderRoutes(getNewRouters(props.routers), props.routers)}
      </BrowserRouter>
    </React.Fragment>
  );
};

/*******路由******/


/*******数据流仓库******/

// 重新创建数据源
const createState = (map: StoreMap) => {
  const newMap = {...map};
  newMap.reducers = newMap.reducers ? newMap.reducers : {};
  const newReducers: StoreReducers = {};
  // 设置state对象的set
  newReducers[`${newMap["namespace"]}/setState`] = (_state: StoreState, {state}: { state: StoreState }) => ({..._state, ...state});
  // 设置每一个state对象里的set
  Object.keys(newMap.state).forEach((item) => {
    newReducers[`${newMap["namespace"]}/set/${item}`] = (_state: StoreState, state: StoreState) => ({
      ..._state,
      [item]: state[item]
    });
  });
  // 重新定义reducers里的函数
  Object.entries(newMap.reducers).forEach((item) => {
    newReducers[`${newMap["namespace"]}/${item[0]}`] = item[1];
  });
  newMap.reducers = newReducers;
  return (state = newMap.state, action: { type: string }) => {
    if (newMap.reducers && newMap.reducers[action.type]) {
      return newMap.reducers[action.type](state, action);
    } else {
      return state;
    }
  };
};

// 根据namespace区分各个数据源
const createReducers = (reducers: StoreStores): StoreReducers => {
  const newReducers: StoreReducers = {};
  Object.keys(reducers).forEach((key) => {
    newReducers[reducers[key]["namespace"]] = createState(reducers[key]);
  });
  return newReducers;
};

// 创建数据仓库
export const createStores = (stores: StoreStores): Store => createStore(combineReducers(createReducers({...stores})), applyMiddleware(thunk));

/*******数据流仓库******/



