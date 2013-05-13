function command_center_post(commandData) {
	return $.ajax({
		type: 'POST',
		url: 'serve_v3.php',
		cache: false,
		async: true,
		data: commandData,
		dataType: 'json',
		success: function (jsonData_) {
			passTo_sd = $.parseJSON(jsonData_);
			return passTo_sd;
		},
		error: function () {
			return false;
		}
	});
}

function command_center_get(commandData, url) {
	return $.ajax({
		type: 'GET',
		url: url,
		cache: false,
		data: commandData,
		dataType: 'jsonp',
		async: true,
		success: function (jsonData_) {
			return jsonData_;
		},
		error: function () {
			return false;
		}
	});
}


function command_center(command, params) {
	// get session cookie, most commands need this
	token = $.cookie('session');
	
	//COMMAND: "get_dev_statuses", add devices statuses to each device
	if (command == "get_dev_statuses") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/status";

		// set up parameters
		commandData_ = {
			'token': token
		};
		
		// attach all necessary parameters from params
		params['deviceId'] ? $.extend(commandData_, {'device_id': params['deviceId']}) : null;
		
		params['blocksize'] ? $.extend(commandData_, {'scale': params['blocksize']}) : null;
		params['from'] ? $.extend(commandData_, {'from': params['from']}) : null;
		params['to'] ? $.extend(commandData_, {'to': params['to']}) : null;

		params['ascending'] ? $.extend(commandData_, {'ascending': params['ascending']}) : null;
		params['filter'] ? $.extend(commandData_, {'filter': params['filter']}) : null;
		params['rounding'] ? $.extend(commandData_, {'rounding': params['rounding']}) : null;

		//deprecated
		params['count'] ? $.extend(commandData_, {'count': params['count']}) : null;

		// return response
		return command_center_get(commandData_, cmdURL);
	}

	//COMMAND: "get_dev_statuses", add devices statuses to each device
	if (command == "get_energy_statuses") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/energyconsumption";

		commandData_ = {
			'token': token,
			'device_id': params['deviceId']
		};

		// attach extra params
		params['blocksize'] ? $.extend(commandData_, {'block': params['blocksize']}) : null;
		params['from'] ? $.extend(commandData_, {'from': params['from']}) : null;
		params['to'] ? $.extend(commandData_, {'to': params['to']}) : null;

		return command_center_get(commandData_, cmdURL);
	}

	//COMMAND: "device_list"
	if (command == "device_list") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/device";

		commandData_ = {
			'token': token
		};

		return command_center_get(commandData_, cmdURL);

	}

	//COMMAND: "get_dev_actions"
	if (command == "get_dev_actions") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/action";

		commandData_ = {
			'token': token,
			'device_id': params['device_id']
		};

		return command_center_get(commandData_, cmdURL);
	}

	//COMMAND: "get_bat_statuses"
	if (command == "get_bat_statuses") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/battery";

		commandData_ = {
			'token': token
		};

		if (params['blocksize'] != undefined && params['from'] != undefined && params['to'] != undefined) {
			$.extend(commandData_, {'block': params['blocksize']});
			$.extend(commandData_, {'from': params['from']});
			$.extend(commandData_, {'to': params['to']});
		}

		return command_center_get(commandData_, cmdURL);
	}

	//COMMAND: "log_in", UPDATE THE 'userModel' WITH JSONP OBJECT RESPONSE
	if (command == "log_in") {
		
		commandData_ = {
			'ourMethod': "POST",
			'url': "session",
			'name': params['username_'],
			'password': params['password_']
		};

		return command_center_post(commandData_);
	}

	//COMMAND: "on_off"
	if (command == "on_off") {

		commandData_ = {
			'ourMethod': "POST",
			'url': "api/action",
			'act_id': params['act_id'],
			'act_value': params['act_value'],
			'token': token
		};

		return command_center_post(commandData_);
	}

	//COMMAND: "activity"
	if (command == "activity") {

		commandData_ = {
			'ourMethod': "POST",
			'url': "api/activity",
			'token': token
		};
		params['new'] ? $.extend(commandData_, {'new': params['new']}) : null;
		params['activity'] ? $.extend(commandData_, {'activity': params['activity']}) : null;
		params['timestamp'] ? $.extend(commandData_, {'timestamp': params['timestamp']}) : null;

		return command_center_post(commandData_);
	}

	if (command == "activity_get") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/activity";
		commandData_ = {
			'token': token
		};

		return command_center_get(commandData_, cmdURL);
	}

	if (command == "activity_time") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/activity";
		commandData_ = {
			'token': token,
			'from': params['from'],
			'to': params['to']
		};

		return command_center_get(commandData_, cmdURL);
	}
	
	if (command == "anomaly") {
		cmdURL = "https://cab.cs.usfca.edu/greenhomeserver/api/anomalies";
		commandData_ = {
			'token': token,
			'from': params['from'],
			'to': params['to']
		};
		
		return command_center_get(commandData_, cmdURL);
	}
}
