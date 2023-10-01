import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class OutdoorHumiPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x419, length: 1 })
        this.mqttPublish = mqttPublish;
        this.lastHumi = NaN;
    }

    process(data) {
        var calcHumi = 0;

        calcHumi += (data[0] & 0xF); // Die ersten 4 Bit sind %
        calcHumi += (data[0] >> 4) * 10; // Die zweiten 4 Bit sind 10^1 %

	if(calcHumi <= 100) {
	        this.lastHumi = calcHumi;
		this.mqttPublish("OutdoorHumi", calcHumi.toFixed());
	}else{
		this.lastHumi = NaN;
	}
    }
}

export default OutdoorHumiPaser
