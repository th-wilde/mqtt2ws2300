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
	var calckmh = calcms * 60 * 60;
        //Nibbel 6 * 22.5 (22.5 weil 360/16 [Ein Nibbel = 4 Bit = 16 Zustände])
        //WinkelGrad von Norden aus im Uhrzeigersinn
		var direction = data[2] >> 4;
        var caldeg = direction * 22.5;

        //Ungülige Wind-Daten erkennen
        if ((data[0] == 0x00) && ((data[1] != 0xFF) || (((data[2] & 0xF) != 0) && ((data[2] & 0xF) != 1)))) {
            this.lastWindSpeed = calcms;
            this.mqttPublish("WindSpeedMs", calcms.toFixed(1));
            this.mqttPublish("WindSpeedKmh", calckmh.toFixed(1));
            this.mqttPublish("WindDirectionDeg", caldeg.toFixed(1));
			switch (direction){
				case 0:
					this.mqttPublish("WindDirectionStr", "N");
					break;
				case 1:
					this.mqttPublish("WindDirectionStr", "NNE");
					break;
				case 2:
					this.mqttPublish("WindDirectionStr", "NE");
					break;
				case 3:
					this.mqttPublish("WindDirectionStr", "ENE");
					break;
				case 4:
					this.mqttPublish("WindDirectionStr", "E");
					break;
				case 5:
					this.mqttPublish("WindDirectionStr", "ESE");
					break;
				case 6:
					this.mqttPublish("WindDirectionStr", "SE");
					break;
				case 7:
					this.mqttPublish("WindDirectionStr", "SSE");
					break;
				case 8:
					this.mqttPublish("WindDirectionStr", "S");
					break;
				case 9:
					this.mqttPublish("WindDirectionStr", "SSW");
					break;
				case 10:
					this.mqttPublish("WindDirectionStr", "SW");
					break;
				case 11:
					this.mqttPublish("WindDirectionStr", "WSW");
					break;
				case 12:
					this.mqttPublish("WindDirectionStr", "W");
					break;
				case 13:
					this.mqttPublish("WindDirectionStr", "WNW");
					break;
				case 14:
					this.mqttPublish("WindDirectionStr", "NW");
					break;
				case 15:
					this.mqttPublish("WindDirectionStr", "NNW");
					break;
			}
        }else{
            this.lastWindSpeed = NaN;
        }
    }
}

export default WindDataPaser
