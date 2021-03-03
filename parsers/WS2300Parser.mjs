import { Writable } from 'stream';

export const ADDRESS_WIDTH = 4;
export const LENGTH_SIZE = 1;
const RESET_SIZE = 1;
const RESET_DATA = 0x02;

/**
 * Emit data every number of bytes
 * @extends Writable
 * @param {Object} options parser options object
 * @param {Number} options.address address
 * @param {Number} options.length number of bytes
 * @summary A transform stream that helps to receive data from a WS2300
 */
class WS2300Parser extends Writable {
    constructor(options = {}) {
        super(options)

        if (typeof options.length !== 'number') {
            throw new TypeError('"length" is not a number')
        }

        if (options.length <= 0) {
            throw new TypeError('"length" is not greater than 0')
        }

        if (options.length > 3) {
            throw new TypeError('"length" is greater than 3')
        }

        if (typeof options.address !== 'number') {
            throw new TypeError('"address" is not a number')
        }

        if (options.address < 0x0000) {
            throw new TypeError('"address" is not greater or equal than 0x00')
        }

        if (options.address > 0xFFFF) {
            throw new TypeError('"address" is greater than 0xFFFF')
        }

        this.length = options.length
        this.address = options.address
        this.position = 0
        this.buffer = Buffer.alloc(this.length + 1)
        this.bufferLevel = 0
        this.preamble = Buffer.alloc(RESET_SIZE + ADDRESS_WIDTH + LENGTH_SIZE)

        this.preamble[0] = RESET_DATA
        for (var i = 0; i < ADDRESS_WIDTH; i++) {
            this.preamble[i + 1] = addressCSum(this.address, i)
        }
        this.preamble[RESET_SIZE + ADDRESS_WIDTH] = readCSum(this.length)
        this.matchOffset = 0
    }

    write(chunk, encoding, cb) {
        const preamble = this.preamble
        const buffer = this.buffer
        let chunkOffset = 0
        while (chunkOffset < chunk.length) {
            if (this.matchOffset < preamble.length) {
                if (preamble[this.matchOffset] === chunk[chunkOffset]) {
                    this.matchOffset++
                } else {
                    this.matchOffset = 0
                }
            } else if (this.bufferLevel < buffer.length) {
                buffer[this.bufferLevel] = chunk[chunkOffset]
                this.bufferLevel++
            }
            if (this.bufferLevel == buffer.length) {
                var data = buffer.slice(0, this.length)
                if (buffer[this.length] === dataCSum(data)) {
                    this.process(data)
                    this.emit('processed')
                }
                this.matchOffset = 0
                this.bufferLevel = 0
            }
            chunkOffset++
        }
        if (typeof cb === 'function') {
            cb()
        }
    }

    process(rawValue) {
        throw new Error('process must be implemented')
    }

    publish(value) {
        mqtt
    }

}

var addressCSum = function (acknowledgement, sequenceNumber) {
    return (sequenceNumber << 4) + (((0x82 + (((acknowledgement >> (4 * (3 - sequenceNumber))) & 0x0F) * 4)) - 0x82) / 4); //Nibblenummer (0-3) als erstes Nibble gefolgt vom Adress-Nibble - Command (0x82) / 4
}

var readCSum = function (numberOfBytes) {
    return 0x30 + numberOfBytes; // Byteanzahl + festem Binärwert (0x30)
}

var dataCSum = function (data) {
    var checksum = 0;

    for (var i = 0; i < data.length; i++) { //Alle übertragenden Bytes Zusammenaddieren
        checksum += data[i];
    }

    return checksum & 0xFF; //Das letzte Byte entspreicht der Prüfsumme
}


export default WS2300Parser