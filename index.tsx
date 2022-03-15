import * as React from "react";

import {createStores} from "./src/main/createStores";

import {CreateRouter} from "./src/main/createRouter";

import {Provider} from "react-redux";

import {RouteOptions,} from "./src/type";

import {Store} from "redux";

export {createStore, combineReducers, applyMiddleware, Store} from "redux";

export {Provider, connect} from "react-redux";

export {
  StoreStores, IReactHooksComponent, IAuth, StoreReducers, StoreMap, Dispatch, RouteOptions, StoreState, MapRoute
} from "./src/type";


export {createStores} from "./src/main/createStores";

export {CreateRouter} from "./src/main/createRouter";

export {Service} from "./src/main/createService";

export default (props: { store: Store, routers: Array<RouteOptions> }): React.ReactElement => {
  return (
    <React.Fragment>
      <Provider store={props.store}>
        <CreateRouter routers={props.routers}/>
      </Provider>
    </React.Fragment>
  );
};
