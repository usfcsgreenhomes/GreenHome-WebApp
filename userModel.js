//First let me say that, Devices, Actions, and statusesCollection have already been instantiated
//If you are curious as to device/status models, etc and their structures, please open Devices_Statuses_Models.js
//MODEL: User Model
var UserAppModel_pd = Backbone.Model.extend({

	defaults: function () {
		return {

			//USER ATTRIBUTES
			token: "Token here",
			name: "Name here",
			householdId: "Household ID here",
			householdName: "Household name",
			expiration: 0, // need to bind a the log-in event to this object changing to !0
			structure: {},
			id: 1,
			
			activities: {
				types: [],
				texts: []
			},

			//APP STATE

			cacheEnabled: true,

			sidebarView: "loggedOut",

			debugCount: 0,
			currentSidebar: {},

			midPanelCollection: {
				"deviceName": "starterPanel",
				"deviceId": -1
			}, //"Active" Mid Panels associated with this device, viewed in center. Set by the Sidebar View -- activeDevice[0] is the deviceName, activeDevice[1] is the device's 'id'
			rightPanelCollection: {
				"deviceName": "",
				"deviceId": -1
			}, //"Former" or "Last Active" Right Panels associated with this device. 
			leftPanelCollection: {
				"deviceName": "",
				"deviceId": -1
			}, //"Shifted Left" Panels only displayed to left when user explicitly clicks on lastActiveDevice, prompting UI panels left.

			supportedGraphs: ['energyConsumption', 'powerDraw'], //This array is used to instantiate panels, and is given to the class name of a given panel (graphs will select that class to render in)

			supportedUnitTypes: {
				'powerDraw': 'watts',
				'energyConsumption': "kWh"
			},

			panelFocus: 0, //The focus of a particular panel/graph (within a 'collection' of panels) will affect the position of all panels

			toClearPanels: {
				"deviceName": "",
				"deviceId": -1
			}, // Panels check to see if they need to be cleared from DOM upon updating
			panelFromRight: 0, //for rare cases when a new panel collection should animate from the right position upon creation
			//This will be set to a negative value equal to the number of panels that have to be created from the right

			statsDeviceID: "default",

			defaultGraphRange: "oneDay" // not fully supported yet -- currently this is static

		};
	},


	// --------- UI RELATED FUNCTIONS --------- //
	//When the user clicks on a new device, this function is called to 
	//1.) set the lastActiveDevice equal to activeDevice
	//2.) set activeDevice equal to new value 
	//3.) trigger the 'device_select_event'
	//The Sidebar View is an example of where this device would be called from

	//THIS IS TRULY WHERE YOU CAN MANIPULATE THE BEHAVIOR OF THE THE PANELS LEFT RIGHT MOVEMENT

	set_device_focus: function (deviceDescriptionObject) { //called by UI elements that are clicked, such as a sidebar tab or a panel

		selectedDevice_ = deviceDescriptionObject;
		//IF the clicked device in UI is not currently represented by any of the panel collections, execute this action
		if (selectedDevice_.deviceId != this.get('midPanelCollection').deviceId && selectedDevice_.deviceId != this.get('rightPanelCollection').deviceId && selectedDevice_.deviceId != this.get('leftPanelCollection').deviceId) {
			//First, we get rid of panels on right or left -- keep in mind, we've already checked that the device selected wasn't already assoc. with a panel
			if (this.get('rightPanelCollection').deviceName) {
				this.set({
					'toClearPanels': this.get('rightPanelCollection')
				}); //PanelView will remove panels stored as 'toClearPanels' in the userModel
				this.set({
					'rightPanelCollection': {}
				}); //clear right panel collection
			}
			if (this.get('leftPanelCollection').deviceName) {
				//console.log('left Panel to be cleared');
				this.set({
					'toClearPanels': this.get('leftPanelCollection')
				}); //this.set({'leftPanelCollection':{}});
				this.set({
					'leftPanelCollection': {}
				});
			}

			this.set({
				'rightPanelCollection': this.get('midPanelCollection')
			}); // move the current mid panels to the right
			this.set({
				'midPanelCollection': selectedDevice_
			}); // set new current mid panels

			this.save(); //save state of app

			this.trigger('new_device_create'); //actually create a new panel by re-rendering PanelsContainer view
			this.trigger('new_device_select'); // tell the app
			return true;
		}
		//IF the clicked device in UI is currently associated with the rightPanelCollection, execute this action
		if (selectedDevice_.deviceName == this.get('rightPanelCollection').deviceName) {

			//console.log('active device from right panel COLLECTION');
			this.set({
				'leftPanelCollection': this.get('midPanelCollection')
			}); //the mid panels are moved to left collection
			this.set({
				'midPanelCollection': this.get('rightPanelCollection')
			}); //the right panels are moved to mid
			this.set({
				'rightPanelCollection': {}
			});
			/*
				//THIS CODE IS SCAFFOLDING FOR LATER UI
						//Make rightPanelCollection equal to next device in Devices
							//find index of device in collection
						var deviceIndex = _.indexOf(Devices.models, Devices.where({'id':selectedDevice_.deviceId})[0]);
						
						if (deviceIndex == (Devices.length - 1)){
							deviceIndex = 0;
						} else {
							deviceIndex++;
						}
						
						var newDeviceName = Devices.at(deviceIndex + 1).get('name');
						var newDeviceId = Devices.at(deviceIndex + 1).get('id');
						
						this.set({'rightPanelCollection': {'deviceName': newDeviceName, 'deviceId': newDeviceId}}); //reset the rightPanelCollection
*/

			this.save(); //save state of app

			this.trigger('new_device_select'); // tell the app
			return true;
		}
		//IF the clicked device in UI is currently associated with the leftPanelCollection, execute this action
		if (selectedDevice_.deviceName == this.get('leftPanelCollection').deviceName) {
			this.set({
				'rightPanelCollection': this.get('midPanelCollection')
			}); //the mid panels are moved to right
			this.set({
				'midPanelCollection': this.get('leftPanelCollection')
			}); //the left panels are moved to mid
			//this.set({'toClearPanels': this.get('leftPanelCollection')}); //remove the view for leftPanelCollection
			this.set({
				'leftPanelCollection': {}
			}); //reset the leftPanelCollection

			this.save(); //save state of app

			this.trigger('new_device_select'); // tell the app
			return true;
		}

		//IF the clicked device in UI is currently associated with the midPanelCollection, execute this action
		//merely allow for new panelFocus
		if (selectedDevice_.deviceName == this.get('midPanelCollection').deviceName) {

			this.trigger('new_device_select'); // tell the app
			return true;
		}
	},

	// --------- SESSION RELATED FUNCTIONS --------- //
	//NOTE: I didn't see a need for an initialize function. The user model's setter function is below, called setAndSave();

	reboot: function () { // Resets the model's values to defaults.  This causes a "change" event on the model, triggering the View to rerender

		//this.save(resetAttributes);
		userAppModel.set(userAppModel.defaults());

		//console.log('rebooting model');
		Devices.reset();

		devStatuses = [];

		//statusesCollection.reset();
		Actions.reset();

		this.save();
		this.trigger('panels_clear'); //Individual panels are told to clear
		this.trigger('logged_out'); //Tell all views of the logged out state (including sidebar)

	},

	// Returns true if cookie hasn't expired (and its value matches that of userModel), else returns false and reboot()s the model
	valid_cookie: function () {
		if ($.cookie('user')) {
			return true;
		} else {
			this.reboot();
			return false;
		}
	},


	//Take the api/session json and build model
	setAndSave: function (structure_) {
		// This is the Model's setter function. Taking the JSON session info and updating model
		//console.log("Setting and saving the user Model");
		this.set({
			name: structure_.currentUser.username,
			expiration: structure_.expiration,
			householdId: structure_.currentUser.household.id,
			householdName: structure_.currentUser.household.name,
			token: structure_.token,
			structure: structure_
		});
		this.save(); //Saves the info to local storage
	},
	// the change event from reboot should trigger a rerendering in the AppView of sidebar-view and topbar-view

});

//COLLECTION:  saveduser is used to persist the userModel_pd instance to local storage
var savedUser = Backbone.Collection.extend({
	model: UserAppModel_pd,
	// Save the user info under the `blue` namespace.
	localStorage: new Store("blue-backbone")
});

// Create our global User-holder - necessary to store the model to Local Storage
var savedUser_instance = new savedUser;


