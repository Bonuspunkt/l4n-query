require('tap').mochaGlobals();
const dgram = require('dgram');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;

const teeworlds = require('./teeworlds');

// prettier-ignore
const info = new Buffer([
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0x67, 0x69, 0x65, 0x33, 0x04
]);

// prettier-ignore
const response = new Buffer([
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0x69, 0x6e, 0x66, 0x33, 0x34, 0x00, 0x30, 0x2e, 0x36, 0x2e, 0x33, 0x00, 0x75, 0x6e, 0x6e, 0x61,
    0x6d, 0x65, 0x64, 0x20, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x00, 0x64, 0x6d, 0x31, 0x00, 0x44,
    0x4d, 0x00, 0x30, 0x00, 0x30, 0x00, 0x38, 0x00, 0x30, 0x00, 0x38, 0x00,
]);

describe('source engine query', () => {
    it('should query server', () => {
        const port = 60000;
        //
        const socket = dgram.createSocket('udp4');
        socket.on('message', (message, { address, port }) => {
            expect(message).to.deep.equal(info);

            socket.send(response, port, address);
        });

        return new Promise((resolve, reject) => {
            socket.bind(port, () =>
                teeworlds({ port })
                    .then(resolve)
                    .catch(reject),
            );
        }).then(response => {
            expect(response).to.deep.equal({
                name: 'unnamed server',
                map: 'dm1',
                gametype: 'DM',
                players: '0',
                maxPlayers: '8',
                version: '0.6.3',
            });
            socket.close();
        });
    });

    it('should timeout', () => {
        expect(teeworlds({ port: 12345, timeout: 100 })).to.be.rejectedWith(Error);
    });
});
