import WS2300Parser from './WS2300Parser.mjs';

/**
 * Emit data every number of bytes
 * @extends WS2300Parser
 * @summary A transform stream that helps to receive data from a WS2300
 */
class RainPaser extends WS2300Parser {
    constructor(mqttPublish) {
        super({ address: 0x4D2, length: 3 })
        this.mqttPublish = mqttPublish;
        this.lastCalcmm = NaN;
        this.queue1h = new Queue(60 * 60 * 1000);
        this.queue24h = new Queue(24 * 60 * 60 * 1000);
    }

    process(data) {
        var calcmm = 0;

        calcmm += (data[0] & 0xF) / 100.0; // Die ersten 4 Bit sind hundertstel mm
        calcmm += (data[0] >> 4) / 10.0; // Die zweiten 4 Bit sind zehntel mm
        calcmm += (data[1] & 0xF); // Die dritten 4 Bit sind mm
        calcmm += (data[1] >> 4) * 10; // Die zweiten 4 Bit sind 10^1 mm
        calcmm += (data[2] & 0xF) * 100; // Die ersten 4 Bit sind 10^2 mm
        calcmm += (data[2] >> 4) * 1000; // Die zweiten 4 Bit sind 10^3 mm

        var delta = calcmm - this.lastCalcmm;
        this.lastCalcmm = calcmm;

        if (!Number.isNaN(delta)) {
            this.queue1h.add(delta);
            this.queue24h.add(delta);
            this.mqttPublish("RainDelta", delta.toFixed(2));
            this.mqttPublish("Rain1h", this.queue1h.total().toFixed(2));
            this.mqttPublish("Rain24h", this.queue24h.total().toFixed(2));
        }
    }
}

class Queue {
    constructor(ageLimit) {
        this.ageLimit = ageLimit;
        this.queue = []
    }

    add(data) {
        this.queue.push(new QueueItem(data))
        var expireDate = Date.now() - this.ageLimit;
        while (this.queue[0].itemDate < expireDate) {
            this.queue.shift()
        }
    }

    total() {
        var result = 0;
        this.queue.forEach(element => {
            result += element.data
        });
        return result
    }

}

class QueueItem {
    constructor(data) {
        this.data = data
        this.itemDate = new Date()
    }
}

export default RainPaser