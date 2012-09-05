// API COMMANDS ----------------------------------------------------- BEGIN //
        
//ALL POST COMMANDS WILL EXECUTE THIS FUNCTION
function command_center_post(commandData) {
    return $.ajax({
      type: 'POST',
      url: 'serve_v3.php',
      cache: false,
      async: true,
      data: commandData ,
      
      dataType: 'json',
      success: function(jsonData_) {
        //console.log('hello from the post site ' + jsonData_)
        passTo_sd = $.parseJSON(jsonData_);
        return passTo_sd;
      },
      error: function() {
        return false;
      }
    });
}

//GET JSONP COMMANDS WILL BE HANDLED HERE
function command_center_get(commandData, url) {  
    
    return $.ajax({
      type: 'GET',
      url: ourURL,
      cache: false,
      data:  commandData ,
      dataType: 'jsonp',
      async: true,
      success: function(jsonData_) {
        
        return jsonData_;
      },
      error: function() {
        return false;
      }  
    });
    }


function command_center(command, params) {
    token = $.cookie('session');
    
    
  //COMMAND: "get_dev_statuses", add devices statuses to each device
  if(command == "get_dev_statuses"){
        domIDtag = "collectionContents";
        ourURL = "https://cab.cs.usfca.edu/greenhomeserver/api/status";
        
        
        commandData_ = {'token': token};
        
        
        params['deviceId'] ? $.extend(commandData_, {'device_id': params['deviceId']}) : null ;
        params['blocksize'] ? $.extend(commandData_, {'scale': params['blocksize']}) : null ;
        
        params['from'] ? $.extend(commandData_, {'from': params['from']}) : null ;
        params['to'] ? $.extend(commandData_, {'to': params['to']}) : null ;
        
        params['ascending'] ? $.extend(commandData_, {'ascending': params['ascending']}) : null ;
        params['filter'] ? $.extend(commandData_, {'filter': params['filter']}) : null ;
        params['rounding'] ? $.extend(commandData_, {'rounding': params['rounding']}) : null ;
        
        //deprecated
        params['count'] ? $.extend(commandData_, {'count': params['count']}) : null ;
        
        ////console.log("DEBUG COMMAND GET STATUSES: " + commandData_['count']);
        
        jsonDATA_sd = command_center_get(commandData_, ourURL);
        
        return jsonDATA_sd;
    }
    var ourMethod = "";
    var commandData = {};
    
  //COMMAND: "get_dev_statuses", add devices statuses to each device
  if(command == "get_energy_statuses"){
        domIDtag = "collectionContents";
        ourURL = "https://cab.cs.usfca.edu/greenhomeserver/api/energyconsumption";
        
        //necessary params
        deviceId = params['deviceId'];
        
        commandData_ = {'token': token, 'device_id':deviceId};
        
        params['blocksize'] ? $.extend(commandData_, {'block': params['blocksize']}) : null ;

        params['from'] ? $.extend(commandData_, {'from': params['from']}) : null ;
        params['to'] ? $.extend(commandData_, {'to': params['to']}) : null ;
        
        //console.log("DEBUG COMMAND GET STATUSES: " + commandData_['block']);
        
        jsonDATA_sd = command_center_get(commandData_, ourURL);
        
        return jsonDATA_sd;
    }
    
    var ourMethod = "";
    var commandData = {};
    
  //COMMAND: DEVICE_LIST
  if(command == "device_list"){
                    // domIDtag = "displayDevices";
                        // **** this destination is no longer needed
                // Building our query to send to the get ajax function
        ourURL = "https://cab.cs.usfca.edu/greenhomeserver/api/device";
        
        //ourURL = 'api/device';
        ourMethod = "GET";
        
        commandData_ = {'token': token, ourMethod: "GET", ourURL: 'api/device'};
        
        return command_center_get(commandData_);
        
    }
    
    var ourMethod = "";
    var commandData = {};
    
if(command == "get_dev_actions"){
        ourURL = "https://cab.cs.usfca.edu/greenhomeserver/api/action";
        
        //necessary params
        deviceId = params['device_id'] ? params['device_id'] : null;
        
        commandData_ = {'token': token, 'device_id':deviceId};

    
    return command_center_get(commandData_);
    }    
    var ourMethod = "";
    var commandData = {};

if(command == "get_bat_statuses"){
        ourURL = "https://cab.cs.usfca.edu/greenhomeserver/api/battery";
        
        //necessary params
        //device_id = params['count'] ? params['count'] : null;
        
        commandData_ = {'token': token};

        if ( params['blocksize'] != undefined && params['from'] != undefined && params['to'] != undefined ) {
            $.extend(commandData_, {'block': params['blocksize']}); 
            $.extend(commandData_, {'from': params['from']});
            $.extend(commandData_, {'to': params['to']});
        }
    
    return command_center_get(commandData_);
    }    
    var ourMethod = "";
    var commandData = {};

//COMMAND: "log_in", UPDATE THE 'userModel' WITH JSONP OBJECT RESPONSE
if(command == "log_in"){
    
    var username = params['username_'];
    var password = params['password_'];
    
    commandData_ = {'ourMethod':"POST",'url':"session", 'name' : username, 'password' : password }; 
    
    return command_center_post(commandData_);
    }
    
    var ourMethod = "";
    var commandData = {};
    
if(command == "on_off"){
    
    var act_value = params['act_value'];
    var act_id = params['act_id'];
    
    commandData_ = {'ourMethod':"POST",'url':"api/action", 'act_id' : act_id, 'act_value' : act_value, 'token': token}; 
    
    return command_center_post(commandData_);
    }   
    
    }
    
    //SUPERFICIAL DATA RESET
        this.username = "";
        this.password = "";

// END ----------------------------------------------------- API COMMANDS //