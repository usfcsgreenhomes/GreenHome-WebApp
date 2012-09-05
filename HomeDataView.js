// StatusView -------------------------------------------------- BEGIN // 

  //VIEW: Home Data View
  var HomeDataView = Backbone.View.extend({
   
   el: $("#homeDataView"),
    
    events: {
	"click #battery-controls-box":"view_battery_elements",
	"click #home-controls-box":"view_home_elements",
	"click #battery_one_day":"battery_one_day",
	"click #battery_three_days":"battery_three_days",
	"click #battery_seven_days":"battery_seven_days"
	
    },
    

    initialize: function() {
        
	//TO CONTROL WHICH GRAPH/CONTROLS ARE IN FOCUS
	this.viewState = "battery";
	
	//So that the (Get-intensive) home 24 hr graph only loads when the sub panel is clicked.
	this.homeGraphFirstLoad = true;
	
        this.batteryCharging = "notsure";
        
        this.houseEnergyConsumed = 0;

        //when the devices finish loading, get battery statuses
	userAppModel.on('devices_ready_event', this.render, this);
	
	userAppModel.on( "change:sidebarView", this.checkSidebar, this);
        
        userAppModel.on('logged_out', this.reboot, this);  
        
	if (userAppModel.valid_cookie()  ){
	    this.render();
	}
    },
    
    render: function(){
        
     //FIRST, REVEAL THE UI
	
	//HIDE THE COVER IMAGE
	$('#bot_widgets_cover').css({'z-index':-1});
	
	//SHOW BATTERY AS 'SELECTED'
        this.view_home_elements();
	
     //NEXT, CALCULATE BASIC CONTROLS and GRAPHS
      
        //console.log('battery hello');
        jsonDATA_stat = command_center('get_bat_statuses', "no Params");
        
        var callbackContext = this;
		
		jsonDATA_stat.success(function (dataObject) {       //accessing callback
				
		  if (!dataObject.success == true) {      // **** dblcheck error msg
		      alert(dataObject.errorMsg);        //**** event should be bound to errorView
		  }
		  else if (dataObject.success == true) {
		    //console.log('battery hello debug');
                    //////console.debugdataObject);
		    if(dataObject.statuses[0].isCharging){
			$('#chargingBool').html("Now charging.")
		    } else
		    { $('#chargingBool').html("Not charging.") }
                    //callbackContext.add_message("battery is charging: " + dataObject.statuses[0].isCharging);
			if (parseInt(dataObject.statuses[0].timestamp) > time_parser("DATE","NOW", false)  - 1814400000){
			    var chargePerc = parseInt(dataObject.statuses[0].percentage);
			    $('#chargingPercentage').html(parseInt(dataObject.statuses[0].percentage));
			    
			}
			else {
			    var chargePerc = 0;
			    $('#chargingPercentage').html(" N/A ");    
			}
		    
		    
		    $(".meter > span").each(function() {
				$(this)
					.data("newWidth", chargePerc + "%")
					.width(0)
					.animate({
						width: $(this).data("newWidth")
					}, 1200);
			});
		    
		    graphValues = [];
		    
		    var innerIndex = 0;
		      while (innerIndex < dataObject.statuses.length) {
			  
			  //we walk from the end of the dataObject toward the beginning, as the latest timestamps are nearest to the front
			
			  var fetchIndex = (dataObject.statuses.length - 1 ) - innerIndex;
			
			  //adding a device for each provided in GET requested JSONP object
			  bulk_stuff = $.extend(dataObject.statuses[fetchIndex], fetchIndex); //adding device id to the status data
			  
			  //add this status to graphValues
			  graphValues.push(bulk_stuff);

			  innerIndex++;   
		      }
		    //console.log('about to render battery graph');
		    //////console.debuggraphValues);
		    callbackContext.render_battery_graph(graphValues);
		    
		    //callbackContext.render_meter(dataObject.statuses[0].percentage);
                  }
                  });
        
		        
	    //to get one, 24 hour 'total energy consumed' value
	    for(i = 0; i < Devices.length; i++) {
            
            //console.log('energy hello');
		      //use 'count' attribute from 'rangeOptions' to calculate 'from' and 'to'
			  var count = 1440 * 60000; //one day in milliseconds
			  var milliUTC = new Date().getTime();
			  var to = milliUTC;
			  var from = new Date(parseInt(milliUTC - (count))).getTime();
			
			////console.log('milli time (to): ' + milliUTC + " count: " + count + ", from" + from + " this.deviceId " + currentDeviceId);
			  
            
            jsonDATA_stat = command_center('get_energy_statuses', {'blocksize':count, 'deviceId':Devices.at(i).get('id'), 'from':from, 'to':to});
            
            var callbackContext = this;
		var devEnCount = 0;
		var houseEnergy = 0;
		  jsonDATA_stat.success(function (dataObject) {       //accessing callback    
				
		  if (!dataObject.success == true) {      // **** dblcheck error msg
		      alert(dataObject.errorMsg);        //**** event should be bound to errorView
		  }
		  else if (dataObject.success == true) {
					
					houseEnergy += dataObject.energyConsumptions[0].energyConsumed;
				    
				    devEnCount++;
				    
					if(devEnCount == Devices.length -1){
					    
					    $('#totalEnergySpec').html(houseEnergy);
					
					}
                  }
                  });                                                      
        }
        // Check state of D1, D2 elements to determine checked or unchecked  
        },
	
	hide_view: function() {
	    $('#homeDataView > div').css({'z-index': -2, 'opacity': 0});
	    
	},
        
	show_view: function() {
	    $('#homeDataView > div').css({'z-index': 1, 'opacity': 1});
	},
	
	checkSidebar: function() {
	    if(userAppModel.get('sidebarView') == "Insights"){
	    this.hide_view();
	    } else {
	    this.show_view();
	    }
	},
	
	
	
	view_battery_elements: function() {
	  this.viewState = 'battery';
	  //console.log('battery clicked');
	//push all graphs to hidden state, and controls to non-selected
	  this.elements_reset();
	  
	  //re-allocate highlighted class
	  $('#battery-controls-box').addClass('selected-controls');
	
	  $('#battery-controls-alert').css({'opacity':1, 'z-index':10});
	
	  $('#home-controls-box').addClass('unselected-controls');
	    
	  //bring back the graph needed
	  $('#battery-graph').css({'z-index':10,'opacity':1});
	    
	},
	
	view_home_elements: function() {
	    
	//Render graph if it's the first time clicked -- or if the html still gives the Requesting statuses message
	if (this.homeGraphFirstLoad == true || $('#home-graph').html().indexOf("Request") != -1 ){
	    this.homeGraphFirstLoad = false;
	    
	    //Describing our Home Energy Consumption desired series-set
	        
		//DEFINE THE RANGE, DATATYPE AND FIDELITY OF DEFAULT PANEL GRAPH
		    
		    var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds,  true indicates we want to support sync-time (cache-friendly)  
		    var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
		    
		    //DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
		    var blocksize_ = 30; //our statuses will be for 30 minute intervals
		    var callbackEvent = "houseRecallSuccess";
		    var datatype_ = "houseEnergy";
		    
		    //Handle the success, rendering the graph
		    successObject = new SuccessObjectClass(); var callbackContext = this;
		    $(successObject).bind(callbackEvent, function(e, it){
			var finalSeriesWithData = it.get_series();
			
			callbackContext.graph_home_energy_render(finalSeriesWithData['seriesArray'][0]);
			
			});
		    
		    //Describing the series we need for the graph
		    get_assembler(successObject, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_}], callbackEvent);
	    
	}    
	    
	  this.viewState = 'home';
	  //console.log('home clicked');
    	//push all graphs to hidden state, and controls to non-selected
	  this.elements_reset();
	  
	  //re-allocate highlight class
	  $('#home-controls-box').addClass('selected-controls');
	  
	  $('#home-controls-alert').css({'opacity':1, 'z-index':10});
	  
	  $('#battery-controls-box').addClass('unselected-controls');
	  
	  //bring back the graph needed
	  $('#home-graph').css({'z-index':10,'opacity':1});
	    
	},
	
	/* Currently Battery API doesn't support necessary fields  :<  */
	battery_one_day: function() {
	    
	},
	
	battery_three_days: function() {
	    
	},
	
	battery_seven_days: function() {
	    
	},
	
	render_battery_graph: function(graphValues){
	  //Update yAXIS label 
	    $(function () {
    		var d1 = [];
		

    		for (var i = 0; i < graphValues.length - 1; i += 1) {
    		////console.log ('So its rendering here graphValues: ' + i + " : " + graphValues);	
    		////console.log(graphValues[i].timestamp);
		
		d1.push([graphValues[i].timestamp, graphValues[i].percentage]);
		
		}
		
		//MAKE SURE THAT THE LATEST BATTERY STATUSES ARE RECENT (within a week)
		var milliUTC = new Date().getTime();
		
		////console.log('hello ' +d1[0][0]);
		////console.log('hello2 ' + parseInt(milliUTC - 604800000));
		
		if(d1[0][0] < parseInt(milliUTC - 604800000)){
		    $("#battery-graph").html('<br /> The latest statuses are over a week old.');
		}
		else {
		//////console.debugd1);
	        //clear old html
    		$("#battery-graph").html('');
		
		//plot graph using time mode
		$.plot($('#battery-graph'), [ {'data':d1, 'color': '#3BAB27'} ],
		           {
			    grid:       
				{
				    
				    borderColor: '#D0D0D0'
				},
			    xaxis: 
    				{
				    //bars: { show: true },
				    mode: 'time',
				    show: true,
					
					color: '#FFFFFF',
					tickColor: '#B0B0B0',
					
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
					
				},
					
				       yaxis: {
					show: true,
					
				    
					    color: '#FFFFFF',
					tickColor: '#B0B0B0'
				       } 
				}
			   );
		}
    	    });  
	},
	
	graph_home_energy_render: function(graphValues) {
	    
	    //console.log('hola with energy home values! ');
	    ////console.debug(graphValues);
	    $(function () {
	    var d1 = [];
	    for (var i = 0; i < graphValues.statuses.length - 1; i += 1){
			    d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
	    }
	    //console.log('hola with energy home arrays! ');
	    ////console.debug(d1);
	    
		//Detect bar graph settings
		barBool = false; if (graphValues.graphType == 'bar'){ barBool = true; }
		
		//plot graph using time mode
		$.plot($('#home-graph'), [ {'data':d1, 'color': '#3BAB27'} ],
		           {
			    grid:       
				{
				    
				    borderColor: '#D0D0D0'
				},
				
			    bars: { show: barBool },
			    xaxis: 
    				{
				    
				    mode: 'time',
				    show: true,
					
					color: '#FFFFFF',
					tickColor: '#B0B0B0',
					
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
					
				},
					
				       yaxis: {
					show: true,
					
				    
					    color: '#FFFFFF',
					tickColor: '#B0B0B0'
				       }
				 
			   }

			   );
	    });
	    
	},
	
	//Returns all graphs to default or hidden states
	elements_reset: function(){	
	    $('#battery-controls-box').removeClass('selected-controls');
	    $('#home-controls-box').removeClass('selected-controls');

	    $('#battery-controls-box').removeClass('unselected-controls');
	    $('#home-controls-box').removeClass('unselected-controls');
	    
	    $('#battery-controls-alert').css({'opacity':0, 'z-index':-1});
	    $('#home-controls-alert').css({'opacity':0, 'z-index':-1});
	    
	    $('#battery-graph').css({'z-index':-1,'opacity':0});
	    $('#home-graph').css({'z-index':-1,'opacity':0});
	    
	},
	
	//Returns all elements to hidden states
	reboot: function() {
	    
	    $('#bot_widgets_cover').css({'z-index':3});
	    
	    //this.$el.html('');
	  
	},
	
	render_meter: function(pct) {
	
	this.$el.append(this.battery_template());
	   $(".meter > span").each(function() {
				$(this)
					.data("newWidth", pct + '%')
					.width(0)
					.animate({
						width: $(this).data("newWidth")
					}, 1200);
			});
	
	}
	
    
  });



// END ---------------------------------------------------- StatusView // 