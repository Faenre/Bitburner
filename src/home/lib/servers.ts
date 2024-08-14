
export function getAllHostnames(ns: NS, host='home'): Array<string> {
  return ns
    .scan(host)
    .slice(host === 'home' ? 0 : 1)
    .reduce(
      (acc, connection) => acc.concat(getAllHostnames(ns, connection)), [host]
    );
}
