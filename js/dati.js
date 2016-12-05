// Variabili globali per il login
var usernameLoginApp;
 function checkInternet() 
 {
    
     var online = window.navigator.onLine;
            if (online) {
                return true;
            } else {
                return false;
            }
  }

// Prelevo i dati dal server
function caricoDatiServerSalvoInDb ()
{
       alert("Si");
       var connessione = checkInternet();
       if (connessione==true) {
          // Prima bisonga cancellare un db se già essitente è crearlo se non esiste
          db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
          db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("DROP TABLE IF EXISTS clienti");
                                            tx.executeSql("CREATE TABLE IF NOT EXISTS clienti (id INTEGER PRIMARY KEY AUTOINCREMENT,identificativo, nome, cognome, email,foto)");
                                          },
                             function () {
                                            // alert("Errore");
                                         },
                             function(){
                                           // alert("Cancellazione effettuata");
                                        }
            )
            // Prelevo dati dal server
                $.getJSON("http://www.trovoperte.com/admin/CS_Sync.aspx", function (dati) {
                    var li_dati = "";
                    $.each(dati, function (i, name) {
                        // Inserisco dati nel db sqllite dell' App
                       db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
                       db.transaction(
                            // Metodo di chiamata asincrona
                            function(tx) {
                                            tx.executeSql("INSERT INTO clienti (identificativo,nome,cognome,email,foto) VALUES (?,?,?,?,?)",[name.ID,name.nome,name.cognome,name.email,name.foto]);
                                          },
                                            onDbError,
                             function(){
                                          //  alert("Inserimento effettuato");
                                         }
                    )
                    });
                      selezionoDati ();
                });
               
            } else {
                // Carico i dati dal db se è stato creato almeno una volta
                 selezionoDati ();

            }
            
}



function selezionoDati ()
{
   db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
				db.transaction(
					function(tx)
					{
               			tx.executeSql("SELECT N.ID as ID_notizia, titolo, descrizione,immagine,link,allegato,attivo_da,attivo_a,data_creazione, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo",[idUUID], 
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
								//alert(descrizione_n);
								notiziaEsistente=checkNotizia(ID_dispositivo,ID_notizia);
								if(!notiziaEsistente)
								{
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
													    tx.executeSql("INSERT INTO notifiche (uuid, data_ora, titolo, descrizione, immagine, link, allegato, attivo_da, attivo_a, ID_dispositivo, ID_notizia,ID_utente) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[uuid,date,titolo_n,descrizione_n,immagine_n,link_n,allegato_n,attivo_da_n,attivo_a_n,ID_dispositivo,ID_notizia,localStorage.getItem('Id_login')]);
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
													 var div ="<div class='popNotifica "+ID_notizia+"' data-itemid='"+ID_notizia+"' >"+
													 "<h3>Data: "+date+"</h3>"+
													 "<p>Notifica: "+titolo_n+"</p>"+
													 "<button  class='ui-btn' id='ApriNotifica'>Apri</button>"+
													 "<button  class='ui-btn' id='SalvaNotifica' onclick='salva_notifica(this," + ID_notizia + ")'>Salva</button>"+
													 "</div>";	
													  $(".container_page").append(div);
												
													/* "<button  class='ui-btn' id='ApriNotifica' onclick='apri_notifica(this," + ID_notizia + ")'>Apri</button>"+
													 "<button  class='ui-btn' id='SalvaNotifica' onclick='salva_notifica(this," + ID_notizia + ")'>Salva</button>"+*/
													}
								)
								}
        			       }
			   		    },erroreSelezione); 
 				});                        
}

function select(tx)
{
       tx.executeSql("SELECT * FROM notifiche",[], successoSelect,erroreSelect);     
      // SELECT N.ID as ID_notizia, titolo, descrizione,immagine,link,allegato,attivo_da,attivo_a,data_creazione, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo   
}

function successoSelect(tx,dati)
{
    var len = dati.rows.length;
    //alert(len);
        var li_dati="";
        if(len!=0)
        {
             
             for(var i=0; i<len; i++)
            {
                var data = dati.rows.item(i).data_ora;
                var splitarray = new Array();
                splitarray = data.split(" ");
                var dataDue = splitarray[0];
                var arrayData = new Array ();
                arrayData = dataDue.split("-");
                var dataCorretta = arrayData[2] + "-" + arrayData[1] + "-" + arrayData[0] + " " + splitarray[1];
                alert("Titolo: "+dati.rows.item(i).titolo+"-Descrizione"+dati.rows.item(i).descrizione);
                li_dati += "<li id="+dati.rows.item(i).id+" data-itemid="+dati.rows.item(i).id+"><a class='detail' href='#'><img src='http://89.36.209.130/scan_dispositivi/public/upload_gallery/immagini/"+dati.rows.item(i).immagine+"'/><h6 style='font-size:14px;color:#AE1C1F'>" + dati.rows.item(i).titolo + "</h6>"+
                "<p style='text-align:left !important;font-size:10px'><b>Data notifica: </b>" + dataCorretta + "</p>"+
                "<p style='font-size:10px; text-align:left !important;'><b>Descrizione: </b>"+dati.rows.item(i).ID_notizia+"</p></a>"+
                "<a  class='storage' href='#purchase' data-rel='popup' data-position-to='window' data-transition='pop'>Cancella</a></li>";
            
            }
            
        }
       // Permette di "appendere" il codice html creato in dinamico con i dati
       $("#lista_datiJson").append(li_dati).promise().done(function () {
         $(this).listview("refresh");
        });
}

function erroreSelect (e)
{
    alert("Select non avvenuta"+e);
}

function onDbError ()
{
    alert("Errore");
}

// Registra utente

function aggiungiUtente(nome,cognome,email,luogoN,dataN,citta,username,password,privacy)
{
    alert(nome+"-"+cognome+"-"+email+"-"+luogoN+"-"+dataN+"-"+citta+"-"+username+"-"+password);
       $.ajax({
        type: "POST",
		data: '{nome:"'+nome+'",cognome:"'+cognome+'",email:"'+email+'",luogo_nascita:"'+luogoN+'",data_nascita:"'+dataN+'",citta:"'+citta+'",username:"'+username+'",password:"'+password+'",privacy:"'+privacy+'"}',
		url: 'http://89.36.209.130/scan_dispositivi/webservices/CS_aggiungiCliente.aspx/prova',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
		success: function(data){
		//console.log(data);
        var ID_utente = data.d;
		   alert('Cliente Salvato'+ID_utente);
            
         //   alert(uriImmagine);
         
          //     $("#pop").click();

		},
		error: function(e){
			//console.log(data);
			alert('Errore'+e.status);
            alert('Errore2'+e.statusTest);
		}
	});
}

// Login utente

function loginUtente(usernameLogin,passLogin)
{
       alert(usernameLogin+"-"+passLogin);
       $.ajax({
        type: "POST",
		data: '{userLogin:"'+usernameLogin+'",passLogin:"'+passLogin+'"}',
		url: 'http://89.36.209.130/scan_dispositivi/webservices/CS_loginUtente.aspx/login',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
		success: function(data){
		//console.log(data);
        var login = data.d;
		if(login!="")
        {
            //alert("Utente Loggato"+login);
            localStorage.setItem('login', true);
            localStorage.setItem('Id_login',login);
            window.location.href = "#home";
        }else{
            alert("Utente non loggato");
        }
		},
		error: function(e){
			//console.log(data);
			alert('Errore'+e.status);
            alert('Errore2'+e.statusTest);
		}
	});
    
}

function caricaNotifica ()
{
   
    db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
     db.transaction(selectNotifica,successoSelectNotifica);  
}

function selectNotifica(tx)
{
        
       tx.executeSql("SELECT * FROM notizie WHERE ID = "+localStorage.getItem('Id_notifica')+"",[], successoSelectNotifica,erroreSelect);        
}

function successoSelectNotifica(tx,dati)
{
    var len = dati.rows.length;
  
        var li_dati="";
        if(len!=0)
        {
           
           li_dati+="<h1 class='titolo_notizia'>"+dati.rows.item(0).titolo+"</h1>"+
            "<p class='notizia_data'>Attivo dal "+dati.rows.item(0).attivo_da+" al "+dati.rows.item(0).attivo_a+"</p>"+
           "<div class='wrapper_notizia'><img class='immagine_notizia' src='http://89.36.209.130/scan_dispositivi/public/upload_gallery/immagini/"+dati.rows.item(0).immagine+"'/></div>"+
           "<hr>"+
           "<p class='notizia'><b>Descrizione:</b> "+dati.rows.item(0).descrizione+"</p>"+
           "<p class='notizia'><b>Link: </b>"+dati.rows.item(0).link+"</p>"+
           "<p class='notizia'><b>Allegato: </b>"+dati.rows.item(0).allegato+"</p>"+
           "<p class='notizia'><b>ID_utente: </b>"+dati.rows.item(0).ID_utente+"</p>"+
           "<hr>";
           $(".schedaNotifica").append(li_dati);
        }
       // Permette di "appendere" il codice html creato in dinamico con i dati
      /* $("#lista_datiJson").append(li_dati).promise().done(function () {
         $(this).listview("refresh");
        });*/
}

function cancellaNotifica ()
{
    //alert( sessionStorage.getItem('ID_not'));
    // Cancellare notifica in base all 'id'
    var idNotifica = sessionStorage.getItem('ID_not');
     db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
        db.transaction(
            // Metodo di chiamata asincrona
            function(tx) {
                tx.executeSql("DELETE FROM notifiche WHERE id=?",[idNotifica]);
            },
            function(){
               // alert("Cancellazione non effettua");
               
            },
            function(){
               // alert("Cancellazione effettua");
               
            }
        )
      $("#purchase").popup( "close" );
      $("#lista_datiJson").html("");
      selezionoDati();
}

function cancellaAllNotifiche ()
{
      db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
        db.transaction(
            // Metodo di chiamata asincrona
            function(tx) {
                tx.executeSql("DELETE FROM notifiche",[]);
            },
            function(){
               // alert("Cancellazione non effettua");
               
            },
            function(){
               // alert("Cancellazione effettua");
               
            }
        )
      $("#lista_datiJson").html("");
      selezionoDati();
}

function apriSocial()
{
    alert("Apri Sociale");
}



/*	
function salva_notifica(obj,id) {
    $('.'+id+'').hide();

}
/*
function apri_notifica(obj,id) {
     localStorage.setItem('Id_notifica', id);
       $('#'+id+'').hide();
    $( ":mobile-pagecontainer" ).pagecontainer( "change", "notifica.html", {    transition: "flip", reload:true } );

}*/

  


 