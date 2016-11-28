// Questo file permette di prelevare dati dal server e salvarli all' interno di un database sqllite della applicazione

// funzione per capire se c'è internet

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
    alert("Seleziono Dati");
     db = window.openDatabase("DatabaseSqlliteApp", "1.0", "Database prova", 200000);
     db.transaction(select,successoSelect);                         
}

function select(tx)
{
       tx.executeSql("SELECT * FROM lettura ORDER BY id ASC",[], successoSelect,erroreSelect);        
}

function successoSelect(tx,dati)
{
    var len = dati.rows.length;
   
        var li_dati="";
        if(len!=0)
        {
             
             for(var i=0; i<len; i++)
            {
               
                li_dati += "<li id="+dati.rows.item(i).identificativo+" data-itemid="+dati.rows.item(i).identificativo+"><a class='storage' href='#'><img src='"+dati.rows.item(i).foto+"'/><h6 style='font-size:12px;'>" + dati.rows.item(i).nome + " - " + dati.rows.item(i).cognome + "</h6>"
                        +"<p style='font-size:10px;'>E-mail: "+dati.rows.item(i).email+"</p></a></li>"
            
            }
            
        }
       // Permette di "appendere" il codice html creato in dinamico con i dati
       $("#lista_datiJson").append(li_dati).promise().done(function () {
         $(this).listview("refresh");
        });
}

function erroreSelect ()
{
    alert("Select non avvenuta");
}

function onDbError ()
{
    alert("Errore");
}

