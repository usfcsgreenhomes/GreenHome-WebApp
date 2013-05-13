// StatsView -------------------------------------------------- BEGIN // 

  //VIEW: graphView
  var StatsDataView = Backbone.View.extend({
   
   el: $("#statsDataView"),
    
    events: {
        "click #resubmitCrossCor" : "cross_correlation_event",
	"click #resubmitAutoCor" : "auto_correlation_event",
	"click #cross-correlation-box":"focus_crossCor_elements",
	"click #auto-correlation-box":"focus_autoCor_elements"
    },
    
    initialize: function(successObject) {
        //for rendering graphs in the panel view
        this.successObjectCallback = successObject;
	
	userAppModel.on( "change:sidebarView", this.render, this);
        
        userAppModel.on('logged_out', this.reboot, this);
        
        var callbackContext= this;
        //bind to changes in DOM
	//initial Range dates for correlation
	
	//Setting Defaults asking for 1 day of 30 min statuses
	    var todaydate = new Date(); 
	    var to_ = new Date(todaydate.toDateString()); //to 12:00 am of this day
	    //set 60 days prior
	    var from_ = new Date(to_.getTime() - 86400000);
	    
	this.crossCorRange = {'to':to_.getTime(),'from':from_.getTime()};
	this.autoCorRange = {'to':to_.getTime(),'from':from_.getTime()};
	
	this.blocksize_generate = function() {
	    return parseInt((this.crossCorRange.to - this.crossCorRange.from)/(48*60000));
	}
	
	this.auto_blocksize_generate = function() {
	    return parseInt((this.autoCorRange.to - this.autoCorRange.from)/(48*60000));
	}
	
	this.currentGraphType = "";
	
	this.crossCorLag = this.blocksize_generate();
	this.autoCorLag = this.auto_blocksize_generate();
	
        $('#statsDevice').change( function selectReact(){
            callbackContext.update_stats_device();
	    callbackContext.refresh_sidebar_stats();
            callbackContext.render();
        });
	
        $('#cross_period_select').change( function selectReact(){
            			//cross-custom-range-display
				$("#cross-custom-range-display").html('');
				
	    switch($('#cross_period_select :selected').attr("range"))
		{ //all times are from midnight the day before
		    case "24hours":
			//asking for 2 months worth of hourly statuses
			var todaydate = new Date(); 
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 86400000).getTime();
			callbackContext.crossCorRange = {'to':to_,'from':from_};
			
				
		    break;
	    	    case "7days":
			var todaydate = new Date();  
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 604800000).getTime();
			callbackContext.crossCorRange = {'to':to_,'from':from_};

		    break;
		    case "30days":
			//1 months range
			var todaydate = new Date();  
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 2592000000).getTime();
			callbackContext.crossCorRange = {'to':to_,'from':from_};
		    break;
		    case "custom":
			$('#date_selector_cross').click();
		    break;
		}
	    
	    //cross-suggested-blocksize
	    var tempdatefrom = new Date(callbackContext.crossCorRange.from);
	    var tempdateto = new Date(callbackContext.crossCorRange.to);
	    
	    //refresh values
	    //update blocksize
	    callbackContext.crossCorLag = callbackContext.blocksize_generate();
	    
	    //cross-custom-range-display
	    $("#cross-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
	    $("#cross-suggested-blocksize").val(callbackContext.blocksize_generate());
	    
	    //console.log('from is now : ' + callbackContext.crossCorRange.from);
	});


    //for auto-correlation
        $('#auto_period_select').change( function selectReact(){
            			//auto-custom-range-display
				$("#auto-custom-range-display").html('');
				
	    switch($('#auto_period_select :selected').attr("range"))
		{ //all times are from midnight the day before
		    case "24hours":
			//asking for 2 months worth of hourly statuses
			var todaydate = new Date(); 
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 86400000).getTime();
			callbackContext.autoCorRange = {'to':to_,'from':from_};
			
				
		    break;
	    	    case "7days":
			var todaydate = new Date();  
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 604800000).getTime();
			callbackContext.autoCorRange = {'to':to_,'from':from_};

		    break;
		    case "30days":
			//1 months range
			var todaydate = new Date();  
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_.valueOf() - 2592000000).getTime();
			callbackContext.autoCorRange = {'to':to_,'from':from_};
		    break;
		    case "custom":
			$('#date_selector_auto').click();
		    break;
		}
	    
	    //auto-suggested-blocksize
	    var tempdatefrom = new Date(callbackContext.autoCorRange.from);
	    var tempdateto = new Date(callbackContext.autoCorRange.to);
	    
	    //refresh values
	    //update blocksize
	    callbackContext.autoCorLag = callbackContext.auto_blocksize_generate();
	    
	    //auto-custom-range-display
	    $("#auto-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
	    $("#auto-suggested-blocksize").val(callbackContext.auto_blocksize_generate());
	    
	    //console.log('from is now : ' + callbackContext.autoCorRange.from);

        });
	
	
	    //for rendering compared series
	this.comparedSeriesCache = {'device1Name':'','device1series':'','device2Name':'','device2series':''};
	
	//Enable auto correlation UI with JQuery enhancements
	this.build_widget_ui();
	
        this.render();
        
    },
    
    render: function(successObject){
	
        //Pull primary device info from DOM
        this.update_stats_device();
        
        //Build select dropdown
        var DeviceOptions =""; var DeviceCompareOptions =""; var selectedModelIndex = 0; var compareIndex;
        //console.log('rerendering stats view');
        //Sidebar Device Select
	
	var sortedDevicesMap = {}; var poweredCount = 0; var notPoweredCount = Devices.length-1;
	
	    //Sort devices based on PowerDraw boolean (so that non-powered devices won't appear at top of list)
	    for(iSort=0; iSort < Devices.length; iSort++){
		if(Devices.models[iSort].attributes.currentStatus.powerDraw != 0){
		    sortedDevicesMap[poweredCount] = iSort;
		    poweredCount++;
		    }
		else {
		    sortedDevicesMap[notPoweredCount] = iSort;
		    notPoweredCount--;
		}
	    }
	
        for(iDev=0; iDev < Devices.length; iDev++){
            //check to see if device has values for energy within first 15 statuses (if not, it will be excluded)
	    
	    
                if(userAppModel.get('statsDeviceID') == 'default' && iDev == 0) {
                    DeviceOptions = "<option selected='selected' " + "description='" + Devices.models[sortedDevicesMap[iDev]].get('id') + "' descriptionname='" + Devices.models[sortedDevicesMap[iDev]].get('name') + "'>"+Devices.models[sortedDevicesMap[iDev]].get('name')+"</option>";
                    selectedModelIndex = iDev;
                    continue;
                } else if (Devices.models[sortedDevicesMap[iDev]].get('id') == userAppModel.get('statsDeviceID')){ 
                    selectedModelIndex = iDev;
                    DeviceOptions += "<option selected='selected' description='" + Devices.models[sortedDevicesMap[iDev]].get('id') + "' descriptionname='" + Devices.models[sortedDevicesMap[iDev]].get('name') + "'>"+Devices.models[sortedDevicesMap[iDev]].get('name')+"</option>";
                }
                else
                {
                DeviceOptions += "<option description='" + Devices.models[sortedDevicesMap[iDev]].get('id') + "' descriptionname='" + Devices.models[sortedDevicesMap[iDev]].get('name') + "'>"+Devices.models[sortedDevicesMap[iDev]].get('name')+"</option>";    
                }
		
		
            }
            //console.log('device options' + DeviceOptions);
            $('#statsDevice').html('<select name="statsDevice">' + DeviceOptions + '</select>');
        
        //Cross Correlation Options
            //find the next device in the models collection
            if(Devices.length-1 != selectedModelIndex){
                compareIndex = sortedDevicesMap[selectedModelIndex + 1];
            } else
                {compareIndex = 0;}
            
            //console.log('compare index: ' + compareIndex);
        //device_compare_select
        for(iDevC=0; iDevC < Devices.length; iDevC++){
                //console.log(iDevC + " models Id " + Devices.models[sortedDevicesMap[iDevC]].get('id') + ", statsDeviceId: " + userAppModel.get('statsDeviceID') );
                if(sortedDevicesMap[iDevC] == compareIndex) {
                    DeviceCompareOptions += "<option selected='selected' " + "description='" + Devices.models[sortedDevicesMap[iDevC]].get('id') + "' descriptionname='" + Devices.models[sortedDevicesMap[iDevC]].get('name') + "'>"+Devices.models[sortedDevicesMap[iDevC]].get('name')+"</option>";
                    
                } else if (Devices.models[iDevC].get('id') == userAppModel.get('statsDeviceID')){
                 //exclude the statsDevice
                } else{
                DeviceCompareOptions += "<option description='" + Devices.models[sortedDevicesMap[iDevC]].get('id') + "' descriptionname='" + Devices.models[sortedDevicesMap[iDevC]].get('name') + "'>"+Devices.models[sortedDevicesMap[iDevC]].get('name')+"</option>";    
                }
            }
            //console.log(DeviceCompareOptions);
            $('#device_compare_select').html('<select name="statsCompareDevice">' + DeviceCompareOptions + '</select>');
        
        //Check Sidebar View
        this.check_sidebar();
        
	this.refresh_sidebar_stats();
	
        
    },
        
        update_stats_device: function(){
                //update before showing view
                statsDeviceID = $('#statsDevice :selected').attr('description');
                userAppModel.set({'statsDeviceID':statsDeviceID});
                statsDeviceNAME = $('#statsDevice :selected').attr('descriptionname');
                userAppModel.set({'statsDeviceNAME':statsDeviceNAME});
		
		
        },
        
	check_sidebar: function() {
            //console.log("I am checking sidebar for stats data view ")
	    if(userAppModel.get('sidebarView') == "Insights"){
                this.update_stats_device();
                
                this.show_view();
	    
            } else {
	    this.hide_view();
	    }
	},
        
    	hide_view: function() {
            $('#statsDataView').css({'z-index': -2, 'opacity': 0});
	    $('#stats-controls-box > div').css({'z-index': -2, 'opacity': 0});
            $('#insightsRange').css({'opacity': 0, 'z-index':-2});
	    $('#insightsView').css({'opacity': 0, 'z-index':-2});
            //this.destroy_view();
	},
        
	show_view: function() {
            $('#statsDataView').css({'z-index': 1, 'opacity': 1});
	    $('#stats-controls-box > div').css({'z-index': 1, 'opacity': 1});
            $('#insightsRange').css({'opacity': 1, 'z-index':3});
            $('#insightsView').css({'opacity': 1, 'z-index':3});
            
            this.fetch_data('cross');
            
            $('#statsInsightsGraph').css({'z-index': 10});
	},
        
        cross_correlation_event: function(){
	    this.currentGraphType = "cross";
		
		    //Widget UI refresh
		    this.button_reset();
		
            this.fetch_data('cross');
            
        },

        auto_correlation_event: function(){
	    this.currentGraphType = "auto";
	    	    //Widget UI refresh
		    this.button_reset();
            this.fetch_data('auto');
            
        },
        
	refresh_sidebar_stats: function(){
	    this.fetch_data("PrimaryDeviceStats");
	},
	
        //Where stats are compiled and added to sidebar
        build_sidebar: function(hourly2WkData){
            $('.updatingalert').hide();
	    $('#updatingstats').html('');  // no longer updating stats
	    
            //2 months of one days
            
	    //console.log('hello, a lot stats');
	    //////console.debug(hourly2WkData);
            
	    sortedStatuses = hourly2WkData.statuses.sort(function(a,b){return a.seriesDataType-b.seriesDataType});
	    
	    //console.log('sorted stats');
	    ////console.debug(sortedStatuses);
	    
	    var energyTotal = 0;
	    for(var iS= 0;iS < hourly2WkData.statuses.length; iS++){
		energyTotal += hourly2WkData.statuses[iS].seriesDataType;
	    }
	    avgEnergy = energyTotal / hourly2WkData.statuses.length;
	    //console.log('energyTotal ' );
	   
		var dayPeak = new Date();
		var peak = 0;
		if(sortedStatuses[hourly2WkData.statuses.length-1]) {
	    	dayPeak = new Date(sortedStatuses[hourly2WkData.statuses.length-1].timestamp);
			peak = sortedStatuses[hourly2WkData.statuses.length-1].seriesDataType.toFixed(4);
		}
		var dayLow = new Date();
		var low = 0;
		if(sortedStatuses[0]) {
	    	dayLow = new Date(sortedStatuses[0].timestamp);
			low = sortedStatuses[0].seriesDataType.toFixed(4);
		}
		var median = 0;
		if(sortedStatuses[parseInt(sortedStatuses.length/2)]) {
			median = sortedStatuses[parseInt(sortedStatuses.length/2)].seriesDataType.toFixed(4);
		}
	    
	    ////console.log('date: ' + new Date(sortedStatuses[0].timestamp).toDateString);
	                
	    $('#DayPeakString').html(dayPeak.toDateString());
	    $('#PeakValueString').html(peak);
	    $('#DayLowString').html(dayLow.toDateString());
	    $('#LowValueString').html(low);
	    $('#AvgValueString').html(avgEnergy.toFixed(2));
	    $('#MedianValueString').html(median);
	    
        },

        fetch_data: function(PrimaryCrossOrAuto) {
          
            //DEFINE THE RANGE, DATATYPE AND FIDELITY
		    //var to_ = time_parser("DATE", "NOW", true);  //returns in UTC milliseconds    
		    //var from_ = time_parser("DATE", "HOURS-FROM-PRESENT", true, 24);  //returns in UTC milliseconds
		    
                    //Device One
		    var datatype_ = 'energyConsumption';
		    var deviceId_ = userAppModel.get('statsDeviceID'); 
		    var deviceName_ = userAppModel.get('statsDeviceNAME');
		    
                    var callbackContext = this;
                                        
			if (PrimaryCrossOrAuto == "cross"){
			//Device Two
			var datatype_2 = 'energyConsumption';
			
			//$('#cross_period_select')
			
			//listen to change of range select -- suggest new interval
			
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			var blocksize_ = this.crossCorLag = $('#cross-suggested-blocksize').val(); //our statuses will be for 30 minute intervals
			
			statsCompareDeviceID = $('#device_compare_select :selected').attr('description');
			statsCompareDeviceNAME = $('#device_compare_select :selected').attr('descriptionname');
			
			var deviceId_2 = statsCompareDeviceID;
			var deviceName_2 = statsCompareDeviceNAME;
			
			//console.log('ID and Name fetch data: ' + deviceId_ + deviceName_ + deviceId_2 + deviceName_2);		    
			
			to_ = this.crossCorRange.to;
			from_ = this.crossCorRange.from;
			
			//console.log('we try with cor objects and time of: ' + to_ + " and " + from_ + " and blocksize of " + blocksize_);
			    
			var callbackEvent_ = "stats_graph";
			
			//Handle the success, rendering the graph
			successObject2 = new SuccessObjectClass(); 
			$(successObject2).bind(callbackEvent_, function(e, it){
			    var finalSeriesWithData = it.get_series();
			    //console.log('we have success with cor objects');
			    callbackContext.comparedSeriesCache = {'rangeTO': new Date(to_).toDateString(), 'rangeFROM': new Date(from_).toDateString(), 'device1Name':deviceName_,'device1series':finalSeriesWithData['seriesArray'][0],'device2Name':deviceName_2,'device2series':finalSeriesWithData['seriesArray'][1]};
			    callbackContext.correlation(blocksize_, finalSeriesWithData['seriesArray'][0], finalSeriesWithData['seriesArray'][1]);
			    });
			
			//Describing the series we need for the graph
			get_assembler(successObject2, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}, {'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_2, 'deviceId': deviceId_2, 'deviceName': deviceName_2}], callbackEvent_);
			}
			
		    else if (PrimaryCrossOrAuto == "auto"){
			//Device Two
			var datatype_2 = 'energyConsumption';
			
			//$('#cross_period_select')
			
			//listen to change of range select -- suggest new interval
			
			//DATA FIDELITY (LOWER NUMBER (MINUTE INTERVAL) MEANS HIGHER FIDELITY)
			var blocksize_ = this.autoCorLag = $('#auto-suggested-blocksize').val(); //our statuses will be for 30 minute intervals
			

			
			//console.log('ID and Name fetch data: ' + deviceId_ + deviceName_ + deviceId_2 + deviceName_2);		    
			
			to_ = this.autoCorRange.to;
			from_ = this.autoCorRange.from;
			
			//console.log('we try with cor objects and time of: ' + to_ + " and " + from_ + " and blocksize of " + blocksize_);
			    
			var callbackEvent_ = "auto_stats_graph";
			
			//Handle the success, rendering the graph
			successObject4 = new SuccessObjectClass(); 
			$(successObject4).bind(callbackEvent_, function(e, it){
			    var finalSeriesWithData = it.get_series();
			    //console.log('we have success with cor objects');
			    callbackContext.comparedSeriesCache = {'rangeTO': new Date(to_).toDateString(), 'rangeFROM': new Date(from_).toDateString(), 'device1Name':deviceName_,'device1series':finalSeriesWithData['seriesArray'][0]};
			    callbackContext.correlation(blocksize_, finalSeriesWithData['seriesArray'][0]);
			    });
			
			//Describing the series we need for the graph
			get_assembler(successObject4, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent_);
			}
                    else if (PrimaryCrossOrAuto == "PrimaryDeviceStats")
                    {
			
			//1 months range
			var todaydate = new Date();  
			var to_ = new Date(todaydate.toDateString()).getTime(); //to 12:00 am of this day
			//set 60 days prior
			var from_ = new Date(to_ - 1209600000).getTime();
			
			//console.log('getting with from ' + from_ + " and to_ " + to_);
			
			var blocksize_ = 60 * 24; //our statuses will be for 60 minute intervals
                        
			var callbackEvent_ = "primary_device_stats3"; //unique callback string
			
			//Handle the success
			//Bind to the sidebar stats building
			successObject3 = new SuccessObjectClass();
			
			$(successObject3).bind(callbackEvent_, function(e, it){
				var finalSeriesWithData = it.get_series();
				//console.log('we have success with cor objects');
				callbackContext.build_sidebar(finalSeriesWithData['seriesArray'][0]);
			    });
			
                        get_assembler(successObject3, [{'from':from_,'to':to_, 'blocksize': blocksize_, 'datatype': datatype_, 'deviceId': deviceId_, 'deviceName': deviceName_}], callbackEvent_);
			
			$('.updatingalert').show();
			$('#updatingstats').html('Updating stats...');
                    }
                    
        },
        
        //present increment size (minutes), series One, and series Two (optional) (Arrays)
        correlation: function(incrementMin, seriesOne, seriesTwo) {
            
            var corGraph = [];
            var i,j;  //index 1 and 2
            var mx,my,sx,sy,sxy,denom,r;
            n = seriesOne.statuses.length;
            
            maxdelay = parseInt(seriesOne.statuses.length/4); var autoCorrelationFlag = -1;
            
            //console.log('hello! seriesTwo?');
            ////console.debug(seriesOne);
            ////console.debug(seriesTwo);
            
            if(seriesTwo == undefined){
		seriesTwo = jQuery.extend(true, {}, seriesOne);
		autoCorrelationFlag = true;
	    }
            //perform cross-correlation
	    
            label = "Cross correlation of " + seriesOne.name + " and " + seriesTwo.name;
            
            x = seriesOne.statuses; y = seriesTwo.statuses;
            
            /* Calculate the mean of the two series x[], y[] */
            mx = 0;
            my = 0;   
            for (i=0;i<n;i++) {
				if(x[i]) {
               mx += x[i].seriesDataType;
			   	}
				if(y[i]) {
               my += y[i].seriesDataType;
			   	}
            }
            mx /= n;
            my /= n;
         
            //console.log("mx is " + mx);
            ////console.debug(y);
         
            /* Calculate the denominator */
            sx = 0;
            sy = 0;
            for (i=0;i<n;i++) {
				if(x[i]) {
               sx += (x[i].seriesDataType - mx) * (x[i].seriesDataType - mx);
			   	}
				if(y[i]) {
               sy += (y[i].seriesDataType - my) * (y[i].seriesDataType - my);
			   	}
            }
            denom = Math.sqrt(sx*sy);
         
            //console.log("denom " + denom);
         
	if (autoCorrelationFlag == true){
	    for (delay=0;delay<maxdelay;delay++) {
               sxy = 0;
               for (i=0;i<n;i++) {
                  j = i + delay;
                  if (j < 0 || j >= n)
                     continue;  // there is no data wrapping, as the data is not (necessarily) circular
                  else
                  
                     sxy += (x[i].seriesDataType - mx) * (y[j].seriesDataType - my);               }
               
               r = sxy / denom;
               corGraph.push({"r": r, "delay": delay, 'minInterval':incrementMin});
               /* r is the correlation coefficient at "delay" */
	}
	} else {
            /* Calculate the correlation series */
            for (delay=-maxdelay;delay<maxdelay;delay++) {
               sxy = 0;
               for (i=0;i<n;i++) {
                  j = i + delay;
                  if (j < 0 || j >= n)
                     continue;  // there is no data wrapping, as the data is not (necessarily) circular
                  else
                  
                     sxy += (x[i].seriesDataType - mx) * (y[j].seriesDataType - my);               }
               
               r = sxy / denom;
               corGraph.push({"r": r, "delay": delay, 'minInterval':incrementMin});
               /* r is the correlation coefficient at "delay" */
                
            }
	}
	    
            //console.log('correlation graph of two devices');
            ////console.debug(corGraph);
            
            this.successObjectCallback.put_series(corGraph);
            $(this.successObjectCallback).trigger('insights_render', this.successObjectCallback);
            //corGraph;
          
        },
            
	build_widget_ui: function() {
	    
	    $("#cross-suggested-blocksize").val(this.blocksize_generate());
	    
	    var tempdatefrom = new Date(this.crossCorRange.from);
	    var tempdateto = new Date(this.crossCorRange.to);
	    
	    //cross-custom-range-display
	    $("#cross-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
	    
	    var callbackContext = this;
	    
	    $('#cross-date-dialog').dialog({
				    autoOpen: false,
				    show: "fade",
				    hide: "fade",
				    modal: true
			    });
	    
	    
	    $('#FROMdateCross').datepicker('disable');
	    $("#TOdateCross").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
	    
	    $('#date_selector_cross').click(function () {
				//console.log('clicked Date');
				$('.ui-widget-overlay').live('click', function() {
					$('#cross-date-dialog').dialog( "close" );
				});
				
				$('#cross-date-dialog').dialog( "open" );
				$('.date_dialog').css({'opacity':1});
				
				$("#ui-datepicker-div").hide();
				$("#FROMdateCross").blur();
				$( "#FROMdateCross").datepicker('enable');
				$( "#FROMdateCross").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
				
				//jQuery('#ui-datepicker-div').hide();
				    return false;
			    });
	    
	    $('#date_submit_cross').click(function () {   
				var thisfrom = $('#FROMdateCross').val();
				var thisto = $('#TOdateCross').val();
				if(thisfrom != "" && thisto != ""){
				    var dFrom = new Date(thisfrom);
				    var dTo = new Date(thisto);
				
				$('#cross_period_selector').val('- custom range -');
				
				callbackContext.crossCorRange = { 'from':dFrom.getTime(), 'to':dTo.getTime() };
				
				var tempdatefrom = new Date(callbackContext.crossCorRange.from);
				var tempdateto = new Date(callbackContext.crossCorRange.to);
				
				//cross-custom-range-display
				$("#cross-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
				
				$('#cross-date-dialog').dialog( "close" );
				$('#cross-suggested-blocksize').val(callbackContext.blocksize_generate());
				
				}
			});
	    
		$('#comparedSeriesDialog').dialog({
				    autoOpen: false,
				    show: "fade",
				    hide: "fade",
				    modal: true,
				    width: 960,
				    height: 575
				});
	    
	    $('#CrossCorReveal').click(function () {
				//console.log('clicked Date');
				
				$('#comparedSeriesDialog').attr("title", '(Compared) Device Time Series -- -- -- ' + callbackContext.comparedSeriesCache.rangeFROM + " to " + callbackContext.comparedSeriesCache.rangeTO);
				
				$('#time_series_name1').html(callbackContext.comparedSeriesCache.device1Name + ", kWh ");
				callbackContext.graph_it($('#time_series_graph1'), callbackContext.comparedSeriesCache.device1series);
				
				$('#time_series_name2').html(callbackContext.comparedSeriesCache.device2Name + ", kWh ");
				callbackContext.graph_it($('#time_series_graph2'), callbackContext.comparedSeriesCache.device2series);
				
				$('.ui-widget-overlay').live('click', function() {
					$('#comparedSeriesDialog').dialog( "close" );
				});
				
				$('#comparedSeriesDialog').dialog( "open" );
				
				    return false;
			    });

	    //similar for auto correlation ui
	    $("#auto-suggested-blocksize").val(this.auto_blocksize_generate());
	    
	    var tempdatefrom = new Date(this.autoCorRange.from);
	    var tempdateto = new Date(this.autoCorRange.to);
	    
	    //cross-custom-range-display
	    $("#auto-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
	    
	    var callbackContext = this;
	    
	    $('#AutoCorReveal').hide();
	    
	    $('#auto-date-dialog').dialog({
				    autoOpen: false,
				    show: "fade",
				    hide: "fade",
				    modal: true
			    });
	    
	    
	    $('#FROMdateAuto').datepicker('disable');
	    $("#TOdateAuto").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
	    
	    $('#date_selector_auto').click(function () {
				//console.log('clicked Date');
				$('.ui-widget-overlay').live('click', function() {
					$('#auto-date-dialog').dialog( "close" );
				});
				
				$('#auto-date-dialog').dialog( "open" );
				$('.date_dialog').css({'opacity':1});
				
				$("#ui-datepicker-div").hide();
				$("#FROMdateAuto").blur();
				$( "#FROMdateAuto").datepicker('enable');
				$( "#FROMdateAuto").datepicker({'showAnim':"fadeIn", 'maxDate': "+0d", 'showOn':'focus'});
				
				//jQuery('#ui-datepicker-div').hide();
				    return false;
			    });
	    
	    $('#date_submit_auto').click(function () {   
				var thisfrom = $('#FROMdateAuto').val();
				var thisto = $('#TOdateAuto').val();
				if(thisfrom != "" && thisto != ""){
				    var dFrom = new Date(thisfrom);
				    var dTo = new Date(thisto);
				
				$('#auto_period_selector').val('- custom range -');
				
				callbackContext.autoCorRange = { 'from':dFrom.getTime(), 'to':dTo.getTime() };
				
				var tempdatefrom = new Date(callbackContext.autoCorRange.from);
				var tempdateto = new Date(callbackContext.autoCorRange.to);
				
				//cross-custom-range-display
				$("#auto-custom-range-display").html(tempdatefrom.toDateString() + ' to ' + tempdateto.toDateString() + '<br>');
				
				$('#auto-date-dialog').dialog( "close" );
				
				$('#auto-suggested-blocksize').val(callbackContext.auto_blocksize_generate());
				
				}
			});
	    
	    $('#Auto-comparedSeriesDialog').dialog({
				    autoOpen: false,
				    show: "fade",
				    hide: "fade",
				    modal: true,
				    width: 960,
				    height: 575
				});
	    
	    $('#AutoCorReveal').click(function () {
				//console.log('clicked Date');
				
				$('#Auto-comparedSeriesDialog').attr("title", '(Compared) Device Time Series -- -- -- ' + callbackContext.comparedSeriesCache.rangeFROM + " to " + callbackContext.comparedSeriesCache.rangeTO);
				
				$('#Auto-time_series_name1').html(callbackContext.comparedSeriesCache.device1Name + ", kWh ");
				callbackContext.graph_it($('#Auto-time_series_graph1'), callbackContext.comparedSeriesCache.device1series);
				
				
				$('.ui-widget-overlay').live('click', function() {
					$('#Auto-comparedSeriesDialog').dialog( "close" );
				});
				
				$('#Auto-comparedSeriesDialog').dialog( "open" );
				
				    return false;
			    });

	},
	
	graph_it: function (plotObject, graphValues) {
		    
		    var callbackContext = this;
		    
		    //console.log('hello asdfasdf');
		    ////console.debug(graphValues);
		    
		    $(function () {
			//Detect bar graph settings
			
			var options = 	{
			    grid: { hoverable: true, clickable: true, labelMargin: 20 },
				bars: {show:barBool, barWidth: 60*1000*graphValues.blocksize},
				xaxis:
					{
					mode: 'time',    
					    
					tickFormatter: function(val) {
					var graphDate = new Date(val)
					return dateFormat(graphDate, "mm/dd") + "<br/>" + dateFormat(graphDate, "htt");
					}
					
					  },
			       yaxis: { min: 0
					},

					
			       };
			
			var d1 = [];
			for (var i = 0; i < graphValues.statuses.length - 1; i += 1){
					d1.push([graphValues.statuses[i]['timestamp'], graphValues.statuses[i]['seriesDataType']]);
			}
			//console.log('hola with energy home arrays! ');
			////console.debug(d1);
			

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
				    'z-index' : 2000,
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
							" kWh : "+ item.datapoint[1].toFixed(5)
							+ "<br>" + d.toTimeString());
					}
				    }
				    else {
					$("#tooltip").remove();
					previousPoint = null;            
				    }   
			    });
			
		    });
	    
	},
	
	focus_crossCor_elements: function(){
	    this.elements_reset();
	  
	    //re-allocate highlight class
	    $('#cross-correlation-box').addClass('selected-controls');
	  
	    $('#auto-correlation-box').addClass('unselected-controls');
	  
	},
	
	focus_autoCor_elements: function() {
	    this.elements_reset();
	  
	    //re-allocate highlight class
	    $('#auto-correlation-box').addClass('selected-controls');
	  
	    $('#cross-correlation-box').addClass('unselected-controls');
	},
	elements_reset: function(){
	    
	    $('#auto-correlation-box').removeClass('selected-controls');
	    $('#auto-correlation-box').removeClass('unselected-controls');
	    $('#cross-correlation-box').removeClass('selected-controls');
	    $('#cross-correlation-box').removeClass('unselected-controls');
	},
	
	button_reset: function() {
	    
	    //console.log('helllasdasfdsdfl');
	    
	    if (this.currentGraphType == "cross"){
		
		$('#resubmitCrossCor').html('Re-Graph Correlation');
		$('#resubmitAutoCor').html('Graph Correlation');
		$('#CrossCorReveal').show();
		$('#AutoCorReveal').hide();
		
	    }
	    else if (this.currentGraphType == "auto"){
	    
		$('#resubmitCrossCor').html('Graph Correlation');
		$('#resubmitAutoCor').html('Re-Graph Correlation');
		$('#CrossCorReveal').hide();
		$('#AutoCorReveal').show();
	    }
	}
	
  });
  
// END -------------------------------------------------- StatsView // 
