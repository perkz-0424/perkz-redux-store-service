import * as React from "react";
import {connect, Provider} from "react-redux";
import {IAuth, RouteOptions, StoreMap, StoreState, StoreStores} from "../../type";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import {createStores} from "../createStores";

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
