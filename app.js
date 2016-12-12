var prova;
var countUno = 0;
var countDue = 0;
var countTre = 0;
var uuid = new String();
var millisecondi = 0;
var provaIDNotifica
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
    
	// Inizializzo matrico
	var  matrice_notizie = new Array();
  /*  if(JSON.parse(localStorage.getItem("matrice_notizie")) == null){
		
	}else{
      var  matrice_notizie  = JSON.parse(localStorage.getItem("matrice_notizie"));
	}*/
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
      alert("OnDevice");
		// Parte l' onDeviceReady
		//Popolo la tebella notizie direttamente scaricate dal server se c'è la connessione
		  var conn = checkInternet();
		  if(conn==true){
              // Creazione delle tabelle del db 
         		db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
         		db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
								               tx.executeSql("DROP TABLE IF EXISTS notizie ");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS notizie (ID INTEGER PRIMARY KEY,data, titolo, descrizione, immagine, link, allegato, user, stato, data_creazione,  attivo_da datetime ,  attivo_a datetime , ultima_modifica, ID_dispositivo)");
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
								               tx.executeSql("DROP TABLE IF EXISTS notifiche");
                                               tx.executeSql("CREATE TABLE IF NOT EXISTS letture (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, major, minor, data_ora, proximity, data_ora_lettura, nome_beacon)");
									           tx.executeSql("CREATE TABLE IF NOT EXISTS notifiche (id INTEGER PRIMARY KEY AUTOINCREMENT,uuid, data_ora datetime, ID_dispositivo, ID_notizia, ID_utente)");
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
	    cordova.plugins.notification.local.registerPermission(function (granted) {
											// console.log('Permission has been granted: ' + granted);
										});		
		// Funzione che  inizia la ricerca dei beacon
		startScan();
		// Display refresh timer.
		//updateTimer = setInterval(displayBeaconList, 500);
	
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
		alert("start scan");
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
		
			alert('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
            
			for (var i in pluginResult.beacons)
			{
				// Se trova il Beacon lo inserisce nella var beacon.
				// Faccio partire beep o vibrazione
				var beacon = pluginResult.beacons[i];
				beacon.timeStamp = Date.now();
				// key, la chiave identifica
				// Queto if permette di idetificare il Beacon a seconda della distanza
				uuid =  beacon.uuid;
				proximity = beacon.proximity;
				idUUID =uuid.toUpperCase();
				var ID_dispositivo=0, ID_notizia = 0;
				var titolo_n,descrizione,immagine_n,link_n,allegato_n,attivo_da_n,attivo_a_n,data_creazione_n;
				var restituito=true;
				// Parte per rilevare o non rilevare il Beacon, ovvero se è già stato rilevato ed ha già mostrato la notizia
				// Select tra dispositivi e notizie
				// Creazione data ora, per db sul server 
				var dF;
				dF = new Date();
				dF = dF.getFullYear() + '-' +
				('00' + (dF.getMonth() + 1)).slice(-2) + '-' +
				('00' + dF.getDate()).slice(-2) + ' ' +
				('00' + dF.getHours()).slice(-2) + ':' +
				('00' + dF.getMinutes()).slice(-2) + ':' +
				('00' + dF.getSeconds()).slice(-2);  
				//alert("Data ora: "+dataFiltro);
				// Fine creazione data_ora
				//alert("id disp:" + uuid + " matrice:" + matrice_notizie[0]);
				db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
				db.transaction(
					function(tx)
					{
                        tx.executeSql("SELECT N.ID as ID_notizia, titolo, descrizione,immagine,link,allegato,attivo_da,attivo_a,data_creazione, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo AND N.attivo_da<= datetime('now','localtime') AND N.attivo_a>=datetime('now','localtime')",[idUUID], 
			   			function(tx,dati)
			   			{
				 			var len = dati.rows.length;
        					var li_dati="";
       						if(len!=0)
        					{
								titolo_n = dati.rows.item(0).titolo;
								descrizione_n = dati.rows.item(0).descrizione;
								immagine_n = dati.rows.item(0).immagine;
								link_n = dati.rows.item(0).link;
								allegato_n = dati.rows.item(0).allegato;
								attivo_da_n = dati.rows.item(0).attivo_da;
								attivo_a_n = dati.rows.item(0).attivo_a;
								data_creazione_n = dati.rows.item(0).data_creazione;
								ID_dispositivo= dati.rows.item(0).ID_dispositivo;
								ID_notizia = dati.rows.item(0).ID_notizia;	
								//alert(attivo_da_n);
								notiziaEsistente=checkNotizia(ID_dispositivo,ID_notizia);
								if(!notiziaEsistente)
								{
								  
									if (inBackground)
		   							{
									  
						               cordova.plugins.notification.local.schedule(
									   {
											id: ID_notizia,
											title: 'Beacon trovato',
											text: 'Notifica '+titolo_n+', clicca qui per aprire.'
									    });
										cordova.plugins.notification.local.on("click", function (notification) {
											//alert(notification.id);
											 localStorage.removeItem("Id_notifica");
											 localStorage.setItem('Id_notifica', notification.id);
											 $( ":mobile-pagecontainer" ).pagecontainer( "change", "notifica.html", {    transition: "flip", reload:true } );
										});
																							
												
							     	}
								   //ok
									navigator.notification.beep(1);
									navigator.vibrate(3000);
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
														// Se loggato o se non loggato
														if(localStorage.getItem('login')=='true')
														{
															tx.executeSql("INSERT INTO notifiche (uuid, data_ora, ID_dispositivo, ID_notizia,ID_utente) VALUES (?,?,?,?,?)",[uuid,date,ID_dispositivo,ID_notizia,localStorage.getItem('Id_login')]);
														}else{
															tx.executeSql("INSERT INTO notifiche (uuid, data_ora,ID_dispositivo, ID_notizia) VALUES (?,?,?,?)",[uuid,date,ID_dispositivo,ID_notizia]); 
														}
															
														},
											function()  {
															alert("Inserimento non  effettuato"+e.message);
														},
											function()  {
														// alert(results.insertId);
														//  localStorage.setItem('Id_notifica', ID_notizia);
														// $.mobile.navigate("#Notifica"); 
														// visualizza(ID_notizia);
														//  navigator.notification.confirm("Data: "+date, onConfirm,'Notifica: '+titolo_n,['Guarda','Salva']);
														// $( ".popupNotifica" ).popup( "open");
														if(!inBackground)
														{
															//alert(inBackground);
														   	var div ="<div class='popNotifica "+ID_notizia+"' data-itemid='"+ID_notizia+"' >"+
															"<h3>Data: "+date+"</h3>"+
															"<p>Notifica: "+titolo_n+"</p>"+
															"<button  class='ui-btn ApriNotifica' onclick='apriNotifica("+ID_notizia+")' >Apri</button>"+
															"<button  class='ui-btn SalvaNotifica' onclick='salvaNotifica("+ID_notizia+")' >Salva</button>"+
															"</div>";	
															$(".container_page").append(div);
														}
												
														/* "<button  class='ui-btn' id='ApriNotifica' onclick='apri_notifica(this," + ID_notizia + ")'>Apri</button>"+
														"<button  class='ui-btn' id='SalvaNotifica' onclick='salva_notifica(this," + ID_notizia + ")'>Salva</button>"+*/
														}
									)
								}

                               
								//salvaLettura(beacon.proximity,ID_dispositivo,ID_notizia);
								salvaLettura(proximity,ID_dispositivo,ID_notizia);
        			       }
			   		    },erroreSelezione); 
 				});
			
				
			}
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
		  
		//	alert('didStartMonitoringForRegion:' + JSON.stringify(pluginResult.state));
		/*	if (inBackground)
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
							text: 'Nome App ha trovato un beacon, clicca qui per aprire app.'
						});
						
				}
			}*/
			
		};

		// Set the delegate object to use.
		locationManager.setDelegate(delegate);

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		locationManager.requestAlwaysAuthorization();

		// Inizio monitoraggio dei beacon che vanno cercati: questa è commentata perchè funziona con la ricerca regions dei beacon statici.
        
	/*	for (var i in regions)
		{
			//alert("Partenza regions");
			//alert(regions[i].uuid);
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

 


function salvaLettura (proximity,dispositivo,notizia)
{
      var datiInviare,urlCorretto;
	  var online = window.navigator.onLine;
	  if(online==true)
	  {
		if(localStorage.getItem('Id_login')!=null)
		{
			//alert("ok");
			 datiInviare = '{proximity:"'+proximity+'",Id_dispositivo:"'+dispositivo+'",Id_notizia:"'+notizia+'",Id_utente:"'+localStorage.getItem('Id_login')+'"}';
			urlCorretto = 'http://89.36.209.130/scan_dispositivi/webservices/CS_aggiungiLettura.aspx/letturaUtente';
		}else{
			//alert("Nullo");
		    datiInviare = '{proximity:"'+proximity+'",Id_dispositivo:"'+dispositivo+'",Id_notizia:"'+notizia+'"}';
			urlCorretto = 'http://89.36.209.130/scan_dispositivi/webservices/CS_aggiungiLettura.aspx/lettura';
		}
	
		$.ajax({
        type: "POST",
		data: datiInviare,
		url: urlCorretto,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
		success: function(data){
		//console.log(data);
        var ritorno = data.d;
		 //  alert('Cliente Salvato'+ritorno);
            
         //   alert(uriImmagine);
         
          //     $("#pop").click();

		},
		error: function(e){
			//console.log(data);
		//	alert('Errore'+e.status);
          //  alert('Errore2'+e.statusTest);
		}
     	});
	  }else{
		  salvaLettura (proximity,dispositivo,notizia);
	  }
	     			
}



    function checkNotizia(ID_dispositivo,ID_notizia)
	{
		
		var matrice_len = matrice_notizie.length;
		//alert('lung iniziale ' + matrice_notizie.length);
	    var  trovato = false;
		if(matrice_len > 0){
			//alert(ID_dispositivo+ "-"+ ID_notizia);
			current_id_disp = 0;
			current_id_not = 0;
            for (var i=0; i < matrice_notizie.length; i++) {
				current_id_disp = matrice_notizie[i][0];
				current_id_not = matrice_notizie[i][1];
				console.log(current_id_disp+"-"+current_id_not+"Passati: "+ID_dispositivo+"-"+ID_notizia);
				if(current_id_disp== ID_dispositivo && current_id_not==ID_notizia)
				{
				
					trovato = true;
				}	
			}
		 } else {
			//alert("Carica il primo id dispositivo e notifica");
			matrice_notizie[0] = new Array();
			matrice_notizie[0][0]=ID_dispositivo;
			matrice_notizie[0][1]=ID_notizia;
			//alert(matrice_len + ' - disp:'+ ID_dispositivo + ' - ' + matrice_notizie[0][0] + ' - ' + matrice_notizie[0][1]);
		}

		if (!trovato){
			matrice_notizie[matrice_len] = new Array();
			matrice_notizie[matrice_len].push(ID_dispositivo,ID_notizia);
			localStorage.setItem("matrice_notizie", JSON.stringify(matrice_notizie));
		}
	
		return trovato;
	   
	}

	function onConfirm(buttonIndex) {
    //alert('You selected button ');
	
	if(buttonIndex==1)
	{
		//alert("Stai guardando la notizia")
		localStorage.setItem('Id_notifica', provaIDNotifica);
		 $( ":mobile-pagecontainer" ).pagecontainer( "change", "#Notifica", {    transition: "flip", reload:false } );
		 
	}else{
		//alert("Stai salvando la notizia");
	
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
	   //alert("Errore selezione");
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

