
// Panel_Views -------------------------------------------------- BEGIN //        
var devStatuses = [];
var statsViewHolder = {'empty':true};

//VIEW: panelsView
  var PanelsContainerView = Backbone.View.extend({

    el: $(".panelsContainer"),
    
    initialize: function() {
       
        //console.log('hello from panels container view');
        
        //Creates new panel collections for devices
	userAppModel.on('new_device_create',this.render,this);
        
        userAppModel.on('logged_out', this.render, this);
        
	//Return start panel to focus
	userAppModel.on('return_start_elements',this.build_starter_panel, this);
	
	//Create Custom Graph Panel
	userAppModel.on('custom_graph_panel_event', this.build_custom_panel, this);

	//Create Custom Graph Panel
	userAppModel.on('insights_panel_event', this.build_insights_panel, this);
	
	//refresh stats view
	statsViewHolder.empty = true;
	
        this.render();
        
    },
    
    render: function(){
        
        //console.log("rendering Panels, the middle panel group/collection is: " + userAppModel.get('midPanelCollection').deviceName);
        
        //First, let's build panels for the active device
	  //if the middle group says "starterPanel", we break from convention
        if (userAppModel.get('midPanelCollection').deviceName == "starterPanel") {
          //console.log("we have a starterPanel");
          this.add_one("StarterPanel");  // special call for a starter panel
	  
	} else if (userAppModel.get('midPanelCollection').deviceName == "customGraphPanel") {
          //We also break from convention with the custom graph panel
	  //
	  
	  //console.log("we have a starterPanel");
	  this.add_one("CustomGraphPanel");
	  
	}
        else {
		    //legacy notes,
		      //if the selected Active Device is not represented in a panel the DOM, add a new panel for it
		      //Notice above in the IF conditional, it looked at the midPanelCollection attribute of the userAppModel
	  
          passIndex = 0;
	  //on page load, if there is a midPanelCollection, render each of it's respective panels
          while(passIndex < userAppModel.get('supportedGraphs').length) {
            //Building a panel for each supported graph type
            this.add_one(passIndex);
            passIndex++;
          
          }        
          }

    },
        

    add_one: function(passedIndex_) {
          
          if ( passedIndex_ == "StarterPanel"){  // this checks if it's a starter panel
            //console.log('indeed we do! (have a starter Panel)');
            panelType_ = 'starterPanel';  //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)
	    
          } else if (passedIndex_ == "CustomGraphPanel") {
	    //console.log('indeed we do! (have a custom graph Panel)');
	    panelType_ = "customGraphPanel"; //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)
	  } else if (passedIndex_ == "InsightsPanel") {
	    //console.log('indeed we do! (have a insights Panel)');
	    panelType_ = "insightsPanel"; //This value 'panelType_' will be passed as a specific kind of panel to render (custom width and height properties in css)
	    
	  }
	  else {
	    // this means the panel will have a class attribute indicating the graph-type
	      panelType_ = userAppModel.get('supportedGraphs')[passedIndex_];  
            }
          //build a panel in the UI
          var panelView = new PanelView({panelType: panelType_,
                                          deviceName: userAppModel.get('midPanelCollection').deviceName,
                                          deviceId: userAppModel.get('midPanelCollection').deviceId});
	  //panelView.one_day(); //now, update its css (location) and render a graph on panel
          //console.log('rendered a panel');
    },
    
    build_custom_panel: function() {
      //console.log('hello');
      // Simultaneously, the sidebar view is 
	if (userAppModel.get('midPanelCollection').deviceName != "customGraphPanel") {  // If there is already this panelType in the view, it won't render another one  
	  // Clear the visual represenations of the panel views
	  userAppModel.trigger('panels_clear');
	  
	  // Reset the app's Panels Colletions values 
	  userAppModel.set({'midPanelCollection':{"deviceName":'customGraphPanel', "deviceId": -1}});
	  userAppModel.set({'leftPanelCollection':{}});
	  userAppModel.set({'rightPanelCollection':{}});
	  
	  // Add our special custom Graph Panel
	  this.add_one("CustomGraphPanel");  //special call for a starter panel
	}
    },
    
    build_insights_panel: function() {
      //console.log('hello');
      // Simultaneously, the sidebar view is 
	if (userAppModel.get('midPanelCollection').deviceName != "insightsPanel") {  // If there is already this panelType in the view, it won't render another one  
	  // Clear the visual represenations of the panel views
	  userAppModel.trigger('panels_clear');
	  
	  // Reset the app's Panels Colletions values 
	  userAppModel.set({'midPanelCollection':{"deviceName":'insightsPanel', "deviceId": -1}});
	  userAppModel.set({'leftPanelCollection':{}});
	  userAppModel.set({'rightPanelCollection':{}});
	  
	  // Add our special custom Graph Panel
	  this.add_one("InsightsPanel");  //special call for a starter panel
	}
    },
    
    build_starter_panel: function(){
      
            //First, let's build panels for the active device (which the default panel type is "starterPanel")
        if (userAppModel.get('midPanelCollection').deviceName != "starterPanel") {  // If there is already a starter panel in the view, it won't render another one
          //console.log("we need a starterPanel");
	  userAppModel.trigger('app_start');//to clear out old panels
	  //Move middle panels to the right

	  userAppModel.set({'midPanelCollection':{"deviceName":"starterPanel", "deviceId":-1}});
	  userAppModel.set({'leftPanelCollection':{}});
	  userAppModel.set({'rightPanelCollection':{}});
	  this.add_one("StarterPanel");  //special call for a starter panel

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
    
    defaults: {
      
        panelWidth: 0,  //retreived from css sheet upon panel's initialization
        deviceId: 0,
        deviceName: 'Example Device Name',
        panelType: "",  //This panel's graph/content type
	graphRange: "oneDay",
        device: [],  //temporary array holding object
        newPanel: false,  //will only be true in initialization
        
	customGraphObject: {}, //used to store custom graph object
	customGraphDataCounter: 0
    },
      
    //CREATE an individual panel (within Panel Collection)
    initialize: function(panelTypeNameId) { // this passed Object was constructed in the Panels Container view and will feed the panel's HTML template info
	
	//panels with this set to true will originate at a special 'left' css position
        this.newPanel = true;  
        
	//No old (residual) panels should survive a page refresh
	userAppModel.on('app_start', this.destroy_view, this); 
	
	//A Call to all panels: remove and delete
	userAppModel.on('panels_clear', this.destroy_view, this); 
	
	//rerender when new a device is selected
        userAppModel.on('new_device_select', this.update_DOM_location, this);
              
        this.device = panelTypeNameId;  // this "passed Object" was constructed in the Panels Container view and will feed the HTML template info
	/////////////////////////////
        this.panelType = this.device.panelType;
        this.deviceName = this.device.deviceName;
        this.deviceId = this.device.deviceId;
	this.graphRange = "oneDay";
    
	
	this.customGraphObject= {}; //used to store custom graph object
	this.customGraphDataCounter= 0;
        
        if (this.panelType == "starterPanel") {this.deviceId = -1;}  // 
        
        //fetch panel width from css stylesheet
        this.panelWidth = $('.panelAttributes').css('width');
        
        _.bindAll(this,"render");
	
	//Render el and append to the DOM
	$('.panelsContainer').append(this.render());
	  
        //console.log('right before appending a graph to panel');
	  

	
	
	//Next, instantiate graph view (by passing true as an argument) and then begin panel animation
	this.update_DOM_location(true); //now, update its css (location) and render a graph on panel
	
        
	this.$el.css({'opacity':1});
	
	
	//custom events  //Must manually bind to some DOM elements
	var functionScope = this;
	$('#'+this.deviceId+this.panelType+"three_days").bind('click', function(){ functionScope.three_days(); });
	$('#'+this.deviceId+this.panelType+"seven_days").bind('click', function(){ functionScope.seven_days(); });
	$('#'+this.deviceId+this.panelType+"one_day").bind('click', function(){ functionScope.one_day(); });

	    //$('#custom_one_day').bind('click',function(){functionScope.custom_graph_one_day()});
	    //$('#custom_three_days').bind('click',function(){functionScope.custom_graph_three_days()});
	    //$('#custom_seven_days').bind('click',function(){functionScope.custom_graph_seven_days()});
	
		//KEEP This 'this.newPanel = false;' at the end of the initialize function
        this.newPanel = false;  //indicate that it is no longer a new panel
    },

    events: {
         //If a panel is clicked (panel_clicked), then it will update DOM location -- but will not rerender graphs.  Just animate to new loc.
	 "click": "panel_clicked"
    },
    
    seven_days: function(){
      		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
		    var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 168);  //returns in UTC milliseconds
		    
		    //DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		    var blocksize_ = 30; //our statuses will be for 30 minute intervals
		    
		    var datatype_ = this.panelType;
		    var deviceId_ = this.deviceId;
		    var deviceName_ = this.deviceName;
		    var callbackEvent = 'sevendays';
		    
		    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			

			
			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
			});
		    
		    //Describing the series we need for the graph
		    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent);
    },
    
    three_days: function(){
      		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
		    var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 72);  //returns in UTC milliseconds
		    
		    //DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		    var blocksize_ = 30; //our statuses will be for 30 minute intervals
		    
		    var datatype_ = this.panelType;
		    var deviceId_ = this.deviceId;
		    var deviceName_ = this.deviceName;
		    var callbackEvent = 'threedays';
		    
		    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			
			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
			});
		    
		    //Describing the series we need for the graph
		    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent);
    },
    one_day: function(){
      		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
		    var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
		    
		    //DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		    var blocksize_ = 30; //our statuses will be for 30 minute intervals
		    
		    var datatype_ = this.panelType;
		    var deviceId_ = this.deviceId;
		    var deviceName_ = this.deviceName;
		    var callbackEvent = "oneday";
		    
		    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			
			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
			});
		    
		    //Describing the series we need for the graph
		    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent);

    },
    
    render: function(){
          
          //check if it's needing a starterTemplate
          if(this.device.panelType == 'starterPanel') {
              var panelContent = this.startTemplate(this.device);
            }
	  //or if it's a custom graph panel  
	  else if (this.device.panelType == "customGraphPanel"){
	    var panelContent = this.customGraphPanelTemplate(this.device);
	  }
	  else if (this.device.panelType == "insightsPanel"){
	    var panelContent = this.insightsPanelTemplate(this.device);
	    
	  }
          else
            {
              var panelContent = this.template(this.device);
            }
	  
          this.delegateEvents(this.events);
          
          this.$el.html(panelContent);
            //check if it's a starterTemplate
            
	  this.$el.buttonset();
  
          return this.$el;
          
        },
        
      destroy_view: function() {
        
		//console.log('PANEL BEING DESTROYED');
		
		this.undelegateEvents();
		
		//COMPLETELY UNBIND THE VIEW
		userAppModel.off(null, null, this);
				
		$(this.el).removeData().unbind(); //destroy View instance before fading animation begins
		
		var callbackContext = this; //to remove after animation completes
		
		this.$el.animate({'opacity':0},{ duration: 1800, queue: false, complete: function(){
	    
		    //Remove view from DOM
		    callbackContext.remove();  
		    Backbone.View.prototype.remove.call(callbackContext);
    
		} });
	    },
        
      panel_clicked: function() {
        //Using this view's given attributes ('this.__') we will refresh the app's state
          
          if(this.deviceId < 0){
	    //this should nix this behavior from non-traditional panels (such as starterPanel and customGraphPanel)
            return false;
          }
          
	  //reflect selected device to the whole app
	  var selectedDevice_ = {};
	  selectedDevice_.deviceName = this.deviceName;  // device's name for Displaying
	  selectedDevice_.deviceId =  this.deviceId; // device's id for identifying unique devices
            
          // find a new panelfocus value (which panel within a panel-group is front-and-center)
	  panelFocus_ = userAppModel.get('supportedGraphs').indexOf(this.panelType);
          
          //save it
          userAppModel.save({'panelFocus': panelFocus_});  
	  
          //tell the app to react
          userAppModel.set_device_focus(selectedDevice_);
          
        },
    
      all_devices_graph_render: function(from_optional, to_optional){
	
		    //DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    var to_ = 0; var from_ = 0;var blocksize_ = 0;
		    if (to_optional != undefined || from_optional != undefined){
			to_ = Math.floor( to_optional );
			from_ = Math.floor( from_optional );
			blocksize_ = Math.floor((to_ - from_) / (48 * 1000 * 60));
			
		    } else {
			 to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
			 from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			blocksize_ = 30; //our statuses will be for 30 minute intervals
		    }
		    

			var datatype_ = "All Devices E.C.";
			var callbackEvent = "AllDevices";
				
		    //Handle the success, rendering the graph
			successObject = new SuccessObjectClass(); var callbackContext = this;
			$(successObject).bind(callbackEvent, function(e, it){
			    var finalSeriesWithData = it.get_series();
			    //console.log('its really happenign right now!');
			    callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]['statuses'], true);
			});
			
						    ////console.log('its really happenign right now!');
			
			//Describing the series we need for the graph
			get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_}], callbackEvent);
      },
      
      device_panel_graph_render: function (from_optional, to_optional){
	
	    //HERE WE ARE ASSEMBLING OUR SERIES REQUEST ARGUMENTS
			    
		    //DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    var to_ = 0; var from_ = 0;var blocksize_ = 0;
		    if (to_optional != undefined || from_optional != undefined){
			to_ = Math.floor( to_optional );
			from_ = Math.floor( from_optional );
			blocksize_ = Math.floor((to_ - from_) / (48 * 1000 * 60));
			
		    } else {
			 to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
			 from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			blocksize_ = 30; //our statuses will be for 30 minute intervals
		    }
		    
		    var datatype_ = this.panelType;
		    var deviceId_ = this.deviceId;
		    var deviceName_ = this.deviceName;
		    var callbackEvent = "regularDevicePanel";
		    
		    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			
			//console.log("Ok, here are the GETS assembled");
			////console.debug(finalSeriesWithData);
			
			callbackContext.graph_render(finalSeriesWithData['seriesArray'][0]);
			});
		    
		    //Describing the series we need for the graph
		    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent);
		    
      },
    
      update_DOM_location: function(needGraph) {
          
		//console.log("from update_DOM_location, before function call " + this.newPanel + this.needGraph);
          
          this.$el.css({'position':'absolute'});  // separate this from rest - it is not circumstantial
          
	  
          //if it's a new panel, it will come from the left UNLESS the come from right flag is set to true
              if(this.newPanel){
	  
		if (userAppModel.get('panelFromRight') < 0) {
		  startingPosition = this.return_pixels_position('right') + "px";
		  userAppModel.set({'panelFromRight':userAppModel.get('panelFromRight')+1});
		} else {
		  startingPosition = this.return_pixels_position('left') + "px";
		}
		  
		  //console.log('i am a new panel ' + startingPosition);
		  this.$el.css({'width': this.panelWidth, 'right': startingPosition}); //'background-color':'#A0A0A0', 
              
	      }
              else {
		
		  //console.log('i am NOT a new panel');
		  currentRight = this.$el.css('right');
		  //console.log(this.deviceName + " css right attribute: " + this.$el.css('right'));
		  this.$el.css({ 'width': this.panelWidth, 'right':currentRight});
		  
		  
              
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
		}
	    else {
	  
	  
            panelPosition = this.return_pixels_position(this.returnCollectionLocation()) + "px";
            
	  //RENDER THIS PANEL'S GRAPH (if it needs one)
		//A true boolean is the signal used to graph_render on panels that are first entering the DOM
		if (needGraph == true && this.panelType != "starterPanel" ) {
		  
		  //custom graph panels get a special treatment
		  if (this.panelType == 'customGraphPanel'){
		    
		    this.all_devices_graph_render();
		    
		  }
		  
		  //custom graph panels get a special treatment
		  else if (this.panelType == 'insightsPanel'){
		    
		    var callbackEvent = "insights_render";
	    	    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			
			callbackContext.graph_render(finalSeriesWithData);
			});
		    //console.log('hello stats 123');
		    ////console.debug(statsViewHolder);
		    if(statsViewHolder.empty == true){
		    var statsDataView = new StatsDataView(successObject);
		    statsViewHolder.statView = statsDataView;
		    statsViewHolder.empty = false;
		    } else {
			statsViewHolder.statView.render(successObject);
		    }
		  
		  
		  }
		  else {
		  
		    //console.log('immediately before render of graph');
		    
		    this.device_panel_graph_render();		    
		  }
		    
		    this.$el.animate({'right': panelPosition}, { duration: 1700, queue: false});
		}
		else {
		  
		  
		    //or panel is animated immediately
		    this.$el.animate({'right': panelPosition}, { duration: 1700, queue: false});
		}
		
	  	//Apply JQUERY UI to new panel  
	  }
	},
	
      //Return panel location in pixels from right.  Based off of "left", "mid", or 'right' of panel's collection
     return_pixels_position: function(leftRightOrMid_) {
          
          var panelPosition = 0;
          
          var _panelWidth = parseInt(this.panelWidth, 10);
          //console.log('panelW: ' + _panelWidth);
          
        //now let's determine its relative pos. based off of the userAppModel's panel collections of mid, left, and right
        switch(leftRightOrMid_)
            {

            case "left":
              panelPosition = 160;
              panelPosition += (_panelWidth + 50) * userAppModel.get('supportedGraphs').length - userAppModel.get('panelFocus') * _panelWidth;
              panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);
              
              //Give each subsequent panel an incrementally higher amount of buffer space (because we're calculating from a fixed point)
              if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0)
              { panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType); }
              
              panelPosition = panelPosition.toFixed(0);
              
              
              //console.log(this.deviceName + 'left: ' + panelPosition); 
              return panelPosition;
              
              break;
            
            case "mid":
              
	      
              
              panelPosition =  150;
              panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);
              panelPosition -= userAppModel.get('panelFocus') * (_panelWidth + 50);
              if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0 ) {
                panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType);  //give a bit of spacing between panels in a collection
	      }


	      
	      //No decimals
              panelPosition = panelPosition.toFixed(0);
              
	      //IF PANEL FOCUS IS NOT 0, THIS WILL PUSH IT ACCROSS THE SIDEBAR GAP
		//DOES NOT APPLY TO PANEL WHICH IS "IN FOCUS"
	      if (userAppModel.get('panelFocus') != 0 && userAppModel.get('supportedGraphs').indexOf(this.panelType) < userAppModel.get('panelFocus') ){
		panelPosition -= 290;
	      }
	      
              //custom for starterPanel
              if( userAppModel.get('supportedGraphs').indexOf(this.panelType) == -1) {
                panelPosition = 155;
              }
              
              
              //console.log(this.deviceName + 'mid: ' + panelPosition); 
              return panelPosition;
          
              break;
            
          case "right":
              panelPosition = 0;
              panelPosition = -134;  // FIXED VARIANCE
              //panelPosition -= ; //sets the far right reference point according to number of supported graphs
              panelPosition -= (_panelWidth + 50) * userAppModel.get('supportedGraphs').length;  
              panelPosition -= userAppModel.get('panelFocus') * _panelWidth;  //adjusts to panel focus
              panelPosition += (userAppModel.get('supportedGraphs').indexOf(this.panelType) * _panelWidth);
              
              // SPACES PANELS APART, ACCORDING TO NUMBER OF SUPPORTED GRAPHS
              if (this.panelType != 'starterPanel' && userAppModel.get('supportedGraphs').indexOf(this.panelType) != 0)
              { panelPosition += 50 * userAppModel.get('supportedGraphs').indexOf(this.panelType); }
              
              
              // SPECIAL CASE: BECAUSE OF SIDEBAR SPACING, IF FOCUS != 0, make FIXED ADJUSTMENT
              if (userAppModel.get('panelFocus') != 0 ) {
                panelPosition += 280; // to give a slight effect of moving to the right
              
              } 
	      
	      //IF PANEL FOCUS IS NOT 0, THIS WILL MAKE UP FOR THE MID-PANELS BEING PUSHED ACCROSS THE SIDEBAR GAP
	      if (userAppModel.get('panelFocus') != 0){
		panelPosition -= 335;
	      }
	                    
              
              panelPosition = panelPosition.toFixed(0);
              
              
              //console.log(this.deviceName + 'right: ' + panelPosition); 
              return panelPosition;
              
              
              break;          
              }
          
        },
        
      
      returnCollectionLocation: function() {
          //get this panel's panel-group location by checking the userAppModel
          
          switch(this.deviceId)
            {
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
      graph_render: function(graphValues, customBool) {
	//console.log('data for graphing');
	////console.debug(graphValues);
	
	  //Boilerplate CHECK CODE
	  if(this.panelType != 'starterPanel') {  // starter panels don't render graphs
	      
		  //console.log('building a graph type ' + this.panelType );
		
		//RENDER GRAPH (Because) now we have our graphValues!!
		    //console.log ('graphValues: ' +  graphValues);
		  
		  //NOTE: the parse INT here is needed even though it doesn't look like it
		    var currentDeviceId = parseInt(userAppModel.get('midPanelCollection').deviceId);
		    
		    //to catch weird cases
		    if(customBool != undefined){
			var currentPanelType = 'customGraphPanel'
		    } else {
		    var currentPanelType = this.panelType;
		    }
		  
		  ////console.log('in this: ' + $('#' + currentDeviceId).find('.' + currentPanelType)[0] );
		  
		  //CLEAR THE OBJECT'S HTML for a new Graph
		  $($('.' + this.panelType).filter('#' + currentDeviceId + 'graph')[0]).html("");
		  
	      //RENDERING SPECIFIC GRAPH TYPES
                switch(currentPanelType)
		  {
		  case "insightsPanel":
		    
		    var callbackContext = this;
		    
		    $(function () {
			//Detect bar graph settings
			barBool = false; if (graphValues.graphType == 'bar'){ barBool = true; }
			
			var options = 	{
			    grid: { hoverable: true, clickable: true },
				bars: { show: barBool },
				xaxis:
					{
					//mode: 'time',    
					    
					tickFormatter: function(val) {
					
					return "Lag (min.)"  + '<br/>' + val * graphValues[0]['minInterval'];
					
					/* var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");*/
					}
					
					  },
			       yaxis: { }
			       };
			
			var d1 = [];
			for (var i = 0; i < graphValues.length - 1; i += 1){
					d1.push([graphValues[i]['delay'], graphValues[i]['r']]);
			}
			//console.log('hola with energy home arrays! ');
			////console.debug(d1);
	    
			var plotObject = $('#statsInsightsGraph');
			
			if(!customBool || customBool == undefined)
			//clear old html
			$(plotObject).html('');
			
			$.plot($(plotObject), [ {'data':d1, 'color': '#3BAB27'} ], options);
			
			function showTooltip(x, y, contents) {
				
				$('<div id="tooltip">' + contents + '</div>').css( {
				    position: 'absolute',
				    display: 'none',
				    top: y + 5,
				    left: x + 5,
				    border: '1px solid #fdd',
				    padding: '2px',
				    'z-index' : 10,
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
							"'r': "+ item.datapoint[1].toFixed(5)
							+ "<br>Delay of " + item.datapoint[0].toFixed(5) * graphValues[0].minInterval);
					}
				    }
				    else {
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
			barBool = false; if (graphValues.graphType == 'bar'){ barBool = true; }
			
			var options = 	{
			    grid: { hoverable: true, clickable: true },
				bars: { show: barBool },
				xaxis:
					{
					mode: 'time',    
					    
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
					
					  },
			       yaxis: { min: 0 }
			       };
			
			var d1 = [];
			for (var i = 0; i < graphValues.statuses.length - 1; i += 1){
					d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
			}
			//console.log('hola with energy home arrays! ');
			////console.debug(d1);
	    
			var plotObject = $('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0];
			
			if(!customBool)
			//clear old html
			$(plotObject).html('');
			
			$.plot($(plotObject), [ {'data':d1, 'color': '#3BAB27'} ], options);
			
			function showTooltip(x, y, contents) {
				
				$('<div id="tooltip">' + contents + '</div>').css( {
				    position: 'absolute',
				    display: 'none',
				    top: y + 5,
				    left: x + 5,
				    border: '1px solid #fdd',
				    padding: '2px',
				    'z-index' : 10,
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
							callbackContext.deviceName +", " + userAppModel.get('supportedUnitTypes')[currentPanelType] + ": "+ item.datapoint[1].toFixed(5)
							+ "<br>" + d.toTimeString());
					}
				    }
				    else {
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
			for (var i = 0; i < graphValues.statuses.length - 1; i += 1){
					d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
			}
			//console.log('hola with energy home arrays! ');
			////console.debug(d1);
	    
			//Detect bar graph settings
			barBool = false; if (graphValues.graphType == 'bar'){ barBool = true; }
			
			$.plot($($('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0]), [ {'data':d1, 'color': '#3BAB27'} ],
			       {
				bars: { show: barBool },
				xaxis: {
					mode: 'time',    
					    
					    
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
			       },
			       yaxis: { min: 0 }
			       }
			       );
		    });
		    break;
		  
		  case "energyConsumption":
		    		    
		    
		    
		    //Update yAXIS label
			$($('.' + this.panelType).filter('#' + currentDeviceId + 'yLabel')[0]).html(' kWh');
		    
			var callbackContext = this;
			//callbackContext['currentPanelType'] = currentPanelType;
		    
		      $(function () {
			
			var d1 = [];
			for (var i = 0; i < graphValues.statuses.length - 1; i += 1){
					d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
			}
			//console.log('hola with energy home arrays! ');
			////console.debug(d1);
	    
			//Detect bar graph settings
			barBool = false; if (graphValues.graphType == 'bar'){ barBool = true; }
			
			//clear old html
			$($('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0]).html('');
			
			//get a blocksize
			var blocksize = 0;
			blocksize = graphValues['blocksize'];
			
			//for refining graph and canceling zoom
			var latestSelection = {'from':-1, 'to':-1};
		    
			var plotObject = $('.' + currentPanelType).filter('#' + currentDeviceId + 'graph')[0];
		    
			var options = {
				  grid: { hoverable: true, clickable: true },
				  yaxis: { min: 0 },
				  //lines: { show: false, fill: true, steps: false },
				  bars: {show:barBool, barWidth: 60*1000*blocksize},
				  selection: { mode: "x" },
				  xaxis: {
				
					mode: 'time',    
					    
					    
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
				  }
			      };
		    
			$(plotObject).bind("plotselected", function (event, ranges) {
			    //$("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));
			    latestSelection.from = ranges.xaxis.from.toFixed(1);
			    latestSelection.to = ranges.xaxis.to.toFixed(1);
			    
				plot = $.plot(plotObject, [ {'data':d1, 'color': '#3BAB27'} ],
					      $.extend(true, {}, options, {
						  xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
					      }));
			});
			$(plotObject).bind("plotunselected", function (event) {
			    $("#selection").text("");
			});
			
			var plot =  $.plot($(plotObject), [ {'data':d1, 'color': '#3BAB27'} ], options);
			
			function showTooltip(x, y, contents) {
				
				$('<div id="tooltip">' + contents + '</div>').css( {
				    position: 'absolute',
				    display: 'none',
				    top: y + 5,
				    left: x + 5,
				    border: '1px solid #fdd',
				    padding: '2px',
				    'z-index' : 10,
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
					    
					    ////console.log('special item debug');
					    //////console.debug(item);
					    
					    $("#tooltip").remove();
					    var x = item.datapoint[0].toFixed(2);
					    var y = item.datapoint[1].toFixed(2);
					    var d = new Date(item.datapoint[0]);
					    showTooltip(item.pageX, item.pageY,
							callbackContext.deviceName +", " + userAppModel.get('supportedUnitTypes')[currentPanelType] + ": "+ item.datapoint[1].toFixed(5)
							+ "<br>" + d.toTimeString());
					}
				    }
				    else {
					$("#tooltip").remove();
					previousPoint = null;            
				    }   
			    });
			    

			callbackContext.$el.find('#refresh' + callbackContext.deviceId + callbackContext.panelType).click(function () {
			    //console.log('hello refresh clicked on ' + callbackContext.deviceId);
			    //console.log(latestSelection.from);
			    if(latestSelection.from != -1){
				$(plotObject).unbind("plothover");
			    callbackContext.device_panel_graph_render(latestSelection.from, latestSelection.to);
			    
			    } else {
				$(plotObject).unbind("plothover");
			    callbackContext.device_panel_graph_render();}
			});
			
			callbackContext.$el.find('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog({
				autoOpen: false,
				show: "fade",
				hide: "fade",
				modal: true
			});
			
			$( "#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker('disable');
			$( "#TOdate" + callbackContext.deviceId + callbackContext.panelType).datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
			
			callbackContext.$el.find('#date_selector' + callbackContext.deviceId + callbackContext.panelType).click(function () {
			    //console.log('clicked Date');
			    $('.ui-widget-overlay').live('click', function() {
				    $('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog( "close" );
			    });
			    
			    $('.date_dialog').css({'opacity':1});
			    
			    $('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog( "open" );
			    
			    $("#ui-datepicker-div").hide();
			    $("#FROMdate" + callbackContext.deviceId + callbackContext.panelType).blur();
			    $( "#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker('enable');
			    $( "#FROMdate" + callbackContext.deviceId + callbackContext.panelType).datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
			    
			    //jQuery('#ui-datepicker-div').hide();
				return false;
			});
			
			////console.log('bluemonkey');
			//////console.debug($('#date_submit' + callbackContext.deviceId + callbackContext.panelType));
			
			 $('#date_submit' + callbackContext.deviceId + callbackContext.panelType).click(function () {   
			    var thisfrom = $('#FROMdate' + callbackContext.deviceId + callbackContext.panelType).val();
			    var thisto = $('#TOdate' + callbackContext.deviceId + callbackContext.panelType).val();
			    if(thisfrom != "" && thisto != ""){
				var dFrom = new Date(thisfrom);
				var dTo = new Date(thisto);
				
			    callbackContext.device_panel_graph_render(dFrom.getTime(), dTo.getTime());
			    $('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog( "close" );
			    } else {callbackContext.device_panel_graph_render();
			    $('#date_dialog' + callbackContext.deviceId + callbackContext.panelType).dialog( "close" );}
			});
			      
			});
		    break;
		  
		  case "customGraphPanel":
		    
		    
		    //console.log('trying to render custom graph');
		    
		    //Clear choices and render RangeOptions buttons each time customGraph button is reclicked
		    $('#customGraphOptions').html('');  // These exist in the sidebar
			
		    var GraphDataType_ = "energyConsumption"; //userAppModel.get('supportedGraphs')[graphTypeIndex];
		    
		    var toggle_graph = function(graphName){
			//console.log('toggle graph name: ' + graphName);
			$("#customGraphPanelInner > div").css({'z-index':-1});
			$("#customGraphOptions > div").css({'border':'none'});
			$('#customGraph-'+graphName).css({'z-index':10});
			
		      }
		    
		    $('#customGraphOptions').append(this.customGraphOptionsTemplate({"dataType":GraphDataType_,"unitType":userAppModel.get('supportedUnitTypes')[GraphDataType_]}));
		    
		    //setOurValues(graphValues);
		    var milliUTCtime_ = time_parser("DATE", "NOW", true);
		    
		      //ourDataType
		      var datasets = {};
		      
		      var datasets = graphValues;
		      
		      $("#customGraphOptions-energyConsumption").html('');  //customGraphOptions
		      
		      //for refining graph and canceling zoom
		      var latestSelection = {'from':-1, 'to':-1};
		      
		      //get a blocksize
		      var i = 0; var blocksize = 0;
		      $.each(datasets, function(key, val) {
			  val.color = i;
			  if(i == 0){blocksize = val.blocksize;}
			  ++i;
		      });
		      
		      //console.log('datasets are here');
		      ////console.debug(datasets);
		      
		      //Bring a specific Custom Graph to the front, toggling all others
		      var toggle_graph = function(graphName){
			//console.log('toggle graph name: ' + graphName);
			$("#customGraphPanelInner > div").css({'z-index':-1});
			$("#customGraphOptions > div").css({'border':'none'});
			$('#customGraph-'+graphName).css({'z-index':10});
			
		      }
		      
		$( "#datepickerTO" ).datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
		$( "#datepickerFROM" ).datepicker( {'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
		      
		    topGraphName = "energyConsumption";
		    toggle_graph(topGraphName);
		    
		    var options = {
				  grid: { hoverable: true, clickable: true },
				  legend: {
				    show: true,
				    
				    labelFormatter: function(label, series) {
					
					return('<b>'+series.name+'</b>');
					}
				    },
				  yaxis: { min: 0 },
				  //lines: { show: false, fill: true, steps: false },
				  bars: {show:true, barWidth: 60*1000*blocksize},
				  selection: { mode: "x" },
				  xaxis: {
				
					mode: 'time',    
					    
					    
					tickFormatter: function(val) {
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
			  
			  
			  var plotObject = "#customGraph-"+ GraphDataType_;
			  //a quick clear of the pre-existing graph (if there is one)
			  $(plotObject).html('');
			  
			$(plotObject).bind("plotselected", function (event, ranges) {
			    //$("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));
			    latestSelection.from = ranges.xaxis.from.toFixed(1);
			    latestSelection.to = ranges.xaxis.to.toFixed(1);
			    
				plot = $.plot(plotObject, data,
					      $.extend(true, {}, options, {
						  xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
					      }));
			});
			$(plotObject).bind("plotunselected", function (event) {
			    $("#selection").text("");
			});
			
			var plot =  $.plot($(plotObject), data, options);
			
			function showTooltip(x, y, contents) {
				
				$('<div id="tooltip">' + contents + '</div>').css( {
				    position: 'absolute',
				    display: 'none',
				    top: y + 5,
				    left: x + 5,
				    border: '1px solid #fdd',
				    padding: '2px',
				    'z-index' : 10,
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
							item.series.name +", " + userAppModel.get('supportedUnitTypes').energyConsumption + ": "+ item.datapoint[1].toFixed(5)
							+ "<br>" + d.toTimeString());
					}
				    }
				    else {
					$("#tooltip").remove();
					previousPoint = null;            
				    }
				    
				    
			    });   
					   
			
			    $('#all-devices-date-dialog').dialog({
				    autoOpen: false,
				    show: "fade",
				    hide: "fade",
				    modal: true
			    });
			
			$( "#datepickerFROM").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});  
			$("#datepickerTO").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
			
			$('#all_devices_date_selector').click(function(){
			  	
				//console.log('clicked Date');
				$('.ui-widget-overlay').live('click', function() {
					$('#all-devices-date-dialog').dialog( "close" );
				});
				
				$('#all-devices-date-dialog').dialog( "open" );
				$('.date_dialog').css({'opacity':1});
				

			});
			
			$("#clearSelection").click(function () {
			    plot =  $.plot($(plotObject), data, options);
			});
						
			$("#refresh").click(function () {
			    if(latestSelection.from != -1){
				$("#customGraph-"+ GraphDataType_).unbind("plothover");
			    callbackContext.all_devices_graph_render(latestSelection.from, latestSelection.to);
			    
			    } else {$("#customGraph-"+ GraphDataType_).unbind("plothover");
			    callbackContext.all_devices_graph_render();}
			});
			
			
			$("#submitDates").click(function () {
			    var thisfrom = $('#datepickerFROM').val();
			    var thisto = $('#datepickerTO').val();
			    if(thisfrom != "" && thisto != ""){
				var dFrom = new Date(thisfrom);
				var dTo = new Date(thisto);
				
			    callbackContext.all_devices_graph_render(dFrom.getTime(), dTo.getTime());
			    $('#all-devices-date-dialog').dialog( "close" );
			    } else {callbackContext.all_devices_graph_render();
			    $('#all-devices-date-dialog').dialog( "close" );}
			});

		      }
		  
		    		    
		      // insert checkboxes
		      var choiceContainer = $("#customGraphOptions-energyConsumption");  //customGraphOptions
		      
		      $.each(datasets, function(key, val) {
			  choiceContainer.append('<br/><input type="checkbox" name="' + key +
						 '" checked="checked" id="id' + key + '">' +
						 '<label for="id' + key + '">'
						  + val.label + '</label>');
		      });
		      choiceContainer.find("input").click(plotAccordingToChoices);
			    var callbackContext = this;
		  
		      plotAccordingToChoices();
		      
		      
	      break;

		  }
	    }
	  }
	  
      });
    // Panel_Views --------------------------------------------------  END //        




