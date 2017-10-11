'use strict';

const dgram = require('dgram');

// prettier-ignore
const status = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF,
    0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20,
    0x45, 0x6E, 0x67, 0x69, 0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00
]);

const responseStart = new Buffer([0xff, 0xff, 0xff, 0xff, 0x49]);

module.exports = ({ address, port, timeout = 5e3 }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socket.close();
            reject(Error('timeout'));
        }, timeout);

        const socket = dgram.createSocket('udp4');

        socket.on('message', (buffer, { address, port }) => {
            let index = 0;
            let end;
            for (; index < responseStart.length; index++) {
                if (buffer[index] !== responseStart[index]) {
                    return;
                }
            }

            const result = {};
            result.protocol = buffer[index];
            index++;

            end = buffer.indexOf('\0', index);
            result.name = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            result.map = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            result.folder = buffer.toString('utf8', index, end);

            index = end + 1;
            end = buffer.indexOf('\0', index);
            result.game = buffer.toString('utf8', index, end);

            index = end + 1;
            result.steamAppId = buffer.readInt16LE(index);
            end += 3;

            result.players = buffer[end];
            end++;

            result.maxPlayers = buffer[end];
            end++;

            result.bots = buffer[end];
            end++;

            result.serverType = buffer.toString('utf8', end, end + 1);
            end++;

            result.environment = buffer.toString('utf8', end, end + 1);
            end++;

            result.visibility = buffer[end];
            end++;

            result.vac = buffer[end];
            end++;

            // if ship byte Mode, byte Witnesses, byte Duration

            index = end;
            end = buffer.indexOf('\0', index);
            result.version = buffer.toString('utf8', index, end);
            end++;

            const edf = buffer[end];
            end++;

            if (edf & 0x80) {
                port = buffer.readUInt16LE(end);
                end += 2;
            }
            if (edf & 0x10) {
                result.serverSteamId = buffer.readInt32LE(end);
                end += 4;
            }
            if (edf & 0x40) {
                result.sourceTvPort = buffer.readInt16LE(end);
                end += 2;

                index = end + 1;
                end = buffer.indexOf('\0', index);
                result.sourceTvName = buffer.toString('utf8', index, end);
            }
            if (edf & 0x20) {
                index = end + 1;
                end = buffer.indexOf('\0', index);
                result.keywords = buffer.toString('utf8', index, end);
                end++;
            }
            if (edf & 0x01) {
                result.steamAppId = buffer.readInt32LE(end);
            }

            resolve(result);
        });

        socket.bind(() => {
            socket.send(status, port, address);
        });
    });
};
