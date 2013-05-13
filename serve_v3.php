<?php
//USER SANITIZATION
function cleanUserInput($input) {
	//this function sanitizes user input for mysql security reasons
    
	$input = htmlentities($input);
	return $input;
}

//THIS IS GENERALIZED PROXY CODE for handling POSTs to the server

$firstArray = array();

$arrayCounter = 0;

$keyArray = array();

$valueArray = array();

// THE FIRST TWO VALUES IN THE REQUEST ARRAY ARE RESERVED FOR
//1.) THE URL EXTENSION ex. "session" or "api/devices"
//2.) THE METHOD TYPE -- now only supporting post, but this remains

foreach($_REQUEST as $key => $value) {
    if($arrayCounter != 0 and $arrayCounter != 1) {        //the first key value pair is reserved for url key:value and method type
 	array_push($keyArray, cleanUserInput($key));
        array_push($valueArray, cleanUserInput($value));
    }
        $arrayCounter++;
	}

//combining the key and value arrays to form query        
$httpQarray = array_combine($keyArray, $valueArray);

if ($_REQUEST['ourMethod'] == 'POST') {
$postdata = http_build_query( $httpQarray );
$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => array("Cache-Control: no-cache, must-revalidate", 
                           "Content-type: application/x-www-form-urlencoded" 
                           ),
        'content' => $postdata
    )
);

$context  = stream_context_create($opts);
} else {
    $postdata = http_build_query( $httpQarray );
$opts = array('http' =>
    array(
        'method'  => 'GET',
        'header'  => array("Cache-Control: no-cache, must-revalidate"

                           ),
        'content' => $postdata
    )
);
$context  = stream_context_create($opts);
    
}


//BUILD POST URL
$ourURL = 'https://cab.cs.usfca.edu/greenhomeserver/' . $_REQUEST['url'];


$result = file_get_contents($ourURL, false, $context);

echo json_encode($result);
?>
