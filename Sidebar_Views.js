// Sidebar_Views ------------------------------------------------ BEGIN //

//VIEW: for singular tabs in the accordion (not the whole sidebar)
  var SidebarTabView = Backbone.View.extend({
    tagName: 'div',
    
    //Each SidebarTabView has been passed a Device model.  So that's what 'this.model' refers to
    
    // Cache the template function for a single item.
    template: _.template($('#sidebar-tab-template').html()),    //this template is using underscore syntax, loaded from the DOM
    
    // The DOM events specific to an item.
    events: {
      'click form #valueOff': "off",
      'click form #valueOn': "on",
    },
    
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      
		$("#insightsView").css("visibility", "hidden");
      //console.log('Tab View hello! ' +  this.model.get('name'));
      
      _.bindAll(this,"render");
      this.render().el;
      
    },
    
    render: function(){
        var tabContent = this.template(this.model.toJSON());
	
      	this.delegateEvents(this.events);
	
	this.$el.html(tabContent);
	
	return this.$el;
      
    },
    

        
    on: function() {
      //toggle on/off state via an Api Command
      //console.log('hello on off on bool: ' + this.model.get('onBool') + ' ' + this.model.get('onOff').id	);
      var command = "on_off";
      
      //This is only going to trigger a post if the value checked is different from onBool. Will also reset onBool
      if (this.model.get('onBool') == 0){
	var actionValue = 1;
	      //console.log('should rerender now');
	      this.model.set({'onBool': 1}, {silent:true});
	      //this.render().el;
      } else {
	return false;
      }
      
      
      
      //device id 
      var params = {'act_id':this.model.get('onOff').id,'act_value':actionValue};
      
      var successObject = command_center(command, params);
      
      //if it worked, reset on Bool
      successObject.success(function (dataObject) {       //accessing callback
            
            if (dataObject.success == false) {    
	      //console.log('SOMETHING ISN"T WORKING');
	      
	    }
      });
      
    },
        
    off: function() {
      //toggle on/off state via an Api Command
      //console.log('hello on off on bool: ' + this.model.get('onBool') + this.model.get('onOff').id);
      var command = "on_off";
      
      //This is only going to trigger a post if the value checked is different from onBool. Will also reset onBool
 if (this.model.get('onBool') == 1){
	
	var actionValue = 0;
	      //console.log('should rerender now');
	      this.model.set({'onBool': 0},{silent:true});
	      //this.render().el;
      } else {
	return false;
      }
      
      //device id 
      var params = {'act_id':this.model.get('onOff').id,'act_value':actionValue};
      
      var successObject = command_center(command, params);
      
      //if it worked, reset on Bool
      successObject.success(function (dataObject) {       //accessing callback
            
            if (dataObject.success == false) {    
	      //console.log('SOMETHING ISN"T WORKING');
	      
	    }
      });
    }
    
  });
  
//SidebarView
var SidebarView = Backbone.View.extend({
    //This View is for logged-in state only
    //SidebarView should handle the instantiation of tabViews but not delegating .focus()
        //it passes the userModel to the tabViews, which are responsible for rerendering when the userModel changes
    
    el: $("#sidebarViewContainer"),
    
    template: _.template($('#sidebar-accordion-template').html()),    //these templates are using underscore syntax, loaded from the DOM
    //onloadTemplate: _.template($('#sidebar-onload-template').html()),    
    //customGraphTemplate: _.template($('#sidebar-custom-graph-template').html())
    
    events: {
      
      "click .dev_selector" : "device_select_eventFire",
      "click #toggle_curtains_icon":"toggle_curtains_event",
      "click #curtainLeft":"toggle_curtains_event",
      "click #curtainRight":"toggle_curtains_event",
      "click .starter_button":"return_home_event",
      "click .custom_graph_button":"custom_graph_event",
      "click .device_center_button":"device_center_event",
      "click .insights_button":"insights_event",
      
      "click #panel_forward":"panel_forward",
      "click #panel_back":"panel_back",
      "keydown .dev_selector" : "device_select_eventFire"
    },
    
    initialize: function() {
      
        this.accordion = $('#accordion');
        this.panelButtons = this.$('.panel_buttons');
        
	this.silenceTabClick = false; //so that refocusing a tab does not cause an unnecessary global event
	
	//When Devices are reset (or are changed), this View must re-render
        Devices.bind('change', this.render, this);
        Devices.bind('reset', this.render, this);
	
	//actions taken on first render, (such as selecting a starter device)
	this.firstLoadBool = true;
	
	//resets sidebar view
	userAppModel.on('logged_out', this.destroy_view, this);
	
	//If the user changes the focus of the device by selecting a panel (instead of clicking an accordion tab)
	//then this will handle correcting the focus
	userAppModel.on('new_device_select',this.refocus, this);
	
	//For the ghost panels to bring in new device collections
	var callbackContext = this;
	$('#ghost-right').on('click', function(){
	  
	  if(userAppModel.get('sidebarView') == "DeviceCenter"){
	  callbackContext.panel_forward();
	  } else {
	    callbackContext.device_center_event();
	  }
	  });
	
	$('#ghost-left').on('click', function(){
	  if(userAppModel.get('sidebarView') == "DeviceCenter"){
	  callbackContext.panel_back();
	  } else {
	    callbackContext.device_center_event();
	  }
	  });
	
        this.render();
    },
    
    
      render: function(){
            
	    // this renders *templates* to support both Device List and the Custom Graph view-states // soon also Stats Center
	    
            //console.log('sidebar Render function');
	    
	    //generic actions
	    $(this.panelButtons).show();
		
	    this.$el.html(this.template());
	    
	    $('#panel_back').button();
            $('#panel_forward').button();
	    $('.toggle_curtains_button').button();
	    $('.starter_button').button();
	    $('.device_center_button').button();
	    $('.custom_graph_button').button();
	    $('.insights_button').button();
	    
	    this.sidebar_reset(); //returns all sidebar elements to 0 opacity at a -1 z-index;
	    
	  if(userAppModel.get('sidebarView') == "DeviceCenter") {
            this.sidebar_reset(); //returns all sidebar elements to 0 opacity at a -1 z-index;
	    
	    $('#accordion').css({'opacity': 1, 'z-index': 5});
	    $('.DeviceCenterButtons').css({'opacity': 1, 'z-index': 5});
	    
            //This sidebar only renders if there are devices to be displayed
            if (Devices.length != 0)
            {  
                index = 0;
                while (index < Devices.length)
                {
		  			// Add a single tab item to the list by creating a view for it, and
					// appending its element to the `<ul>`.
                    this.add_one(Devices.at(index));
                    index++;
                }
            }
            else {
                    //update app's state
                    userAppModel.set({'viewStatus':0});
            } 
            $('#accordion').accordion({'active':false});
	    
	    this.refocus();
            this.silenceTabClick = false; //so that refocusing a tab does not cause an unnecessary global event
            
	    //to select a device on first render of view
	    if(this.firstLoadBool == true){
	      this.firstLoadBool = false;
	      this.device_center_event();
	    }
	    return this;
	  }
	  
	  else if (userAppModel.get('sidebarView') == "CustomGraph") {
	    this.sidebar_reset(); //returns all sidebar elements to 0 opacity at a -1 z-index;
	    
	    $('.CustomGraphButtons').css({'opacity': 1, 'z-index': 5});
	    $('#customGraphView').css({'opacity': 1, 'z-index': 5});
            $('#customGraphOptions').css({'opacity': 1, 'z-index': 5});
	    
	      //Add Graph's Device-specific options for the custom graph
	      /* if (Devices.length != 0)
	      {  
		  index = 0;
		  while (index < Devices.length)
		  {
		    // Add a single tab item to the list by creating a view for it, and
		  // appending its element to the `<ul>`.
		      //this.add_one(Devices.at(index));
		      index++;
		  }
	      }   */
	    
	    
	      //$('.toggle_curtains_button').button();
	    $('.starter_button').button();
	    $('.insights_button').button();
	    $('.device_center_button').button();
	    
	  }
	  else if (userAppModel.get('sidebarView') == "Insights"){
	    
	    //console.log('surely you heard me!');
	    
	    this.sidebar_reset(); //returns all sidebar elements to 0 opacity at a -1 z-index;
	    $('.InsightsButtons').css({'opacity': 1, 'z-index': 5});
	    $('#insightsView').css({'opacity': 1, 'z-index': 5});
            $('#insightsOptions').css({'opacity': 1, 'z-index': 5});
	    
	      //$('.toggle_curtains_button').button();
	    $('.starter_button').button();
	    $('.custom_graph_button').button();  
	    $('.device_center_button').button();  
	  }
	  else if (userAppModel.get('sidebarView') == "Home"){
	    this.sidebar_reset(); //returns all sidebar elements to 0 opacity at a -1 z-index;
	    $('.ReturnHomeButtons').css({'opacity': 1, 'z-index': 5});
	    
	    $('.ReturnHomeButtons button').button();
	    
	  }
        },
        
        // Add a single tab item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        add_one: function(device, index_) {
          var tabview = new SidebarTabView({model: device});
	 	 //this next line is not very nice -- it should be part of the DOM's template, added to the todo list
          $('#accordion').append('<h3 class="dev_selector"><a id="device_select" class="' + device.get('id') + '">' + device.get('name') + '</a></h3>');
          $('#accordion').append(tabview.render());

        },
	
	//This ONLY acts when the midPanelCollection is not reflected as the selected sidebar selected tab 
	refocus: function(silenceOverride) {
	  //console.log('trying to refocus');
	  
	  //If the accordion focus is not in line with the app's active device, refocus it
	  if (userAppModel.get('midPanelCollection').deviceName != $('h3[aria-expanded="true"] #device_select').html())
	  {
	    
	    _activeDeviceName_ = userAppModel.get('midPanelCollection').deviceName;
	    
	    this.silenceTabClick = true;
	    
	    if(silenceOverride == "notSilent"){
	      this.silenceTabClick = false;
	    }
	    
	  $("a:contains(" + _activeDeviceName_ + ")").click();
	    
	    //sidebar (DOM) is now updated
	  }
	  
	},
	
	destroy_view: function() {
  
  
	      //console.log('SIDEBAR BEING DESTROYED');
		
		//COMPLETELY UNBIND THE VIEW
		
		/* $(this.el).undelegate('#custom_graph_button', 'click');
		$(this.el).undelegate('#toggle_curtains_button', 'click');
		$(this.el).undelegate('#panel_back', 'click');
		$(this.el).undelegate('#panel_forward', 'click');
		$(this.el).undelegate('#starter_button', 'click');  */

		userAppModel.set({'sidebarView':'loggedOut'});
		userAppModel.save();
		this.sidebar_reset();
		this.undelegateEvents();
		userAppModel.off(null, null, this);
		$(this).removeData().unbind(); //unbind View instance
	},

	device_select_eventFire: function(optionalPassedDevice) {  // optionalPassedDevice
	  
	  if (this.silenceTabClick == false) { //it's true on initial page load.  It checks so that refocusing does not cause an unnecessary global event

	      //console.log("from sidebar's device_select_eventFire" + $('h3[aria-expanded="true"] #device_select').html());  //This selector is the selected accordion tab title
	  
	      //console.log("from sb - optional device: " + optionalPassedDevice.deviceId)
	  
	  var selectedDevice_ = {};
	  
	  if (optionalPassedDevice.deviceId != undefined) {  //this function supports a passed device (as opposed to fetching from the sidebar tabs)
	    
	    //console.log("from sb - optional device: " + optionalPassedDevice.deviceId)
	    
	    selectedDevice_ = optionalPassedDevice;  
	  } else {
	  
	    var selectedDevice_ = {};
	    selectedDevice_.deviceName = $('h3[aria-expanded="true"] #device_select').html();  // device's name for Displaying
	    selectedDevice_.deviceId =  $('h3[aria-expanded="true"] #device_select').attr('class'); // device's id for identifying unique devices
  
	    //console.log($('h3[aria-expanded="true"] #device_select').attr('class'));
	  }
	  
	  
	  //let's set the panelFocus back to zero
	  userAppModel.set({'panelFocus':0});
	  
	  userAppModel.set_device_focus(selectedDevice_); 
	  
	  this.silenceTabClick = false; //so that refocusing a tab does not cause an unnecessary global event
	  } else {
	    
	    this.silenceTabClick = false; //so that refocusing a tab does not cause an unnecessary global event
	  }
	},
	
	
	//THESE TWO FUNCTIONS (are hooked up to the FORWARD and BACK buttons) CHANGE THE panelFocus AND THEN UPDATE THE APP
	panel_forward: function() {
	  //console.log('registering: ' + this.debugCount);
	//First, if it is not the right-most panel, move the collection to the right
  	  if(userAppModel.get('panelFocus') != 0 )
	  {
	    userAppModel.set({'panelFocus': userAppModel.get('panelFocus')-1 });
	    userAppModel.trigger('new_device_select');
	  }
	  //If it is the right-most panel, and there exists a panel-group to the right of it, move to the left most panel of that group
	  else if(userAppModel.get('panelFocus') == 0 )
	  {
	  //else, IF the next panel is the next panel group, skip to it
	    if(userAppModel.get('rightPanelCollection').deviceName != undefined  && userAppModel.get('rightPanelCollection').deviceName != 'starterPanel' && userAppModel.get('rightPanelCollection').deviceName != ""){
	      //Next, tell the app of the new collection being assigned to the right
	      var passedDevice4newFocus= {};
	      passedDevice4newFocus.deviceName = userAppModel.get('rightPanelCollection').deviceName;
	      passedDevice4newFocus.deviceId = userAppModel.get('rightPanelCollection').deviceId;
	      
	      //calling this function will ultimately trigger a 'new_device_select' event
	      this.device_select_eventFire(passedDevice4newFocus);
	      
    	      //First, set a new panel focus
	      userAppModel.set({'panelFocus': (userAppModel.get('supportedGraphs').length - 1) });
	      userAppModel.trigger('new_device_select');
	    }
	    else {
	      
	      //else, IF there is NO panel group to the right, focus on the Device group that comes after in Devices list
	    	    
	      var midDeviceId = userAppModel.get('midPanelCollection').deviceId;
	      var focusedIndex = _.indexOf(Devices.models, (Devices.get(midDeviceId)));
	      
	      if(focusedIndex == Devices.models.length-1){
		  focusedIndex = -1;
	      }
		  
		newMidDeviceId = Devices.models[focusedIndex+1].get('id');
		newMidDeviceName = Devices.models[focusedIndex+1].get('name');
		
      	        //make sure that that panels group is not already rendered on the either side
		if (newMidDeviceId != userAppModel.get('leftPanelCollection').deviceId){
		
		userAppModel.set({'toClearPanels':{"deviceName":userAppModel.get('leftPanelCollection').deviceName,"deviceId":userAppModel.get('leftPanelCollection').deviceId}});
		userAppModel.set({'leftPanelCollection':{"deviceName":userAppModel.get('midPanelCollection').deviceName,"deviceId":userAppModel.get('midPanelCollection').deviceId}});
		userAppModel.set({'midPanelCollection':{"deviceName":newMidDeviceName,"deviceId":newMidDeviceId}});
		
		//First, set a new panel focus
		userAppModel.set({'panelFocus': userAppModel.get('supportedGraphs').length - 1 });
		
		//rapidly call another new_device_select event to update to focus
		userAppModel.set({'panelFromRight': -userAppModel.get('supportedGraphs').length});
		userAppModel.trigger('new_device_create');
		userAppModel.trigger('new_device_select');
		this.refocus();
		
		//for app persistence
		userAppModel.save();
		}
		else
		//if it is already rendered on the left side, skip a device in the list - by reattributing newMidDeviceId (&name)
		{
		  //to handle top of index situations...
		  if(focusedIndex == Devices.models.length-2){
		      focusedIndex = -2;
		  }
		  
		    newMidDeviceId = Devices.models[focusedIndex+2].get('id');
		    newMidDeviceName = Devices.models[focusedIndex+2].get('name');
		  
		userAppModel.set({'toClearPanels':{"deviceName":userAppModel.get('leftPanelCollection').deviceName,"deviceId":userAppModel.get('leftPanelCollection').deviceId}});
		userAppModel.set({'leftPanelCollection':{"deviceName":userAppModel.get('midPanelCollection').deviceName,"deviceId":userAppModel.get('midPanelCollection').deviceId}});
		userAppModel.set({'midPanelCollection':{"deviceName":newMidDeviceName,"deviceId":newMidDeviceId}});
		
		//First, set a new panel focus
		userAppModel.set({'panelFocus': userAppModel.get('supportedGraphs').length - 1 });
		
		//rapidly call another new_device_select event to update to focus
		userAppModel.set({'panelFromRight': -userAppModel.get('supportedGraphs').length});
		userAppModel.trigger('new_device_create');
		userAppModel.trigger('new_device_select');
		this.refocus();
		
		//for app persistence
		userAppModel.save();
		  
		}
	    }
	  } 
	},
	panel_back: function() {
	  
	  //First, if it is not the left-most panel, move the collection to the left
	  if(userAppModel.get('panelFocus') != userAppModel.get('supportedGraphs').length - 1 )
	  {
	    userAppModel.set({'panelFocus': userAppModel.get('panelFocus')+1 });
	    userAppModel.trigger('new_device_select', this.update_DOM_location, this);
	  }
	  //If it is the left-most panel, and there exists a panel-group to the left of it, move to the right-most panel of that group
	  else if(userAppModel.get('panelFocus') == userAppModel.get('supportedGraphs').length - 1 ){
	    
	    //else, IF the next panel is the previous (left) panel group, skip to it
	    if(userAppModel.get('leftPanelCollection').deviceName !== undefined && userAppModel.get('leftPanelCollection').deviceName != ""){
	      
	      //console.log('truth test ' + userAppModel.get('leftPanelCollection').deviceName !== undefined);
	      
	      //Next, tell the app of the new collection being assigned to the right
	      var passedDevice4newFocus= {};
	      passedDevice4newFocus.deviceName = userAppModel.get('leftPanelCollection').deviceName;
	      passedDevice4newFocus.deviceId = userAppModel.get('leftPanelCollection').deviceId;
	      
	      //calling this function will ultimately trigger a 'new_device_select' even
	      this.device_select_eventFire(passedDevice4newFocus);
	      
    	      //First, set a new panel focus
	      userAppModel.set({'panelFocus': 0 });
	      //rapidly call another new_device_select event to update to focus
	      userAppModel.trigger('new_device_select');
	    }
    
	    else {
	      	    //else, IF there is NO panel group to the left, focus on the Device group that comes before in Devices list
	    	    
	      var midDeviceId = userAppModel.get('midPanelCollection').deviceId;
	      
	      var focusedIndex = _.indexOf(Devices.models, (Devices.get(midDeviceId)));
	      
	      if(focusedIndex == 0){
		  focusedIndex = Devices.models.length;
	      }
		  
		newMidDeviceId = Devices.models[focusedIndex-1].get('id');
		newMidDeviceName = Devices.models[focusedIndex-1].get('name');
		
	      //make sure that that panels group is not already rendered on the right side
	      if (newMidDeviceId != userAppModel.get('rightPanelCollection').deviceId){
		
		userAppModel.set({'toClearPanels':{"deviceName":userAppModel.get('rightPanelCollection').deviceName,"deviceId":userAppModel.get('rightPanelCollection').deviceId}});
		userAppModel.set({'rightPanelCollection':{"deviceName":userAppModel.get('midPanelCollection').deviceName,"deviceId":userAppModel.get('midPanelCollection').deviceId}});
		userAppModel.set({'midPanelCollection':{"deviceName":newMidDeviceName,"deviceId":newMidDeviceId}});
		
		//First, set a new panel focus
		userAppModel.set({'panelFocus': 0 });
		
		//rapidly call another new_device_select event to update to focus
		userAppModel.trigger('new_device_create');
		userAppModel.trigger('new_device_select');
		this.refocus();
		
		//for app persistence
		userAppModel.save();
	    }
	    else
	    //if it is already rendered on the right side, skip a device in the list - by reattributing newMidDeviceId (&name)
	    {
	      //to handle top of index situations...
	      if(focusedIndex == 1){
		  focusedIndex = Devices.models.length + 1;
	      }
	      
	      	newMidDeviceId = Devices.models[focusedIndex-2].get('id');
		newMidDeviceName = Devices.models[focusedIndex-2].get('name');
	      
	      	userAppModel.set({'toClearPanels':{"deviceName":userAppModel.get('rightPanelCollection').deviceName,"deviceId":userAppModel.get('rightPanelCollection').deviceId}});
		userAppModel.set({'rightPanelCollection':{"deviceName":userAppModel.get('midPanelCollection').deviceName,"deviceId":userAppModel.get('midPanelCollection').deviceId}});
		userAppModel.set({'midPanelCollection':{"deviceName":newMidDeviceName,"deviceId":newMidDeviceId}});
		
		//First, set a new panel focus
		userAppModel.set({'panelFocus': 0 });
		
		//rapidly call another new_device_select event to update to focus
		userAppModel.trigger('new_device_create');
		userAppModel.trigger('new_device_select');
		this.refocus();
		
		//for app persistence
		userAppModel.save();
	      
	    }
	    }
	  } 
	},
	
	toggle_curtains_event: function() {
	    //Toggle the curtains
	    userAppModel.trigger('toggle_curtains_event');
	},
	
	device_center_event: function() {
	  
	  //console.log('device center function');
	  userAppModel.set({'sidebarView':'DeviceCenter'});
	  userAppModel.save();
	  
	  userAppModel.trigger('panels_clear');
	  
	  //clear the panels container
	  userAppModel.set({'toClearPanels': userAppModel.get('midPanelCollection')});
	  
	  newMidDeviceId = Devices.models[0].get('id');
	  newMidDeviceName = Devices.models[0].get('name');
	  userAppModel.set({'midPanelCollection': {"deviceName":newMidDeviceName, "deviceId":newMidDeviceId}});

	  userAppModel.trigger('new_device_create');
	  userAppModel.trigger('new_device_select');
	  this.refocus();

	  //userAppModel.trigger('custom_graph_panel_event');
	  this.render();
	  
	},
	
	custom_graph_event: function() {
	  
	  //clear the panels container
	  userAppModel.set({'toClearPanels': userAppModel.get('midPanelCollection')});
	  userAppModel.set({'midPanelCollection': {"deviceName":"", "deviceId":-1}});
	  userAppModel.trigger('panels_clear');
	  
	  
	  userAppModel.set({'sidebarView':'CustomGraph'});
	  userAppModel.save();
	  
	  userAppModel.trigger('custom_graph_panel_event');
	  this.render();
	  
	  //Which will...
	  //Render Custom Graph Panel (super-wide) in the PanelsContainer View
	  //Render Sidebar with new Custom Graph Options
	  
	  //APP LOGIC//
	  /*  Sequence of events
	  1. First, we will utilize the Panels-Clear event -- to clear up the DOM
	  2. Then, we will set userAppModel.set('{'midPanelCollection':{"deviceName":'Custom_Graph_Panel', "deviceId": -1}) 
	  3. Then, we reset the remaining panel collections to {}
	  4. Then we utilize the userAppModel.trigger('new_device_create'); 
	  --  The Panels Container View will respond to this event by checking (and finding) the Custom_Graph_Panel and bringing in the custom panel --
	  */
	},
	
	return_home_event: function() {
	  
	  //console.log('new debug yo');
	  
	  userAppModel.trigger('panels_clear');
	  userAppModel.set({'toClearPanels':{"deviceName":"","deviceId":-1}});
	  userAppModel.trigger('return_start_elements');
	  userAppModel.set({'sidebarView':'Home'});
	  userAppModel.save();
	  this.render();
	},
	
	insights_event: function() {
	  
	  
	  userAppModel.set({'toClearPanels': userAppModel.get('midPanelCollection')});
	  userAppModel.set({'midPanelCollection': {"deviceName":"", "deviceId":-1}});
	  userAppModel.trigger('panels_clear');
	  
	  
	  userAppModel.set({'sidebarView':'Insights'});
	  userAppModel.save();
	  userAppModel.trigger('insights_panel_event');
		$("#insightsView").css("visibility", "");
	  this.render();
	  
	},
	
	sidebar_reset: function() {
	  //console.log('sidebar reset function');
	  $('.CustomGraphButtons').css({'opacity': 0, 'z-index': -1});
	  $('.OnloadButtons').css({'opacity': 0, 'z-index': -1});
	  $('.ReturnHomeButtons').css({'opacity': 0, 'z-index': -1});
	  $('.DeviceCenterButtons').css({'opacity': 0, 'z-index': -1});
	  $('#accordion').css({'opacity': 0, 'z-index': -1});
	  $('#customGraphOptions').css({'opacity':0, 'z-index':-1});
	  $('#customGraphView').css({'opacity':0, 'z-index':-1});
	  
	}
  });
        
	
// END ------------------------------------------------ Sidebar_Views //  
