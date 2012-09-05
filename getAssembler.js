//Creates listening objects which will be passed to the GetAssembler and be triggered to return the final object.
    //Instances of this class will be passed in with the invocation of the get_assembler() 
function SuccessObjectClass() {
        var finalSeriesWithData = [];
        
        this.put_series = function (completeSeries) {
            finalSeriesWithData = completeSeries;
            
        }
        this.get_series = function () {
            
            return finalSeriesWithData;
        }
    }

function get_assembler ( successEventObject, series_descriptor, callbackEvent ) {  //callback event merely is a unique string passed with function
    // argument is an array of series descriptors and //after all of the series have been "gotten", a success event will be triggered on the successEventObject
        
    // A deep copy of the original request will be available with the final success object
    var orig_series_descriptor = jQuery.extend(true, {}, series_descriptor);
   
   var finalSeriesDescriptor = {
        seriesArray : []
   };
    
    //First we PREP each SERIES for API-specific treatment -- 
     //This handles any discrepancies in API and supports total House Energy
        // includes support for "AUTO" block size and API commands
    //CHANGES ARE RETURNED in a finalSeriesDescriptor array
    
    function API_prep_series(singleSeries) {
        
        switch(series_descriptor[seriesIndex].datatype)
        {
        case "powerDraw":   //This API is Very LIMITING dues to using SCALE instead of BLOCK
                // 'AUTO' Block size fidelity -- POSTSCRIPT: Unfortunately, this is impossible with the limited API    
            singleSeries['blocksize'] = "HALF_HOUR";
            singleSeries['graphType'] = 'line';
            singleSeries['api_command'] = 'get_dev_statuses';
            singleSeries['APIvalueReference'] = 'statuses';
            singleSeries['seriesDataReference'] = 'powerDraw';
            singleSeries['timestampReference'] = 'timestamp';
            
            return singleSeries;
            
        break;
    
        case "energyConsumption":
            
            singleSeries['graphType'] = 'bar';
            singleSeries['api_command'] = 'get_energy_statuses';
            singleSeries['APIvalueReference'] = 'energyConsumptions';
            singleSeries['seriesDataReference'] = 'energyConsumed';
            singleSeries['timestampReference'] = 'to';
            
            ////console.log("tell me what this is: " + singleSeries['rulesFlag']);
            
            if (singleSeries['rulesFlag'] == "All_Devices_EC_Rule"){
                //console.log("tell me you see me");
                singleSeries['label'] = singleSeries['deviceName'];
                singleSeries['name'] = singleSeries['deviceName'];;
                singleSeries['stack'] = 1;
            }
             //console.log('tell me this too!')
             ////console.debug(singleSeries);
            return singleSeries;
            
        break;
    
        case "batteryPercentage":
            
            singleSeries['graphType'] = 'line';
            singleSeries['api_command'] = 'get_bat_statuses';
            
            return singleSeries;
            
        break;
        
    }
    //End of API_prep_series
    }
    

   //Building the finalSeriesDescriptor -- ITERATION over requested SERIES, handling exceptions, and supporting keywords
   
   for ( var seriesIndex = 0; seriesIndex < series_descriptor.length; seriesIndex++ ){
        
     //SPECIAL DATATYPES CENTER, ending with a basic-type catch-all
        
        //Special Type #1 -- House Energy datatype
        if ( series_descriptor[seriesIndex].datatype == 'houseEnergy'){                       
            //IF DATATYPE IS HOUSE ENERGY
            //ADD A SERIES FOR EACH DEVICE TO finalSeriesDescriptor
                //ONE OF THE COMPLETION RULES IS TO RECOMBINE THESE SERIES for TOTAL EnergyConsumption
                
                //for each series(device), changing datatype to the basic 'energyConsumption'
                //for each series(device) adding a rulesFlag attribute so it can be recombined at the end of Get Assembler
                series_descriptor[seriesIndex]['datatype'] = "energyConsumption";
                series_descriptor[seriesIndex]['rulesFlag'] = "House_Energy_Rule";
                
                var deviceSeriesPrototype = series_descriptor[seriesIndex];
                
                for (var deviceIndex = 0; deviceIndex < Devices.length; deviceIndex++) {
                    var deviceSeriesInsert = jQuery.extend(true, {}, deviceSeriesPrototype);
                    deviceSeriesInsert['deviceId'] = Devices.models[deviceIndex].get('id');
                    deviceSeriesInsert['deviceName'] = Devices.models[deviceIndex].get('name');
                    
                    //Now 1.) prep and 2.) add this series to finalSeriesDescriptor
                    finalSeriesDescriptor['seriesArray'].push( API_prep_series(deviceSeriesInsert) );        
                }
                
                //add original request description
                finalSeriesDescriptor['description'] = orig_series_descriptor;
            
            //console.log('take a look at the new series descriptor (with house energy)');
            ////console.debug(finalSeriesDescriptor);
        }
        //Special Type #2 -- "All Devices" datatype
        else if (series_descriptor[seriesIndex].datatype == 'All Devices E.C.') {
            //IF DATATYPE IS All Devices E.C.
            //ADD A SERIES FOR EACH DEVICE TO finalSeriesDescriptor
                //ONE OF THE COMPLETION RULES IS TO Dress up this info with proper labeling
                
                //for each series(device), changing datatype to the basic 'energyConsumption'
                //for each series(device) adding a rulesFlag attribute so it can be recombined at the end of Get Assembler
                series_descriptor[seriesIndex]['datatype'] = "energyConsumption";
                series_descriptor[seriesIndex]['rulesFlag'] = "All_Devices_EC_Rule";
                
                
                for (var deviceIndex = 0; deviceIndex < Devices.length; deviceIndex++) {
                    var deviceSeriesInsert = jQuery.extend(true, {}, series_descriptor[seriesIndex]);
                    deviceSeriesInsert['deviceId'] = Devices.models[deviceIndex].get('id');
                    deviceSeriesInsert['deviceName'] = Devices.models[deviceIndex].get('name');
                    
                    //Now 1.) prep and 2.) add this series to finalSeriesDescriptor
                    finalSeriesDescriptor['seriesArray'].push( API_prep_series(deviceSeriesInsert) );        
                }
                
                //add original request description
                finalSeriesDescriptor['description'] = orig_series_descriptor;
            
            ////console.debug(finalSeriesDescriptor);
            
        }
        //Basic-Type Catch-All  ('datatypes' like energyConsumption, powerDraw, batteryPercentage)
        else {
            //Take the series add API query, add to finalSeriesDescriptor
            finalSeriesDescriptor['seriesArray'].push( API_prep_series(series_descriptor[seriesIndex] ) );
                
            //add original request description
            finalSeriesDescriptor['description'] = orig_series_descriptor;
        }
        }
        
        //console.log('here is the finalSeriesDescriptor');
        ////console.debug(finalSeriesDescriptor);
    
    //DEFINE ANY POST-GET RULES - that must be applied to the seriesData

      function completionRules(SeriesWithData) {
            
                //TO HANDLE MULTIPLE houseEnergy REQUESTS FROM ORIGINAL series_descriptor
                var HouseDeviceCount = 0; var HouseEnergyConsumedMasterArray = [];
                var AllDevicesCount = 0; var AllDevicesMasterObject = {};
            
            finalSeriesWithData_ = {
                desc: SeriesWithData.description,
                seriesArray:[]
                }; //What will be returned after rules are applied              
            
            //Final assembly of Series -- applying the rules
            for (var sIndex = 0; sIndex < SeriesWithData['seriesArray'].length; sIndex++) {
                        
                        //console.log('emergency debug aa');
                        ////console.debug(SeriesWithData['seriesArray'][sIndex]);
                        
                        //var correctIndex = reOrder(SeriesWithData['seriesArray'][sIndex]['deviceId']);
                
                //ADDING RULE: House_Energy_Rule
                     if (SeriesWithData['seriesArray'][sIndex].rulesFlag == 'House_Energy_Rule'){
                        
                        //THIS RULE DEPENDS ON devices of HouseEnergy to be added sequentially
                        if(HouseDeviceCount == 0){
                            iLength = 0;
                            while(iLength < SeriesWithData['seriesArray'][sIndex].statuses.length){
                            HouseEnergyConsumedMasterArray.push(SeriesWithData['seriesArray'][sIndex]['statuses'][iLength]);
                            iLength++;
                            }
                            //console.log('here is the initial Master Array');
                            ////console.debug(HouseEnergyConsumedMasterArray);
                                        // if (HouseEnergyConsumedArray == []){ } else { for ( var eArraySeries = 0; eArraySeries < SeriesWithData[i].statuses.length; eArraySeries++) {                            }}
                        } else {
                            //console.log('here is the subsequent Master Array');
                            ////console.debug(HouseEnergyConsumedMasterArray);
                            var addIndex = 0;
                                while(addIndex < SeriesWithData['seriesArray'][sIndex].statuses.length){
                                HouseEnergyConsumedMasterArray[addIndex]['seriesDataType'] += SeriesWithData['seriesArray'][sIndex]['statuses'][addIndex]['seriesDataType'];
                                addIndex++;
                                }
                        }
                        
                        //TO HANDLE MULTIPLE houseEnergy REQUESTS FROM ORIGINAL series_descriptor, we take action on every Devices.length-th series
                        
                        HouseDeviceCount++;
                        
                            if (HouseDeviceCount % Devices.length == 0){
                                SeriesWithData['seriesArray'][sIndex]['datatype'] = 'houseEnergy';
                                SeriesWithData['seriesArray'][sIndex]['deviceId'] = '';
                                
                                SeriesWithData['seriesArray'][sIndex]['deviceName'] = '';
                                SeriesWithData['seriesArray'][sIndex]['statuses'] = HouseEnergyConsumedMasterArray;
                                finalSeriesWithData_['seriesArray'].push(SeriesWithData['seriesArray'][sIndex]);
                                var HouseEnergyConsumedMasterArray = [];
                                //console.log('made it here');
                                ////console.debug(finalSeriesWithData_);
                            }
                      }
                
                //ADDING RULE: All Devices Energy Object - to be made ready for stacked graphing
                    else if (SeriesWithData['seriesArray'][sIndex].rulesFlag == 'All_Devices_EC_Rule'){

                        var deviceSeriesWithData = {};
                        //finalSeriesWithData_['seriesArray'].push(SeriesWithData['seriesArray'][sIndex]);
                        ////console.debug(SeriesWithData['seriesArray']);
                        //console.log('describe state of sIndex series ' + sIndex);
                        ////console.debug(SeriesWithData['seriesArray'][sIndex]);
                        //console.log('the length is :' + SeriesWithData['seriesArray'][sIndex]['statuses'].length);
                        
                        deviceSeriesWithData = jQuery.extend({}, SeriesWithData['seriesArray']);
                        
                        //console.log('let me see deviceSeriesWithData');
                        ////console.debug(deviceSeriesWithData);

                        ////console.log('the correct index for ' + deviceSeriesWithData[sIndex]['deviceName'] +" is " + correctIndex );
                        //THIS RULE DEPENDS ON devices of All Devices to be added sequentially
                        deviceSeriesWithData[sIndex]['data'] = [];
                            for(var i = 0; i < SeriesWithData['seriesArray'][sIndex]['statuses'].length; i++){
                                
                                deviceSeriesWithData[sIndex]['data'].push([SeriesWithData['seriesArray'][sIndex]['statuses'][i]['timestamp'],SeriesWithData['seriesArray'][sIndex]['statuses'][i]['seriesDataType']]);
                            }
                                //SeriesWithData['seriesArray'][sIndex]['deviceName'];
                        //up from this
                        //console.log('dont confound me');
                        ////console.debug(deviceSeriesWithData);
                                
                            AllDevicesMasterObject[deviceSeriesWithData[sIndex]['deviceName']] = deviceSeriesWithData[sIndex];

                        
                        //TO HANDLE MULTIPLE houseEnergy REQUESTS FROM ORIGINAL series_descriptor, we take action on every Devices.length-th series
                        

                        AllDevicesCount++;
                            if (AllDevicesCount % Devices.length == 0){
                                var passObject = {};
                        //console.log('all devices Master Object');
                        ////console.debug(AllDevicesMasterObject);
                                
                                passObject['datatype'] = 'All Devices E.C.';
                                passObject['statuses'] = AllDevicesMasterObject;
                                
                                //resetting some inherited values
                                delete deviceSeriesWithData['data'];
                                delete deviceSeriesWithData['deviceId'];
                                delete deviceSeriesWithData['deviceName'];
                                delete deviceSeriesWithData['label'];
                                delete deviceSeriesWithData['label'];
                                delete deviceSeriesWithData['stack'];
                                                
                                finalSeriesWithData_['seriesArray'].push(passObject);
                                var AllDevicesMasterObject = {};
                            }   
                    } 
                    else { 
                        finalSeriesWithData_['seriesArray'].push(SeriesWithData['seriesArray'][sIndex]);
                    }   
              }
              return finalSeriesWithData_;
            }
    
    var completionCounter = 0;
    var completionIndex = finalSeriesDescriptor['seriesArray'].length;
    //console.log('completionIndex ' + completionIndex);
    
//LOOP, ITERATE PER final SERIES DESCRIPTOR
//THIS is Where the Server is Queried

    var SeriesWithData = {}
        //'seriesArray': [finalSeriesDescriptor]
        //};
    $.extend(SeriesWithData, finalSeriesDescriptor);

    //console.log('final series descriptor object pre api command');
    ////console.debug(finalSeriesDescriptor);

    var getCallbackCounter = 0;

  for ( var seriesIndex = 0; seriesIndex < finalSeriesDescriptor['seriesArray'].length; seriesIndex++ ) {
    
   function scopeForCallback() {
    
    var apiCommand = finalSeriesDescriptor['seriesArray'][seriesIndex]['api_command'];
    
    var params = {};
    
    if (finalSeriesDescriptor['seriesArray'][seriesIndex]['deviceId'] != undefined) {
        params['deviceId'] = finalSeriesDescriptor['seriesArray'][seriesIndex]['deviceId'];
        }
    params['blocksize'] = finalSeriesDescriptor['seriesArray'][seriesIndex]['blocksize'];
    params['from'] = finalSeriesDescriptor['seriesArray'][seriesIndex]['from'];
    params['to'] = finalSeriesDescriptor['seriesArray'][seriesIndex]['to'];
    
    //For callback Unique Data
    var seriesDeviceName = finalSeriesDescriptor['seriesArray'][seriesIndex]['deviceName'];
    var seriesDeviceId = finalSeriesDescriptor['seriesArray'][seriesIndex]['deviceId'];
    var seriesDataType = finalSeriesDescriptor['seriesArray'][seriesIndex]['datatype'];
    var APIvalueReference = finalSeriesDescriptor['seriesArray'][seriesIndex]['APIvalueReference'];
    var timestampReference = finalSeriesDescriptor['seriesArray'][seriesIndex]['timestampReference'];
    var seriesDataReference = finalSeriesDescriptor['seriesArray'][seriesIndex]['seriesDataReference'];
    //var UIData ={'seriesDataType':seriesDataType, 'APIvalueReference': APIvalueReference};

    //console.log("here is what the final series descriptor for " + finalSeriesDescriptor['seriesArray'][seriesIndex]['deviceName'] + " looks like" );
    ////console.debug(finalSeriesDescriptor['seriesArray'][seriesIndex]);
    
    //console.log('and the params');
    ////console.debug(params);

        jsonDATA_results= {};

    //For this series, call the API and save the statuses to the SeriesWithData array:
    jsonDATA_results[$.extend(seriesIndex, {})] = command_center( apiCommand , params);
                        
    jsonDATA_results[$.extend(seriesIndex, {})].success(function (dataObject) {       //accessing callback    
				
        if (dataObject.success != true) {      // **** dblcheck error msg
	    //console.log(dataObject.errorMsg + " apiCommand " + apiCommand + " ; and params in debug");        //**** event should be bound to errorView
            ////console.debug(params);
        }
	else if (dataObject.success == true) {
                /*
                var seriesDeviceName = finalSeriesDescriptor['seriesArray'][completionCounter]['deviceName'];
                var seriesDataType = finalSeriesDescriptor['seriesArray'][completionCounter]['datatype'];
                var APIvalueReference = finalSeriesDescriptor['seriesArray'][completionCounter]['APIvalueReference'];
                var timestampReference = finalSeriesDescriptor['seriesArray'][completionCounter]['timestampReference'];
                var seriesDataReference = finalSeriesDescriptor['seriesArray'][completionCounter]['seriesDataReference'];
                */
            //console.log('SuccessObject');
            ////console.debug(dataObject);
            
	    var innerIndex = 0;
            
            var Statuses = [];
            
	    while (innerIndex < dataObject[APIvalueReference].length) {
		fetchIndex = (dataObject[APIvalueReference].length - 1 ) - innerIndex;
		    //we walk from the end of the dataObject toward the beginning, as the latest timestamps are nearest to the front
			      
		//add this status to array
		Statuses.push({seriesDataType:dataObject[APIvalueReference][innerIndex][seriesDataReference], 'timestamp': dataObject[APIvalueReference][innerIndex][timestampReference]});
		
                if (innerIndex == dataObject[APIvalueReference].length-1)
                        {//console.log('please lord no ' + seriesDeviceName + " value: "  +dataObject[APIvalueReference][innerIndex][seriesDataReference]);
                                }	
		    innerIndex++;   
		}
            

            
            //console.log('get callback counter' + getCallbackCounter);
            ////console.debug(SeriesWithData);
            //console.log('completion counter (pre add)' + completionCounter);

            ////console.log('right before statuses fail');
            ////console.debug(SeriesWithData['seriesArray'][seriesIndex]);
            ////console.log('series index' + seriesIndex);
            
            //console.log('completion index ' + completionIndex);
            //console.log('finalSeriesDescriptor.length ' + finalSeriesDescriptor.length);
            
            function match_up(deviceName){
                        for(var findOrderIndex = 0; findOrderIndex < SeriesWithData['seriesArray'].length; findOrderIndex++){
                                if ( deviceName == SeriesWithData['seriesArray'][findOrderIndex]['deviceName']){
                                        return findOrderIndex;
                                }
                        }
                        }
                        
                        
                        
                        var correctIndex = match_up(seriesDeviceName);
            
            
            SeriesWithData['seriesArray'][correctIndex]['statuses'] = Statuses;
            completionCounter++;
            
            if (completionCounter == completionIndex) {
                
        //FINALLY, SUCCESS EVENT IS TRIGGERED - RETURNING RESULTS
                
                //console.log('series with data before rules');
                //console.debug(SeriesWithData);
                
                
                //POST-GET series massaging -- such as combining series
                finalSeriesWithData = completionRules(SeriesWithData);
                
                //console.log('series with data post rules');
                //console.debug(finalSeriesWithData);
                
                //console.log('calling back with this trigger name: ' + callbackEvent);
                
                //put in status store - for later cache checks
                //status_store('write', finalSeriesWithData);
                
                successEventObject.put_series(finalSeriesWithData);
                
                $(successEventObject).trigger(callbackEvent, successEventObject);
            }
                getCallbackCounter++;
              }
            
            
            
          });
        }
        scopeForCallback();
      }
      


    /* DOES blocksize == "AUTO" */
    
    /* for status API, blocksize is not BLOCK but SCALE */
    
    
    
}

// "HALF-HOUR"
// "DATE","MINUTES-FROM-PRESENT", 30
// "DATE", "HOURS-FROM-PRESENT", 24
// "DATE", "NOW"

// timesync

//var to_ = time_parser("DATE", "NOW");  //returns in UTC milliseconds


var instantationTime = new Date().getTime();

function time_parser ( dateOrCalculation_, unitType_or_Now_ , timesync , quantity_ ) {   // rename to... date_range_parser
    
    if ("DATE" == dateOrCalculation_){
        
        switch(unitType_or_Now_)
            {
            case "NOW":
                if (userAppModel.get('cacheEnabled') === true || timesync === true) {
                    return instantationTime;
                } else { return new Date().getTime(); }
              
            break;
        
            case "MINUTES-FROM-PRESENT":
                
                //this means we take the quantity of minutes and reduce current date by that much, return millisecond UTC time
                if (userAppModel.get('cacheEnabled') === true || timesync === true) {
                    return instantationTime - quantity_ * 60000;
                } else {  var milliUTC = new Date().getTime();  return milliUTC - quantity_ * 60000; }
              
            break;
            
            case "HOURS-FROM-PRESENT":
                //this means we take the quantity of hours and reduce date by that much, return millisecond UTC time
                if (userAppModel.get('cacheEnabled') === true || timesync === true) {
                    return instantationTime - quantity_ * 3600000; 
                } else { var milliUTC = new Date().getTime();  return milliUTC - quantity_ * 3600000;  }
                
            break;
            
    }
    
    //Raw support for minutes to milliseconds conversion (stupid I know)    
    if (typeof(dateOrCalculation_) == "number"){
        
        return dateOrCalculation_ * 60000;
        
    }

                                    }
                        }



var status_store_inventory = {};



//essentially a conduit for graphValues to be referenced before making fresh request (unless cache is disabled)
function status_store ( command , finalSeriesWithData ) {  // temp, timestamped graphValues with context (not binary)
    
    
    
    //instantationTime;
    
}

/* MVO areas:
  
  
        callback instructions - shoehorned - "but this is currently used as a way to shoehorn status getting code for ind. panels"
        
        var from = new Date(parseInt(milliUTC + (count * - 1800000 ))).getTime();
        
 */