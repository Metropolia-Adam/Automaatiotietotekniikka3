
**Tarve**: 
Köyhä ja osaamaton opiskelija ostaa elintarvikkeita ja unohtaa ne jääkaapin perälle / ei osaa tehdä ruokaa niistä
mikä aiheuttaa ruokahävikkiä kun ruuat vanhenevat ja mikä tärkeintä aiheuttaa rahan kuluttammista turhaan.
Sovellus pitää kirjaa parasta ennen päiväyksistä ja ehdottaa valmiita reseptejä aineksista jotka ovat vanhenemassa.

**Käyttäjäskenaario**: 
Opiskelija avaa sovelluksen kaupassa ja hän näkee punaisella korostettuuna, että kanafileet ja
kermapurkki ovat vanhenemassa huomenna. Opiskelija painaa "Ehdota reseptejä" nappia, jolloin sovellus ottaa tietokannasta
"kermainen kanapasta" reseptin ja kertoo että häneltä puuttuu vain suola ja pasta.

**Rajaus**:Ei tehdä viivankoodinlukijaa, eikä ravitsemuslaskuria, eikä netistä haettavia reseptejä, käytetään valmista paikallista tietokantaa.

**Vaatimukset ja hyväksymiskriteerit:**

V1 (Tuotteen lisäys ja tallennus): Käyttäjä voi lisätä tuotteen nimen, määrän ja parasta ennen päivämäärän.

V2 (Vanhenemishälytys): Sovelluus laskee jäljellä olevat päivät ja järjestää tuotteet kiireellisyysjärjestykseen.
                        Tuotteet joiden parasta ennen päivämäärä on 2 päivän päästä korostetaan punaisella.
                        Tuotteet joiden parasta ennen päivämäärä on 5 päivän päästä korostetaan keltaisella.

V3 (Reseptisuositus): Sovellus vertaa käyttäjän lisäämiä tuotteita reseptitiedostoon  ja suosittelee reseptejä joissa 
                      käytetään pian vanhenevia aineksia. Kriittisiä raaka-aineita jotka ovat punaisella / keltaisella
                      korostettu käytetään eka ja näyttää käyttäjälle myös puuttuvat ainekset jotka käyttäjän tulee ostaa.
                      

V4 (Virheilmoitus): Järjestelmä ei anna lisätä vanhentuneita ja tyhjiä tuotenimiä. Tämä näytetään käyttäjälle virheilmoituksena.

Mainokset lisätty simuloimaan todellisen sovelluksen sponsoroitua toimintaa!
