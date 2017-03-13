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
  this.apiroute = config.apiroute;
  this.houseId = config.houseId;
  this.thermostatIndex = config.thermostatIndex;
  this.xMobileId = config.xMobileId;
	this.xApiKey = config.xApiKey;
  this.manufacturer = config.manufacturer;
  this.model = config.model;
  this.serialNumber = config.serialNumber;
  this.service = new Service.Thermostat(this.name);
}

NexiaThermostat.prototype = {
  identify: function(callback) {
		this.log("Nexia Identify requested!");
		callback(null);
	},
	getCurrentHeatingCoolingState: function(callback) {

  },
  setTargetHeatingCoolingState: function(targetHeatingCoolingState, callback) {

  },
  getTargetHeatingCoolingState: function(callback) {

  },
  getCurrentTemperature: function(callback) {

  },
  getTargetTemperature: function(callback) {

  },
  setTargetTemperature: function(value, callback) {

  },
  getTemperatureDisplayUnits: function(callback) {
    callback(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
  },
  setTemperatureDisplayUnits: function(value, callback) {
    callback(null);//no error
  },
  getCoolingThresholdTemperature: function(callback) {

  },
  getHeatingThresholdTemperature: function(callback) {
    
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
	},
  httpRequest: function(url, method, callback) {
    request({
      url: this.apiroute + url,
      method: method,
      headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey}
    },
    function (error, response, body) {
      var data = JSON.parse(body);
      callback(error, response, data)
    })
  },
  ctof: function(c){
    return c * 1.8000 + 32.00;
  },
  ftoc: function(f){
    return (f-32.0) / 1.8;
  }
};
