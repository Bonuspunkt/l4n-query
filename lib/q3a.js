'use strict';

const dgram = require('dgram');

// prettier-ignore
const getInfo = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF,
    // getinfo
    0x67, 0x65, 0x74, 0x69, 0x6E, 0x66, 0x6F, 0x00
]);

// prettier-ignore
const infoResponse = new Buffer([
    0xff, 0xff, 0xff, 0xff,
    0x69, 0x6e, 0x66, 0x6f, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65
]);

module.exports = ({ address, port, timeout = 5e3 }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socket.close();
            reject(Error('timeout'));
        }, timeout);

        const socket = dgram.createSocket('udp4');

        socket.on('message', (buffer, { address, port }) => {
            let index = 0;
            for (; index < infoResponse.length; index++) {
                if (buffer[index] !== infoResponse[index]) {
                    return;
                }
            }

            const responseString = buffer.toString('utf-8', infoResponse.length);
            const responseSplit = responseString.split(/\\/g);

            const result = {};
            for (let i = 1; i < responseSplit.length; i += 2) {
                result[responseSplit[i]] = responseSplit[i + 1];
            }

            resolve(result);
        });
        socket.bind(() => {
            socket.send(getInfo, port, address);
        });
    });
};
