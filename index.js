var Service, Characteristic;
var request = require('request');

module.export = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-nexia-thermostat", "Nexia Thermostat", NexiaThermostat);
}

function NexiaThermostat(log, config) {
  this.log = log;
	this.name = config.name;

  //https://www.mynexia.com/mobile/
	this.apiroute = config.apiroute;

  https://www.mynexia.com/mobile/houses/{houseId}
  this.houseId = config.houseId;

  //https://www.mynexia.com/mobile/xxl_zones/{zoneId}/zone_mode
  //https://www.mynexia.com/mobile/xxl_zones/{zoneId}/setpoints
  this.zoneId = config.zoneId;

  //response.result._links.child[0].data.items[{thermostatIndex}]
  this.thermostatIndex = config.thermostatIndex;

  //X-MobileId and X-ApiKey headers
	this.xMobileId = config.xMobileId;
	this.xApiKey = config.xApiKey;

  //Properties
  this.manufacturer = config.manufacturer;
  this.model = config.model;
  this.serialNumber = config.serialNumber;
}

//Prototype
NexiaThermostat.prototype = {
  //Helper methods
  convertRawToHeatingCoolingState = function(rawState) {
    if(rawState === "OFF") {
      return Characteristic.CurrentHeatingCoolingState.OFF;
    } else if (rawState === "COOL") {
      return Characteristic.CurrentHeatingCoolingState.COOL;
    } else if (rawState === "HEAT") {
      return Characteristic.CurrentHeatingCoolingState.HEAT;
    } else if (rawState === "AUTO") {
      return Characteristic.CurrentHeatingCoolingState.AUTO;
    }
  },
  convertRawToTargetHeatingCoolingState = function(rawState) {
    if(rawState === "OFF") {
      return Characteristic.TargetHeatingCoolingState.OFF;
    } else if (rawState === "COOL") {
      return Characteristic.TargetHeatingCoolingState.COOL;
    } else if (rawState === "HEAT") {
      return Characteristic.TargetHeatingCoolingState.HEAT;
    } else if (rawState === "AUTO") {
      return Characteristic.TargetHeatingCoolingState.AUTO;
    }
  },
  getThermostat = function(json) {
    return json.result._links.child[0].data.items[this.thermostatIndex]
  },
  httpRequest: function(url, method, callback) {
    request({
      url: this.apiroute + url,
      method: method,
      headers: {'X-MobileId': this.xMobileId, 'X-ApiKey': this.xApiKey}
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
  },
	//Start
	identify: function(callback) {
		this.log("Nexia Identify requested!");
		callback(null);
	},
	// Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState from:", this.apiroute);
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data) {
      if(error) {
        this.log("Error in getCurrentHeatingCoolingState: %s", error);
        callback(error)
      } else {
        this.log("getCurrentHeatingCoolingState succeeded");
        var rawData = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].current_zone_mode;
        return callback(null, convertRawToHeatingCoolingState(rawData));
      }
    }.bind(this));
  },
  setTargetHeatingCoolingState: function(targetHeatingCoolingState, callback) {
    //Do something...
    callback(null);//no error
  },
  getTargetHeatingCoolingState: function(callback) {
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data) {
      if(error) {
        this.log("Error in getCurrentHeatingCoolingState: %s", error);
        callback(error)
      } else {
        this.log("getTargetHeatingCoolingState succeeded");
        var rawData = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].current_zone_mode;
        return callback(null, convertRawToTargetHeatingCoolingState(rawData));
      }
    }.bind(this));
  },
  getCurrentTemperature: function(callback) {
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data) {
      if(error) {
        this.log("Error in getCurrentTemperature: %s", error);
        callback(error);
      } else {
        this.log("getCurrentTemperature succeeded");
        var f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].temperature;
        var c = ftoc(f);
        callback(null, c);
      }
    }.bind(this));
  },
  getTargetTemperature: function(callback) {
    this.httpRequest("houses/" + this.houseId, "GET", function(error, response, data){
      if(error) {
        this.log("Error in getTargetTemperature: %s", error);
        callback(error);
      } else {
        var systemStatus = data.result._links.child[0].data.items[this.thermostatIndex].system_status;
        //Get the current temperature
        var f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].temperature;
        //If cooling, return cool set point
        if(systemStatus === "Cooling") {
          f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.cool;
        }
        //If heating, return heat set point
        if(systemStatus === "Heating") {
          f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.heat;
        }
        var c = ftoc(f);
        callback(null, c);
      }
    }.bind(this));
  },
  setTargetTemperature: function(value, callback) {
    //Do something...
    callback(null);//no error
  },
  getTemperatureDisplayUnits: function(callback) {
    //Do something...
    callback(null);//no error
  },
  setTemperatureDisplayUnits: function(value, callback) {
    //Do something...
    callback(null);//no error
  },
  getCurrentRelativeHumidity: function(callback) {
    //Do something...
    callback(null);//no error
  },
  getTargetRelativeHumidity: function(callback) {
    //Do something...
    callback(null);//no error
  },
  setTargetRelativeHumidity: function(value, callback) {
    //Do something...
    callback(null);//no error
  },
  getCoolingThresholdTemperature: function(callback) {
    //Do something...
    callback(null);//no error
  },
  getHeatingThresholdTemperature: function(callback) {
    //Do something...
    callback(null);//no error
  },
  getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},
  getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

		// Required Characteristics
    var thermostatService = new Service.Thermostat(this.name);

		thermostatService
			.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
			.on('get', this.getCurrentHeatingCoolingState.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.TargetTemperature)
			.on('get', this.getTargetTemperature.bind(this))
			.on('set', this.setTargetTemperature.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.TemperatureDisplayUnits)
			.on('get', this.getTemperatureDisplayUnits.bind(this))
			.on('set', this.setTemperatureDisplayUnits.bind(this));

		// Optional Characteristics
		thermostatService
			.getCharacteristic(Characteristic.CurrentRelativeHumidity)
			.on('get', this.getCurrentRelativeHumidity.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.TargetRelativeHumidity)
			.on('get', this.getTargetRelativeHumidity.bind(this))
			.on('set', this.setTargetRelativeHumidity.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.CoolingThresholdTemperature)
			.on('get', this.getCoolingThresholdTemperature.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.HeatingThresholdTemperature)
			.on('get', this.getHeatingThresholdTemperature.bind(this));

		thermostatService
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		return [informationService, thermostatService];
	}
};
