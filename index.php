<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso'-8859-1" />
		<title>Greenhome Webapp</title>
		<link type="text/css" href="../../assets/css/custom-theme/jquery-ui-1.8.20.custom.css" rel="stylesheet" />
		<link type="text/css" href="Dcss.css" rel="stylesheet" />
		<script type="text/javascript" src="../../assets/js/jquery-1.7.2.min.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery-ui-1.8.20.custom.min.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery.watermark.js"></script>
		
		<script type="text/javascript" src="BrowserSupport.js"></script>
		
		<!--<script type="text/css" src="../../assets/css/progress_style.css"></script>-->
                
		<script type="text/javascript">
		
			//If Ajax is in progress, prevent user from clicking ui directly
			$("body").on({
			ajaxStart: function() {
				console.log('heard the event');
			$(this).addClass("loading"); 
			},
			ajaxStop: function() { 
			  $(this).removeClass("loading");
			  console.log('heard the event');
			}    
			});
		
		</script>
		<style type="text/css">
		
		
		</style>	
	</head>
	<body>
            
        <!--CONTAINER ELEMENT-->
	    
		<!-- Floating Curtain Icon -->
		<div id="toggle_curtains_icon" style="position: absolute; left: 6px; top: 450px; opacity: .5;  z-index:16; width: 20px; height: 20px;" ><img  alt="Toggle side curtains" src="../../assets/img/toggle_curtains_icon.png" /></div>
	    
		<div class="fullContainer">		
	    
	    
		<div class="appContainer">
                
			<!-- /* GHOST forward/back panels */ -->
			<div  style="position: absolute; top: 81px; z-index: 1; left: 1015px;">
			<img id="ghost-right" style="z-index:1;"  alt="Toggle side curtains" src="../../assets/img/right-ghost-up.png" />
			</div>

			<!-- /* GHOST forward/back panels */ -->
			<div  style="position: absolute; top: 81px; z-index: 1; left: -75px; ">
			<img id="ghost-left" style="z-index:1;"  alt="Toggle side curtains" src="../../assets/img/left-ghost-up.png" />
			</div>
		
	    <!-- LOADING SCREEN	-->
		
		<div class="loadingTop"> <img src="../../assets/img/loader-thin5.gif" /> </div>
		
	    <!-- CURTAIN LEFT -->
		<div id="curtainLeft"> 
		<div id="curtainLeft-InnerRight"> </div>

		
		<div id="curtainLeft-InnerLeft"><!--<a id="curtainArrowLeft"> </a> --></div>
		</div>
		
	    <!-- CURTAIN RIGHT -->
		<div id="curtainRight">
		<div id="curtainRight-InnerRight"> </div>	
		<div id="curtainRight-InnerLeft"> <!--<a id="curtainArrowRight"> </a> --></div>
			
		</div>
		
	    <!--LOG IN HTML-->
		<div id="top_bar">
                <div class="login_box">
                    <input type="text" id="nameLogin" />
                    <input type="password" id="passwordLogin" />
                    <img id="imgLogin" src="../../assets/images/greenbutton-in2.png" alt="Log-in" />
		    <!--<span id="tempButton">Temp Button</span><br>
		    <span id="tempButton">Temp Button 2</span>	-->
			
		    <img style="position: absolute;" id="imgLogout" src="../../assets/images/greenbutton-out2.png" alt="Log-out" />
			
                </div>
		</div>
		
		


	    <!--PANELS-->
		
		<div class="panelsContainer"> </div>

		
            <!--SIDEBAR ELEMENTS-->
		
                <div id="sidebar">
			<img id="top_sidebar" src="../../assets/images/sidebar_top_opaque.png" />
		
			
		
		<!--DEVICES, OPTIONs PANEL-->
			<div id="sidebarContainer">
				
		     <!-- CUSTOM GRAPH - aka "All Devices" -->
			<div id="customGraphView">
				<div id="customGraphRange">
				</div>
			</div>

			<div id="customGraphOptions"> <!-- NOTE - if you need to add another div, do so also in Panel View -->
				
				<!--<div id="customGraphOptions-powerDraw"></div>-->
				
				<div id="customGraphOptions-energyConsumption"></div>
			</div>
			
		     <!-- Insights Panel!  :D -->
			<div id="insightsView">
			<div id="insightsRange">

			Select Primary Device: <div id="statsDevice"></div>
				<div id="insightsStats">
				<br>
					<div style="padding-bottom: 8px;">
				Highest kWh Day: <br>
					&nbsp;&nbsp;&nbsp;<span class="blue-padded" id="DayPeakString"></span><br>
					&nbsp;&nbsp;&nbsp;kWh of: <span id="PeakValueString"></span><br>
					</div>
					<div style="padding-bottom: 8px;">
				Lowest kWh Day:<br>
					&nbsp;&nbsp;&nbsp;<span class="blue-padded" style="padding-bottom: 0px;" id="DayLowString"></span><br>
					&nbsp;&nbsp;&nbsp;kWh of: <span class="blue-padded" id="LowValueString"></span><br>
					</div>
					<div style="padding-bottom: 8px;">
				Average daily energy <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;consumption: <br>
					&nbsp;&nbsp;&nbsp;kWh of: <span class="blue-padded" id="AvgValueString"></span><br>
					</div>
					<div style="padding-bottom: 8px;">
				Median daily energy<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;consumption:<br>
					&nbsp;&nbsp;&nbsp;kWh of: <span class="blue-padded" id="MedianValueString"></span>
					</div>
					<br><span style="font-size: .8em">&nbsp;&nbsp;&nbsp;&nbsp;(Data from Last 2 Weeks)</span>
				<div class="updatingalert"><div class="ui-state-highlight ui-corner-all" style="margin: 3px;"><span id="updatingstats"> </span></div></div>
				<br><br> <div> </div>
				</div>
			</div>
			</div>
			
			
		   <div id="sidebarViewContainer"></div>
			

			</div>

			
			<img id="bot_sidebar" src="../../assets/images/sidebar_bot_opaque.png" />
		</div>
		
			
		<div id="bot_widgets_cover">
				 
			</div>
				
	    <!-- HOME DATA -- BOTTOM WIDGET AREA -->
                <div id="bot_widgets">
			
			<!-- Stats, Home and Battery HTML-->
			<div id="homeDataView">
				
				<div id="home-container">
					
				<div id="controls-background"></div>
				<div id="home-controls-box" class="selected-controls lightbox">
				  <div class="inner-content">
					House Energy Consumed, in kWh
					<br /> Last 24 hrs: <span id="totalEnergySpec"></span>kWh
					<br />
					<div style='text-align: center;width:100%;'>
					<span id="home-controls-alert">Displaying 24 hours of statuses</span>
					</div>

				  </div>
				</div>
				<div id="battery-controls-box" class="unselected-controls lightbox">
				  <div class="inner-content">
					Battery % Charged -- <span id="chargingBool"></span><br/>
					Charge: <span id="chargingPercentage"></span>%
					<div style="width: 155px; float: right; position: relative; top: 3px;">
						<div class="meter">
						<span style="width: 0%"></span>
					</div>
					</div>
					<br />
					
					<div style='text-align: center;width:100%;'>
					<span id="battery-controls-alert">Displaying most recent statuses</span>
					</div>
					<!--
					<span class="battery-radio-range">
					    <input type="radio" id="battery_one_day" name="radio2" checked="checked" /><label for="battery_one_day_input">24 Hrs</label>
					    <input type="radio" id="battery_three_days" name="radio2"  /><label for="battery_three_days_input">3 Days</label>
					    <input type="radio" id="battery_seven_days" name="radio2" /><label for="battery_seven_days_input">7 Days</label>
		    			</span>
					-->
				  </div>
				</div>
				<div class="graphs-bottom" id="home-graph">
					<br />
					Requesting statuses...
				</div>
				<div class="graphs-bottom" id="battery-graph">
				</div>
				</div>
			</div>

			
			<!-- STAT OPERATIONS CONSOLE -->
			<div id="statsDataView">
				<div id="insights-container"> <div id="stats-background"></div>
					<div id="cross-correlation-box" class="lightbox selected-controls">
					  <div class="inner-content">
							
						<div id="cross_correlation">
							Cross Correlation: <br>
							<div style="position: relative; top: 11px;">Compare to device: <span id="device_compare_select"></span></div> <br>
							<div style="position:relative; bottom: 6px;"> For period: <span id="cross_period_select">
								<select name="crossRange" id="cross_period_selector" >
									<option range='24hours'>Last 24 hours</option>
									<option range='7days'>Last 7 Days</option>
									<option range='30days'>Last 30 Days</option>
									<option range='custom'>- custom range -</option>
								</select>	
							</span>
							<button id="date_selector_cross" style="position: relative; top:8px;"><span class="ui-icon ui-icon-calendar"></span></button></div>
							<div style="position: relative; left:18px;" id='cross-custom-range-display'></div>
							
							Lag Interval (min)<input id="cross-suggested-blocksize" size="4"></input><br>
							<button style="position: relative; top: 6px;" id="resubmitCrossCor" value="GraphCorrelation">Re-Graph Correlation</button> <button style="position: relative; top: 6px;" id="CrossCorReveal">View Compared Series</button>
							
						
						<div class="date_dialog" id='cross-date-dialog' title="Set Range">
							From Date: <input type="text" id="FROMdateCross" size="30"/><br>
							To Date: <input type="text" id="TOdateCross" size="30"/><br>
							<input id="date_submit_cross" type="button" value="Set Range" />
						</div>
						<div id='comparedSeriesDialog' title="(Compared) Device Time Series">
							<div id="time_series_name1" style="position:absolute; top: 20px; left: 20px;"> </div>
							<div id="time_series_graph1" style="position:absolute; top: 50px; left: 20px; width:420px; height:425px;" > </div>
							<div id="time_series_name2" style="position:absolute; top: 20px; left: 485px;"> </div>
							<div id="time_series_graph2" style="position:absolute; top: 50px; left: 485px; width:420px; height:425px;" > </div>
							<div id="pleaseNote" style="width:840px; left: 25px; position:absolute; top: 485px;">Please Note: The correlation range compares the inner one-half of both time series.  (To compare the data in the first and last quarters, increase the range.)</div>
						</div>
						<!--comparedSeriesDialog -->
							
					  </div>
					</div>
					</div>
					<div id="auto-correlation-box" class="lightbox unselected-controls">
					  <div class="inner-content">
						<div id="auto_correlation">
						  
							Auto Correlation: <br>
							For period: <span id="auto_period_select">
								<select name="autoRange" id="auto_period_selector" >
									<option range='24hours'>Last 24 hours</option>
									<option range='7days'>Last 7 Days</option>
									<option range='30days'>Last 30 Days</option>
									<option range='custom'>- custom range -</option>
								</select>	
							</span>
							<button id="date_selector_auto" style="position: relative; top:8px;"><span class="ui-icon ui-icon-calendar"></span></button>
							<div style="position: relative; left:18px;" id='auto-custom-range-display'></div>
							<br>
							Lag Interval (min)<input id="auto-suggested-blocksize" size="4"></input><br><br>
							<button id="resubmitAutoCor" value="GraphCorrelation">Graph Correlation</button> <button id="AutoCorReveal">View Original Series</button>
							
						
							<div class="date_dialog" id='auto-date-dialog' title="Set Range">
								From Date: <input type="text" id="FROMdateAuto" size="30"/><br>
								To Date: <input type="text" id="TOdateAuto" size="30"/><br>
								<input id="date_submit_auto" type="button" value="Set Range" />
							</div>
							<div id='Auto-comparedSeriesDialog' title="(Compared) Device Time Series">
								<div id="Auto-time_series_name1" style="position:absolute; top: 20px; left: 230px;"> </div>
								<div id="Auto-time_series_graph1" style="position:absolute; top: 50px; left: 230px; width:420px; height:425px;" > </div>
								
								<div id="pleaseNote" style="width:840px; left: 25px; position:absolute; top: 485px;">Please Note: The correlation range compares the inner one-half of both time series.  (To compare the data in the first and last quarters, increase the range.)</div>
							</div>
						
					  </div>
					</div>
					</div>
				
			
			</div>
			<div id="choices"> </div>
			
		</div>
		
		<!-- BACKGROUND ASSETS -->
		<div class="ajaxLoadingMask"><!-- Place at bottom of page --></div>
            </div>
	</div>
            
            <!--BACKGROUND IMAGES WITH ABSOLUTE POSITIONING-->
            <div id="back_top"> </div>
            <div id="back_mid"> </div>
            <div id="back_bot"> </div>
            
	    <div id="test_bot" style="position:absolute; bottom: 60px; left: 200px;">  </div>
        
	<!-- TEMPLATES -->
		<!--SIDEBAR-->


		<script type="text/template" id="sidebar-tab-template">
				<form <% print('id="controls-' + id + '">'); %>
					<input id="valueOff" type="radio" name="onOff" value="off" <% if (!onBool) { %> checked="checked"<% } %> /> Off<br />
					<input id="valueOn" type="radio" name="onOff" value="on" <% if (onBool) { %> checked="checked"<% } %>/> On
				</form>
		</script>
		
		<script type="text/template" id="custom-graph-options-template">
				<% print("<span id='change_graph_to_"+ dataType +"' title='"+ dataType + "'>All Devices, " + unitType + '</span>'); %> 
				<% print('<div id="customGraphOptions-'+ dataType +'"></div><br>'); %>
					 
					Set Custom Range &nbsp;&nbsp;<button id="all_devices_date_selector" style="position: relative; top: 7px;">
						<span class="ui-icon ui-icon-calendar"> </span> 
					</button>
				<br><br>
					Refresh Graph &nbsp;&nbsp;<button style="z-index: 20; position: relative; top: 7px;"  id="refresh">
						<span class="ui-icon ui-icon-refresh"> </span> 
					</button>
					
				<br>
				<br><span style="font-size: .8em">&nbsp;&nbsp;&nbsp;&nbsp;(Drag graph to zoom)</span>
				
				<% print('<label id="selection"></label><br>'); %>
				<div class="date_dialog" id="all-devices-date-dialog" title="Set Range">
						From Date: <input type="text" id="datepickerFROM" size="30"/><br>
						To Date: <input type="text" id="datepickerTO" size="30"/><br>
				<input id="submitDates" type="button" value="Submit Dates" />
				</div>
				
		</script>
		
		<script type="text/template" id="annotation-dialog-template">
			<div class="annotation_dialog" id="annotation-dialog" title="Select an Activity" style="visibility: hidden;">
				<div style="width:200px; float:left">
					<p>Please select an activity for </p>
					<div id="annotation-timestamp" style="height:50px;"></div>
					<select id="annotation-selectbox">
						<option id="annotation-entertainment">Entertainment</option>
						<option id="annotation-cooking">Cooking</option>
						<option id="annotation-chores">Chores</option>
						<option id="annotation-work">Work</option>
						<option id="annotation-other">Other</option>
					</select><br>
					<input type="text" id="annotation-text"/><br>
					<input type="button" id="annotation-submit" value="Submit"/>
				</div>
				<div style="width:200px; float:right">
					<p>Previously logged activities:</p>
					<select id="annotation-list" size=10 style="width:200px">
					</select>
				</div>
				<div id="annotation-loading" class="ui-widget ui-widget-content ui-corner-all">
					<img style="margin: auto; padding: 20px;" src="../assets/images/ajax-loader.gif" alt="loading..." width=64 height=64>
					<p>Please wait...</p>
				</div>
			</div>
		</script>	

		<!--
				<br />
				<button class="toggle_curtains_button"> Toggle Curtains </button>
				<br />
				<button class="toggle_curtains_button" style="position: relative; right:3px;"> Toggle Curtains</button>
		-->
			
		<script type="text/template" id="sidebar-accordion-template">
			<div id="accordion"></div>
			
			<div class="panel_buttons">
			   <div class="DeviceCenterButtons">
				
				<button class="insights_button"> Energy Insights </button>
				<br />
				<button class="custom_graph_button"> All Devices </button>
				<br />
				<button id="panel_back"> <<&nbsp; </button> <button class="starter_button" id="starter_small"> Home </button> <button id="panel_forward"> >>&nbsp; </button>
				
			   </div>
			   <div class="CustomGraphButtons">
			   	
				<button class="insights_button"> Energy Insights </button>
				<br />
				<button class="device_center_button"> Device Controls </button>
				<br />
				<button class="starter_button"> Return Home </button>
			   </div>
			   <div class="OnloadButtons">
				
			   </div>
			   <div class="ReturnHomeButtons">
				
				<button class="insights_button"> Energy Insights </button>
				<br />
				<button class="custom_graph_button"> All Devices </button>
				<br />
				<button class="device_center_button" style="position: relative; right:3px; bottom: 2px; margin-top: 8px;"> Device Controls </button>
				
			   </div>
			   <div class="InsightsButtons">
				
				<button class="custom_graph_button"> All Devices </button>
				<br />
				<button class="device_center_button"> Device Controls </button>
				<br />
				<button class="starter_button"> Return Home </button>
			   </div>
			   
			</div>
			
		
		</script>
		
		<!--PANEL-->
		<script type="text/template" id="panel-template">
		
			<div class="outer">
			    <div class="tm" >
				<div class="tl"></div>
				<div class="tr"></div>
			    </div>
			    <div class="ml">
				<div class="mr">
				    <div class="inner">
						
					<div class='panelAttributes' id=<% print('"' + deviceId + '"'); %>>
					   
					   
					   
					     <div id="panelbar-left">
					     <div id="inPanelbar_int-left">
					     <span id="inPanelbar-left">
						<% print(deviceName + " - " + panelType + " "); %>
						</span>
						</div>
					     </div>
						
					<!--////JQUERY BUTTONS FOR RANGE SELECTION-->
					     <div id="panelbar-right">
						<span style='vertical-align: middle;' class=<% print('"radio-range"'); %>>     
							<input type="radio" id=<% print('"' + deviceId + panelType + 'one_day"'); %> name="radio" checked="checked" /><label for=<% print('"' + deviceId + panelType + 'one_day"'); %>>24 Hours</label>
							<input type="radio" id=<% print('"' + deviceId + panelType + 'three_days"'); %> name="radio" /><label for=<% print('"' + deviceId + panelType + 'three_days"'); %>>3 Days</label>
							<input type="radio" id=<% print('"' + deviceId + panelType + 'seven_days"'); %> name="radio" /><label for=<% print('"' + deviceId + panelType + 'seven_days"'); %>>7 Days</label>
						</span>
					     </div>
					<!--/// REFRESH AND DATE RANGE SELECTION  (only supported for energy Consumption) -->
					   
					<% if (panelType == "energyConsumption") { %> 
					   <button style="z-index: 20;" class="refresh" id=<% print('"refresh' + deviceId + panelType + '"'); %>>
						<span class="ui-icon ui-icon-refresh"></span>
					   </button>
					   
					   <button class="date_selector" id=<% print('"date_selector' + deviceId + panelType + '"'); %>>
						<span class="ui-icon ui-icon-calendar"></span>
					   </button>
					   
					   <div class="date_dialog" id=<% print('"date_dialog' + deviceId + panelType + '"'); %> title="Date Selection">
					
						From Date: <input type="text" id=<% print('"FROMdate' + deviceId + panelType + '"'); %> size="30"/><br>
						To Date: <input type="text" id=<% print('"TOdate' + deviceId + panelType + '"'); %> size="30"/><br>
						<input id=<% print('"date_submit' + deviceId + panelType + '"'); %> type="button" value="Submit Dates" />
						</div>
					<% } %>   
					   
					   
					</div>
					
					<!-- // GRAPH DIVS -->
						<div class=<% print('"' + panelType + ' yAxisLabel"'); %> id=<% print('"' + deviceId + 'yLabel"'); %>> </div>
						<div class=<% print('"' + panelType + '"'); %> style="width:84%;  height:290px; position: absolute; right: 18px; bottom: 8px;" id=<% print('"' + deviceId + 'graph"'); %>></div>
						
				     </div>
					
					
				    
				</div>
				
			    </div>
			    
			    <div class="bm" >
				<div class="bl"></div>
				<div class="br"></div>
			    </div>
			</div>			
			
		</script>
		

		<script type="text/template" id="starter-panel-template">
		    <div class='panelAttributes'> <div id="starterPanelOuter">  <!--/* This craziness is to allow the necessary positioning to occur*/-->
			<div class="outer">
			    <div class="tm" >
				<div class="tl"></div>
				<div class="tr"></div>
			    </div>
			    <div class="ml">
				<div class="mr">
				    <div class="inner">
						
						<div  id="starterPanelInner">
						<iframe src="StartPage.html" frameBorder="0" id="starterPanelIframe">
						
						</iframe>
						</div>
					
					
				    </div>
				</div>
			    </div>
			    <div class="bm" >
				<div class="bl"></div>
				<div class="br"></div>
			    </div>
			</div>
		     </div></div>
		</script>

		<script type="text/template" id="custom-graph-panel-template">
		    <div class='panelAttributes'> <div id="customGraphPanelOuter">  <!--/* This craziness is to allow the necessary positioning to occur*/-->
			<div class="outer">
			    <div class="tm" >
				<div class="tl"></div>
				<div class="tr"></div>
			    </div>
			    <div class="ml">
				<div class="mr">
				    <div class="inner">
						<div  id="customGraphPanelInner">
							<!--<div id="customGraph-powerDraw" style="z-index: 10;"> </div> -->
							<div id="customGraph-yAxisLabel" class="yAxisLabel" style="z-index: 15; top: 175px;">kWh</div>
							<div id="customGraph-energyConsumption"> </div>
						</div>
				    </div>
				</div>
			    </div>
			    <div class="bm" >
				<div class="bl"></div>
				<div class="br"></div>
			    </div>
			</div>
		     </div></div>
		</script>		

		<script type="text/template" id="insights-panel-template">
		    <div class='panelAttributes'> <div id="insightsPanelOuter">  <!--/* This craziness is to allow the necessary positioning to occur*/-->
			<div class="outer">
			    <div class="tm" >
				<div class="tl"></div>
				<div class="tr"></div>
			    </div>
			    <div class="ml">
				<div class="mr">
				    <div class="inner">
						<div  id="insightsPanelInner">
						
							<div id="statsInsightsGraph">  </div>
						
						</div>
				    </div>
				</div>
			    </div>
			    <div class="bm" >
				<div class="bl"></div>
				<div class="br"></div>
			    </div>
			</div>
		     </div></div>
		</script>		
		
		<!-- HOME DATA VIEW -->
	
		
		<script type="text/template" id="battery-level">

		</script>
		
		
		<span class="panelAttributes"> </span>  <!-- FOR ACCESSING PANEL WIDTH FROM JS-->
			<!--
			<div id="custom_one_day"></div>
			<div id="custom_three_days"></div>
			<div id="custom_seven_days"></div>
			-->
                <!--ADD FINAL DEPENDENCIES-->
		
		<script type="text/javascript" src="../../assets/js/flot/excanvas.min.js"></script>
		
		<script type="text/javascript" src="../../assets/js/jquery.flot.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery.flot.regions.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery.flot.stack.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery.flot.selection.js"></script>
		<script type="text/javascript" src="../../assets/js/jquery.flot.time.js"></script>
		
        	<script type="text/javascript" src="../../assets/js/underscore-min.js"></script>
		<script type="text/javascript" src="../../assets/js/backbone5-8-12.js"></script>
		<script type="text/javascript" src="../../assets/js/backbone.localStorage.js"></script>
		
		<script type="text/javascript" src="../../assets/js/DateParser.js" charset="utf-8"></script>
		
                <script type="text/javascript" src="../../assets/js/jquery.cookie.js"></script>
                
		
                <script type="text/javascript" src="Panel_Views.js"></script>
		<script type="text/javascript" src="getAssembler.js"></script>
		<script type="text/javascript" src="HomeDataView.js"></script>
		<script type="text/javascript" src="StatsView.js"></script>
		<script type="text/javascript" src="CurtainView.js"></script>
		
		<script type="text/javascript" src="ApiCommands.js"></script>
		
		<script type="text/javascript" src="Devices_Statuses_Models.js"></script>
                <script type="text/javascript" src="Sidebar_Views.js"></script>
		<script type="text/javascript" src="userModel.js"></script>
		
		<script type="text/javascript" src="SessionView.js"></script>
            	<script type="text/javascript" src="appView.js"></script>
                
		<script type="text/javascript">
		
		$(function () {
		
		//<!-- Links the curtain icon to the toggling event -->
		$('#toggle_curtains_icon').on('click', function curtain_call(){
					userAppModel.trigger('toggle_curtains_event');
				});
			    });
		
		
			
		

		</script>
		
	</body>
</html>
