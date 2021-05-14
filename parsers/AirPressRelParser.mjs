import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class AirPressRelPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x5E2, length: 3 })
        this.mqttPublish = mqttPublish;
    }

    process(data) {
        var calchPa = 0;
        calchPa += (data[0] & 0xF) / 10.0; 	//The first  4 bits are 10^-1 hPa
        calchPa += (data[0] >> 4); 			//The second 4 bits are 10^0  hPa
        calchPa += (data[1] & 0xF) * 10; 	//The third  4 bits are 10^1  hPa
        calchPa += (data[1] >> 4) * 100; 	//The forth  4 bits are 10^2  hPa
        calchPa += (data[2] & 0xF) * 1000; 	//The fith   4 bits are 10^3  hPa

        this.mqttPublish("AirPressure_REL", calchPa.toFixed(2))
    }
}

export default AirPressRelPaser