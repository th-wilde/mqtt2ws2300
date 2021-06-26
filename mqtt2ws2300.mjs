import MqttClient from 'mqtt'
import mqttConf from './config.json'
import SerialPort from 'serialport'
import InterByteTimeout from '@serialport/parser-inter-byte-timeout'
import OutdoorTempParser from './parsers/OutdoorTempParser.mjs'
import IndoorTempParser from './parsers/IndoorTempParser.mjs'
import IndoorHumiParser from './parsers/IndoorHumiParser.mjs'
import OutdoorHumiParser from './parsers/OutdoorHumiParser.mjs'
import AirPressAbsParser from './parsers/AirPressAbsParser.mjs'
import AirPressRelParser from './parsers/AirPressRelParser.mjs'
import WindDataParser from './parsers/WindDataParser.mjs'
import Rain1hParser from './parsers/Rain1hParser.mjs'
import Rain24hParser from './parsers/Rain24hParser.mjs'
import RainTotalParser from './parsers/RainTotalParser.mjs'
import DewpointTempParser from './parsers/DewpointTempParser.mjs'
import WindchillTempParser from './parsers/WindchillTempParser.mjs'
import ForecastParser from './parsers/ForecastParser.mjs'
import TendencyParser from './parsers/TendencyParser.mjs'
import RecordTimeParser from './parsers/RecordTimeParser.mjs'

//Setup MQTT

const mqtt = MqttClient.connect(mqttConf.mqtt.server, mqttConf.mqtt.options);
const mqttPublish = function (name, value) {
	mqtt.publish(mqttConf.mqtt.prefix + name, value.toString(), mqttConf.mqtt.publish);
}

//homeassistant mqtt discovery
mqtt.on("connect",function(){	
	var retainOption = { "retain": true };
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"OutdoorTemp/config", '{"device_class": "temperature", "name": "Outdoor Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'OutdoorTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'OutdoorTemp" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"OutdoorHumi/config", '{"device_class": "humidity", "name": "Outdoor Humidity", "state_topic": "'+mqttConf.mqtt.prefix+'OutdoorHumi", "unit_of_measurement": "%", "unique_id": "'+mqttConf.mqtt.prefix+'OutdoorHumi" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"IndoorTemp/config", '{"device_class": "temperature", "name": "Indoor Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'IndoorTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'IndoorTemp" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"IndoorHumi/config", '{"device_class": "humidity", "name": "Indoor Humidity", "state_topic": "'+mqttConf.mqtt.prefix+'IndoorHumi", "unit_of_measurement": "%", "unique_id": "'+mqttConf.mqtt.prefix+'IndoorHumi" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"AirPressure_ABS/config", '{"device_class": "pressure", "name": "AirPressure ABS", "state_topic": "'+mqttConf.mqtt.prefix+'AirPressure_ABS", "unit_of_measurement": "hPa", "unique_id": "'+mqttConf.mqtt.prefix+'AirPressure_ABS" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"AirPressure_REL/config", '{"device_class": "pressure", "name": "AirPressure REL", "state_topic": "'+mqttConf.mqtt.prefix+'AirPressure_REL", "unit_of_measurement": "hPa", "unique_id": "'+mqttConf.mqtt.prefix+'AirPressure_REL" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"RainDelta/config", '{"name": "Rain Delta", "state_topic": "'+mqttConf.mqtt.prefix+'RainDelta", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'RainDelta" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Rain1h/config", '{"name": "Rain 1h", "state_topic": "'+mqttConf.mqtt.prefix+'Rain1h", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'Rain1h" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Rain24h/config", '{"name": "Rain 24h", "state_topic": "'+mqttConf.mqtt.prefix+'Rain24h", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'Rain24h" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"RainTotal/config", '{"name": "Rain Total", "state_topic": "'+mqttConf.mqtt.prefix+'RainTotal", "unit_of_measurement": "mm/m²", "unique_id": "'+mqttConf.mqtt.prefix+'Total" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindSpeedMs/config", '{"name": "Wind Speed", "state_topic": "'+mqttConf.mqtt.prefix+'WindSpeedMs", "unit_of_measurement": "m/s", "unique_id": "'+mqttConf.mqtt.prefix+'WindSpeedMs" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindSpeedKmh/config", '{"name": "Wind Speed", "state_topic": "'+mqttConf.mqtt.prefix+'WindSpeedKmh", "unit_of_measurement": "km/h", "unique_id": "'+mqttConf.mqtt.prefix+'WindSpeedKmh" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindDirectionDeg/config", '{"name": "Wind Direction Degree", "state_topic": "'+mqttConf.mqtt.prefix+'WindDirectionDeg", "unit_of_measurement": "°", "unique_id": "'+mqttConf.mqtt.prefix+'WindDirectionDeg" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindDirectionStr/config", '{"name": "Wind Direction Compass", "state_topic": "'+mqttConf.mqtt.prefix+'WindDirectionStr", "unique_id": "'+mqttConf.mqtt.prefix+'WindDirectionStr" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"DewpointTemp/config", '{"device_class": "temperature", "name": "Dewpoint Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'DewpointTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'DewpointTemp" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"WindchillTemp/config", '{"device_class": "temperature", "name": "Windchill Temperature", "state_topic": "'+mqttConf.mqtt.prefix+'WindchillTemp", "unit_of_measurement": "°C", "unique_id": "'+mqttConf.mqtt.prefix+'WindchillTemp" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Forecast/config", '{"name": "Forecast", "state_topic": "'+mqttConf.mqtt.prefix+'Forecast", "unique_id": "'+mqttConf.mqtt.prefix+'Forecast" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"Tendency/config", '{"name": "Tendency", "state_topic": "'+mqttConf.mqtt.prefix+'Tendency", "unique_id": "'+mqttConf.mqtt.prefix+'Tendency" }', retainOption);
	mqtt.publish("homeassistant/sensor/"+mqttConf.mqtt.prefix+"RecordTime/config", '{"name": "Weather Record Time", "state_topic": "'+mqttConf.mqtt.prefix+'RecordTime", "unique_id": "'+mqttConf.mqtt.prefix+'RecordTime" }', retainOption);
})

const port = new SerialPort(mqttConf.serial.port, {
	baudRate: 2400
})

port.setMaxListeners(20);

const Parsers = [
	new IndoorTempParser(mqttPublish),
	new IndoorHumiParser(mqttPublish),
	new OutdoorTempParser(mqttPublish),
	new OutdoorHumiParser(mqttPublish),
	new AirPressAbsParser(mqttPublish),
	new AirPressRelParser(mqttPublish),
	new WindDataParser(mqttPublish),
	new Rain1hParser(mqttPublish),
	new Rain24hParser(mqttPublish),
	new RainTotalParser(mqttPublish),
	new DewpointTempParser(mqttPublish),
	new WindchillTempParser(mqttPublish),
	new ForecastParser(mqttPublish),
	new TendencyParser(mqttPublish),
	new RecordTimeParser(mqttPublish),
]

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
	currentCommand = 0;
	currentCommandByte = 0;
	byteByByteSender();
}

const nextCommand = function () {
	currentCommand = currentCommand + 1;
	currentCommandByte = 0;
	byteByByteSender();
}

var timeout = null;

const byteByByteSender = function () {
	if(timeout) {
		clearTimeout(timeout);
	}
	
	var commandLength = Parsers[currentCommand % Parsers.length].preamble.length;
	if (currentCommand < Parsers.length) {
		if(currentCommandByte < commandLength) {
			port.write(Parsers[currentCommand].command[currentCommandByte], function (err) {
				if (err) {
					console.log("error sending" + Parsers[currentCommand][currentCommandByte]);
				}
			});
			currentCommandByte++
		}
		timeout = setTimeout(function () {
			currentCommandByte = 0;
			byteByByteSender();
		}, 200);
	}
}

const parser = port.pipe(new InterByteTimeout({ interval: 50 }))
parser.on('data', function (data) { byteByByteSender(); })


Parsers.forEach(element => {
	port.pipe(element).on('processed', nextCommand)
});

setInterval(function () {
	sendCommand()
}, 32000);
