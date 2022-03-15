## perkz
##### 第一步
~~~ts
// 数据文件
import {Dispatch, MapRoute, StoreState} from "perkz";
import {connect} from "react-redux";


export type State = {
  name: string;
}

// 数据源
export const state = {
   namespace: "main" ,
   state: {
     name: "",
   },
   reducers: {
      init(state: StoreState) {
        return {...state};
      }
   }
}

function mapState(state: { main: State }) {
  return {
    ...state.main,
  };
}

// 数据更改
function mapDispatch(dispatch: Dispatch, params: MapRoute) {
  return {
    init() {
      dispatch({type: `main/init`});
      dispatch({type: `main/set/name`, name: ""});
      dispatch({type: `main/setState`, state: {name: ""}});
    },
  };
}

export interface IProps extends ReturnType<typeof mapDispatch>,
  ReturnType<typeof mapState> {
  [key: string]: any;
}

export default connect(mapState, mapDispatch);
~~~

##### 第二步
~~~ts
// store 文件 存放数据源
import {createStores} from "perkz";
import {state as main}  from "@/store/main"
export default createStores({
  main,
})

~~~

##### 第三步
~~~tsx
import * as React from "react";
import {IReactHooksComponent} from "perkz";
import store, {IProps} from "@/store/main";

const Main: IReactHooksComponent<IProps> = (props) => {

  return <>{props.childrenRouter()}</>
};
export default store(Main);
~~~

##### 第四步
~~~ts
// 路由配置文件
const routes = [
  {
    path: "/",
    Component: require("@/pages").default,
    redirect: "pc",
    name: "首页",
    children: [
      {
        path: "/pc",
        Component: require("@/pages/Pc").default,
        name: "pc端",
      },
      {
        path: "/mobile",
        Component: require("@/pages/Mobile").default,
        name: "h5端",
      },
    ],
  },
];
export default routes;
~~~

##### 第五步
~~~tsx
// 项目入口文件
import * as React from "react";
import store from "@/store";
import {CreateRouter} from "perkz";
import {Provider} from "react-redux";
import routers from "@/routers";

const App = () => {
  return (
    <React.Fragment>
      <Provider store={store}>
        <CreateRouter routers={routers}/>
      </Provider>
    </React.Fragment>
  );
};
~~~
