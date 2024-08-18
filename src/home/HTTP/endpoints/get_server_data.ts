import { Status } from '../StatusCodes';
import { getAllHostnames, getRootedServers, getHackableServers } from '../../lib/servers';

/**
 * Returns information about a server.
 *
 * @param {NS} ns
 * @param {Object} data object containing at least a `hostname` string
 * */
export function getServerData(ns: NS, data: object): [Status, object] {
	const hostname = String(data['hostname']);
  try {
    return [Status.OK, {server: ns.getServer(hostname)}];
  } catch {
    return [Status.BAD_INPUT, {info: 'Bad hostname provided!'}];
  }
}

export function getAllServerData(ns: NS, _data: object): [Status, object] {
  const servers = getHackableServers(ns).map(hostname => ns.getServer(hostname));
  return [Status.OK, {servers}];
}

export function getHostnames(ns: NS, _data: object): [Status, object] {
  return [Status.OK, {hosts: getAllHostnames(ns)}];
}

export function getRootedHostnames(ns: NS, _data: object): [Status, object] {
  return [Status.OK, {hosts: getRootedServers(ns)}];
}
