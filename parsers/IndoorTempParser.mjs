import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class IndoorTempPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x346, length: 2 })
        this.mqttPublish = mqttPublish;
    }

    process(data) {
        var calcTemp = -30; //Entfernt den Offset der WetterStation

        calcTemp += (data[0] & 0xF) / 100.0; // Die ersten 4 Bit sind hundertstel Grad Celsius
        calcTemp += (data[0] >> 4) / 10.0; // Die zweiten 4 Bit sind zehntel Grad Celsius			
        calcTemp += (data[1] & 0xF); // Die dritten 4 Bit sind Grad Celsius
        calcTemp += (data[1] >> 4) * 10; // Die vierten 4 Bit sind 10^1 Grad Celsius

        if (calcTemp < 80) {
            this.mqttPublish("IndoorTemp", calcTemp.toFixed(2));
        }
    }
}

export default IndoorTempPaser