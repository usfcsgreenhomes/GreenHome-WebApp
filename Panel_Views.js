statuses = [];
var statsViewHolder = {
	'empty': true
};



//VIEW: panelsView
var PanelsContainerView = Backbone.View.extend({

	el: $(".panelsContainer"),

	initialize: function () {

		//console.log('hello from panels container view');

		//Creates new panel collections for devices
		userAppModel.on('new_device_create', this.render, this);

		userAppModel.on('logged_out', this.render, this);

		//Return start panel to focus
		userAppModel.on('return_start_elements', this.build_starter_panel, this);

		//Create Custom Graph Panel
		userAppModel.on('custom_graph_panel_event', this.build_custom_panel, this);

		//Create Custom Graph Panel
		userAppModel.on('insights_panel_event', this.build_insights_panel, this);

		//refresh stats view
		statsViewHolder.empty = true;

		this.render();

	},

	render: function () {

		//console.log("rendering Panels, the middle panel group/collection is: " + userAppModel.get('midPanelCollection').deviceName);

		//First, let's build panels for the active device
		//if the middle group says "starterPanel", we break from convention
		if (userAppModel.get('midPanelCollection').deviceName == "starterPanel") {
			//console.log("we have a starterPanel");
			this.add_one("StarterPanel"); // special call for a starter panel

		} else if (userAppModel.get('midPanelCollection').deviceName == "customGraphPanel") {
			//We also break from convention with the custom graph panel
			//

			//console.log("we have a starterPanel");
			this.add_one("CustomGraphPanel");

		} else {
			//legacy notes,
			//if the selected Active Device is not represented in a panel the DOM, add a new panel for it
			//Notice above in the IF conditional, it looked at the midPanelCollection attribute of the userAppModel

			passIndex = 0;
			//on page load, if there is a midPanelCollection, render each of it's respective panels
			while (passIndex < userAppModel.get('supportedGraphs').length) {
				//Building a panel for each supported graph type
				this.add_one(passIndex);
				passIndex++;

			}
		}

	},


	add_one: function (passedIndex_) {

		if (passedIndex_ == "StarterPanel") { // this checks if it's a starter panel
			//console.log('indeed we do! (have a starter Panel)');
			panelType_ = 'starterPanel'; //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)

		} else if (passedIndex_ == "CustomGraphPanel") {
			//console.log('indeed we do! (have a custom graph Panel)');
			panelType_ = "customGraphPanel"; //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)
		} else if (passedIndex_ == "InsightsPanel") {
			//console.log('indeed we do! (have a insights Panel)');
			panelType_ = "insightsPanel"; //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)

		} else {
			// this means the panel will have a class attribute indicating the graph-type
			panelType_ = userAppModel.get('supportedGraphs')[passedIndex_];
		}
		//build a panel in the UI
		var panelView = new PanelView({
			panelType: panelType_,
			deviceName: userAppModel.get('midPanelCollection').deviceName,
			deviceId: userAppModel.get('midPanelCollection').deviceId
		});
		//panelView.one_day(); //now, update its css (location) and render a graph on panel
		//console.log('rendered a panel');
	},

	build_custom_panel: function () {
		//console.log('hello');
		// Simultaneously, the sidebar view is 
		if (userAppModel.get('midPanelCollection').deviceName != "customGraphPanel") { // If there is already this panelType in the view, it won't render another one  
			// Clear the visual represenations of the panel views
			userAppModel.trigger('panels_clear');

			// Reset the app's Panels Colletions values 
			userAppModel.set({
				'midPanelCollection': {
					"deviceName": 'customGraphPanel',
					"deviceId": -1
				}
			});
			userAppModel.set({
				'leftPanelCollection': {}
			});
			userAppModel.set({
				'rightPanelCollection': {}
			});

			// Add our special custom Graph Panel
			this.add_one("CustomGraphPanel"); //special call for a starter panel
		}
	},

	build_insights_panel: function () {
		//console.log('hello');
		// Simultaneously, the sidebar view is 
		if (userAppModel.get('midPanelCollection').deviceName != "insightsPanel") { // If there is already this panelType in the view, it won't render another one  
			// Clear the visual represenations of the panel views
			userAppModel.trigger('panels_clear');

			// Reset the app's Panels Colletions values 
			userAppModel.set({
				'midPanelCollection': {
					"deviceName": 'insightsPanel',
					"deviceId": -1
				}
			});
			userAppModel.set({
				'leftPanelCollection': {}
			});
			userAppModel.set({
				'rightPanelCollection': {}
			});

			// Add our special custom Graph Panel
			this.add_one("InsightsPanel"); //special call for a starter panel
		}
	},

	build_starter_panel: function () {

		//First, let's build panels for the active device (which the default panel type is "starterPanel")
		if (userAppModel.get('midPanelCollection').deviceName != "starterPanel") { // If there is already a starter panel in the view, it won't render another one
			//console.log("we need a starterPanel");
			userAppModel.trigger('app_start'); //to clear out old panels
			//Move middle panels to the right

			userAppModel.set({
				'midPanelCollection': {
					"deviceName": "starterPanel",
					"deviceId": -1
				}
			});
			userAppModel.set({
				'leftPanelCollection': {}
			});
			userAppModel.set({
				'rightPanelCollection': {}
			});
			this.add_one("StarterPanel"); //special call for a starter panel

		}
	}
});

//VIEW: panelView
var PanelView = Backbone.View.extend({
	//This View is for logged-in state only
	//SidebarView should handle the instantiation of tabViews but not delegating .focus()
	//it passes the userModel to the tabViews, which are responsible for rerendering when the userModel changes

	tagName: "div",

	//ASSIGN interior html from our template in the DOM
	template: _.template($('#panel-template').html()),

	startTemplate: _.template($('#starter-panel-template').html()),

	customGraphPanelTemplate: _.template($('#custom-graph-panel-template').html()),

	insightsPanelTemplate: _.template($('#insights-panel-template').html()),

	customGraphOptionsTemplate: _.template($('#custom-graph-options-template').html()),

	annotationDialog: _.template($('#annotation-dialog-template').html()),

	defaults: {

		panelWidth: 0, //retreived from css sheet upon panel's initialization
		deviceId: 0,
		deviceName: 'Example Device Name',
		panelType: "", //This panel's graph/content type
		graphRange: "oneDay",
		device: [], //temporary array holding object
		newPanel: false, //will only be true in initialization

		customGraphObject: {}, //used to store custom graph object
		customGraphDataCounter: 0
	},

	//CREATE an individual panel (within Panel Collection)
	initialize: function (panelTypeNameId) { // this passed Object was constructed in the Panels Container view and will feed the panel's HTML template info

		//panels with this set to true will originate at a special 'left' css position
		this.newPanel = true;

		//No old (residual) panels should survive a page refresh
		userAppModel.on('app_start', this.destroy_view, this);

		//A Call to all panels: remove and delete
		userAppModel.on('panels_clear', this.destroy_view, this);

		//rerender when new a device is selected
		userAppModel.on('new_device_select', this.update_DOM_location, this);

		this.device = panelTypeNameId; // this "passed Object" was constructed in the Panels Container view and will feed the HTML template info
		/////////////////////////////
		this.panelType = this.device.panelType;
		this.deviceName = this.device.deviceName;
		this.deviceId = this.device.deviceId;
		this.graphRange = "oneDay";


		this.customGraphObject = {}; //used to store custom graph object
		this.customGraphDataCounter = 0;

		if (this.panelType == "starterPanel") {
			this.deviceId = -1;
		} // 

		//fetch panel width from css stylesheet
		this.panelWidth = $('.panelAttributes').css('width');

		_.bindAll(this, "render");

		//Render el and append to the DOM
		$('.panelsContainer').append(this.render());

		//console.log('right before appending a graph to panel');




		//Next, instantiate graph view (by passing true as an argument) and then begin panel animation
		this.update_DOM_location(true); //now, update its css (location) and render a graph on panel


		this.$el.css({
			'opacity': 1
		});


		//custom events  //Must manually bind to some DOM elements
		var functionScope = this;
		$('#' + this.deviceId + this.panelType + "three_days").bind('click', function () {
			functionScope.three_days();
		});
		$('#' + this.deviceId + this.panelType + "seven_days").bind('click', function () {
			functionScope.seven_days();
		});
		$('#' + this.deviceId + this.panelType + "one_day").bind('click', function () {
			functionScope.one_day();
		});

		//$('#custom_one_day').bind('click',function(){functionScope.custom_graph_one_day()});
		//$('#custom_three_days').bind('click',function(){functionScope.custom_graph_three_days()});
		//$('#custom_seven_days').bind('click',function(){functionScope.custom_graph_seven_days()});

		//KEEP This 'this.newPanel = false;' at the end of the initialize function
		this.newPanel = false; //indicate that it is no longer a new panel
	},

	events: {
		//If a panel is clicked (panel_clicked), then it will update DOM location -- but will not rerender graphs.  Just animate to new loc.
		"click": "panel_clicked"
	},

	seven_days: function () {
		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		var to_ = time_parser("DATE", "NOW", true); //returns in UTC milliseconds    
		var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 168); //returns in UTC milliseconds

		//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		var blocksize_ = 30; //our statuses will be for 30 minute intervals

		var datatype_ = this.panelType;
		var deviceId_ = this.deviceId;
		var deviceName_ = this.deviceName;
		var callbackEvent = 'sevendays';

		//Handle the success, rendering the graph
		successObject = new SuccessObjectClass();
		var callbackContext = this;
		$(successObject).bind(callbackEvent, function (e, it) {
			var finalSeriesWithData = it.get_series();



			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
		});

		//Describing the series we need for the graph
		get_assembler(successObject, [{
			'from': from_,
			'to': to_,
			'blocksize': blocksize_,
			'datatype': datatype_,
			'deviceId': deviceId_,
			'deviceName': deviceName_
		}], callbackEvent);
	},

	three_days: function () {
		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		var to_ = time_parser("DATE", "NOW", true); //returns in UTC milliseconds    
		var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 72); //returns in UTC milliseconds

		//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		var blocksize_ = 30; //our statuses will be for 30 minute intervals

		var datatype_ = this.panelType;
		var deviceId_ = this.deviceId;
		var deviceName_ = this.deviceName;
		var callbackEvent = 'threedays';

		//Handle the success, rendering the graph
		successObject = new SuccessObjectClass();
		var callbackContext = this;
		$(successObject).bind(callbackEvent, function (e, it) {
			var finalSeriesWithData = it.get_series();

			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
		});

		//Describing the series we need for the graph
		get_assembler(successObject, [{
			'from': from_,
			'to': to_,
			'blocksize': blocksize_,
			'datatype': datatype_,
			'deviceId': deviceId_,
			'deviceName': deviceName_
		}], callbackEvent);
	},
	one_day: function () {
		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		var to_ = time_parser("DATE", "NOW", true); //returns in UTC milliseconds    
		var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24); //returns in UTC milliseconds

		//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		var blocksize_ = 30; //our statuses will be for 30 minute intervals

		var datatype_ = this.panelType;
		var deviceId_ = this.deviceId;
		var deviceName_ = this.deviceName;
		var callbackEvent = "oneday";

		//Handle the success, rendering the graph
		successObject = new SuccessObjectClass();
		var callbackContext = this;
		$(successObject).bind(callbackEvent, function (e, it) {
			var finalSeriesWithData = it.get_series();

			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
		});

		//Describing the series we need for the graph
		get_assembler(successObject, [{
			'from': from_,
			'to': to_,
			'blocksize': blocksize_,
			'datatype': datatype_,
			'deviceId': deviceId_,
			'deviceName': deviceName_
		}], callbackEvent);

	},

	render: function () {

		//check if it's needing a starterTemplate
		if (this.device.panelType == 'starterPanel') {
			var panelContent = this.startTemplate(this.device);
		}
		//or if it's a custom graph panel  
		else if (this.device.panelType == "customGraphPanel") {
			var panelContent = this.customGraphPanelTemplate(this.device);
		} else if (this.device.panelType == "insightsPanel") {
			var panelContent = this.insightsPanelTemplate(this.device);
		} else {
			var panelContent = this.template(this.device);
		}

		this.delegateEvents(this.events);

		this.$el.html(panelContent);
		//check if it's a starterTemplate

		this.$el.buttonset();

		return this.$el;

	},

	destroy_view: function () {

		//console.log('PANEL BEING DESTROYED');

		this.undelegateEvents();

		//COMPLETELY UNBIND THE VIEW
		userAppModel.off(null, null, this);

		$(this.el).removeData().unbind(); //destroy View instance before fading animation begins

		var callbackContext = this; //to remove after animation completes

		this.$el.animate({
			'opacity': 0
		}, {
			duration: 1800,
			queue: false,
			complete: function () {

				//Remove view from DOM
				callbackContext.remove();
				Backbone.View.prototype.remove.call(callbackContext);

			}
		});
	},

	panel_clicked: function () {
		//Using this view's given attributes ('this.__') we will refresh the app's state

		if (this.deviceId < 0) {
			//this should nix this behavior from non-traditional panels (such as starterPanel and customGraphPanel)
			return false;
		}

		//reflect selected device to the whole app
		var selectedDevice_ = {};
		selectedDevice_.deviceName = this.deviceName; // device's name for Displaying
		selectedDevice_.deviceId = this.deviceId; // device's id for identifying unique devices

		// find a new panelfocus value (which panel within a panel-group is front-and-center)
		panelFocus_ = userAppModel.get('supportedGraphs').indexOf(this.panelType);

		//save it
		userAppModel.save({
			'panelFocus': panelFocus_
		});

		//tell the app to react
		userAppModel.set_device_focus(selectedDevice_);

	},

	all_devices_graph_render: function (from_optional, to_optional) {

		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		var to_ = 0;
		var from_ = 0;
		var blocksize_ = 0;
		if (to_optional != undefined || from_optional != undefined) {
			to_ = Math.floor(to_optional);
			from_ = Math.floor(from_optional);
			blocksize_ = Math.floor((to_ - from_) / (48 * 1000 * 60));

		} else {
			to_ = time_parser("DATE", "NOW", true); //returns in UTC milliseconds    
			from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24); //returns in UTC milliseconds
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			blocksize_ = 30; //our statuses will be for 30 minute intervals
		}


		var datatype_ = "All Devices E.C.";
		var callbackEvent = "AllDevices";

		//Handle the success, rendering the graph
		successObject = new SuccessObjectClass();
		var callbackContext = this;
		
		var getAssemblerDone = false;
		var getActivitiesDone = false;
		var getAnomaliesDone = false;
		
		var allDevStatuses;
		var activities;
		var anomalies;
		
		// callback event for get assembler call below
		$(successObject).bind(callbackEvent, function (e, it) {
			if(getActivitiesDone && getAnomaliesDone) {
				// if the other two api calls are done, proceed
				var dataObject = {activities: activities, anomalies: anomalies, statuses: it.get_series().seriesArray[0].statuses};
				callbackContext.graph_render(dataObject, true);
			} else {
				// otherwise, inform the world we are done
				allDevStatuses = it.get_series().seriesArray[0].statuses;
				getAssemblerDone = true;
			}
		});

		//Describing the series we need for the graph
		get_assembler(successObject, [{
			'from': from_,
			'to': to_,
			'blocksize': blocksize_,
			'datatype': datatype_
		}], callbackEvent);
		
		// get activities information
		var activitiesJson = command_center("activity_time", {from:from_,to:to_});
		activitiesJson.success(function(dataObject) {
			if(!dataObject.success) {
				alert("Error!");
			} else {
				// initialize activities series
				activities = {
					entertainment: {activity: true, label: "Entertainment", name: "Entertainment", data: [], list: [], yaxis: 2, points: {show: true, fillColor: "#000000"}},
					cooking: {activity: true, label: "Cooking", name: "Cooking", data: [], list: [], yaxis: 2, points: {show: true, fillColor: "#000000"}},
					chores: {activity: true, label: "Chores", name: "Chores", data: [], list: [], yaxis: 2, points: {show: true, fillColor: "#000000"}},
					work: {activity: true, label: "Work", name: "Work", data: [], list: [], yaxis: 2, points: {show: true, fillColor: "#000000"}},
					other: {activity: true, label: "Other", name: "Other", data: [], list: [], yaxis: 2, points: {show: true, fillColor: "#000000"}}
				};
				for(i = 0; i < dataObject.activities.length; i++) {
					// parse the returned json object and prepare the activity data to be graphed
					var type = dataObject.activities[i].activity.match(/^(entertainment|cooking|chores|work|other)/i);
					if(type != null && type.length != 0) {
						switch(type[0].toLowerCase()){
							// positions are on the x axis of time, and the y axis of 0 to 1
							case "entertainment":
								activities.entertainment.data.push([dataObject.activities[i].timestamp, 0.98]);
								activities.entertainment.list.push(dataObject.activities[i].activity);
								break;
							case "cooking":
								activities.cooking.data.push([dataObject.activities[i].timestamp, 0.97]);
								activities.cooking.list.push(dataObject.activities[i].activity);
								break;
							case "chores":
								activities.chores.data.push([dataObject.activities[i].timestamp, 0.96]);
								activities.chores.list.push(dataObject.activities[i].activity);
								break;
							case "work":
								activities.work.data.push([dataObject.activities[i].timestamp, 0.95]);
								activities.work.list.push(dataObject.activities[i].activity);
								break;
							case "other":
								activities.other.data.push([dataObject.activities[i].timestamp, 0.94]);
								activities.other.list.push(dataObject.activities[i].activity);
								break;
						}
					}
				}
				// if the other two calls are done, proceed, otherwise tell the other two calls that this is done
				if(getAssemblerDone && getAnomaliesDone) {
					var dataObject = {activities: activities, anomalies: anomalies, statuses: allDevStatuses};
					callbackContext.graph_render(dataObject, true);
				} else {
					getActivitiesDone = true;
				}
			}
		});

		
		/* UNCOMMENT THIS ONCE ANOMALIES API IS WORKING
		var activitiesJson = command_center("anomaly", {from:from_,to:to_});
		activitiesJson.success(function(dataObject) {
			if(!dataObject.success) {
				alert("Error!");
			} else {
				anomalies = dataObject.anomalies;
				if(getAssemblerDone && getActivitiesDone) {
					// if the other two api calls are done, proceed
					var dataObject = {activities: activities, anomalies: anomalies, statuses: allDevStatuses};
					callbackContext.graph_render(dataObject, true);
				} else {
					// otherwise, tell the world we are done
					getAnomaliesDone = true;
				}
			}
		});*/
		
		// TEMPORARY FIXED DATA FOR ANOMALIES TESTING
		// remove this code
		getAnomaliesDone = true;
		var now = (new Date()).valueOf()
		anomalies = [
			{
				description: "Rule broken; Testing",
				device_id: 521,
				from: (now-(1000 * 60 * 60 * 18)), // 18 hours ago
				to: (now-(1000 * 60 * 60 * 15)) // 15 hours ago
			},
			{
				description: "Rule broken; Testing",
				device_id: 523,
				from: (now-(1000 * 60 * 60 * 6)),
				to: (now-(1000 * 60 * 60 * 4))
			},
			{
				description: "Rule broken; Testing",
				device_id: 522,
				from: (now-(1000 * 60 * 60 * 10)),
				to: (now-(1000 * 60 * 60 * 9))
			},
			{
				description: "Rule broken; Testing",
				device_id: 527,
				from: (now-(1000 * 60 * 60 * 18)),
				to: (now-(1000 * 60 * 60 * 17))
			}
		];
		// stop removing here
	},

	device_panel_graph_render: function (from_optional, to_optional) {

		//HERE WE ARE ASSEMBLING OUR SERIES REQUEST ARGUMENTS

		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		var to_ = 0;
		var from_ = 0;
		var blocksize_ = 0;
		if (to_optional != undefined || from_optional != undefined) {
			to_ = Math.floor(to_optional);
			from_ = Math.floor(from_optional);
			blocksize_ = Math.floor((to_ - from_) / (48 * 1000 * 60));

		} else {
			to_ = time_parser("DATE", "NOW", true); //returns in UTC milliseconds    
			from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24); //returns in UTC milliseconds
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			blocksize_ = 30; //our statuses will be for 30 minute intervals
		}

		var datatype_ = this.panelType;
		var deviceId_ = this.deviceId;
		var deviceName_ = this.deviceName;
		var callbackEvent = "regularDevicePanel";

		//Handle the success, rendering the graph
		successObject = new SuccessObjectClass();
		var callbackContext = this;
		$(successObject).bind(callbackEvent, function (e, it) {
			var finalSeriesWithData = it.get_series();

			//console.log("Ok, here are the GETS assembled");
			////console.debug(finalSeriesWithData);

			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
		});

		//Describing the series we need for the graph
		get_assembler(successObject, [{
			'from': from_,
			'to': to_,
			'blocksize': blocksize_,
			'datatype': datatype_,
			'deviceId': deviceId_,
			'deviceName': deviceName_
		}], callbackEvent);

	},

	update_DOM_location: function (needGraph) {

		//console.log("from update_DOM_location, before function call " + this.newPanel + this.needGraph);

		this.$el.css({
			'position': 'absolute'
		}); // separate this from rest - it is not circumstantial


		//if it's a new panel, it will come from the left UNLESS the come from right flag is set to true
		if (this.newPanel) {

			if (userAppModel.get('panelFromRight') < 0) {
				startingPosition = this.return_pixels_position('right') + "px";
				userAppModel.set({
					'panelFromRight': userAppModel.get('panelFromRight') + 1
				});
			} else {
				startingPosition = this.return_pixels_position('left') + "px";
			}

			//console.log('i am a new panel ' + startingPosition);
			this.$el.css({
				'width': this.panelWidth,
				'right': startingPosition
			}); //'background-color':'#A0A0A0', 

		} else {

			//console.log('i am NOT a new panel');
			currentRight = this.$el.css('right');
			//console.log(this.deviceName + " css right attribute: " + this.$el.css('right'));
			this.$el.css({
				'width': this.panelWidth,
				'right': currentRight
			});



		}

		//HANDLE PANELS TO BE CLEARED AND STARTER PANELS

		//Make sure it's still an active panel
		if (userAppModel.get('toClearPanels').deviceName == this.deviceName) {
			this.destroy_view();
		}

		//Get rid of the starter panel, if it's not set for 'mid'
		else if (userAppModel.get('midPanelCollection').deviceName != this.deviceName && this.deviceName == 'starterPanel') {
			//console.log('last word debug 1');
			this.destroy_view();
		} else {


			panelPosition = this.return_pixels_position(this.returnCollectionLocation()) + "px";

			//RENDER THIS PANEL'S GRAPH (if it needs one)
			//A true boolean is the signal used to graph_render on panels that are first entering the DOM
			if (needGraph == true && this.panelType != "starterPanel") {

				//custom graph panels get a special treatment
				if (this.panelType == 'customGraphPanel') {

					this.all_devices_graph_render();

				}

				//custom graph panels get a special treatment
				else if (this.panelType == 'insightsPanel') {

					var callbackEvent = "insights_render";
					//Handle the success, rendering the graph
					successObject = new SuccessObjectClass();
					var callbackContext = this;

					$(successObject).bind(callbackEvent, function (e, it) {
						var finalSeriesWithData = it.get_series();

						callbackContext.graph_render(finalSeriesWithData);
					});
					//console.log('hello stats 123');
					////console.debug(statsViewHolder);
					if (statsViewHolder.empty == true) {
						var statsDataView = new StatsDataView(successObject);
						statsViewHolder.statView = statsDataView;
						statsViewHolder.empty = false;
					} else {
						statsViewHolder.statView.render(successObject);
					}


				} else {

					//console.log('immediately before render of graph');

					this.device_panel_graph_render();
				}

				this.$el.animate({
					'right': panelPosition
				}, {
					duration: 1700,
					queue: false
				});
			} else {


				//or panel is animated immediately
				this.$el.animate({
					'right': panelPosition
				}, {
					duration: 1700,
					queue: false
				});
			}

			//Apply JQUERY UI to new panel  
		}
	},

	//Return panel location in pixels from right.  Based off of "left", "mid", or 'right' of panel's collection
	return_pixels_position: function (leftRightOrMid_) {

		var panelPosition = 0;

		var _panelWidth = parseInt(this.panelWidth, 10);
		//console.log('panelW: ' + _panelWidth);

		//now let's determine its relative pos. based off of the userAppModel's panel collections of mid, left, and right
		switch (leftRightOrMid_) {

			case "left":
				panelPosition = 160;
				panelPosition += (_panelWidth + 50) * userAppModel.get('supportedGraphs').length - userAppModel.get('panelFocus') * _panelWidth;
				//panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);

				//Give each subsequent panel an incrementally higher amount of buffer space (because we're calculating from a fixed point)
				if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0) {
					panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType);
				}

				panelPosition = panelPosition.toFixed(0);


				//console.log(this.deviceName + 'left: ' + panelPosition); 
				return panelPosition;

				break;

			case "mid":



				panelPosition = 150;
				panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);
				panelPosition -= userAppModel.get('panelFocus') * (_panelWidth + 50);
				if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0) {
					panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType); //give a bit of spacing between panels in a collection
				}



				//No decimals
				panelPosition = panelPosition.toFixed(0);

				//IF PANEL FOCUS IS NOT 0, THIS WILL PUSH IT ACCROSS THE SIDEBAR GAP
				//DOES NOT APPLY TO PANEL WHICH IS "IN FOCUS"
				if (userAppModel.get('panelFocus') != 0 && userAppModel.get('supportedGraphs').indexOf(this.panelType) < userAppModel.get('panelFocus')) {
					panelPosition -= 290;
				}

				//custom for starterPanel
				if (userAppModel.get('supportedGraphs').indexOf(this.panelType) == -1) {
					panelPosition = 155;
				}


				//console.log(this.deviceName + 'mid: ' + panelPosition); 
				return panelPosition;

				break;

			case "right":
				panelPosition = 0;
				panelPosition = -134; // FIXED VARIANCE
				//panelPosition -= ; //sets the far right reference point according to number of supported graphs
				panelPosition -= (_panelWidth + 50) * userAppModel.get('supportedGraphs').length;
				panelPosition -= userAppModel.get('panelFocus') * _panelWidth; //adjusts to panel focus
				panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);

				// SPACES PANELS APART, ACCORDING TO NUMBER OF SUPPORTED GRAPHS
				if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0) {
					panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType);
				}


				// SPECIAL CASE: BECAUSE OF SIDEBAR SPACING, IF FOCUS != 0, make FIXED ADJUSTMENT
				if (userAppModel.get('panelFocus') != 0) {
					panelPosition += 280; // to give a slight effect of moving to the right

				}

				//IF PANEL FOCUS IS NOT 0, THIS WILL MAKE UP FOR THE MID-PANELS BEING PUSHED ACCROSS THE SIDEBAR GAP
				if (userAppModel.get('panelFocus') != 0) {
					panelPosition -= 335;
				}


				panelPosition = panelPosition.toFixed(0);


				//console.log(this.deviceName + 'right: ' + panelPosition); 
				return panelPosition;


				break;
		}

	},


	returnCollectionLocation: function () {
		//get this panel's panel-group location by checking the userAppModel

		switch (this.deviceId) {
			case userAppModel.get('midPanelCollection').deviceId:

				return 'mid';
				break;
			case userAppModel.get('rightPanelCollection').deviceId:

				return 'right';
				break;
			case userAppModel.get('leftPanelCollection').deviceId:

				return 'left';
				break;

		}
	},

	//(More or less) A 'DUMB' FUNCTION THAT IS GIVEN VALUES TO PLOT
	graph_render: function (graphValues, customBool) {
		//console.log('data for graphing');
		////console.debug(graphValues);

		//Boilerplate CHECK CODE
		if (this.panelType != 'starterPanel') { // starter panels don't render graphs

			//console.log('building a graph type ' + this.panelType );

			//RENDER GRAPH (Because) now we have our graphValues!!
			//console.log ('graphValues: ' +  graphValues);

			//NOTE: the parse INT here is needed even though it doesn't look like it
			var currentDeviceId = parseInt(userAppModel.get('midPanelCollection').deviceId);

			//to catch weird cases
			if (customBool != undefined) {
				var currentPanelType = 'customGraphPanel'
			} else {
				var currentPanelType = this.panelType;
			}

			////console.log('in this: ' + $('#' + currentDeviceId).find('.' + currentPanelType)[0] );

			//CLEAR THE OBJECT'S HTML for a new Graph
			$($('.' + this.panelType).filter('#' + currentDeviceId + 'graph')[0]).html("");

			//RENDERING SPECIFIC GRAPH TYPES
			switch (currentPanelType) {
				case "insightsPanel":

					var callbackContext = this;

					$(function () {
						//Detect bar graph settings
						barBool = false;
						if (graphValues.graphType == 'bar') {
							barBool = true;
						}

						var options = {
							grid: {
								hoverable: true,
								clickable: true
							},
							xaxis: {
								//mode: 'time',    

								tickFormatter: function (val) {
									if(graphValues[0]) {
										return "Lag (min.)" + '<br/>' + val * graphValues[0]['minInterval'];
									} else {
										return "";
									}

									/* var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");*/
								}

							},
							yaxis: {}
						};

						var d1 = [];
						for (var i = 0; i < graphValues.length - 1; i += 1) {
							d1.push([graphValues[i]['delay'], graphValues[i]['r']]);
						}
						//console.log('hola with energy home arrays! ');
						////console.debug(d1);

						var plotObject = $('#statsInsightsGraph');

						if (!customBool || customBool == undefined)
						//clear old html
						$(plotObject).html('');

						$.plot($(plotObject), [{
							bars: {show: barBool},
							data: d1,
							color: '#3BAB27'
						}], options);

						function showTooltip(x, y, contents) {

							$('<div id="tooltip">' + contents + '</div>').css({
								position: 'absolute',
								display: 'none',
								top: y + 5,
								left: x + 5,
								border: '1px solid #fdd',
								padding: '2px',
								'z-index': 10,
								'background-color': '#fee',
								opacity: 0.80
							}).appendTo("body").fadeIn(200);

						}


						var previousPoint = null;

						$(plotObject).bind("plothover", function (event, pos, item) {

							$("#x").text(pos.x.toFixed(2));
							$("#y").text(pos.y.toFixed(2));

							if (item) {

								if (previousPoint != item.dataIndex) {

									previousPoint = item.dataIndex;



									$("#tooltip").remove();
									var x = item.datapoint[0].toFixed(2);
									var y = item.datapoint[1].toFixed(2);
									var d = new Date(item.datapoint[0]);
									showTooltip(item.pageX, item.pageY,
										"'r': " + item.datapoint[1].toFixed(5) + "<br>Delay of " + item.datapoint[0].toFixed(5) * graphValues[0].minInterval);
								}
							} else {
								$("#tooltip").remove();
								previousPoint = null;
							}
						});

					});


					break;

				case "powerDraw":

					//Update yAXIS label
					$($('.' + this.panelType).filter('#' + currentDeviceId + 'yLabel')[0]).html('Watts');

					var callbackContext = this;

					$(function () {
						//Detect bar graph settings
						barBool = false;
						if (graphValues.graphType == 'bar') {
							barBool = true;
						}

						var options = {
							grid: {
								hoverable: true,
								clickable: true
							},
							xaxis: {
								mode: 'time',

								tickFormatter: function (val) {
									var graphDate = new Date(val)
									return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
								}

							},
							yaxis: {
								min: 0
							}
						};

						var d1 = [];
						for (var i = 0; i < graphValues.statuses.length - 1; i += 1) {
							d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
						}
						//console.log('hola with energy home arrays! ');
						////console.debug(d1);

						var plotObject = $('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0];

						if (!customBool)
						//clear old html
						$(plotObject).html('');

						$.plot($(plotObject), [{
							bars: {show: barBool},
							data: d1,
							color: '#3BAB27'
						}], options);

						function showTooltip(x, y, contents) {

							$('<div id="tooltip">' + contents + '</div>').css({
								position: 'absolute',
								display: 'none',
								top: y + 5,
								left: x + 5,
								border: '1px solid #fdd',
								padding: '2px',
								'z-index': 10,
								'background-color': '#fee',
								opacity: 0.80
							}).appendTo("body").fadeIn(200);

						}


						var previousPoint = null;

						$(plotObject).bind("plothover", function (event, pos, item) {

							$("#x").text(pos.x.toFixed(2));
							$("#y").text(pos.y.toFixed(2));

							if (item) {

								if (previousPoint != item.dataIndex) {

									previousPoint = item.dataIndex;



									$("#tooltip").remove();
									var x = item.datapoint[0].toFixed(2);
									var y = item.datapoint[1].toFixed(2);
									var d = new Date(item.datapoint[0]);
									showTooltip(item.pageX, item.pageY,
									callbackContext.deviceName + ", " + userAppModel.get('supportedUnitTypes')[currentPanelType] + ": " + item.datapoint[1].toFixed(5) + "<br>" + d.toTimeString());
								}
							} else {
								$("#tooltip").remove();
								previousPoint = null;
							}
						});

					});
					break;

				case "voltage":

					//Update yAXIS label
					$($('.' + this.panelType).filter('#' + currentDeviceId + 'yLabel')[0]).html('Volts');

					$(function () {

						var d1 = [];
						for (var i = 0; i < graphValues.statuses.length - 1; i += 1) {
							d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
						}
						//console.log('hola with energy home arrays! ');
						////console.debug(d1);

						//Detect bar graph settings
						barBool = false;
						if (graphValues.graphType == 'bar') {
							barBool = true;
						}

						$.plot($($('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0]), [{
							bars: {show: barBool},
							data: d1,
							color: '#3BAB27'
						}], {
							xaxis: {
								mode: 'time',


								tickFormatter: function (val) {
									var graphDate = new Date(val)
									return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
								}
							},
							yaxis: {
								min: 0
							}
						});
					});
					break;

				case "energyConsumption":



					//Update yAXIS label
					$($('.' + this.panelType).filter('#' + currentDeviceId + 'yLabel')[0]).html(' kWh');

					var callbackContext = this;
					//callbackContext['currentPanelType'] = currentPanelType;

					$(function () {

						var d1 = [];
						for (var i = 0; i < graphValues.statuses.length - 1; i += 1) {
							d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
						}
						//console.log('hola with energy home arrays! ');
						////console.debug(d1);

						//Detect bar graph settings
						barBool = false;
						if (graphValues.graphType == 'bar') {
							barBool = true;
						}

						//clear old html
						$($('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0]).html('');

						//get a blocksize
						var blocksize = 0;
						blocksize = graphValues['blocksize'];

						//for refining graph and canceling zoom
						var latestSelection = {
							'from': -1,
							'to': -1
						};

						var plotObject = $('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0];

						var options = {
							grid: {
								hoverable: true,
								clickable: true
							},
							yaxis: {
								min: 0
							},
							selection: {
								mode: "x"
							},
							xaxis: {

								mode: 'time',


								tickFormatter: function (val) {
									var graphDate = new Date(val)
									return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
								}
							}
						};

						$(plotObject).unbind("plotselected");
						$(plotObject).bind("plotselected", function (event, ranges) {
							//$("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));
							latestSelection.from = ranges.xaxis.from.toFixed(1);
							latestSelection.to = ranges.xaxis.to.toFixed(1);

							plot = $.plot(plotObject, [{
								bars: {show: true, barWidth: 60 * 1000 * blocksize},
								data: d1,
								color: '#3BAB27'
							}],
							$.extend(true, {}, options, {
								xaxis: {
									min: ranges.xaxis.from,
									max: ranges.xaxis.to
								}
							}));
							// plot with smaller bars
							callbackContext.device_panel_graph_render(latestSelection.from, latestSelection.to);
							latestSelection.from = -1;
							latestSelection.to = -1;
						});
						$(plotObject).bind("plotunselected");
						$(plotObject).bind("plotunselected", function (event) {
							$("#selection").text("");
						});

						var plot = $.plot($(plotObject), [{
							bars: {show: barBool, barWidth: 60 * 1000 * blocksize},
							data: d1,
							color: '#3BAB27'
						}], options);

						function showTooltip(x, y, contents) {

							$('<div id="tooltip">' + contents + '</div>').css({
								position: 'absolute',
								display: 'none',
								top: y + 5,
								left: x + 5,
								border: '1px solid #fdd',
								padding: '2px',
								'z-index': 10,
								'background-color': '#fee',
								opacity: 0.80
							}).appendTo("body").fadeIn(200);

						}


						var previousPoint = null;
						$(plotObject).unbind("plothover");
						$(plotObject).bind("plothover", function (event, pos, item) {


							$("#x").text(pos.x.toFixed(2));
							$("#y").text(pos.y.toFixed(2));


							if (item) {

								if (previousPoint != item.dataIndex) {

									previousPoint = item.dataIndex;

									////console.log('special item debug');
									//////console.debug(item);

									$("#tooltip").remove();
									var x = item.datapoint[0].toFixed(2);
									var y = item.datapoint[1].toFixed(2);
									var d = new Date(item.datapoint[0]);
									showTooltip(item.pageX, item.pageY,
									callbackContext.deviceName + ", " + userAppModel.get('supportedUnitTypes')[currentPanelType] + ": " + item.datapoint[1].toFixed(5) + "<br>" + d.toTimeString());
								}
							} else {
								$("#tooltip").remove();
								previousPoint = null;
							}
						});
						//$(plotObject).unbind("plotclick");
						/*$(plotObject).bind("plotclick", function(event, pos, item) {
					var d = new Date(Math.round(pos.x));
					alert(d.toTimeString());
					
					//$(function() {
						//$("#dialog-modal").dialog();
					//});
				});*/

						callbackContext.$el.find('#refresh' + callbackContext.deviceId + callbackContext.panelType).click(function () {
							//console.log('hello refresh clicked on ' + callbackContext.deviceId);
							//console.log(latestSelection.from);
							if (latestSelection.from != -1) {
								$(plotObject).unbind("plothover");
								//$(plotObject).unbind("plotclick");
								callbackContext.device_panel_graph_render(latestSelection.from, latestSelection.to);

							} else {
								$(plotObject).unbind("plothover");
								//$(plotObject).unbind("plotclick");
								callbackContext.device_panel_graph_render();
							}
						});

						callbackContext.$el.find('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog({
							autoOpen: false,
							show: "fade",
							hide: "fade",
							modal: true
						});

						$("#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker('disable');
						$("#TOdate" + callbackContext.deviceId + callbackContext.panelType).datepicker({
							'showAnim': "fadeIn",
							'maxDate': "+0d",
							'showOn': 'focus'
						});

						callbackContext.$el.find('#date_selector' + callbackContext.deviceId + callbackContext.panelType).click(function () {
							//console.log('clicked Date');
							$('.ui-widget-overlay').live('click', function () {
								$('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog("close");
							});

							$('.date_dialog').css({
								'opacity': 1
							});

							$('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog("open");

							$("#ui-datepicker-div").hide();
							$("#FROMdate" + callbackContext.deviceId + callbackContext.panelType).blur();
							$("#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker('enable');
							$("#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker({
								'showAnim': "fadeIn",
								'maxDate': "+0d",
								'showOn': 'focus'
							});

							//jQuery('#ui-datepicker-div').hide();
							return false;
						});

						////console.log('bluemonkey');
						//////console.debug($('#date_submit' + callbackContext.deviceId + callbackContext.panelType));

						$('#date_submit' + callbackContext.deviceId + callbackContext.panelType).click(function () {
							var thisfrom = $('#FROMdate' + callbackContext.deviceId + callbackContext.panelType).val();
							var thisto = $('#TOdate' + callbackContext.deviceId + callbackContext.panelType).val();
							if (thisfrom != "" && thisto != "") {
								var dFrom = new Date(thisfrom);
								var dTo = new Date(thisto);

								callbackContext.device_panel_graph_render(dFrom.getTime(), dTo.getTime());
								$('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog("close");
							} else {
								callbackContext.device_panel_graph_render();
								$('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog("close");
							}
						});

					});
					break;

				case "customGraphPanel":


					//console.log('trying to render custom graph');

					//Clear choices and render RangeOptions buttons each time customGraph button is reclicked
					$('#customGraphOptions').html(''); // These exist in the sidebar

					var GraphDataType_ = "energyConsumption"; //userAppModel.get('supportedGraphs')[graphTypeIndex];

					var toggle_graph = function (graphName) {
						//console.log('toggle graph name: ' + graphName);
						$("#customGraphPanelInner > div").css({
							'z-index': -1
						});
						$("#customGraph-yAxisLabel").css({
							'z-index': 15
						});
						$("#customGraphOptions > div").css({
							'border': 'none'
						});
						$('#customGraph-' + graphName).css({
							'z-index': 10
						});

					}

					$('#customGraphOptions').append(this.customGraphOptionsTemplate({
						"dataType": GraphDataType_,
						"unitType": userAppModel.get('supportedUnitTypes')[GraphDataType_]
					}));
					$('#customGraphOptions').append(this.annotationDialog());

					//setOurValues(graphValues);
					var milliUTCtime_ = time_parser("DATE", "NOW", true);

					//ourDataType
					var datasets = {};
					
					//console.log(graphValues);

					var datasets = graphValues.statuses;

					$("#customGraphOptions-energyConsumption").html(''); //customGraphOptions

					//for refining graph and canceling zoom
					var latestSelection = {
						'from': -1,
						'to': -1
					};

					//get blocksize, to, from
					var blocksize = 0;
					var to = 0;
					var from = 0;
					$.each(datasets, function (key, val) {
						blocksize = val.blocksize;
						to = val.to;
						from = val.from;
						return false;
					});

					//console.log('datasets are here');
					////console.debug(datasets);

					//Bring a specific Custom Graph to the front, toggling all others
					var toggle_graph = function (graphName) {
						//console.log('toggle graph name: ' + graphName);
						$("#customGraphPanelInner > div").css({
							'z-index': -1
						});
						$("#customGraph-yAxisLabel").css({
							'z-index': 15
						});
						$("#customGraphOptions > div").css({
							'border': 'none'
						});
						$('#customGraph-' + graphName).css({
							'z-index': 10
						});

					}

					$("#datepickerTO").datepicker({
						'showAnim': "fadeIn",
						'maxDate': "+0d",
						'showOn': 'focus'
					});
					$("#datepickerFROM").datepicker({
						'showAnim': "fadeIn",
						'maxDate': "+0d",
						'showOn': 'focus'
					});

					topGraphName = "energyConsumption";
					toggle_graph(topGraphName);

					var options = {
						grid: {
							hoverable: true,
							clickable: true
						},
						legend: {
							show: true,

							labelFormatter: function (label, series) {

								return ('<b>' + series.name + '</b>');
							}
						},
						yaxes: [{
							min: 0
						},
						{
							min: 0,
							max: 1,
							show: false
						}],
						selection: {
							mode: "x"
						},
						xaxis: {
							mode: 'time',

							tickFormatter: function (val) {
								var graphDate = new Date(val)
								return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
							}
						}
					};
					
					function plotAccordingToChoices() {
						var data = [];
						
						choiceContainer.find("input:checked").each(function () {
							var key = $(this).attr("name");
							if (key && datasets[key]) {
								data.push(datasets[key]);
							}
						});


						var plotObject = "#customGraph-" + GraphDataType_;
						var lastEventSelect = true;
						//a quick clear of the pre-existing graph (if there is one)
						$(plotObject).html('');
						
						$(plotObject).unbind("plotselected");
						$(plotObject).bind("plotselected", function (event, ranges) {
							//$("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));
							latestSelection.from = ranges.xaxis.from.toFixed(1);
							latestSelection.to = ranges.xaxis.to.toFixed(1);
							
							plot = $.plot(plotObject, data,
							$.extend(true, {}, options, {
								xaxis: {
									min: latestSelection.from,
									max: latestSelection.to
								}
							}));
							
							callbackContext.all_devices_graph_render(latestSelection.from, latestSelection.to);
							
							latestSelection.from = -1;
							latestSelection.to = -1;
							
							lastEventSelect = true;
						});
						
						$(plotObject).unbind("plotunselected");
						$(plotObject).bind("plotunselected", function (event, pos, item) {
							lastEventSelect = false;
							
							$("#selection").text("");
						});

						$(plotObject).unbind("plotclick");
						$(plotObject).bind("plotclick", function (event, pos, item) {
							// 
							if(!lastEventSelect) {
								// build date text
								activity_timestamp = Math.round(pos.x);
								var d = new Date(activity_timestamp);
								$('#annotation-timestamp').text(d.format("m/d/yyyy \"at\" h:MMTT Z"));
								// rebuild listbox
								var activites = userAppModel.get('activities');
								$("#annotation-list").empty();
								for(var i = 0; i < activites.texts.length; i++) {
									$("#annotation-list").append("<option>"+activites.texts[i].label+"</option>\n");
								}
								// rebuild autocomplete
								$("#annotation-text").autocomplete("destroy");
								// register for autocompletion on the text field
								$("#annotation-text").autocomplete({
									source: userAppModel.get('activities').texts,
									// this code fills in the text and selectbox controls when the autocomplete is used
									select: function(e, ui) {
										var types = userAppModel.get('activities').types;
										// if we can use the types, and have an index, select the type for this index
										if(types != null && ui != null && types[ui.item.i] != null) {
											$("#annotation-selectbox")[0].selectedIndex = types[ui.item.i];
										}
									}
								});
								// actually show the dialog
								$('#annotation-dialog').dialog("open");
							}
						});

						for(i = 0; i < data.length; i++) {
							//data[i].bars = {show: true, barWidth: 60 * 1000 * blocksize};
							//data[i].lines = {show: true, fill: false};
							data[i].regions = [];
							// only populate regions if anomalies is selected
							if($("input:checked[name='anomalies']").length == 1) {
								for(var j = 0; j < graphValues.anomalies.length; j++) {
									if(graphValues.anomalies[j].device_id == data[i].deviceId) {
										// Set up regions for region plugin
										var region = graphValues.anomalies[j];
										region.color = "#000000";
										region.x1 = region.from;
										region.x2 = region.to;
										data[i].regions.push(region);
									}
								}
							}
						}

						// add the datasets of each activity type
						if($("input:checked[name='entertainment']").length == 1) {
							data.push(graphValues.activities.entertainment);
						}
						if($("input:checked[name='cooking']").length == 1) {
							data.push(graphValues.activities.cooking);
						}
						if($("input:checked[name='chores']").length == 1) {
							data.push(graphValues.activities.chores);
						}
						if($("input:checked[name='work']").length == 1) {
							data.push(graphValues.activities.work);
						}
						if($("input:checked[name='other']").length == 1) {
							data.push(graphValues.activities.other);
						}
						
						var plot = $.plot($(plotObject), data, options);

						function showTooltip(x, y, contents) {

							$('<div id="tooltip">' + contents + '</div>').css({
								position: 'absolute',
								display: 'none',
								top: y + 5,
								left: x + 5,
								border: '1px solid #fdd',
								padding: '2px',
								'z-index': 10,
								'background-color': '#fee',
								opacity: 0.80
							}).appendTo("body").fadeIn(200);

						}


						var previousPoint = null;
						$(plotObject).unbind("plothover");
						$(plotObject).bind("plothover", function (event, pos, item) {


							$("#x").text(pos.x.toFixed(2));
							$("#y").text(pos.y.toFixed(2));

							if (item) {
								
								if (previousPoint != item.dataIndex) {

									previousPoint = item.dataIndex;

									$("#tooltip").remove();
									var x = item.datapoint[0].toFixed(2);
									var y = item.datapoint[1].toFixed(2);
									var d = new Date(item.datapoint[0]);
									if(item.series.activity) {
										// if it's an activity, use a different tooltip
										showTooltip(item.pageX, item.pageY, item.series.list[item.dataIndex] + "<br>" + d.format("m/d/yyyy \"at\" h:MMTT Z"));
									} else {
										showTooltip(item.pageX, item.pageY,
										item.series.name + ", " + userAppModel.get('supportedUnitTypes').energyConsumption + ": " + (item.datapoint[1] - item.datapoint[2]).toFixed(5) + "<br>" + d.format("m/d/yyyy \"at\" h:MMTT Z"));
									}
								}
							} else {
								$("#tooltip").remove();
								previousPoint = null;
							}


						});
					

						// Activity Annotation setup

						// register our div as a dialog
						$('#annotation-dialog').dialog({
							autoOpen: false,
							show: "fade",
							hide: "fade",
							modal: true,
							width: 450,
							height: 350,
							resizable: false
						});

						$('#annotation-loading').hide();
						
						// make the dialog visible (it's not visible when parsed to make sure the dialog won't show up where it shouldn't)
						$('#annotation-dialog').css('visibility', '');
						
						$("#annotation-list").unbind("change");
						$("#annotation-list").bind("change", function() {
							// when a user selects something from the previously logged list, fill in the information for them
							var i = this.selectedIndex;
							$("#annotation-text").val(userAppModel.get('activities').texts[i].label);
							$("#annotation-selectbox")[0].selectedIndex = userAppModel.get('activities').types[i];
						});
		
						// when the list is deselected, remove any selection on it
						$("#annotation-list").unbind("blur");
						$("#annotation-list").blur(function() {
							this.selectedIndex = -1;
						});
						
						// put a watermark on the text field
						$("#annotation-text").watermark("Activity");
						
						function lockActivityControls() {
							$("#annotation-text").attr('disabled', true);
							$("#annotation-text").autocomplete("close");
							$("#annotation-list").attr('disabled', true);
							$("#annotation-selectbox").attr('disabled', true);
							$("#annotation-submit").attr('disabled', true);

							$("#annotation-loading").show();
						}

						function unlockActivityControls() {
							$("#annotation-text").attr('disabled', false);
							$("#annotation-list").attr('disabled', false);
							$("#annotation-selectbox").attr('disabled', false);
							$("#annotation-submit").attr('disabled', false);

							$("#annotation-loading").hide();
						}


						function submitActivity() {
							var index = $("#annotation-selectbox")[0].selectedIndex; // get the category index
							var type = $("#annotation-selectbox").val(); // get the category name
							var text = $("#annotation-text").val(); // get the activity text
							var activityString = type + "  : " + text;
							var activities = userAppModel.get('activities'); // get the activities list
							var isNew = true; // we'll use this to create the activity first if it's new
							
							// validation checks
							if(!text.replace(/\s+/g, '')) {
								// text field is blank (or only whitespace)!
								// output some error message
								
							} else if(type.match(/^(Entertainment|Cooking|Chores|Work|Other)$/) == null) {
								// someone tampered with the selection box!
								// output some error message

							} else if(index < 0 || index > 4) {
								// someone invalidated index!
								// output some error message
								// this is category index
							}
							
							// determine if this activity is new
							for(var i = 0; i < activities.texts.length; i++) {
								if(activities.texts[i].label === text && activities.types[i] === index) {
									isNew = false;
									i = activities.texts.length; // they say break is bad practice - so fine.
								}
							}
							

							lockActivityControls();
							if(isNew) {
								// call api to create new activity entry
								var jsonResponse = command_center("activity", {activity: activityString, 'new': true});
								jsonResponse.success(function(dataObject) {
									if(!dataObject.success) {
										// error adding activity
										alert("error");
									} else {
										// add to activity list model - cheaper than reloading model from API
										activities.texts.push(text);
										activities.types.push(type);
										userAppModel.set({activities: activities});
										
										// call api to log time for new activity
										var jsonResponse = command_center("activity", {activity: activityString, 'new': false, timestamp: activity_timestamp});
										jsonResponse.success(function (dataString) {
											var dataObject = $.parseJSON(dataString);
											if(!dataObject.success) {
												// error adding activity at time
												alert("error");
											} else {
												// success!
												unlockActivityControls();
												// hide annotation dialog
												$('#annotation-dialog').dialog("close");
												// re-render
												callbackContext.all_devices_graph_render(from, to);
											}
										});
									}
								});
							} else {
								// call api to log time for activity
								var jsonResponse = command_center("activity", {activity: activityString, 'new': false, timestamp: activity_timestamp});
								jsonResponse.success(function (dataString) {
									var dataObject = $.parseJSON(dataString);
									if(!dataObject.success) {
										console.log(dataObject.success);
										// error adding activity at time
										alert("error");
									} else {
										// success!
										unlockActivityControls();
										// hide annotation dialog
										$('#annotation-dialog').dialog("close");
										// re-render
										callbackContext.all_devices_graph_render(from, to);
									}
								});
							}
						}
						
						// bind the click event of the submission
						$("#annotation-submit").unbind("click");
						$("#annotation-submit").unbind("keypress");
						$("#annotation-submit").click(submitActivity);
						$("#annotation-submit").keypress(function(e) {
							if(e.keyCode == 13) {	
								submitActivity();
							}
						});

						$("#annotation-text").unbind("keypress");
						$("#annotation-text").keypress(function(e) {
							if(e.keyCode == 13) {	
								submitActivity();
							}
						});
						
						$("#annotation-selectbox").unbind("keypress");
						$("#annotation-selectbox").keypress(function(e) {
							if(e.keyCode == 13) {	
								submitActivity();
							}
						});

						$("#annotation-list").unbind("keypress");
						$("#annotation-list").keypress(function(e) {
							if(e.keyCode == 13) {	
								submitActivity();
							}
						});

						$('#all-devices-date-dialog').dialog({
							autoOpen: false,
							show: "fade",
							hide: "fade",
							modal: true
						});

						$("#datepickerFROM").datepicker({
							'showAnim': "fadeIn",
							'maxDate': "+0d",
							'showOn': 'focus'
						});
						$("#datepickerTO").datepicker({
							'showAnim': "fadeIn",
							'maxDate': "+0d",
							'showOn': 'focus'
						});

						//$("#all_devices_date_selector").unbind("click");
						$('#all_devices_date_selector').click(function () {
							$('.ui-widget-overlay').live('click', function () {
								$('#all-devices-date-dialog').dialog("close");
							});

							$('#all-devices-date-dialog').dialog("open");
							$('.date_dialog').css({
								'opacity': 1
							});


						});

						$("#clearSelection").unbind("click");
						$("#clearSelection").click(function () {
							plot = $.plot($(plotObject), data, options);
						});

						$("#refresh").unbind("click");
						$("#refresh").click(function () {
							if (latestSelection.from != -1) {
								callbackContext.all_devices_graph_render(latestSelection.from, latestSelection.to);

							} else {
								callbackContext.all_devices_graph_render();
							}
						});

						$("#submitDates").unbind("click");
						$("#submitDates").click(function () {
							var thisfrom = $('#datepickerFROM').val();
							var thisto = $('#datepickerTO').val();
							latestSelection.from = -1;
							latestSelection.to = -1;
							if (thisfrom != "" && thisto != "") {
								var dFrom = new Date(thisfrom);
								var dTo = new Date(thisto);

								callbackContext.all_devices_graph_render(dFrom.getTime(), dTo.getTime());
								$('#all-devices-date-dialog').dialog("close");
							} else {
								callbackContext.all_devices_graph_render();
								$('#all-devices-date-dialog').dialog("close");
							}
						});
						
						

						var labels = $("#customGraphOptions-energyConsumption").find("label");
						labels.each(function(i) {
							var labelText = $(this).text();
							$(this).empty();
							$(this).text(labelText);
						});

						$('.legend tr').each(function(i){
							var name = $(this).children(".legendLabel").children().text();
							var label = $("label:contains("+name+")");
							var colorBox = $(this).children(".legendColorBox").children().clone();
							colorBox.css("display", "inline-block");
							colorBox.css("margin-right", "4px");
							//label.children("div").remove();
							label.prepend(colorBox);
						});
					}


					// insert checkboxes
					var choiceContainer = $("#customGraphOptions-energyConsumption"); //customGraphOptions

					$.each(datasets, function (key, val) {
						// check if all datapoints have a y of zero
						var isNonZero = false;
						var i;
						for(i = 0; i < val.data.length && !isNonZero; i++) {
							if(val.data[i][1] != 0) {
								isNonZero = true;
							}
						}
						
						// uncheck and lock datasets that are empty, fixes bugs on the stacked graph
						if(val.data.length != 0 && isNonZero) {
							choiceContainer.append('<br/><input type="checkbox" name="' + key +
								'" checked="checked" id="id' + key + '">' +
								'<label for="id' + key + '">' + val.label + '</label>');
						} else {
							choiceContainer.append('<br/><input type="checkbox" name="' + key +
								'" disabled="true" id="id' + key + '">' +
								'<label for="id' + key + '">' + val.label + '</label>');
						}
					});
					
					choiceContainer.append('<p>Activities</p>');
					
					// add activities as well
					$.each(graphValues.activities, function(key, val) {
						if(val.data.length != 0) {
							choiceContainer.append('<input type="checkbox" name="' + key +
								'" checked="checked" id="id' + key + '">' +
								'<label for="id' + key + '">' + val.label + '</label><br/>');
						} else {
							choiceContainer.append('<input type="checkbox" name="' + key +
								'" disabled="true" id="id' + key + '">' +
								'<label for="id' + key + '">' + val.label + '</label><br/>');
						}
					});
					
					// and finally add anomalies
					
					choiceContainer.append('<p><input type="checkbox" name="anomalies" checked="checked" id="anomalies"</input> <label for="anomalies">Anomalies</label></p>');
					
					choiceContainer.find("input").click(plotAccordingToChoices);
					var callbackContext = this;

					plotAccordingToChoices();


					break;

			}
		}
	}

});
// Panel_Views --------------------------------------------------  END //        

/*
	  custom_graph_render__get_statuses: function(rangeOptions){
	  //CALLED TO ASSEMBLE CUSTOM graphValues FOR GRAPH RENDER OF customGraphPanel
	  
	  // tasked with creating a complete data object. a 'graph values' object for each graph-type of each device
	  
	      //Construct initial data-less object if it doesn't exist (serves as a skeleton/scaffolding)
	      index = 0;
	      while(index < Devices.length){
		

		var innerIndex = 0;
		while (innerIndex < userAppModel.get('supportedGraphs').length) {
		  
		  var ourDataType = userAppModel.get('supportedGraphs')[innerIndex];		  
		  var lineUID = Devices.models[index].get('id') + " " + ourDataType;
		  
			//console.log('instead me REACHED 2... ' + Devices.models[index].get('id') + ourDataType + lineUID);
		  
		  var label_ = ourDataType + " - " + Devices.models[index].get('name');
		  
		  var line = {};
		  
		  this.customGraphObject[lineUID] = {'label': label_, 'stack':1, 'data': [], 'name': Devices.models[index].get('name'), 'dataType':ourDataType};
		  
		  //////console.debug(line);
		
		  
		    innerIndex++;
		}
		
		index++;
	      }
	  
	      //a callback is necessary, since the get request takes time to complete
	      var callback_context = this;
	      var callback_instruction = 'add graphValues object to custom graph';
	      
	      index = 0;
	      while(index < Devices.length){
	      
		  var ourDeviceId = Devices.models[index].get('id');
		  
		  var innerIndex = 0;
		  while (innerIndex < userAppModel.get('supportedGraphs').length) {
		    
		      var ourDataType = userAppModel.get('supportedGraphs')[innerIndex];
		     //console.log('data type (before call): ' + ourDataType);
		     
		      this.graph_render__get_statuses(rangeOptions, callback_context, callback_instruction, ourDeviceId, ourDataType);		   
		    
		      innerIndex++;
		  }
		
	      index++;
	      }
	    /*
	    the callback instruction tells it to call the add_to_custom_graph_values function
	    
	    this function adds the values (with context info) into proper object
	    
	    ends with a check to see if size of proper object equals Devices.length * supportedGraphs.length
	    
	      if true, then it calls graph_render with proper object as graphValues argument
	    
	    
	  },*/


/*
	  add_to_custom_graph_values: function(datacontext_graphValues) {  //the passed datacontext_graphValues object contains context in the first object, graphvalues in second object
	    //add the recieved info to our scaffolding
	  //  {'deviceId':currentDeviceId, 'dataType':currentPanelType, 'data':graphValues}
		  
	      var obj = this.customGraphObject;
	      var ourKey = datacontext_graphValues.deviceId + ' ' + datacontext_graphValues.dataType;
	      
	      if(datacontext_graphValues.dataType == 'energyConsumption') {
		var ourDatatype = 'energyConsumed'
	      } else {
		var ourDatatype = datacontext_graphValues.dataType;
	      }
	      
	      if (datacontext_graphValues.dataType != "energyConsumption"){
		  var newValue = datacontext_graphValues.data;
		  delete newValue['energyConsumed']; //to prevent overwriting energyConsumption GET data
	      } else {
		  var newValue = datacontext_graphValues.data;
	      }
	      //console.log('add-t-custom-graph values: our Key: ' + ourKey);
	      
	      //////console.debug(newValue);
	      
	      var getKeys = function(obj, ourKey, newValue){
		  var keys = [];
		  for(var key in obj){
		     if (key == ourKey){
		      
		      var indexedNewValue = [];
		      

		      for (var i = 0; i < newValue.length - 1; i += 1){
			    indexedNewValue.push([newValue[i].timestamp, newValue[i][ourDatatype]]);
		      }
		      
		      obj[key].data = indexedNewValue;

		     }
		  }
	       }
	       getKeys(obj,ourKey,newValue);
	      
	      this.customGraphDataCounter++;
	      //console.log('after add counter: ' + this.customGraphDataCounter);
	    
	      //checks to see if requests are done
	      if(this.customGraphDataCounter == (Devices.length * userAppModel.get('supportedGraphs').length)){
		
		//console.log('this is the thing');
		
		//////console.debug(this.customGraphObject);
		this.graph_render(this.customGraphObject, true);
		this.customGraphDataCounter = 0;
	      }
	  }
	  */
/* graph_render__get_statuses: function(rangeOptions, callback_context, callback_instruction, deviceId_, dataType_) {

	  // starter panels don't render regular graphs
	  if(this.panelType != 'starterPanel' ) {  // && this.deviceId > 0 Non-traditional panels will have a device ID greater than 0, this should catch 
	
	    //FETCH GRAPH DATA -- THIS MODULE IS SELF CONTAINED
		//IT BUILDS 'GET' QUERY STRICTLY FROM this PANELVIEW's CONTEXT (this.graphRange, this.deviceId, this.deviceName)
	      
	      var graphValues = [];
	      
	      //INTEGRATE (passed) request rangeOptions
	      //otherwise, falling back on some standard defaults -- equiv. to "oneDay" get request
		if (rangeOptions.scale != undefined){
		    var scale = rangeOptions.scale;
		} else { var scale = "HALF_HOUR"; }
		
		if (rangeOptions.count != undefined){
		    var count = rangeOptions.count;
		} else { var count = 48; } // 24hours 
	      
	      	//To handle custom Graph Requests, we separate from panel's context
		if(deviceId_ == undefined || deviceId_ == null){
		  //NOTE: the parse INT here is needed even though it doesn't look like it
		    var currentDeviceId = parseInt(userAppModel.get('midPanelCollection').deviceId);
		    var currentPanelType = this.panelType;
		  } else {
		    //for customGraph graph data values
		    var currentDeviceId = deviceId_;
		    var currentPanelType = dataType_;
		  }
	      
	      
	      //console.log('custom graph. rangeOptions: ' + scale +" " + count + ' ' + currentDeviceId + ' vs ' + this.deviceId);
	      
	      if (currentPanelType == "powerDraw"){
	      
	      //For this.device, call the API and save the statuses to the graphValues array:
	      jsonDATA_stat = command_center("get_dev_statuses",{device_id: currentDeviceId, 'scale': scale, 'count':count});
	      //You could add additional status api option to this argument option
		
		var callbackContext = this;
		
		  jsonDATA_stat.success(function (dataObject) {       //accessing callback    
				
		  if (!dataObject.success == true) {      // **** dblcheck error msg
		      alert(dataObject.errorMsg);        //**** event should be bound to errorView
		  }
		  else if (dataObject.success == true) {
				
		      var innerIndex = 0;
		      while (innerIndex < dataObject.statuses.length) {
			  
			  //we walk from the end of the dataObject toward the beginning, as the latest timestamps are nearest to the front
			
			  var fetchIndex = (dataObject.statuses.length - 1) - innerIndex;
			
			  //adding a device for each provided in GET requested JSONP object
			  bulk_stuff = $.extend(dataObject.statuses[fetchIndex], {'device_id':dataObject.device_id}); //adding device id to the status data
			  
			  //add this status to graphValues
			  graphValues.push(bulk_stuff);
			  
			  innerIndex++;   
		      }
		      
		      //console.log('Itoo REACHED, get area: instruction: ' + callback_instruction);
		      
		      if (callback_instruction == "render graph"){
			callback_context.graph_render(graphValues);  //this will call the graph_render function
			}
			else if (callback_instruction == "add graphValues object to custom graph") {
			  
			  //console.log('Itoo REACHED, if (add graphvalues)...graph values before transfer, of: ' + currentDeviceId);
			  //////console.debug(graphValues);
			  //providing sufficient context with the values
			  callback_context.add_to_custom_graph_values({'deviceId':currentDeviceId, 'dataType':currentPanelType, 'data':graphValues});
			}
		      }
		  else {
			  alert("Unable to start session, server problems for " + username);
		      }
		});
		  }
		  
		else if (currentPanelType == "energyConsumption"){
		  
		    var callbackContext = this;
		  
		      //SOLUTIONS HARD CODED FOR THIRTY MINUTE BLOCKS due to DISCREPANCIES IN APIs
		      // could add the energy info here to the energyConsumption feild
		  
		      //use 'count' attribute from 'rangeOptions' to calculate 'from' and 'to'
			  
			  var milliUTC = new Date().getTime();
			  var to = milliUTC;
			  var from = new Date(parseInt(milliUTC + (count * - 1800000 ))).getTime();
			
			//console.log('milli time (to): ' + milliUTC + " count: " + count + ", from" + from + " this.deviceId " + currentDeviceId);
			  
		      //For this.device, call the API and save the statuses to the graphValues array:
		      jsonDATA_stat2 = command_center("get_energy_statuses",{'device_id': currentDeviceId, 'block': 30, 'from':from, 'to':to});
		      
		      jsonDATA_stat2.success(function (dataObject) {       //accessing callback    
				
			if (dataObject.success != true) {      // **** dblcheck error msg
			    alert(dataObject.errorMsg);        //**** event should be bound to errorView
			}
			else if (dataObject.success == true) {
				      
			    var innerIndex = 0;
			    
			    //console.log('energy consumption debug');
			    //////console.debug(dataObject.energyConsumptions);

			    while (innerIndex < dataObject.energyConsumptions.length) {
			      fetchIndex = (dataObject.energyConsumptions.length -1) -innerIndex;
				//we walk from the end of the dataObject toward the beginning, as the latest timestamps are nearest to the front
			      
				//var fetchIndex = (dataObject.energyConsumptions.length - 1) - innerIndex;
			      
			      ////console.log("valcheck: " + dataObject.energyConsumptions[fetchIndex].energyConsumed);
			      
			      //add this status to graphValues
			      graphValues.push({'energyConsumed':dataObject.energyConsumptions[innerIndex].energyConsumed, 'timestamp': dataObject.energyConsumptions[innerIndex].to});
				
			      innerIndex++;   
			    }
			    
			//Handles differently if basic graph or Custom Graph
			
			//console.log('energy consumption graph values: (down)');
			//////console.debug(graphValues);
			
			if (callback_instruction == "render graph"){
			callback_context.graph_render(graphValues);  //this will call the graph_render function
			}
			else if (callback_instruction == "add graphValues object to custom graph") {
			  //console.log('In graph (after gotten) : ' + currentDeviceId + " " + currentPanelType);
			  //////console.debug(graphValues);
			  //providing sufficient context with the values
			  callback_context.add_to_custom_graph_values({'deviceId':currentDeviceId, 'dataType':currentPanelType, 'data':graphValues});
			}
		      }
		      });
		    }
		  }
      }, */

/*
    custom_graph_one_day: function(){
    
	//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
	    var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
	    var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
		    
	//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
	    var blocksize_ = 30; //our statuses will be for 30 minute intervals
		    
	    var datatype_ = this.panelType;
	    var deviceId_ = this.deviceId;
	    var deviceName_ = this.deviceName;
		    
	//Handle the success, rendering the graph
	    successObject = new SuccessObjectClass(); var callbackContext = this;
	    $(successObject).bind('series_ready', function(e, it){
		var finalSeriesWithData = it.get_series();
			
		callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
	    });
		    
	    //Describing the series we need for the graph
	    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}]);
    
    
      //a callback is necessary, since the get request takes time to complete
      var callback_context = this;
      //var callback_instruction = 'render graph';
      
      this.graphRange = "oneDay";
      this.custom_graph_render__get_statuses({'count':48, 'scale':"HALF_HOUR", 'getType':'oneDay'}, callback_context);
      
    },
    
    custom_graph_seven_days: function(){
	//console.log('seven days custom');
	
      //a callback is necessary, since the get request takes time to complete
      var callback_context = this;
      //var callback_instruction = 'render graph';
      
      this.graphRange = "sevenDays";
      this.custom_graph_render__get_statuses({'count':336, 'scale':"HALF_HOUR", 'getType':'sevenDays'}, callback_context);
	
    },
    
    custom_graph_three_days: function(){
	if(this.panelType = "customGraph")
      //a callback is necessary, since the get request takes time to complete
      var callback_context = this;
      //var callback_instruction = 'render graph';
      
      this.graphRange = "threeDays";
      this.custom_graph_render__get_statuses({'count':144, 'scale':"HALF_HOUR", 'getType':'threeDays'}, callback_context);
      
    },
    */
