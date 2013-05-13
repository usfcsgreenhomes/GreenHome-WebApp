// Devices_Statuses_Models ---------------------------------------- BEGIN //


var currentTime = new Date();

//MODEL: DEFAULT ATTRIBUTES OF DEVICE MODEL 
var deviceModel = Backbone.Model.extend({        
    defaults: function() {
      return {
        name: "empty...",
        id: -100,  //effectively the device_id
        location: "",
        powered: false,
        pluggedIn: false,
        udid: "",
                        //onOff: {}, - not necessary considering the Actions collection holds more comprehensive info
        onOffState: this.onOffState(), //Actually, it is necessary, and so this is a function to get it from the Actions Collection
        
        collectionFlag: false,  //only devices which have been added to the deviceList Collection can store statuses
        statuses: null,
        
        currentStatus: {},
        
        modelUpdated: currentTime,  // needs to be updated from the set function
        
        bulk: {} //debugging purposes
      };
    },
 
    initialize: function() {
        
        //This deviceModel will be instantiated like so:  device = new deviceModel({bulk: infoFromApi});
        
      if(this.get("bulk") != {}) {
        if(this.get('bulk').name!=undefined && this.get('bulk').name!=''){
            this.set({"name":this.get('bulk').name, 'currentStatus':this.get('bulk').currentStatus, 'id':this.get('bulk').id, 'location':this.get('bulk').location, 'meterSupplyingPower':this.get('bulk').meterSupplyingPower, 'onOff':this.get('bulk').onOff, 'meterPluggedIn':this.get('bulk').meterPluggedIn,'udid':this.get('bulk').udid});  //'onOff':this.get('bulk').onOff - - not necessary considering the Actions collection holds more comprehensive info
            
            if(this.get("bulk").onOff != undefined) {
                
                //First, calculate the displayed On Off state of device, given what we know
                if(this.get("bulk").onOff.latest != undefined) {
                    var onBool = this.get("bulk").onOff.latest.value;
                } else if (this.get("bulk").currentStatus!=undefined && this.get("bulk").meterSupplyingPower == true && this.get("bulk").currentStatus.powerDraw != 0) {  //If that object is undefined, we construct the best guess
                    var onBool = true;
                } else if (this.get("bulk").meterSupplyingPower == true ) {
                    var onBool = true;
                } else {
                    var onBool = false;
                }
                this.set({'onBool': onBool});
            } else {
                
                this.set({'onBool': false});
            }
        
            this.set({'bulk':{}});   //remove superficial object
        
      }
      } else
      {return false;}

    },
    
    onOffState: function() {
        return true;
        //console.log('Checking for On Off Status');
        
        //This function may be called before Actions are ready, so for that scenario we will pass -100 as the value
        if(userAppModel.get('doneActions') == 1){
            
            //console.log('This returns a good value ACTIONS: ' + Actions.where({device_id:177})[0].attributes.currentValue);
            
        return Actions.where({device_id:177})[0].attributes.currentValue;
        } else {
        return -100;}
    },

    

    // Remove this device from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }   
});
        
//COLLECTION: STORES DEVICE MODELS
  // Device Collection
  // ---------------

  var DeviceList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: deviceModel,
    localStorage: new Store("greenhome-backbone")
    
    /*comparator: function(Model) {
      var str = Model.get("name");
        str = str.toLowerCase();
        str = str.split("");
        str = _.map(str, function(letter) { 
          return String.fromCharCode(-(letter.charCodeAt(0)));
        });
        return str;
    }
    
    */
  });

    //OVERRIDE DeviceList's add method to disallow duplicate
    
    DeviceList.prototype.add = function(device) {
        /* Anti-duplication code. */
        if (this.length != 0) {
        var outerFlag;
        this.any(function(_device) {
            outerFlag = _device.get('id') === device.get('id');
        });
        if (outerFlag) {
            // **** either return false or throw an exception -- silently ignores
            return false;
        } else {
            
            device.set({'collectionFlag':true});  // which will allow it to store statuses
        }
        outerFlag = false;
        } 
        Backbone.Collection.prototype.add.call(this, device);
    }

//MODEL: STATUS MODEL   --  these are stored in a  globally accesable (instance of) statusList collection
var statusModel = Backbone.Model.extend({        
    defaults: function() {
      return {
        "device_id" : -10,
        "timestamp":0,
        "id":0,
        "voltage":0,
        "current":0,
        "energyConsumed":0,
        "powerDraw":0,
        "collectionFlag": false,
        "bulk":{}
      }
    },
    
    initialize: function() {

      if(this.get("bulk") != {}) {
        this.set({'device_id': this.get('bulk').device_id, 'timestamp': this.get('bulk').timestamp,"id":this.get('bulk').id, 'voltage':this.get('bulk').voltage, 'current':this.get('bulk').current, 'powerDraw':this.get('bulk').powerDraw});
        
        //console.log("Model's device ID " + this.get('device_id') +"Model's Status ID " + this.get('id') + " timestamp " + this.get('timestamp') + " powerDraw " + this.get('powerDraw'));
        
        this.set({'bulk':{}});   //remove superficial object
      }
    }
});
    
//COLLECTION: STATUS COLLECTION -- this collection is initialized for each device model
var statusList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: statusModel,

    // Save all of the device statuses under the `"greenhome"` namespace.
    localStorage: new Store("greenhome-backbone"),

    // statuses are sorted by their timestamp.
    comparator: function(status) {
        return -status.get("timestamp"); // the minus sign is intentional
    }

  });

    //OVERRIDE DeviceList's add method to disallow duplicate
    
    statusList.prototype.add = function(status) {
        var isDup = this.any(function(_status) {
            return _status.get('id') === status.get('id');
        });
        if (isDup) {
            // **** either return false or throw an exception -- perhaps silently ignore
            return false;
        } else {
            
            //status.set({'collectionFlag':true});  // which will allow it to store statuses
        }
        Backbone.Collection.prototype.add.call(this, status);
    }

//MODEL: ACTION MODEL   --  these are stored in a  globally accesable (instance of) ActionList collection
var actionModel = Backbone.Model.extend({        
    defaults: function() {
      return {
        "id":0,
        "uaid": "",
        "name": "",
        "device_id" : -10,
        "values": [],
        "currentValue":-1000,
        "executionDate":0,
        "latest": {},
        "collectionFlag": false,
        "bulk":{}
      }
    },
    
    initialize: function() {
            //console.log('package: ' + this.get('bulk'));
      if(this.get("bulk") != {}) {
        this.set({
        
            "uaid": this.get('bulk').uaid,
            "name": this.get('bulk').name,
            
            "currentValue": this.get('bulk').latest.value,
            "executionDate": this.get('bulk').latest.executionDate,
            "device_id": this.get('bulk').deviceId,
            
            "values":this.get('bulk').values,
            "id":this.get('bulk').id
            });
        
        //console.log("Model's device ID " + this.get('device_id') +"Model's id: " + this.get('id') + ", uaid: " + this.get('uaid') + ", name: " + this.get('name'));
        
        this.set({'bulk':{}});   //reset passed (superficial) object
      }
    }
});

//COLLECTION: STORES DEVICE ACTIONS
  // Actions Collection
  // ---------------

  var ActionList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: actionModel,

    localStorage: new Store("greenhome-backbone")

  });

    //OVERRIDE DeviceList's add method to disallow duplicate
    
    ActionList.prototype.add = function(action) {
        /* Anti-duplication code. */
        if (this.length != 0) {
        var outerFlag;
        this.any(function(_action) {
            outerFlag = _action.get('uaid') === action.get('uaid');
        });
        if (outerFlag) {
            // **** either return false or throw an exception -- silently ignores
            return false;
        } else {
            
            action.set({'collectionFlag':true});  // which will allow it to store statuses
        }
        outerFlag = false;
        } 
        Backbone.Collection.prototype.add.call(this, action);
    }

//Create devices COLLECTION
Devices = new DeviceList;
        
//Keep them alphabetical
Devices.comparator = function(model) {
  return model.get("name");
};
        
//Create actions COLLECTION
Actions = new ActionList;

//Create statuses Collection
statusesCollection = new statusList;


// END ---------------------------------------- Devices_Statuses_Models //