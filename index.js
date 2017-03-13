var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
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
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute + "houses/" + this.houseId,
			headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
        var data = JSON.parse(body);
        var rawState = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].current_zone_mode;
        var characteristic = Characteristic.CurrentHeatingCoolingState.OFF;
        if (rawState === "COOL") {
          characteristic = Characteristic.CurrentHeatingCoolingState.COOL;
        } else if (rawState === "HEAT") {
          characteristic = Characteristic.CurrentHeatingCoolingState.HEAT;
        } else if (rawState === "AUTO") {
          characteristic = Characteristic.CurrentHeatingCoolingState.AUTO;
        }
        return callback(null, characteristic);
			} else {
				this.log("Error getting CurrentHeatingCoolingState: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTargetHeatingCoolingState: function(callback) {
		this.log("getTargetHeatingCoolingState from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute + "houses/" + this.houseId,
      headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var data = JSON.parse(body);
        var rawState = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].current_zone_mode;

        var characteristic = Characteristic.TargetHeatingCoolingState.OFF;
        if (rawState === "COOL") {
          characteristic = Characteristic.TargetHeatingCoolingState.COOL;
        } else if (rawState === "HEAT") {
          characteristic = Characteristic.TargetHeatingCoolingState.HEAT;
        } else if (rawState === "AUTO") {
          characteristic = Characteristic.TargetHeatingCoolingState.AUTO;
        }
        return callback(null, characteristic);
			} else {
				this.log("Error getting TargetHeatingCoolingState: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	setTargetHeatingCoolingState: function(value, callback) {
		if(value === undefined) {
			callback(); //Some stuff call this without value doing shit with the rest
		} else {
			callback(null);
		}
	},
	getCurrentTemperature: function(callback) {
		this.log("getCurrentTemperature from:", this.apiroute+"/status");
		request.get({
      url: this.apiroute + "houses/" + this.houseId,
      headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var data = JSON.parse(body);
        var f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].temperature;
        var c = (f-32.0) / 1.8;
        callback(null, c);
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTargetTemperature: function(callback) {
		this.log("getTargetTemperature from:", this.apiroute+"/status");
		request.get({
      url: this.apiroute + "houses/" + this.houseId,
      headers: {"Content-Type": "application/json", "X-MobileId": this.xMobileId, "X-ApiKey": this.xApiKey}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var data = JSON.parse(body);
        var systemStatus = data.result._links.child[0].data.items[this.thermostatIndex].system_status;
        var f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].temperature;
        if(systemStatus === "Cooling") {
          f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.cool;
        }
        if(systemStatus === "Heating") {
          f = data.result._links.child[0].data.items[this.thermostatIndex].zones[0].setpoints.heat;
        }
        var c = (f-32.0) / 1.8;
        callback(null, c);
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	setTargetTemperature: function(value, callback) {
		this.log("setTargetTemperature from:", this.apiroute+"/targetTemperature/"+value);
		request.get({
			url: this.apiroute+"/targetTemperature/"+value,
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				callback(null); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		var error = null;
		callback(error, this.temperatureDisplayUnits);
	},
	setTemperatureDisplayUnits: function(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		var error = null;
		callback(error);
	},

	// Optional
	getCurrentRelativeHumidity: function(callback) {
		this.log("getCurrentRelativeHumidity from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute+"/status",
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body); //{"state":"OFF","targetStateCode":5,"temperature":"18.10","humidity":"34.10"}

				if (json.currentRelativeHumidity != undefined)
                                {
                                  this.log("Humidity state is %s", json.currentRelativeHumidity);
                                  this.currentRelativeHumidity = parseFloat(json.currentRelativeHumidity);
                                }
                                else
                                {
                                  this.log("Humidity %s", json.humidity);
                                  this.currentRelativeHumidity = parseFloat(json.humidity);
                                }

				callback(null, this.currentRelativeHumidity); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTargetRelativeHumidity: function(callback) {
		this.log("getTargetRelativeHumidity:", this.targetRelativeHumidity);
		var error = null;
		callback(error, this.targetRelativeHumidity);
	},
	setTargetRelativeHumidity: function(value, callback) {
		this.log("setTargetRelativeHumidity from/to :", this.targetRelativeHumidity, value);
		this.log("setTargetRelativeHumidity not implemented with API");
		this.targetRelativeHumidity = value;
		var error = null;
		callback(error);
	},
	getCoolingThresholdTemperature: function(callback) {
		this.log("getCoolingThresholdTemperature: ", this.coolingThresholdTemperature);
		var error = null;
		callback(error, this.coolingThresholdTemperature);
	},
	getHeatingThresholdTemperature: function(callback) {
		this.log("getHeatingThresholdTemperature :" , this.heatingThresholdTemperature);
		var error = null;
		callback(error, this.heatingThresholdTemperature);
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
			.setCharacteristic(Characteristic.Manufacturer, "HTTP Manufacturer")
			.setCharacteristic(Characteristic.Model, "HTTP Model")
			.setCharacteristic(Characteristic.SerialNumber, "HTTP Serial Number");



		// Required Characteristics
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

		// Optional Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentRelativeHumidity)
			.on('get', this.getCurrentRelativeHumidity.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetRelativeHumidity)
			.on('get', this.getTargetRelativeHumidity.bind(this))
			.on('set', this.setTargetRelativeHumidity.bind(this));

		this.service
			.getCharacteristic(Characteristic.CoolingThresholdTemperature)
			.on('get', this.getCoolingThresholdTemperature.bind(this));


		this.service
			.getCharacteristic(Characteristic.HeatingThresholdTemperature)
			.on('get', this.getHeatingThresholdTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));
		this.service.getCharacteristic(Characteristic.CurrentTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});
		this.service.getCharacteristic(Characteristic.TargetTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});
		this.log(this.minTemp);
		return [informationService, this.service];
	}
};
