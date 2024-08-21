import { Server } from './HTTP/Server';

/**
 * Starts a webserver that listens on port 1001
 * and responds on port 1002.
 *
 * For information on how to use, consult the
 * README.md that accompanied this application.
 *
 * @param {NS} ns
 * */
export async function main(ns: NS) {
	const server = new Server(ns);
	ns.toast('Webserver now online', 'info', 5e3);
	await server.listen();
}
