// SessionView -------------------------------------------------- BEGIN //       


//VIEW:  sessionView  -- interfaces with DOM inputs, handles setting the cookie, and initial ApiCommands
var SessionView = Backbone.View.extend({
  
    el: $(".login_box"), //Binding to HTML skeleton //(template not needed here)

    events:   // 1.) clicking log in (hitting enter too) calls the ApiCommand to set cookie 2.) Logging out rerenders View
    {
      "keypress #nameLogin":  "pushCredsOnEnter",
      "keypress #passwordLogin": "pushCredsOnEnter",
      "click #imgLogin": "startSession",
      "click #imgLogout": "unsetSession",
      "click #tempButton":"temp_button"
	
    },
    
    initialize: function() {
                // If the userModel's attributes are changed, this (session) View will rerender
                userAppModel.on('change', this.render, this);
                
		//Binding to the user Model's devices ready event, which triggers syncronous functions, like building the sidebar view
		userAppModel.on('devices_ready_event', this.devices_done, this);
                
                //Simply set the userAppModel's statusesLoaded attribute to true
                userAppModel.on('statuses_ready_event', this.statuses_done, this);
                
                //Binding the statuses done event to render, so that the loading mask will disappear on time
                userAppModel.on('statuses_ready_event', this.render, this);
                
		//if there's a hanging error on an API call (greenhome server is down), this will happen
		userAppModel.on('force_log_out', this.unsetSession, this);
		
                // Binding View to DOM Elements
                this.name = this.$('#nameLogin');
                this.password = this.$('#passwordLogin');
                this.loginButton = this.$('#imgLogin');
                this.logoutButton = this.$('#imgLogout');
		
                //console.log('before fetch'); //console.log('after fetch'); //console.log("collection length " + savedUser_instance.length);
                
		this.render();
    },
        
    //Here is where the "Log-in" HTML is refreshed
    render: function() {	// 1.) acknowledge a valid cookie by re-rendering the DOM's log-in div

      
    //HANDLES VIEW ANIMATION 
      if (userAppModel.valid_cookie()){
        //replaceable DOM references
	    //console.log( userAppModel.get('name') +'is logged-in');
            this.logoutButton.animate({'top': '0px'},{duration:'slow',queue: false});
            this.loginButton.hide('slow');
            this.password.hide('slow');
            this.name.hide('slow');
	  

            
		} else { 	//there is no valid cookie
                  
            //console.log('original rendering settings');
	      	
		if(this.logoutButton.css('top') != "-50px"){ //starting position
		this.logoutButton.animate({'top': "-50px"}, {duration:'fast', queue:false});
		}
                this.loginButton.show();
                this.password.show('slow');
                this.name.show('slow');
            
		//add watermarks to input feilds
		this.name.watermark('username');
		this.password.watermark('password');
	    
                }
    
    //HANDLES GETTING OF DEVICES       
      if (userAppModel.valid_cookie()) {
        //Each time the Session View renders, it makes sure the Devices collection has been set.	
            if (!Devices.length) {
              this.set_user_devices();
              }
      }
    },
    
    //When the devices collection is set, this function is triggered by the "devices_ready_event"
    //These are functions that depend on Devices
    devices_done: function() {
	//console.log("Triggered from 'devices_ready_event' after Devices are done -- in sessionView");
	
	userAppModel.save({sidebarView: "DeviceCenter"});
	
	if(this.sidebarView != 'init'){
	    //this.sidebarView.destroy_view();
	    delete this.sidebarView;
	}

	//First, build the sidebar View	
	this.sidebarView = new SidebarView; 
	
	
	
	//Now, continue to grab statuses info
	//userAppModel.set_dev_statuses({'count':48, 'scale':"HALF_HOUR", 'getType':'oneDay'});
	this.set_dev_actions();
	
    },
    
    //Set the userAppModel's statusesLoaded attribute to true
    statuses_done: function() {
        userAppModel.set({'statusesLoaded':true});
    },
    
    // If you hit the 'return/enter' key in either input field, it will attempt to log you in (by pushing credentials)
    pushCredsOnEnter: function(e) {
      //console.log('pushing creds');
      if (e.keyCode != 13) return;
      if (!this.name.val() && !this.password.val()) return;
      this.pushCreds(this);
      this.name.val('');
      this.password.val('');
    },
    
    temp_button: function(){
	//console.log("button pushed");
	userAppModel.trigger('special_event_call');

    },
        
    unsetSession: function(){
      $.cookie('user', null);
      $.cookie('session', null);
      
      userAppModel.reboot(); //which, again, should trigger change event which will handle rerendering
      
      /*
            	//Attributes that should always reset on page load (regardless of app state)
		//For valid cookie situations, reset the viewStatus so DOM views will reset
                userAppModel.set({'viewStatus':0});
		//userAppModel.set({deviceStatusesLoaded: 0});  //used to trigger statuses loaded to true
		//userAppModel.set({statusesLoaded: false});  //is checked for synchronocity purposes
		userAppModel.set({'leftPanelCollection':{}, 'rightPanelCollection':{}});
		
		userAppModel.save();
      */	
      
    },
    
    startSession: function() {
	this.pushCreds(this);
    },
    
    // ---- API Handling Functions, updating models, setting cookies, etc. ---- //
    
    //This function handles the 'session' api and updating the web app's user model
    
    pushCreds: function(thisView){
      //Take returned Callback, pass in the this View and set cookie from within Callback
          
          // Calling the command center Api Handling code -- see ApiCommands.js to check connectivity code
          jsonDATA_sd = command_center("log_in", {'username_': this.name.val(), 'password_': this.password.val()});
          
          //Handling callback function
          jsonDATA_sd.success(function (data) {       //accessing callback
            data_unique = $.parseJSON(data);
            
            // **** NOTE: Alerts are lame, and I know it. They will be replaced with an error event.
                    
            //Bad Username / pass combo 
            if (data_unique.success == false) {
                alert("Please check your username and password" + data_unique.errorMsg);    //**** event should be bound to errorView
            }
            else if (data_unique.success == true) {   //  && check for error message
                //console.log('passing: ' + data_unique);
                thisView.parse_set_cookie(data_unique);   //SET TWO COOKIES, USER (VALUE = USERNAME), SESSION (VALUE = TOKENID)
                thisView.model.setAndSave(data_unique);  //The set() will trigger a change event, which will call this View's render function
                }
            else {
                    alert("Unable to start session, server problems for " + username);
                }
          });               //this.render(); -- unnecessary because "thisView.model.setAndSave(data_unique)" will cause a change event on user model                                      
	},
	
    parse_set_cookie: function (jsonFromPHP) {
      // jsonFromPHP = window.globalPass;  // **** Quick Fix for a bug
        //SETTING TWO COOKIES, MIMICKING THE GREENHOME API PLAYGROUND BEHAVIOR
        var thedate=new Date(jsonFromPHP.expiration);
        
        myExpiration = thedate.getUTCMilliseconds();
        myUsername = jsonFromPHP.currentUser.username;
        myToken = jsonFromPHP.token;

        //console.log(myUsername); //console.log(myToken); //console.log(myExpiration); 
        
        $.cookie('user', myUsername, {'expires':myExpiration}); // , {'expires':myExpiration}
        $.cookie('session', myToken, {'expires':myExpiration}); // , {'expires':myExpiration}
        //console.log('Cookie Set ' + $.cookie('user'));
      },
      
    set_user_devices: function() {
        
        // Calling the command center Api Handling code -- see ApiCommands.js to check connectivity code
        jsonDATA_sd = command_center("device_list");
        
        //jsonDATA_sd.success(function (dataObject) { alert(dataObject.success)});
        
        jsonDATA_sd.success(function (dataObject) {       //accessing callback
            //
            if (!dataObject.success == true) {      // **** dblcheck error msg
                alert(dataObject.errorMsg);        //**** custom event should be bound to errorView
                // TODO **** STUB:  custom event for error handling
            }
            else if (dataObject.success == true) {
                
                //console.log("devices length" + dataObject.devices.length);
                //console.log("device 1 (0) id: " + dataObject.devices[0].id);
                
                index = 0;
                while (index < dataObject.devices.length) {
                    //adding a device for each provided in GET requested JSONP object
                    
		    //console.log('spencerd: ' + dataObject.devices[index].name);
		    
		    if(dataObject.devices[index].name != undefined || dataObject.devices[index].name != ''){
			device = new deviceModel({bulk:dataObject.devices[index]}); // the initialize/constructor of this model handles parsing thisdevice.set();   
				  //console.log("Device collectionFlag before add" + device.get('collectionFlag'));
			Devices.add(device);
				  //console.log("Device after add collectionFlag " + device.get('collectionFlag'));                    
			$("#collectionContents").append("Item added to Devices (collection): " + device.get('name') + "? " + device.get('collectionFlag') + "<br/>");
		    }
                    index++;   
                }
			
		
		userAppModel.trigger("devices_ready_event");
                
		  //temporary workaround for synchronous effect
                  //callback();  //getting statuses: executing the callback, which is to set_dev_statuses of devices
                  //callback2();  //getting actions: executing the second callback, which is to set_dev_actions of devices
                  //callback3();    //userAppModel.devices_done();

                }
            else {
                    alert("Unable to start session, server problems for " + username);
                }
        });  },
    
    set_dev_actions: function() {
        //for each device, add those actions to Actions collection
        
        var index = 0;

      while(index < Devices.length) {
        
        device_ = Devices.at(index);
        //console.log("Hello, after trying to ping API, device: " + device_.id);
        //For each Device, call the API and save the statuses to the statuses Collection:
          //For each Possible Action, create a model
        
        jsonDATA_act = command_center("get_dev_actions",{device_id: device_.id});
            jsonDATA_act.success(function (dataObject) {       //accessing callback
            
            if (!dataObject.success == true) {      // **** dblcheck error msg
                alert(dataObject.errorMsg);        //**** custom event should be bound to errorView
                // TODO **** STUB:  custom event for error handling
            }
            else if (dataObject.success == true) {
              
              //For each Possible Action, create a model
              innerIndex = 0;
              while (innerIndex < dataObject.possibleActions.length){
                
                action = new actionModel({bulk:dataObject.possibleActions[innerIndex]}); // the initialize/constructor of this model handles parsing this data
            // Adding each action to the global collection of actions
                Actions.add(action); 
                innerIndex++;
              }
            }
        })

        index++;
      }
      }

    });

// END -------------------------------------------------- SessionView // 