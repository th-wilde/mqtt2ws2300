import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class TendencyPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x26C, length: 1 })
        this.mqttPublish = mqttPublish;
		this.tendencyMap = {
			0: "constant",
			1: "rising",
			2: "falling",
		};
    }

    process(data) {
		//0 = constant, 1 = rising, 2 = falling
        var tendency = data[0] & 0xF; 
        this.mqttPublish("Tendency", this.tendencyMap[tendency]);
    }
}

export default TendencyPaser