var Service, Characteristic;
var request = require("request");

module.export = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-nexia-thermostat", "NexiaThermostat", NexiaThermostat);
};

function NexiaThermostat(log, config) {
  this.log = log;
	this.name = config.name;
  this.service = new Service.Thermostat(this.name);
}

NexiaThermostat.prototype = {
  identify: function(callback) {
		this.log("Nexia Identify requested!");
		callback(null);
	},
	getCurrentHeatingCoolingState: function(callback) {
		callback(null);
  },
  setTargetHeatingCoolingState: function(targetHeatingCoolingState, callback) {
    callback(null);
  },
  getTargetHeatingCoolingState: function(callback) {
    callback(null);
  },
  getCurrentTemperature: function(callback) {
    callback(null);
  },
  getTargetTemperature: function(callback) {
    callback(null);
  },
  setTargetTemperature: function(value, callback) {
    callback(null)
  },
  getTemperatureDisplayUnits: function(callback) {
    callback(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
  },
  setTemperatureDisplayUnits: function(value, callback) {
    callback(null);
  },
  getCoolingThresholdTemperature: function(callback) {
    callback(null);
  },
  getHeatingThresholdTemperature: function(callback) {
    callback(null);
  },
  getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},
  getServices: function() {
    var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

		this.service
			.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
			.on('get', this.getCurrentHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetTemperature)
			.on('get', this.getTargetTemperature.bind(this))
			.on('set', this.setTargetTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TemperatureDisplayUnits)
			.on('get', this.getTemperatureDisplayUnits.bind(this))
			.on('set', this.setTemperatureDisplayUnits.bind(this));

		this.service
			.getCharacteristic(Characteristic.CoolingThresholdTemperature)
			.on('get', this.getCoolingThresholdTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.HeatingThresholdTemperature)
			.on('get', this.getHeatingThresholdTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		return [informationService, this.service];
	}
};
