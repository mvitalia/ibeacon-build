var prova;
var countUno = 0;
var countDue = 0;
var countTre = 0;
var uuid = new String();
//sessionStorage.getItem('id');
var app = (function()
{

	var ble = null;
	// Application object.
	var app = {};

    app.scanInterval = 5000;
	app.isScanning = false;
	app.lastScanEvent = 0;
    
	

	// Tabella dei beacon da rilevare 

	// Specify your beacon 128bit UUIDs here.
	/*var regions =
	[
		// Estimote Beacon factory UUID.
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},//blu
		// Sample UUIDs for beacons in our lab.
		{uuid:'5F4DF8FB-3EC2-60B1-DB6F-6E7013122EE0'}, //azzurro
		{uuid:'937BD9F3-5C44-971C-F389-35152A80C632'},	// verde
	];*/
	/* Per Beacon in dinamico */ 
     var regions = [];
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

	function checkInternet() 
 {
    
     var online = window.navigator.onLine;
            if (online) {
                return true;
            } else {
                return false;
            }
  }

	function onDeviceReady()
	{
		alert("Ondevice");
		// Per il login anche dopo la chiusura dell' applicazione, la prima volta'
		if(localStorage.getItem('login')==null)
		{
			  localStorage.setItem('login', false);
		}
       
	
		// Creazione delle tabelle del db 
         db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								             //  tx.executeSql("DROP TABLE IF EXISTS letture");
								            //   tx.executeSql("DROP TABLE IF EXISTS notifiche");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS letture (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, major, minor, data_ora, proximity, data_ora_lettura, nome_beacon)");
									           tx.executeSql("CREATE TABLE IF NOT EXISTS notifiche (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, data_ora datetime, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                          //  alert("Creazione");
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


   function selezionaBeacon ()
   {
	     db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         db.transaction(selezione,successoSelezione);     
   }

   function selezione(tx)
   {
       tx.executeSql("SELECT * FROM dispositivi ORDER BY id ASC",[], successoSelezione,erroreSelezione);        
   }

   function erroreSelezione ()
   {
	   alert("Errore selezione");
   }

   function successoSelezione(tx,dati)
   {
    var len = dati.rows.length;
    alert(len);
        var li_dati="";
        if(len!=0)
        {
            
             for(var i=0; i<len; i++)
            {
				alert("ok");
				regions.push({
					uuid: dati.rows.item(i).uuid
				});
				alert(regions[i].uuid);
				

			
				//alert(dati.rows.item(i).uuid);
				// Popolare la var region
				
              /*  var data = dati.rows.item(i).data_ora;
                var splitarray = new Array();
                splitarray = data.split(" ");
                var dataDue = splitarray[0];
                var arrayData = new Array ();
                arrayData = dataDue.split("-");
                var dataCorretta = arrayData[2] + "-" + arrayData[1] + "-" + arrayData[0] + " " + splitarray[1];
               // alert(dataCorretta);
                li_dati += "<li id="+dati.rows.item(i).id+" data-itemid="+dati.rows.item(i).id+"><a class='storage' href='#'><img src='"+dati.rows.item(i).uuid+"'/><h6 style='font-size:12px;'>" + dati.rows.item(i).titolo + "</h6><p style='text-align:left !important;'>Data: " + dataCorretta + "</p>"
                        +"<p style='font-size:10px; text-align:left !important;'>Descrizione: "+dati.rows.item(i).descrizione+"</p></a></li>"*/
            
            }
		
            
        }
      
    }

	function startScan()
	{
			alert("StartScan");
			 /* Creazione della tabella Beacon e notifiche se c'è o non c'è internet */
		  var connessione = checkInternet();
		  alert(connessione);
		  if(connessione==true){
              // Creazione delle tabelle del db 
         		db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         		db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								             //  tx.executeSql("DROP TABLE IF EXISTS letture");
								               tx.executeSql("DROP TABLE IF EXISTS dispositivi ");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS dispositivi (id INTEGER PRIMARY KEY AUTOINCREMENT,identificativo,uuid, major, minor, nome, stato)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                            alert("Creazione");
                                        }
         						)
		 // Fine della creazione delle tabella db 
		 // Prelevo dati dal server e salvo nel db
		  $.getJSON("http://89.36.209.130/scan_dispositivi/webservices/sync_dispositivi.aspx", function (dati) {
                    var li_dati = "";
                    $.each(dati, function (i, name) {
                        // Inserisco dati nel db sqllite dell' App
                       db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO dispositivi (identificativo,uuid, major, minor, nome, stato) VALUES (?,?,?,?,?,?)",[name.ID,name.UUID,name.major,name.minor,name.nome,name.stato]);
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                            alert("Inserimento effettuato");
                                         }
                    )
                    });
                      selezionaBeacon ();
					  				  for (var i in regions)
		{
			alert("Partenza regions");
			alert(regions[i].uuid);
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
		              
                });
		  }else{
			  //Seleziono beacon e notifiche da db interno app
		  }
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
					alert("Uno");
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					countUno++;
					// Creazione data ora, per db sul server 
					var date;
    				date = new Date();
    				date = date.getUTCFullYear() + '-' +
            		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getUTCDate()).slice(-2) + ' ' +
            		('00' + date.getUTCHours()).slice(-2) + ':' +
            		('00' + date.getUTCMinutes()).slice(-2) + ':' +
            		('00' + date.getUTCSeconds()).slice(-2);  
					// Fine creazione data_ora

					// Inserisco notizie nella tabella notifche per Beacon Azzurro 
					 db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a) VALUES (?,?,?,?,?,?,?,?,?)",[uuid,date,"Notizia Uno","Sconto su tutto","link immagine","link","link allegato","29-11-2016","29-12-2016"]);
                                         },
                             function()  {
                                            alert("Inserimento non  effettuato"+e.message);
                                         },
                             function()  {
                                          //  alert("Inserimento effettuato");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 	
				}
				if(countDue==0 && uuid.toUpperCase()=="937BD9F3-5C44-971C-F389-35152A80C632")
				{
				    alert("Due");
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					countDue++;
					// Creazione data ora, per db sul server 
					var date;
    				date = new Date();
    				date = date.getUTCFullYear() + '-' +
            		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getUTCDate()).slice(-2) + ' ' +
            		('00' + date.getUTCHours()).slice(-2) + ':' +
            		('00' + date.getUTCMinutes()).slice(-2) + ':' +
            		('00' + date.getUTCSeconds()).slice(-2);  
					// Fine creazione data_ora

					// Inserisco notizie nella tabella notifche per Beacon Azzurro 
					 db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a) VALUES (?,?,?,?,?,?,?,?,?)",[uuid,date,"Notizia Due","Offerta Pane","link immagine","link","link allegato","29-11-2016","29-11-2017"]);
                                         },
                             function()  {
                                            alert("Inserimento non  effettuato"+e.message);
                                         },
                             function()  {
                                          //  alert("Inserimento effettuato");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 
				}
				if(countTre==0 && uuid.toUpperCase()=="B9407F30-F5F8-466E-AFF9-25556B57FE6D")
				{
					alert("Tre");
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					countTre++;
					var date;
    				date = new Date();
    				date = date.getUTCFullYear() + '-' +
            		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getUTCDate()).slice(-2) + ' ' +
            		('00' + date.getUTCHours()).slice(-2) + ':' +
            		('00' + date.getUTCMinutes()).slice(-2) + ':' +
            		('00' + date.getUTCSeconds()).slice(-2);  
					// Fine creazione data_ora

					// Inserisco notizie nella tabella notifche per Beacon Azzurro 
					 db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a) VALUES (?,?,?,?,?,?,?,?,?)",[uuid,date,"Notizia Tre","Offerta Carne","link img","link","link allegato","29-11-2016","29-11-2017"]);
                                         },
                             function()  {
                                            alert("Inserimento non  effettuato"+e.message);
                                         },
                             function()  {
                                          //  alert("Inserimento effettuato");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 
					//navigator.notification.confirm('Notizia', onConfirm,'Beacon Blu',['Guarda','Salva']);
				}
				var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
				beacons[key] = beacon;
			    // Inserisco dati ogni volta che si legge un beacon, nella tabella lettura 
					var date;
    				date = new Date();
    				date = date.getUTCFullYear() + '-' +
            		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getUTCDate()).slice(-2) + ' ' +
            		('00' + date.getUTCHours()).slice(-2) + ':' +
            		('00' + date.getUTCMinutes()).slice(-2) + ':' +
            		('00' + date.getUTCSeconds()).slice(-2);  
					// Fine creazione data_ora
					 db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO letture (uuid, major, minor, proximity, data_ora_lettura, nome_beacon) VALUES (?,?,?,?,?,?)",[beacon.uuid,beacon.major,beacon.minor,beacon.proximity,date,"Nome Beacon"]);
                                         },
                             function()  {
                                            alert("Inserimento non  effettuato"+e.message);
                                         },
                             function()  {
                                           // alert("Inserimento effettuato");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 
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
		/*
		for (var i in regions)
		{
			alert("Partenza regions");
			alert(regions[i].uuid);
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
		}*/
		
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
 