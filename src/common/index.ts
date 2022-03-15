export const getParamsToSearch = (params: any) => {
  let search = "";
  for (const p in params) {
    if (params.hasOwnProperty(p) && (params[p] || params[p] === 0 || params[p] === "")) {
      search += `${p}=${params[p]}&`;
    }
  }
  search = search.substr(0, search.length - 1);
  return search;
};


export const getSearchToParams = (search?: string) => {
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
