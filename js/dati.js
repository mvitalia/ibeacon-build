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
    alert("Seleziono dati");
   db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);  
   db.transaction(select,successoSelect);                    
}

function select(tx)
{
    alert("Select join");
       tx.executeSql("SELECT C.ID as ID_notifica, N.*, C.* FROM notizie as N, notifiche as C WHERE C.ID_notizia=N.ID",[], successoSelect,erroreSelect);   
     //   tx.executeSql("SELECT * FROM notizie",[], successoSelect,erroreSelect);  
      // SELECT N.ID as ID_notizia, titolo, descrizione,immagine,link,allegato,attivo_da,attivo_a,data_creazione, D.ID as ID_dispositivo FROM dispositivi as D,notizie as N WHERE D.uuid=? AND D.id=N.ID_dispositivo   
}

function successoSelect(tx,dati)
{
    var len = dati.rows.length;
    alert(len);
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
                //alert("Titolo: "+dati.rows.item(i).titolo+"-Descrizione"+dati.rows.item(i).descrizione);
                li_dati += "<li id="+dati.rows.item(i).ID_notifica+" data-itemid="+dati.rows.item(i).ID_notifica+"><a class='detail' href='#'><img src='http://89.36.209.130/scan_dispositivi/public/upload_gallery/immagini/"+dati.rows.item(i).immagine+"'/>";
                li_dati+="<h6 style='font-size:14px;color:#AE1C1F'>" + dati.rows.item(i).titolo + "</h6> <p style='text-align:left !important;font-size:10px'><b>Data notifica: </b>" + dataCorretta + "</p> <p style='font-size:10px; text-align:left !important;'>";
                li_dati+="<b>Descrizione: </b>"+dati.rows.item(i).descrizione+"</p></a><a  class='storage' href='#purchase' data-rel='popup' data-position-to='window' data-transition='pop'>Cancella</a></li>";
            
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

function  apriCondividi ()
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

  


 