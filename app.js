var prova;
var countUno = 0;
var countDue = 0;
var countTre = 0;
var uuid = new String();

var app = (function()
{
	
	var ble = null;
	// Application object.
	var app = {};

    app.scanInterval = 5000;
	app.isScanning = false;
	app.lastScanEvent = 0;

	// Specify your beacon 128bit UUIDs here.
	var regions =
	[
		// Estimote Beacon factory UUID.
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},//blu
		// Sample UUIDs for beacons in our lab.
		{uuid:'5F4DF8FB-3EC2-60B1-DB6F-6E7013122EE0'}, //azzurro
		{uuid:'937BD9F3-5C44-971C-F389-35152A80C632'},	// verde
	];

	// Background detection.
	var notificationID = 0;
	var inBackground = false;
	document.addEventListener('pause', function() { inBackground = true });
	document.addEventListener('resume', function() { inBackground = false });

	// Dictionary of beacons.
	var beacons = {};

	// Timer that displays list of beacons.
	var updateTimer = null;

	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};

	function onDeviceReady()
	{

		// Creazione delle tabelle del db 
         db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("CREATE TABLE IF NOT EXISTS letture (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, major, minor, data_ora, proximity)");
										    tx.executeSql("CREATE TABLE IF NOT EXISTS notifiche (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                            alert("Creazione");
                                        }
         )
		 // Fine della creazione delle tabella db 

		 // Controllo se bluetooth è accesso
	     ble = evothings.ble;
		 app.startLeScan();
		 // Fine controllo bluetooth acceso


		window.locationManager = cordova.plugins.locationManager;
		// Start tracking beacons!
		startScan();

		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 500);
	}

	app.startLeScan = function()
    {
	console.log('startScan');

	app.stopLeScan();
	app.isScanning = true;
	app.lastScanEvent = new Date();
	//app.runScanTimer();

	ble.startScan(function(r)
	{
		//address, rssi, name, scanRecord
		if (app.knownDevices[r.address])
		{
			return;
		}
		app.knownDevices[r.address] = r;
		var res = r.rssi + " " + r.name + " " + r.address;
		console.log('scan result: ' + res);
		var p = document.getElementById('deviceList');
		var li = document.createElement('li');
		var $a = $("<a href=\"#connected\">" + res + "</a>");
		$(li).append($a);
		$a.bind("click",
			{address: r.address, name: r.name},
			app.eventDeviceClicked);
		//p.appendChild(li);
		$("#deviceList").listview("refresh");
	}, function(errorCode)
	{
		console.log('startScan error: ' + errorCode);
	});
};

app.stopLeScan = function()
{
	console.log('Stopping scan...');
	ble.stopScan();
	app.isScanning = false;
	clearTimeout(app.scanTimer);
};

app.runScanTimer = function()
{
	if (app.isScanning)
	{
		var timeSinceLastScan = new Date() - app.lastScanEvent;
		if (timeSinceLastScan > app.scanInterval)
		{
			if (app.scanTimer) { clearTimeout(app.scanTimer); }
			app.startLeScan(app.callbackFun);
		}
		app.scanTimer = setTimeout(app.runScanTimer, app.scanInterval);
	}
};


	function startScan()
	{
		
		// L' oggetto delegate detiene le funzioni di callback di iBeacon plugin 
		// Dichiarato di seguito.
		var delegate = new locationManager.Delegate();

		// Richiamto di continuo per cercare i Beacon nei paraggi.
		delegate.didRangeBeaconsInRegion = function(pluginResult)
		{
		
			//alert('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
            
			for (var i in pluginResult.beacons)
			{
				// Se trova il Beacon lo inserisce nella var beacon.
				// Faccio partire beep o vibrazione
				
				var beacon = pluginResult.beacons[i];
				beacon.timeStamp = Date.now();

				// key, la chiave identifica
				// Queto if permette di idetificare il Beacon a seconda della distanza
				uuid =  beacon.uuid;
				if(countUno==0 && uuid.toUpperCase()=="5F4DF8FB-3EC2-60B1-DB6F-6E7013122EE0")
				{
					
					 navigator.notification.beep(1);
        			 navigator.vibrate(3000);
					countUno++;
					// Inserisco notizie nella tabella notifche per Beacon Azzurro
					 db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a) VALUES (?,now,?,?,?,?,?,?,?)",[uuid,"Notizia Uno","Sconto su tutto","link immagine","link allegato","29-11-2016","29-12-2016"]);
                                         },
                             function()  {
                                            alert("Inserimento non  effettuato");
                                         },
                             function()  {
                                            alert("Inserimento effettuato");
                                         }
                    )
					//navigator.notification.confirm('Notizia', onConfirm,'Beacon Azzurro',['Guarda','Salva']);
				}
				if(countDue==0 && uuid.toUpperCase()=="937BD9F3-5C44-971C-F389-35152A80C632")
				{
				    
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					countDue++;
					// Inserisco notizie nella tabella notifche per Beacon Verde
					navigator.notification.confirm('Notizia', onConfirm,'Beacon Verde',['Guarda','Salva']);
				}
				if(countTre==0 && uuid.toUpperCase()=="B9407F30-F5F8-466E-AFF9-25556B57FE6D")
				{
					 navigator.notification.beep(1);
        			navigator.vibrate(3000);
					countTre++;
					// Inserisco notizie nella tabella notifche per Beacon Blu
					navigator.notification.confirm('Notizia', onConfirm,'Beacon Blu',['Guarda','Salva']);
				}
				var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
				beacons[key] = beacon;
			    // Inserisco dati ogni volta che si legge un beacon, nella tabella lettura
				
			}
			//alert("ok");
		};

		// Called when starting to monitor a region.
		// (Not used in this example, included as a reference.)
		delegate.didStartMonitoringForRegion = function(pluginResult)
		{
			//alert('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
		};

		// Called when monitoring and the state of a region changes.
		// If we are in the background, a notification is shown.
		delegate.didDetermineStateForRegion = function(pluginResult)
		{
		
			//alert('didStartMonitoringForRegion:' + JSON.stringify(pluginResult.state))
			if (inBackground)
		   	{
				// Show notification if a beacon is inside the region.
				// TODO: Add check for specific beacon(s) in your app.
				if (pluginResult.region.typeName == 'BeaconRegion' &&
					pluginResult.state == 'CLRegionStateInside')
				{
					
					cordova.plugins.notification.local.schedule(
						{
							id: ++notificationID,
							title: 'Beacon trovato',
							text: 'iBeacon Scan detected a beacon, tap here to open app.'
						});
						
				}
			}
			
		};

		// Set the delegate object to use.
		locationManager.setDelegate(delegate);

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		locationManager.requestAlwaysAuthorization();

		// Start monitoring and ranging beacons.
		for (var i in regions)
		{
			var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid);

			// Start ranging.
			locationManager.startRangingBeaconsInRegion(beaconRegion)
				.fail(console.error)
				.done();

			// Start monitoring.
			// (Not used in this example, included as a reference.)
			locationManager.startMonitoringForRegion(beaconRegion)
				.fail(console.error)
				.done();
		}
		
	}

	function onConfirm(buttonIndex) {
    //alert('You selected button ' + buttonIndex);
	if(buttonIndex==1)
	{
		//alert("Stai guardando la notizia")
		$('#pop').click();
	}else{
		//alert("Stai salvando la notizia");
		$('#popDue').click();
	}
}



	function displayBeaconList()
	{
		// Clear beacon list.
		$('#found-beacons').empty();

		var timeNow = Date.now();
		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				
				// Map the RSSI value to a width in percent for the indicator.
				var rssiWidth = 1; // Used when RSSI is zero or greater.
				if (beacon.rssi < -100) { rssiWidth = 100; }
				else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	'Proximity: ' + beacon.proximity + '<br />'
					+	'RSSI: ' + beacon.rssi + '<br />'
					+	'Precisione: ' + beacon.accuracy + '<br />'
					+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
					+ 		rssiWidth + '%;"></div>'
					+ '</li>'
				);
                $('.noBeacon').remove();
				//$('#warning').remove();
				//$('#found-beacons').append(element);
			}
		});
	}
  
	return app;
})();

app.initialize();
 