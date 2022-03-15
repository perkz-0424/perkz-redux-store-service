import createStores from "./src/main/createStores";

import CreateRouter from "./src/main/createRouter";

import {
  IReactHooksComponent,
  MapRoute as IReactProps,
  StoreState,
  RouteOptions,
  Dispatch,
  StoreMap,
  StoreReducers,
  StoreStores,
  IAuth
} from "./src/type";


export {
  CreateRouter,
  createStores,
  IReactHooksComponent,
  IReactProps,
  StoreState,
  RouteOptions,
  Dispatch,
  StoreMap,
  StoreReducers,
  StoreStores,
  IAuth
};

const perkz = {
  CreateRouter,
  createStores,
};

export default perkz;
