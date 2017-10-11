'use strict';
const dgram = require('dgram');

// prettier-ignore
const info = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    // gie3.
    0x67, 0x69, 0x65, 0x33, 0x04
]);
// prettier-ignore
const start = new Buffer([
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0x69, 0x6e, 0x66, 0x33, 0x34, 0x00
]);

module.exports = ({ address, port, timeout = 5e3 }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socket.close();
            reject(Error('timeout'));
        }, timeout);

        const socket = dgram.createSocket('udp4');

        socket.on('message', (buffer, { address, port }) => {
            for (let i = 0; i < start.length; i++) {
                if (buffer[i] !== start[i]) {
                    return;
                }
            }

            const responseString = buffer.toString('utf-8', start.length);
            const responseSplit = responseString.split(/\u0000/g);

            const [version, name, map, gametype, , players, maxPlayers] = responseSplit;

            resolve({ name, map, gametype, players, maxPlayers, version });
        });

        socket.bind(() => {
            socket.send(info, port, address);
        });
    });
};
