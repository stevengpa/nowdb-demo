const _ = require('lodash');
const nowdb = require('nowdb')({ path: './db', fileName: 'transactions.json' })

// Init Schema
const { schema, setTable, sparkles } = nowdb;
schema.init();
// Init Clicks Table
const tblClicks = setTable({ table: 'clicks' });
tblClicks.create({ table: 'clicks' });

const nowDB = () => {

	function broadcastClickInserts({ tableRowInserted, table, actionKey, newVal, adapter }) {
		const { io } = adapter || {};

		if (
			tableRowInserted && io &&
			table === 'clicks' && actionKey === 'TABLE_ROW_INSERT'
		) {
			const _table = tblClicks.read({ emit: false }).rows;
			const count = _.size(_table);
			io.sockets.emit('count', count);
			io.sockets.emit('new', newVal);
		}
	}

	function broadcastTableCreated({ tableCreated, actionKey, adapter }) {
		const { io } = adapter || {};
		const valid = tableCreated && io && actionKey === 'TABLE_CREATE';

		if (valid) {
			const table = tblClicks.read({ adapter: { io } }).rows;
			io.sockets.emit('init', table);
			io.sockets.emit('count', _.size(table));
		}
	}

	// nowDB - Listen for changes
	sparkles.on('table-event', (event) => {
		broadcastClickInserts(event);
		broadcastTableCreated(event);
	});
}

nowDB(); // Start the table-event listener

module.exports = (io) => {

	io.on('connection', (socket) => {
		// >> Send <<
		// Init User Connection
		const table = tblClicks.read({ adapter: { socket }}).rows;
		socket.emit('init', table);
		socket.emit('count', _.size(table));

		// >> Receive <<
		socket.on('click', ({ user }) => {
			tblClicks.insert({
				value: {player: user, date: new Date().toLocaleString()},
				adapter: {io}
			}); // broadcastClickInserts will emit
		});

		socket.on('reset', () => {
			tblClicks.remove({adapter: {io}});
			tblClicks.create({table: 'clicks', adapter: {io}}) // broadcastTableCreated will emit
		});

	});
}
