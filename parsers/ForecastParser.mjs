import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class ForecastPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x26B, length: 1 })
        this.mqttPublish = mqttPublish;
		this.forecastMap = {
			0: "rainy",
			1: "cloudy",
			2: "sunny",
		};
    }

    process(data) {
		//0 = rain, 1 = cloudy, 2 = sunny
        var forecast = data[0] & 0xF; 
        this.mqttPublish("Forecast", this.forecastMap[forecast]);
    }
}

export default ForecastPaser