import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class IndoorHumiPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x3FB, length: 1 })
        this.mqttPublish = mqttPublish;
    }

    process(data) {
        var calcHumi = 0;

        calcHumi += (data[0] & 0xF); // Die ersten 4 Bit sind %
        calcHumi += (data[0] >> 4) * 10; // Die zweiten 4 Bit sind 10^1 %

        this.mqttPublish("IndoorHumi", calcHumi.toFixed());
    }
}

export default IndoorHumiPaser