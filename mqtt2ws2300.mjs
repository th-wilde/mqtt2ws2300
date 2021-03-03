import MqttClient from 'mqtt'
import mqttConf from './config.json'
import SerialPort from 'serialport'
import InterByteTimeout from '@serialport/parser-inter-byte-timeout'
import OutdoorTempParser from './parsers/OutdoorTempParser.mjs'
import IndoorTempParser from './parsers/IndoorTempParser.mjs'
import IndoorHumiParser from './parsers/IndoorHumiParser.mjs'
import OutdoorHumiParser from './parsers/OutdoorHumiParser.mjs'
import AirPressParser from './parsers/AirPressParser.mjs'
import WindDataParser from './parsers/WindDataParser.mjs'
import RainPaser from './parsers/RainParser.mjs'
import { ADDRESS_WIDTH } from './parsers/WS2300Parser.mjs'

//Setup MQTT

const mqtt = MqttClient.connect(mqttConf.mqtt.server, mqttConf.mqtt.options);
const mqttPublish = function (name, value) {
	mqtt.publish(mqttConf.mqtt.prefix + name, value.toString(), mqttConf.mqtt.publish);
}

//homeassistant mqtt discovery
mqtt.on("connect",function(){	
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"OutdoorTemp/config", '{"device_class": "temperature", "name": "Outdoor Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'OutdoorTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'OutdoorTemp" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"OutdoorHumi/config", '{"device_class": "humidity", "name": "Outdoor Humidity", "state_topic": "'+mqttConf.mqtt.prefix+'OutdoorHumi", "unit_of_measurement": "%", "unique_id": "'+mqttConf.mqtt.prefix+'OutdoorHumi" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"IndoorTemp/config", '{"device_class": "temperature", "name": "Indoor Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'IndoorTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'IndoorTemp" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"IndoorHumi/config", '{"device_class": "humidity", "name": "Indoor Humidity", "state_topic": "'+mqttConf.mqtt.prefix+'IndoorHumi", "unit_of_measurement": "%", "unique_id": "'+mqttConf.mqtt.prefix+'IndoorHumi" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"AirPressure_ABS/config", '{"device_class": "pressure", "name": "AirPressure ABS", "state_topic": "'+mqttConf.mqtt.prefix+'AirPressure_ABS", "unit_of_measurement": "hPa", "unique_id": "'+mqttConf.mqtt.prefix+'AirPressure_ABS" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"AirPressure_REL/config", '{"device_class": "pressure", "name": "AirPressure REL", "state_topic": "'+mqttConf.mqtt.prefix+'AirPressure_REL", "unit_of_measurement": "hPa", "unique_id": "'+mqttConf.mqtt.prefix+'AirPressure_REL" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"RainDelta/config", '{"name": "Rain Delta", "state_topic": "'+mqttConf.mqtt.prefix+'RainDelta", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'RainDelta" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Rain1h/config", '{"name": "Rain 1h", "state_topic": "'+mqttConf.mqtt.prefix+'Rain1h", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'Rain1h" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Rain24h/config", '{"name": "Rain 24h", "state_topic": "'+mqttConf.mqtt.prefix+'Rain24h", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'Rain24h" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindSpeed/config", '{"name": "Wind Speed", "state_topic": "'+mqttConf.mqtt.prefix+'WindSpeed", "unit_of_measurement": "km/h", "unique_id": "'+mqttConf.mqtt.prefix+'WindSpeed" }', mqttConf.mqtt.publish);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindDirection/config", '{"name": "Wind Direction", "state_topic": "'+mqttConf.mqtt.prefix+'WindDirection", "unit_of_measurement": "°", "unique_id": "'+mqttConf.mqtt.prefix+'WindDirection" }', mqttConf.mqtt.publish);
})

//WS2300 stuff

const RESET_COMMAND = 0x06;

const port = new SerialPort(mqttConf.serial.port, {
	baudRate: 2400
})

const encodeAddress = function (address, position) {

	return 0x82 + (((address >> (4 * (3 - position))) & 0x0F) * 4) //Bits nach rechts verschieben und das Nibble (letzten 4 Bit) mit 0x82 (Befehl für die WS) addieren.
}

const encodeRead = function (numberOfBytes) {
	return (0xC2 + numberOfBytes * 4); // Byteanzahl * 4 + Befehl (0xC2)
}

const commandBuilder = function (parser) {
	var command = []

	command.push(Buffer.from([RESET_COMMAND]))
	for (var i = 1; i <= ADDRESS_WIDTH; i++) {
		command.push(Buffer.from([encodeAddress(parser.address, i - 1)]))
	}
	command.push(Buffer.from([encodeRead(parser.length)]))

	return command
}

const outdoorTempParser = new OutdoorTempParser(mqttPublish)
const outdoorHumiParser = new OutdoorHumiParser(mqttPublish)
const windDataParser = new WindDataParser(mqttPublish)

const Parsers = [
	outdoorTempParser,
	new IndoorTempParser(mqttPublish),
	outdoorHumiParser,
	new IndoorHumiParser(mqttPublish),
	new AirPressParser(mqttPublish),
	windDataParser,
	new RainPaser(mqttPublish),
]


const CommandLoop = []
for(var i = 0; i < 16; i++){
	CommandLoop.push([])
}
Parsers.forEach(element => {
	CommandLoop.push(commandBuilder(element))
});

var currentCommand = 0;
var currentCommandByte = 0;

// Open errors will be emitted as an error event
port.on('error', function (err) {
	console.log('Error: ', err.message)
})

port.on('open', function () {
	port.set({ dtr: false })
})

const sendCommand = function () {
	currentCommandByte = 0;
	byteByByteSender();
}

const nextCommand = function () {
	currentCommand = (currentCommand + 1) % CommandLoop.length
	if (currentCommand == 0) {
		var windchill = windChillCalc(outdoorTempParser.lastTemp, windDataParser.lastWindSpeed);
		if (!Number.isNaN(windchill)) {
			mqtt.publish(mqttConf.mqtt.prefix + "Windchill", windchill.toString(), mqttConf.mqtt.publish);
		}
		var dewPoint = dewPointCalc(outdoorTempParser.lastTemp, outdoorHumiParser.lastHumi);
		if (!Number.isNaN(dewPoint)) {
			mqtt.publish(mqttConf.mqtt.prefix + "DewPoint", dewPoint.toString(), mqttConf.mqtt.publish);
		}
		mqtt.publish(mqttConf.mqtt.prefix + "FullRecord", new Date().toUTCString(), mqttConf.mqtt.publish);
	}
}

const byteByByteSender = function () {
	if (CommandLoop[currentCommand].length == 0) {
		nextCommand();
	}
	else if (currentCommandByte < CommandLoop[currentCommand].length) {
		port.write(CommandLoop[currentCommand][currentCommandByte], function (err) {
			if (err) {
				console.log("error sending" + CommandLoop[currentCommand][currentCommandByte]);
			}
		});
		currentCommandByte++
	}
}

const parser = port.pipe(new InterByteTimeout({ interval: 50 }))
parser.on('data', function (data) { byteByByteSender(); })

Parsers.forEach(element => {
	port.pipe(element).on('processed', nextCommand)
});

setInterval(function () {
	sendCommand()
}, 2000);

const windChillCalc = function (temp, speed) {
	var kmh = (speed * 3.6)
	if (kmh >= 5) {
		return 13.12 + (0.6215 * temp) + ((0.3965 * temp - 11.37) * kmh)
	} else {
		return temp;
	}
}

const K2 = 17.62
const K3 = 243.12
const dewPointCalc = function (temp, humi) {
	var k3v = (K3 + temp)
	var rel = humi / 100;
	return K3 * (
		(((K2 * temp) / k3v) + Math.log(rel)) /
		(((K2 * K3) / k3v) - Math.log(rel))
	)
}