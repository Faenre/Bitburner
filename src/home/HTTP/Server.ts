import { NS } from '@/NetscriptDefinitions';
import * as ENDPOINTS from './endpoints/index';
import { Status, StatusCodes } from './StatusCodes';
import { PortRequest, PortResponse, DEFAULT_LISTEN_PORT, DEFAULT_RESPONSE_PORT } from './API';

export class Server {
	ns: NS;
  listenPort: number;
  responsePort: number;

  /**
   * @param ns
   * @param listenPort default 1001
   * @param responsePort default 1002
   */
	constructor(ns: NS, listenPort=DEFAULT_LISTEN_PORT, responsePort=DEFAULT_RESPONSE_PORT) {
		this.ns = ns;
    this.listenPort = listenPort;
    this.responsePort = responsePort;

    for (const endpoint of Object.keys(ENDPOINTS))
      this.ns.print(`INFO endpoint recognized: ${endpoint}`);
	}

  /**
   * Listens to a port, handles web requests, and sends responses.
   */
	async listen() {
		// this.ns.clearPort(this.listenPort);
		this.ns.clearPort(this.responsePort);

		this.ns.print(`INFO Now listening on port ${this.listenPort}.`);
		this.ns.print(`INFO Responses will be sent on port ${this.responsePort}.`);

		while (true) {
			const content = await this.getRequest();

			// Parse the request
			const [request, error] = this.parseContent(content);
			if (error) {
				this.ns.print(`WARNING skipping invalid request: ${error}`);
				continue;
			}

			// Process the request
			this.ns.print(`INFO Now handling \`${request.endpoint}\` request.`);
			const response = this.handle(request);

			// Send a reply (unless indicated not to)
			if (!request.callback) continue;
			// responsePort.write(response);
			this.ns.writePort(DEFAULT_RESPONSE_PORT, response);
			this.ns.print(`${response.status.code < 400 ? 'SUCCESS' : 'WARNING'} response sent to cb \`${response.callback}\``);
		}
	}

	async getRequest(): Promise<object | string> {
		const content = this.ns.readPort(this.listenPort);
		if (content !== 'NULL PORT DATA') return content;

		await this.ns.nextPortWrite(this.listenPort);
		return await this.getRequest();
	}

  parseContent(content: string | object): [PortRequest, string | null] {
    try {
      let json = content;
			if (typeof content === 'string') json = JSON.parse(content);
      return [{
        endpoint: json['endpoint'],
        callback: json['callback'],
        data: 		json['data'],
      }, null]
    } catch (err) {
      const error = `\
      Cannot parse message content. Perhaps the JSON is malformed?

      Message content:
      ${JSON.stringify(content)}

      Stack:
      ${err.stack}`;
      return [{ endpoint: '', callback: null, data: {} }, error]
    }
  }

	handle(request: PortRequest): PortResponse {
		const [status, data] = this.doHandle(request.endpoint, request.data);

		return {
      callback: request.callback,
			status: StatusCodes[status],
			data: data,
		}
	}

	doHandle(endpoint: string, data: object): [Status, object] {
		try {
			const controller = ENDPOINTS[endpoint];
			if (!controller) {
				this.ns.print(`WARNING Unknown endpoint '${endpoint}' requested.`);
				return [Status.NOT_FOUND, {}];
			}

			return controller(this.ns, data);
		} catch (err) {
			this.ns.print('ERROR server can not handle request:\n' + err.stack);
			return [Status.SERVER_ERROR, {}];
		}
	}
}
