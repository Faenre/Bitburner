import { NetscriptPort } from '@/NetscriptDefinitions';
import { StatusCode } from './StatusCodes';

export const DEFAULT_LISTEN_PORT = 1001;
export const DEFAULT_RESPONSE_PORT = 1002;

export interface PortRequest {
	endpoint: string;
	callback: string | number | boolean | null;
	data: object | null;
}

export interface PortResponse {
	callback: string | number | boolean | null;
	status: StatusCode;
	data: object;
}

/**
 *
 * @param ns
 * @param serverListenPort The port that the HTTP server accepts messages on
 * @param serverResponsePort The port that the HTTP server sends responses on
 * @returns
 */
export function getPortHandles(ns: NS, serverListenPort=DEFAULT_LISTEN_PORT, serverResponsePort=DEFAULT_RESPONSE_PORT): [NetscriptPort, NetscriptPort] {
  return [
    ns.getPortHandle(serverListenPort),
    ns.getPortHandle(serverResponsePort),
  ]
}

/**
 * The no-fluff version of getFromApi.
 * Callback and request forming are handled automagically.
 *
 * @param ns
 * @param endpoint
 * @returns
 */
export async function getRequest(ns: NS, endpoint: string): Promise<object> {
  const request = { endpoint, callback: ns.pid + 5000, data: {} };
  return (await getFromApi(ns, request)).data;
}

/**
 *
 * @public
 * @param ns
 * @param request
 * @param serverListenPort
 * @param serverResponsePort
 * @returns Promise<PortResponse>
 */
export async function getFromApi(ns: NS, request: PortRequest, serverListenPort?: number, serverResponsePort?: number): Promise<PortResponse> {
  const listenPort = serverListenPort ?? DEFAULT_LISTEN_PORT;
  const responsePort = serverResponsePort ?? DEFAULT_RESPONSE_PORT;

  ns.writePort(listenPort, request);
  // ns.print(`INFO requesting resource \`${request.endpoint}\` on port ${responsePort}`);
  const response = await getResponse(ns, responsePort, request.callback);
  return response;
}

async function getResponse(ns: NS, port: number, callback: string | number | boolean | null): Promise<PortResponse> {
  const response = ns.readPort(DEFAULT_RESPONSE_PORT);
  if (response !== 'NULL PORT DATA') return response;
  await ns.nextPortWrite(DEFAULT_RESPONSE_PORT);
  return await getResponse(ns, port, callback);
}
