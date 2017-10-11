'use strict';
const dgram = require('dgram');

// prettier-ignore
const status = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF,
    //status
    0x73, 0x74, 0x61, 0x74, 0x75, 0x73, 0x00
]);
const responseStart = new Buffer([0xff, 0xff, 0xff, 0xff, 0x6e]);

module.exports = ({ address, port, timeout = 5e3 }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socket.close();
            reject(Error('timeout'));
        }, timeout);

        const socket = dgram.createSocket('udp4');

        socket.on('message', (buffer, { address, port }) => {
            for (let i = 0; i < responseStart.length; i++) {
                if (buffer[i] !== responseStart[i]) {
                    return;
                }
            }

            const responseString = buffer.toString('utf-8', responseStart.length + 1);
            const responseSplit = responseString.split(/\n/g);

            const result = {};

            const serverInfo = responseSplit[0].split(/\\/g);
            for (let i = 0; i < serverInfo.length - 1; i += 2) {
                result[serverInfo[i]] = serverInfo[i + 1];
            }
            result.players = responseSplit
                .slice(1, responseSplit.length - 1)
                .map(player => player.split(/ /g))
                .map(split => {
                    const [id, score, time, ping, name, skin, color1, color2] = split;
                    return {
                        id,
                        score,
                        time,
                        ping,
                        name: name.replace(/^"(.*)"$/, (_, capture) => capture),
                        skin: skin.replace(/^"(.*)"$/, (_, capture) => capture),
                        color1,
                        color2,
                    };
                });

            resolve(result);
        });

        socket.bind(() => {
            socket.send(status, port, address);
        });
    });
};
