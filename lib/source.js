const debug = require('debug')('l4n:query:source')
const dgram = require('dgram');

'use strict';
const status = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF, 0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69,
    0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00
]);

const responseStart = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF, 0x49
]);

module.exports = ({ address, port }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socket.close();
            reject(Error('timeout'));
        }, 5e3)

        const socket = dgram.createSocket('udp4');

        socket.on('message', (buffer, { address, port }) => {
            let index = 0;
            let end;
            for (; index < responseStart.length; index++) {
                if (buffer[index] !== responseStart[index]) { return; }
            }

            const protocol = buffer[index];
            index++;

            end = buffer.indexOf('\0', index);
            const name = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            const map = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            const folder = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            const game = buffer.toString('utf8', index, end);

            index = end + 1;
            let steamAppId = buffer.readInt16LE(index);
            end += 3;

            const players = buffer[end];
            end++;

            const maxPlayers = buffer[end];
            end++;

            const bots = buffer[end];
            end++;

            const serverType = buffer.toString('utf8', end, end + 1);
            end++

            const environment = buffer.toString('utf8', end, end + 1);
            end++;

            const visibility = buffer[end];
            end++;

            const vac = buffer[end];
            end++;

            // if ship byte Mode, byte Witnesses, byte Duration

            index = end;
            end = buffer.indexOf('\0', index);
            const version = buffer.toString('utf8', index, end);
            end++;

            const edf = buffer[end];
            end++

            if (edf & 0x80) {
                port = buffer.readUInt16LE(end);
                end += 2;
            }
            if (edf & 0x10) {
                let serverSteamId = buffer.readInt32LE(end);
                end += 4;
            }
            if (edf & 0x40) {
                let sourceTvPort = buffer.readInt16LE(end);
                end += 2;

                index = end + 1;
                end = buffer.indexOf('\0', index);
                let sourceTvName = buffer.toString('utf8', index, end);
            }
            if (edf & 0x20) {
                index = end + 1;
                end = buffer.indexOf('\0', index);
                let keywords = buffer.toString('utf8', index, end);
                end++;
            }
            if (edf & 0x01) {
                steamAppId = buffer.readInt32LE(end);
            }

            const result = {
                game: game.toLowerCase(),
                address: address,
                port: port,
                name: name,
                map: map,
                steamAppId: steamAppId,
                players: players,
                maxPlayers: maxPlayers
            };

            resolve(result);
        });

        socket.bind(resolve, () => {
            socket.send(status, port, address);
        });

    });
};
