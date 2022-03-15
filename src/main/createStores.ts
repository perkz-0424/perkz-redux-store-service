import thunk from "redux-thunk";
import {createStore, combineReducers, applyMiddleware, Store} from "redux";
import {StoreStores, StoreReducers, StoreMap, StoreState} from "../type";

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
const createStores = (stores: StoreStores): Store =>
  createStore(
    combineReducers(
      createReducers(
        {
          ...stores
        }
      )
    ),
    applyMiddleware(thunk)
  );
export default createStores;
