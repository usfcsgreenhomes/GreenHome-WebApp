// appView -------------------------------------------------- BEGIN // 

// First remnants of an old session need to know the page has refreshed (destroying old panel views)
if (userAppModel != undefined) {
	userAppModel.trigger('app_start');
}


var userAppModel = {};  //Global model for events/app-state.  In the appView will be set equal to the savedUser_instance (collection) userModel_pd (model) instance 


//VIEW ****
	// show() or hide() sessionView div. - to be replaced by animation eventually
var appView = Backbone.View.extend({
        
	initialize: function() {
	    
        //Look to local storage for an existing user model
	savedUser_instance.fetch();
              ////console.log('instantiating the session View from the App View');
            
        //INSTANTIATE THE USER MODEL INSTANCE  --
	//used for passing and listening to global events, such as "devices_ready_event"
	// as well as saving the app's state
              
		if (savedUser_instance.length == 0){      // If the savedUser collection does not have a userModel, add one
			////console.log('instantiate user model');
			  var userModelglobal = new UserAppModel_pd;
			  savedUser_instance.add(userModelglobal);
			  userAppModel = savedUser_instance.get(1); //The app now knows it as "userAppModel"
			 } else {
			  userAppModel = savedUser_instance.get(1); //The app now knows it as "userAppModel"
			 }
            
		/* // If a user model exists, check for a valid cookie
		if (savedUser_instance.length){     ////console.log('checking cookie ' + savedUser_instance.get(1).validCookie());
		} */
                
		////console.log('checking cookie hello test ' + userAppModel.valid_cookie());
		if (!userAppModel.valid_cookie()){  // If model does not return valid cookie, reset model
		  userAppModel.reboot(); // !!!! This triggers a 'change' event, which causes the session View to rerender (see above bound event)
		} 
                
		//Cleanse App
		//userAppModel.trigger('remove_views_event');  
		
	      //ONLOAD SETTINGS REGARDLESS OF APPSTATE
		
		//Attributes that should always reset on page load (regardless of app state)
		//For valid cookie situations, reset the viewStatus so DOM views will reset
                userAppModel.set({'viewStatus':0});
				//userAppModel.set({deviceStatusesLoaded: 0});  //used to trigger statuses loaded to true
				//userAppModel.set({statusesLoaded: false});  //is checked for synchronocity purposes
		userAppModel.set({'leftPanelCollection':{}, 'rightPanelCollection':{}});
		
		userAppModel.set({'midPanelCollection':{"deviceName":"starterPanel", "deviceId":-1}});
		

		//userAppModel.set({
		
		
		//       GLOBAL EVENT CENTER       //  (Sounds like trouble right? Let's try calling it this then:)
		   // ---- GLOSSARY OF CUSTOM EVENTS ---- //
			// Used to trigger syncronous code after Devices data has been downloaded from API
			userAppModel.on('devices_ready_event');
			
			//Once the statuses have loaded from the api, again to handle syncronocity
			userAppModel.on('statuses_ready_event');
			
			//Create a new panel-'collection' (aka 'group') by re-rendering PanelsContainer view
				// ... with a new device in the midPanelCollection object of the user model
			userAppModel.on('new_device_create'); 
			
			// The app's focus has changed to a new panel, this will update the DOM.
				// ... this is used to move currently rendered panels
				// ... if a new panel group needs to be constructed, use new_device_create
			userAppModel.on('new_device_select');  
			
			// The app has been logged out. All views should rerender
			userAppModel.on('logged_out');
			
			//if there's a hanging error on an API call (greenhome server is down), this will happen
			userAppModel.on('force_reboot');
			
			//on startup, remove any old views
			userAppModel.on('app_start');
			
			//This Specifically Removes and clears all panels in the container
				//Try it in the console right now, it works.
			//What it does not do:  remove the attributes from the userAppModel. That will need to be done manually
			userAppModel.on('panels_clear');  
			
		    //SIDEBAR BUTTONS
			
			//Activated by the Return to Start button in sidebar
			userAppModel.on('return_start_elements');
			
			userAppModel.on('custom_graph_panel_event');
			
			userAppModel.on('insights_panel_event');
			
			//remove or bring back curtains
			userAppModel.on('toggle_curtains_event');
			
			
	
	//INSTANTIATE SESSION VIEW
	//The SessionView calls all device, status, and action data.
	//as well as builds the necessary onload views, such as the sidebar view
		//Instantiate the SessionView() -- the initialize function of sessionView handles Devices, Actions, Statuses
		var sessionView_instance = new SessionView({model: userAppModel});
			//A NOTE:  Even though have passed the user model in above like '{model: userModelglobal}'
			//... I'm making it a standard to refer to the user model as savedUser_instance.get(1) -- instead of this.model
			//This is because some views refer to more than one model, and I want it to be clear -- this.model isn't alway clear
                  
		  
	     //INSTATIATE OTHER VIEWS
		var panelsContainerView = new PanelsContainerView;
		
		//var statusView = new StatusView;
		
		var homeDataView = new HomeDataView;
		
		var curtainView = new CurtainView;

        }
    

    });
	

	
var blueApp = new appView;

		
