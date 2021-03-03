import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class WindDataPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x527, length: 3 })
        this.mqttPublish = mqttPublish;
        this.lastWindSpeed = NaN;
    }

    process(data) {
        //Nibbel 5 umd 4 und 3 ergänzen und Dezimalwert durch 10 teilen.
        var calcms = (((data[2] & 0xF) << 8) + (data[1])) / 10.0;

        //Nibbel 6 * 22.5 (22.5 weil 360/16 [Ein Nibbel = 4 Bit = 16 Zustände])
        //WinkelGrad von Norden aus im Uhrzeigersinn
        var caldeg = (data[2] >> 4) * 22.5;

        //Ungülige Wind-Daten erkennen
        if ((data[0] == 0x00) && ((data[1] != 0xFF) || (((data[2] & 0xF) != 0) && ((data[2] & 0xF) != 1)))) {
            this.lastWindSpeed = calcms;
            this.mqttPublish("WindSpeed", calcms.toFixed(1));
            this.mqttPublish("WindDirection", caldeg.toFixed(1));
        }else{
            this.lastWindSpeed = NaN;
        }
    }
}

export default WindDataPaser