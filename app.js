var prova;
var countUno = 0;
var countDue = 0;
var countTre = 0;
var uuid = new String();
// Variabili globali per la selezione una tantum dei diversi beacon


//sessionStorage.getItem('id');
var app = (function()
{
    
    // Varibile che serve per il controllo del bluetooth all' apertura dall' app
	var ble = null;
	// Application object.
	var app = {};

    app.scanInterval = 5000;
	app.isScanning = false;
	app.lastScanEvent = 0;
    
	

	// I beacon da rilevare in modo statico 
	/*var regions =
	[
		// Estimote Beacon factory UUID.
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},//blu
		// Sample UUIDs for beacons in our lab.
		{uuid:'5F4DF8FB-3EC2-60B1-DB6F-6E7013122EE0'}, //azzurro
		{uuid:'937BD9F3-5C44-971C-F389-35152A80C632'},	// verde
	];*/
	
	// Dichiaro regions per trovare beacon in dinamico  
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
		// Parte l' onDeviceReady
        
		//Popolo la tebella notizie direttamente scaricate dal server se c'è la connessione
		  var conn = checkInternet();
		  if(conn==true){
              // Creazione delle tabelle del db 
         		db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         		db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								               tx.executeSql("DROP TABLE IF EXISTS notiize ");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS notizie (ID INTEGER PRIMARY KEY,data, titolo, descrizione, immagine, link, allegato, user, stato, data_creazione, attivo_da, attivo_a, ultima_modifica, ID_dispositivo)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                          //  alert("Creazione tabella notizie");
                                        }
         						)
		 // Fine della creazione delle tabella db 
		 // Prelevo dati dal server e salvo nel db
		  $.getJSON("http://89.36.209.130/scan_dispositivi/webservices/sync_notizie.aspx", function (dati) {
                    var li_dati = "";
                    $.each(dati, function (i, name) {
                        // Inserisco dati nel db sqllite dell' App
                       db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO notizie (ID,data, titolo, descrizione, immagine, link, allegato, user, stato, data_creazione, attivo_da, attivo_a, ultima_modifica, ID_dispositivo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[name.ID,name.data,name.titolo,name.descrizione,name.immagine,name.link,name.allegato,name.user,name.stato,name.data_creazione,name.attivo_da,name.attivo_a,name.ultima_modifica,name.ID_dispositivo]);
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                           // alert("Inserimento effettuato tabelle notizie");
                                         }
                    )
                    });
					 
                                
                });
		  }else{
			  //Seleziono notizie da db interno
		  }

		// Per il login anche dopo la chiusura dell' applicazione, la prima volta'
		if(localStorage.getItem('login')==null)
		{
			  localStorage.setItem('login', false);
		}

		// Creazione delle tabelle letture e notifiche del db interno alla app.. L' unica che sarà visualizzata all' utente è la tabella notifiche
         db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								             //  tx.executeSql("DROP TABLE IF EXISTS letture");
								             //  tx.executeSql("DROP TABLE IF EXISTS notifiche");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS letture (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, major, minor, data_ora, proximity, data_ora_lettura, nome_beacon)");
									           tx.executeSql("CREATE TABLE IF NOT EXISTS notifiche (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, data_ora datetime, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a, ID_dispositivo, ID_notizia)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                           // alert("Creazione tabella notifiche e letture");
                                        }
         )
		 // Fine della creazione delle tabella db 

		 // Controllo se bluetooth è accesso
	     ble = evothings.ble;
		 app.startLeScan();
		 // Fine controllo bluetooth acceso


		window.locationManager = cordova.plugins.locationManager;
		// Funzione che  inizia la ricerca dei beacon
		startScan();
		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 500);
	}

// Funzioni per il controllo del bluetooth all' avvio della applicazione
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
// Fine funzioni per il controllo del bluetooth all' avvio della applicazione

  

function startScan()
{
		  // Inizio scansione dei vari beacon

		  // Creazione della tabella Beacon e notifiche se c'è o non c'è internet 
		  var connessione = checkInternet();
		  if(connessione==true){
              // Creazione delle tabelle del db 
         		db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         		db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								               tx.executeSql("DROP TABLE IF EXISTS dispositivi ");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS dispositivi (ID INTEGER PRIMARY KEY ,uuid, major, minor, nome, stato)");
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                          //  alert("Creazione tabella dispositivi");
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
                                            tx.executeSql("INSERT INTO dispositivi (ID,uuid, major, minor, nome, stato) VALUES (?,?,?,?,?,?)",[name.ID,name.UUID,name.major,name.minor,name.nome,name.stato]);
                                          },
                             function () {
                                             alert("Errore"+e.message);
                                         },
                             function(){
                                           // alert("Inserimento dispositivi");
                                         }
                    )
                    });
					  // Funzione per la selezione dei beacon da ricercare dal db dell' app
                      selezionaBeacon ();              
                });
		  }else{
			  //Seleziono beacon e notifiche da db interno app
		  }
		
		// L' oggetto delegate detiene le funzioni di callback di iBeacon plugin 
		// Dichiarato di seguito.
		var delegate = new locationManager.Delegate();

		// Richiamato di continuo per cercare i Beacon nei paraggi, viene eseguita subito dopo il ciclo for 'Inizio monitoraggio dei beacon che vanno cercati' scritto nella funzione successoSelezione
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
				idUUID =uuid.toUpperCase();
				var ID_dispositivo, ID_notizia;
				
				// Parte per rilevare o non rilevare il Beacon, ovvero se è già stato rilevato ed ha già mostrato la notizia
				// Select tra dispositivi e notizie
				db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
				db.transaction(
					function(tx)
					{
               			tx.executeSql("SELECT N.ID as ID_notizia, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo",[idUUID], 
			   			function(tx,dati)
			   			{
				 			var len = dati.rows.length;
        					var li_dati="";
       						if(len!=0)
        					{
								ID_dispositivo= dati.rows.item(0).ID_dispositivo;
								ID_notizia = dati.rows.item(0).ID_notizia;
                				//alert("ID_Dispositivo"+ID_dispositivo);
			    				//alert("ID_notiiza"+ID_notizia);
        			       }
			   		    },erroreSelezione); 
 				});
				// Select delle notifiche
				var rilevaBeacon = false;
				db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
				db.transaction(
					function(tx)
					{
					
						tx.executeSql("SELECT * FROM notifiche WHERE ID_dispositivo = '"+ID_dispositivo+"' AND ID_notizia = '"+ID_notizia+"'",[],
						function(tx,dati)
						{
						    var len = dati.rows.length;
       						if(len==0)
        					{

								navigator.notification.beep(1);
        						navigator.vibrate(3000);
								alert("Uno");
								// Creazione data ora, per db sul server 
								var date;
    							date = new Date();
								date = date.getFullYear() + '-' +
								('00' + (date.getMonth() + 1)).slice(-2) + '-' +
								('00' + date.getDate()).slice(-2) + ' ' +
								('00' + date.getHours()).slice(-2) + ':' +
								('00' + date.getMinutes()).slice(-2) + ':' +
								('00' + date.getSeconds()).slice(-2);  
								// Fine creazione data_ora

								// Inserisco notizie nella tabella notifche per Beacon Azzurro 
								db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
								db.transaction(
										// Metodo di chiamata asincrona
										function(tx) {
														tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a, ID_dispositivo, ID_notizia) VALUES (?,?,?,?,?,?,?,?,?,?,?)",[uuid,date,"Notizia Uno","Sconto su tutto","link immagine","link","link allegato","29-11-2016","29-12-2016",ID_dispositivo,ID_notizia]);
													},
										function()  {
														alert("Inserimento non  effettuato"+e.message);
													},
										function()  {
													//  alert("Inserimento effettuato Beacon Uno");
													   window.location.href = "#home";
													}
								)
							  
        			        }
						},erroreSelezione);
					}
				);

			// DA CANCELLARE QUANDO SICURO CHE TUTTO FUNZIONA	
			/*	if(countUno==0 && uuid.toUpperCase()=="5F4DF8FB-3EC2-60B1-DB6F-6E7013122EE0")
				{
				
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					alert("Uno");
					countUno++;
					// Creazione data ora, per db sul server 
					var date;
    				date = new Date();
    				date = date.getFullYear() + '-' +
            		('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getDate()).slice(-2) + ' ' +
            		('00' + date.getHours()).slice(-2) + ':' +
            		('00' + date.getMinutes()).slice(-2) + ':' +
            		('00' + date.getSeconds()).slice(-2);  
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
                                          //  alert("Inserimento effettuato Beacon Uno");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 	
				}
				if(countDue==0 && uuid.toUpperCase()=="937BD9F3-5C44-971C-F389-35152A80C632")
				{
				 
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					   alert("Due");
					countDue++;
					// Creazione data ora, per db sul server 
					var date;
    				date = new Date();
    				date = date.getFullYear() + '-' +
            		('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getDate()).slice(-2) + ' ' +
            		('00' + date.getHours()).slice(-2) + ':' +
            		('00' + date.getMinutes()).slice(-2) + ':' +
            		('00' + date.getSeconds()).slice(-2);  
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
                                          //  alert("Inserimento effettuato Beacon Due");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 
				}
				if(countTre==0 && uuid.toUpperCase()=="B9407F30-F5F8-466E-AFF9-25556B57FE6D")
				{
					
					navigator.notification.beep(1);
        			navigator.vibrate(3000);
					alert("Tre");
					countTre++;
					var date;
    				date = new Date();
    				date = date.getFullYear() + '-' +
            		('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getDate()).slice(-2) + ' ' +
            		('00' + date.getHours()).slice(-2) + ':' +
            		('00' + date.getMinutes()).slice(-2) + ':' +
            		('00' + date.getSeconds()).slice(-2);  
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
                                          //  alert("Inserimento effettuato Beacon Tre");
                                         }
                    )
					// Fine inserimento notizie nella tabella notifche per Beacon Azzurro 
					//navigator.notification.confirm('Notizia', onConfirm,'Beacon Blu',['Guarda','Salva']);
				}*/
				// FINE DA CANCELLARE QUANDO SICURO CHE TUTTO FUNZIONA	
				var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
				beacons[key] = beacon;
			    // Inserisco dati ogni volta che si legge un beacon, nella tabella lettura 
					var date;
    				date = new Date();
    				date = date.getFullYear() + '-' +
            		('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            		('00' + date.getDate()).slice(-2) + ' ' +
            		('00' + date.getHours()).slice(-2) + ':' +
            		('00' + date.getMinutes()).slice(-2) + ':' +
            		('00' + date.getSeconds()).slice(-2);  
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

		// Inizio monitoraggio dei beacon che vanno cercati: questa è commentata perchè funziona con la ricerca regions dei beacon statici.
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
        var li_dati="";
        if(len!=0)
        {
            
             for(var i=0; i<len; i++)
            {
				// popolo l' array associativo regions che mi permette di ricercare i beacon scaricati dal server e salvati nel db locale dell' app 
				regions.push({
					uuid: dati.rows.item(i).uuid
				});
            }
			//Inizio monitoraggio dei beacon che vanno cercati
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
      
    }
// Continuare selezione	
/*			
 function selezionaDispositiviNotizie (idUUID)
   {
	  
	    db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
		db.transaction(
			function(tx)
			{
               tx.executeSql("SELECT N.ID as ID_notizia, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo",[idUUID], 
			   function(tx,dati)
			   {
				 	var len = dati.rows.length;
        			var li_dati="";
       				if(len!=0)
        			{
					ID_dispositivo= dati.rows.item(0).ID_dispositivo;
					ID_notizia = dati.rows.item(0).ID_notizia;
                	alert("ID_Dispositivo"+ID_dispositivo);
			    	alert("ID_notiiza"+ID_notizia);
        			}
			   },//successoSelezioneDisp,
			   erroreSelezione); 
 			});
       /*var valori =  db.transaction(
			  // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("SELECT N.ID as ID_notizia, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo",[idUUID], function(tx, result)  {
                                           
											return rresult.rows.item[0].ID_dispositivo;
                                         });
                                         }

		 );  
		  alert("Inserimento effettuato"+valori);
		/* selezionaID("SELECT N.ID as ID_notizia, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid='"+idUUID+"' AND D.id=N.ID_dispositivo", function(dati) {
              alert(dati);
     
   		});  */ 
  // }

  /* function selezioneDisp(tx,idUUID)
   {
	   alert(idUUID);
       tx.executeSql("SELECT N.ID as ID_notizia, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo",[idUUID], successoSelezioneDisp,erroreSelezione);        
   }
*/


  /* function successoSelezioneDisp(tx,dati)
   {
    var len = dati.rows.length;
        var li_dati="";
        if(len!=0)
        {
            
            
				ID_dispositivo= dati.rows.item(0).ID_dispositivo;
				ID_notizia = dati.rows.item(0).ID_notizia;
                alert("ID_Dispositivo"+ID_dispositivo);
			    alert("ID_notiiza"+ID_notizia);
			
        }
      
    }*/
	

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
 