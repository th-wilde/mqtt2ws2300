import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class Rain1hParser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x4B4, length: 3 })
        this.mqttPublish = mqttPublish;
    }

    process(data) {
        var calcmm = 0;

        calcmm += (data[0] & 0xF) / 100.0; // Die ersten 4 Bit sind hundertstel mm
        calcmm += (data[0] >> 4) / 10.0; // Die zweiten 4 Bit sind zehntel mm
        calcmm += (data[1] & 0xF); // Die dritten 4 Bit sind mm
        calcmm += (data[1] >> 4) * 10; // Die zweiten 4 Bit sind 10^1 mm
        calcmm += (data[2] & 0xF) * 100; // Die ersten 4 Bit sind 10^2 mm
        calcmm += (data[2] >> 4) * 1000; // Die zweiten 4 Bit sind 10^3 mm

		this.mqttPublish("Rain1h", calcmm.toFixed(2));
	}
}

export default Rain1hParser