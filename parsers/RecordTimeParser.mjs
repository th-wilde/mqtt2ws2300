import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class RecordTimePaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x200, length: 7 })
        this.mqttPublish = mqttPublish;
    }

    process(data) {
        var hwUtc = "20"+
			(data[6] & 0xF)+""+(data[5] >> 4)+"-"+
			(data[5] & 0xF)+""+(data[4] >> 4)+"-"+
			(data[4] & 0xF)+""+(data[3] >> 4)+"T"+
			(data[2] >> 4)+""+(data[2] & 0xF)+":"+
			(data[1] >> 4)+""+(data[1] & 0xF)+":"+
			(data[0] >> 4)+""+(data[0] & 0xF);

		this.mqttPublish("RecordTime", hwUtc);
    }
}

export default RecordTimePaser