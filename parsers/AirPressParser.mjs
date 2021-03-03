import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class AirPressPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x5D8, length: 3 })
        this.mqttPublish = mqttPublish;
    }

    calcRel(abshPa) {
        return abshPa + 11.25; //apply correction of measure location
    }

    process(data) {
        var calchPa = 7.45; //Correction based on other sources

        calchPa += (data[0] & 0xF) / 10.0; // Die ersten 4 Bit sind zehntel hPa
        calchPa += (data[0] >> 4); // Die zweiten 4 Bit sind hPa
        calchPa += (data[1] & 0xF) * 10; // Die dritten 4 Bit sind 10^1 hPa
        calchPa += (data[1] >> 4) * 100; // Die zweiten 4 Bit sind 10^2 hPa
        calchPa += (data[2] & 0xF) * 1000; // Die ersten 4 Bit sind 10^3 hPa

        this.mqttPublish("AirPressure_ABS", calchPa.toFixed(2))
        this.mqttPublish("AirPressure_REL", this.calcRel(calchPa).toFixed(2))
    }
}

export default AirPressPaser