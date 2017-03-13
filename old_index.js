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
    var currentTemperature = 0;
    var currentHeat = 0;
    var currentCool = 0;
    var isHeating = false;
    var isCooling = false;
    var isWaiting = false;
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data){
      if(error) {
        this.log("Error in setTargetTemperature: %s", error);
      } else {
        this.log("setTargetTemperature succeded");
        var systemStatus = data.result._links.child[0].data.items[this.thermostatIndex].system_status;
        if(systemStatus === "Waiting...") {
          isWaiting = true;
        } else if(systemStatus === "Heating") {
          isHeating = true;
        } else if(systemStatus === "Cooling") {
          isCooling = true;
        }

        currentTemperature = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].temperature;
        currentHeat = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.heat;
        currentCool = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.cool;

        var heatSetPoint = currentHeat;
        var coolSetPoint = currentCool;

        if(currentHeat === currentCool) {
          coolSetPoint = this.ctof(value);
          heatSetPoint = this.ctof(value);
        } else if (isWaiting) {
          if(currentTemperature === currentHeat) {
            heatSetPoint = this.ctof(value);
          }
          if(currentTemperature === currentCool) {
            coolSetPoint = this.ctof(value);
          }
        } else if (isHeating) {
          heatSetPoint = this.ctof(value);
        } else if (isCooling) {
          coolSetPoint = this.ctof(value);
        }

        var postUrl = data.result._links.child[0].data.items[this.thermostatIndex].features[0].actions.set_heat_setpoint.href;
        request({
          url: postUrl,
          method: "POST",
          headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey},
          body: { "heat" : heatSetPoint, "cool":coolSetPoint }
        },
        function (error, response, body) {
          if(error) {
            this.log("Error in post setpoints: %s", error);
            callback(error);
          } else {
            this.log("Success in setpoint setting");
            callback(null);
          }
        })
      }
    }.bind(this));
  },
  getTemperatureDisplayUnits: function(callback) {
    callback(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
  },
  setTemperatureDisplayUnits: function(value, callback) {
    callback(null);//no error
  },
  getCoolingThresholdTemperature: function(callback) {
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data){
      if(error) {
        this.log("Error in getCoolingThresholdTemperature: %s", error);
        callback(error);
      } else {
        this.log("getCoolingThresholdTemperature succeeded");
        var currentCool = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.cool;
        var currentCoolC = this.ftoc(currentCool);
        callback(null,  currentCoolC);
      }
    }.bind(this));
  },
  getHeatingThresholdTemperature: function(callback) {
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data){
      if(error) {
        this.log("Error in getHeatingThresholdTemperature: %s", error);
        callback(error);
      } else {
        this.log("getHeatingThresholdTemperature succeeded");
        var currentHeat = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.heat;
        var currentHeatC = this.ftoc(currentHeat);
        callback(null, currentHeatC);
      }
    }.bind(this));
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
