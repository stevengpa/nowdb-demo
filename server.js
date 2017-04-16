const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

require('./private/handle-sockets')(io);

app.use(express.static(`${__dirname}/public`));

// Serve index.html
const mainRouter = express.Router({ mergeParams: true });
mainRouter.get('/', (req, res) => {
	return res.sendFile(`${__dirname}/index.html`);
});
app.use(mainRouter);
// -------------------------------------------------------

const port = 4545;
server.listen(port, () => {
	console.log(`Server running in ${port}`);
});
