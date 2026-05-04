 // 1. Wir legen eine "Datenbank" (Array) in unserem Speicher an
let aufgabenDatenbank = [];

// 2. Wir holen uns alle wichtigen Elemente von der Seite
const textEingabe = document.getElementById('task-text');
const datumEingabe = document.getElementById('task-date');
const hinzufuegenKnopf = document.getElementById('add-btn');

const alleAufgabenListe = document.getElementById('all-tasks-list');
const filterDatum = document.getElementById('filter-date');
const gefilterteAufgabenListe = document.getElementById('filtered-tasks-list');

// 3. Funktion: Die Gesamtübersicht aktualisieren
function renderAlleAufgaben() {
    alleAufgabenListe.innerHTML = ''; // Liste zuerst leeren

    if (aufgabenDatenbank.length === 0) {
        alleAufgabenListe.innerHTML = '<li class="empty-state">Noch keine Aufgaben vorhanden.</li>';
        return;
    }

    // Für jede Aufgabe in unserer Datenbank ein Element erstellen
    aufgabenDatenbank.forEach(function(aufgabe) {
        const li = document.createElement('li');
        
        // Den Text und das Datum schön formatieren
        let datumText = aufgabe.datum ? aufgabe.datum : 'Kein Datum gesetzt';
        li.innerHTML = `<strong>${aufgabe.text}</strong> <span class="date-badge">📅 ${datumText}</span>`;
        
        alleAufgabenListe.appendChild(li);
    });

    // Immer wenn sich die Hauptliste ändert, aktualisieren wir auch den Filter
    renderGefilterteAufgaben();
}

// 4. Funktion: Die Aufgaben nach dem ausgewählten Tag filtern
function renderGefilterteAufgaben() {
    gefilterteAufgabenListe.innerHTML = ''; // Liste leeren
    const gesuchtesDatum = filterDatum.value;

    if (gesuchtesDatum === "") {
        gefilterteAufgabenListe.innerHTML = '<li class="empty-state">Bitte wähle ein Datum aus.</li>';
        return;
    }

    // Wir durchsuchen die Datenbank nach Aufgaben mit genau diesem Datum
    const gefilterteAufgaben = aufgabenDatenbank.filter(function(aufgabe) {
        return aufgabe.datum === gesuchtesDatum;
    });

    if (gefilterteAufgaben.length === 0) {
        gefilterteAufgabenListe.innerHTML = '<li class="empty-state">Juhu! Keine Aufgaben an diesem Tag.</li>';
        return;
    }

    // Die gefundenen Aufgaben in die rechte Liste eintragen
    gefilterteAufgaben.forEach(function(aufgabe) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${aufgabe.text}</strong>`;
        gefilterteAufgabenListe.appendChild(li);
    });
}

// 5. Was passiert beim Klicken auf "Hinzufügen"?
hinzufuegenKnopf.addEventListener('click', function() {
    const text = textEingabe.value.trim();
    const datum = datumEingabe.value;

    if (text !== "") {
        // Wir speichern die Aufgabe als "Objekt" in unserer Datenbank
        aufgabenDatenbank.push({
            text: text,
            datum: datum
        });

        // Felder wieder leer machen
        textEingabe.value = "";
        datumEingabe.value = "";

        // Listen neu zeichnen
        renderAlleAufgaben();
    }
});

// 6. Was passiert, wenn man unten im Kalender ein neues Datum anklickt?
filterDatum.addEventListener('change', renderGefilterteAufgaben);