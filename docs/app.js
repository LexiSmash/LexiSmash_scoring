// =================================================================
// docs/app.js — LexiSmash Letter Scores Explorer
// -----------------------------------------------------------------
// Standalone page for the LexiSmash_scoring repository (GitHub Pages,
// "docs/" folder). No build step, no dependency, no game code.
//
// It reads the same two kinds of files the game uses:
//   data/scoring/<lang>.json   -> { lang, systems: { <system>: { values: { A: 1, ... } } } }
//   data/alphabets/<lang>.json -> { lang, vocals: [...], consonants: [...] }
// and lets anyone browse them and prepare a correction (Issue or Pull
// Request) without touching JSON by hand.
//
// Theme: automatic (system preference) or chosen by the user.
// Site language: automatic (browser) or chosen by the user.
// Both choices are remembered in localStorage.
// =================================================================
(function () {
    'use strict';

    const REPO = 'LexiSmash/LexiSmash_scoring';
    const BRANCH = 'main';
    const LANGS = ['it', 'en', 'fr', 'de', 'es', 'nl'];
    const LANG_META = {
        it: { flag: '🇮🇹', native: 'Italiano' },
        en: { flag: '🇬🇧', native: 'English' },
        fr: { flag: '🇫🇷', native: 'Français' },
        de: { flag: '🇩🇪', native: 'Deutsch' },
        es: { flag: '🇪🇸', native: 'Español' },
        nl: { flag: '🇳🇱', native: 'Nederlands' }
    };
    const SYSTEM_ORDER = ['frizzy', 'scrabble'];
    const VALUE_COLORS = ['#0f766e', '#0e7490', '#2563eb', '#7c3aed', '#a21caf', '#be185d', '#c2410c', '#b45309', '#a16207', '#b91c1c'];

    // ------------------------------------------------------------------
    // UI strings (site language). Keys missing in a language fall back to English.
    // ------------------------------------------------------------------
    const STRINGS = {
        en: {
            title: 'LexiSmash Letter Scores',
            subtitle: 'The letter values and letter sets behind <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a> — check them, and propose a fix.',
            uiLanguage: 'Site language', uiLanguageHint: 'Automatic at first, from your browser.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Light', themeDark: '🌙 Dark', themeLabel: 'Theme: {{mode}} (click to change)',
            gameLanguage: 'Game language', scoringSystem: 'Scoring system',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Official Scrabble',
            sysDesc_frizzy: 'LexiSmash\'s own classic system, built around how often each letter appears in Italian. Available for Italian only.',
            sysDesc_scrabble: 'The letter values of the official Scrabble set for this language.',
            sysNote: 'The game also has a "Random" system (each drawn letter is worth 1–9 points) and a "Custom" one (the room\'s host decides every value): neither has fixed data to correct.',
            editMode: '✏️ Propose changes',
            editHint: 'Edit mode: select a letter, then pick its new value. Your changes stay in this page until you send them.',
            pickLetter: 'Select a letter to see its value in every language.',
            valueIn: 'Worth {{value}} {{points}} in {{system}}',
            point: 'point', points: 'points',
            notScored: 'No value in this system',
            otherLanguages: 'Same letter, other languages',
            newValue: 'New value:',
            restore: 'Restore the original value',
            notDrawable: 'Not in this language\'s letter set: it is never drawn.',
            alphabetTitle: 'Letters that can be drawn',
            alphabetIntro: 'When a player asks for a vowel or a consonant, the game draws one of these letters at random.',
            vowels: 'Vowels', consonants: 'Consonants',
            neverDrawn: 'Have a value but are never drawn in this language: {{letters}}',
            proposalTitle: 'Your proposal',
            changeLine: '{{letter}}: {{from}} → {{to}}',
            reasonLabel: 'Why should these values change?',
            reasonPlaceholder: 'e.g. the official Spanish Scrabble set gives Ñ 8 points, not 10.',
            openIssue: 'Open an Issue with these changes',
            copyJson: 'Copy the updated JSON',
            editOnGithub: 'Edit the file on GitHub (Pull Request)',
            resetChanges: 'Discard changes',
            copied: 'Copied! Paste it into data/scoring/{{lang}}.json in your Pull Request.',
            copyFailed: 'Copy failed: select the text manually from the Issue preview.',
            loading: 'Loading…',
            loadError: '⚠️ Could not load the data files. If you opened this page from disk (file://), serve the "docs" folder with a local web server (e.g. "python3 -m http.server").',
            footer: 'Letter values are facts, not code: see <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. Want to help? Read <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">how to propose a fix</a>.'
        },
        it: {
            title: 'Punteggi delle Lettere di LexiSmash',
            subtitle: 'I valori e gli insiemi di lettere usati da <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a>: controllali e proponi una correzione.',
            uiLanguage: 'Lingua del sito', uiLanguageHint: 'All\'inizio è automatica, presa dal browser.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Chiaro', themeDark: '🌙 Scuro', themeLabel: 'Tema: {{mode}} (clicca per cambiare)',
            gameLanguage: 'Lingua di gioco', scoringSystem: 'Sistema di punteggio',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Scrabble Ufficiale',
            sysDesc_frizzy: 'Il sistema classico di LexiSmash, pensato in base a quanto spesso compare ogni lettera in italiano. Disponibile solo per l\'italiano.',
            sysDesc_scrabble: 'I valori delle lettere del set ufficiale di Scrabble per questa lingua.',
            sysNote: 'Il gioco ha anche il sistema "Casuale" (ogni lettera pescata vale da 1 a 9 punti) e quello "Personalizzato" (i valori li decide il Master della stanza): nessuno dei due ha dati fissi da correggere.',
            editMode: '✏️ Proponi modifiche',
            editHint: 'Modalità modifica: seleziona una lettera e scegli il nuovo valore. Le modifiche restano in questa pagina finché non le invii.',
            pickLetter: 'Seleziona una lettera per vederne il valore in tutte le lingue.',
            valueIn: 'Vale {{value}} {{points}} in {{system}}',
            point: 'punto', points: 'punti',
            notScored: 'Nessun valore in questo sistema',
            otherLanguages: 'La stessa lettera nelle altre lingue',
            newValue: 'Nuovo valore:',
            restore: 'Ripristina il valore originale',
            notDrawable: 'Non fa parte delle lettere di questa lingua: non viene mai pescata.',
            alphabetTitle: 'Lettere che si possono pescare',
            alphabetIntro: 'Quando un giocatore chiede una vocale o una consonante, il gioco pesca a caso una di queste lettere.',
            vowels: 'Vocali', consonants: 'Consonanti',
            neverDrawn: 'Hanno un valore ma in questa lingua non si pescano mai: {{letters}}',
            proposalTitle: 'La tua proposta',
            reasonLabel: 'Perché questi valori dovrebbero cambiare?',
            reasonPlaceholder: 'es. nel set ufficiale dello Scrabble spagnolo la Ñ vale 8 punti, non 10.',
            openIssue: 'Apri una Issue con queste modifiche',
            copyJson: 'Copia il JSON aggiornato',
            editOnGithub: 'Modifica il file su GitHub (Pull Request)',
            resetChanges: 'Annulla le modifiche',
            copied: 'Copiato! Incollalo in data/scoring/{{lang}}.json nella tua Pull Request.',
            copyFailed: 'Copia non riuscita: seleziona il testo a mano dall\'anteprima della Issue.',
            loading: 'Caricamento…',
            loadError: '⚠️ Impossibile caricare i dati. Se hai aperto la pagina dal disco (file://), servi la cartella "docs" con un server locale (es. "python3 -m http.server").',
            footer: 'I valori delle lettere sono fatti, non codice: vedi <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. Vuoi aiutare? Leggi <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">come proporre una correzione</a>.'
        },
        fr: {
            title: 'Points des Lettres de LexiSmash',
            subtitle: 'Les valeurs et les ensembles de lettres utilisés par <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a> : vérifie-les et propose une correction.',
            uiLanguage: 'Langue du site', uiLanguageHint: 'Automatique au départ, d\'après ton navigateur.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Clair', themeDark: '🌙 Sombre', themeLabel: 'Thème : {{mode}} (clique pour changer)',
            gameLanguage: 'Langue de jeu', scoringSystem: 'Système de points',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Scrabble Officiel',
            sysDesc_frizzy: 'Le système classique de LexiSmash, conçu selon la fréquence de chaque lettre en italien. Disponible uniquement pour l\'italien.',
            sysDesc_scrabble: 'Les valeurs des lettres du jeu officiel de Scrabble pour cette langue.',
            sysNote: 'Le jeu propose aussi le système « Aléatoire » (chaque lettre tirée vaut de 1 à 9 points) et le système « Personnalisé » (le Master de la salle décide des valeurs) : aucun des deux n\'a de données fixes à corriger.',
            editMode: '✏️ Proposer des modifications',
            editHint: 'Mode modification : sélectionne une lettre, puis choisis sa nouvelle valeur. Tes modifications restent sur cette page jusqu\'à ce que tu les envoies.',
            pickLetter: 'Sélectionne une lettre pour voir sa valeur dans toutes les langues.',
            valueIn: 'Vaut {{value}} {{points}} en {{system}}',
            point: 'point', points: 'points',
            notScored: 'Aucune valeur dans ce système',
            otherLanguages: 'La même lettre dans les autres langues',
            newValue: 'Nouvelle valeur :',
            restore: 'Rétablir la valeur d\'origine',
            notDrawable: 'Ne fait pas partie des lettres de cette langue : elle n\'est jamais tirée.',
            alphabetTitle: 'Lettres qui peuvent être tirées',
            alphabetIntro: 'Quand un joueur demande une voyelle ou une consonne, le jeu tire au hasard l\'une de ces lettres.',
            vowels: 'Voyelles', consonants: 'Consonnes',
            neverDrawn: 'Ont une valeur mais ne sont jamais tirées dans cette langue : {{letters}}',
            proposalTitle: 'Ta proposition',
            reasonLabel: 'Pourquoi ces valeurs devraient-elles changer ?',
            reasonPlaceholder: 'ex. dans le jeu officiel du Scrabble espagnol, le Ñ vaut 8 points, pas 10.',
            openIssue: 'Ouvrir une Issue avec ces modifications',
            copyJson: 'Copier le JSON mis à jour',
            editOnGithub: 'Modifier le fichier sur GitHub (Pull Request)',
            resetChanges: 'Annuler les modifications',
            copied: 'Copié ! Colle-le dans data/scoring/{{lang}}.json dans ta Pull Request.',
            copyFailed: 'Copie impossible : sélectionne le texte à la main depuis l\'aperçu de l\'Issue.',
            loading: 'Chargement…',
            loadError: '⚠️ Impossible de charger les données. Si tu as ouvert la page depuis le disque (file://), sers le dossier « docs » avec un serveur local (ex. « python3 -m http.server »).',
            footer: 'Les valeurs des lettres sont des faits, pas du code : voir <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. Envie d\'aider ? Lis <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">comment proposer une correction</a>.'
        },
        de: {
            title: 'Buchstabenpunkte von LexiSmash',
            subtitle: 'Die Buchstabenwerte und Buchstabensätze von <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a>: prüfe sie und schlage eine Korrektur vor.',
            uiLanguage: 'Sprache der Seite', uiLanguageHint: 'Zuerst automatisch, aus deinem Browser.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Hell', themeDark: '🌙 Dunkel', themeLabel: 'Design: {{mode}} (zum Ändern klicken)',
            gameLanguage: 'Spielsprache', scoringSystem: 'Punktesystem',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Offizielles Scrabble',
            sysDesc_frizzy: 'Das klassische System von LexiSmash, aufgebaut darauf, wie häufig jeder Buchstabe im Italienischen vorkommt. Nur für Italienisch verfügbar.',
            sysDesc_scrabble: 'Die Buchstabenwerte des offiziellen Scrabble-Sets für diese Sprache.',
            sysNote: 'Das Spiel hat auch das System „Zufällig“ (jeder gezogene Buchstabe ist 1–9 Punkte wert) und „Benutzerdefiniert“ (der Master des Raums legt die Werte fest): beide haben keine festen Daten zum Korrigieren.',
            editMode: '✏️ Änderungen vorschlagen',
            editHint: 'Bearbeitungsmodus: wähle einen Buchstaben und dann seinen neuen Wert. Deine Änderungen bleiben auf dieser Seite, bis du sie absendest.',
            pickLetter: 'Wähle einen Buchstaben, um seinen Wert in allen Sprachen zu sehen.',
            valueIn: '{{value}} {{points}} wert in {{system}}',
            point: 'Punkt', points: 'Punkte',
            notScored: 'Kein Wert in diesem System',
            otherLanguages: 'Derselbe Buchstabe in den anderen Sprachen',
            newValue: 'Neuer Wert:',
            restore: 'Ursprünglichen Wert wiederherstellen',
            notDrawable: 'Gehört nicht zum Buchstabensatz dieser Sprache: er wird nie gezogen.',
            alphabetTitle: 'Buchstaben, die gezogen werden können',
            alphabetIntro: 'Wenn ein Spieler einen Vokal oder einen Konsonanten verlangt, zieht das Spiel zufällig einen dieser Buchstaben.',
            vowels: 'Vokale', consonants: 'Konsonanten',
            neverDrawn: 'Haben einen Wert, werden in dieser Sprache aber nie gezogen: {{letters}}',
            proposalTitle: 'Dein Vorschlag',
            reasonLabel: 'Warum sollten sich diese Werte ändern?',
            reasonPlaceholder: 'z. B. im offiziellen spanischen Scrabble ist Ñ 8 Punkte wert, nicht 10.',
            openIssue: 'Ein Issue mit diesen Änderungen öffnen',
            copyJson: 'Aktualisiertes JSON kopieren',
            editOnGithub: 'Datei auf GitHub bearbeiten (Pull Request)',
            resetChanges: 'Änderungen verwerfen',
            copied: 'Kopiert! Füge es in deinem Pull Request in data/scoring/{{lang}}.json ein.',
            copyFailed: 'Kopieren fehlgeschlagen: markiere den Text von Hand in der Issue-Vorschau.',
            loading: 'Wird geladen…',
            loadError: '⚠️ Die Daten konnten nicht geladen werden. Wenn du die Seite von der Festplatte geöffnet hast (file://), stelle den Ordner „docs“ über einen lokalen Server bereit (z. B. „python3 -m http.server“).',
            footer: 'Buchstabenwerte sind Fakten, kein Code: siehe <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. Möchtest du helfen? Lies, <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">wie man eine Korrektur vorschlägt</a>.'
        },
        es: {
            title: 'Puntos de las Letras de LexiSmash',
            subtitle: 'Los valores y los conjuntos de letras que usa <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a>: compruébalos y propón una corrección.',
            uiLanguage: 'Idioma del sitio', uiLanguageHint: 'Al principio es automático, según tu navegador.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Claro', themeDark: '🌙 Oscuro', themeLabel: 'Tema: {{mode}} (haz clic para cambiar)',
            gameLanguage: 'Idioma de juego', scoringSystem: 'Sistema de puntuación',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Scrabble Oficial',
            sysDesc_frizzy: 'El sistema clásico de LexiSmash, pensado según la frecuencia de cada letra en italiano. Solo disponible para el italiano.',
            sysDesc_scrabble: 'Los valores de las letras del juego oficial de Scrabble para este idioma.',
            sysNote: 'El juego también tiene el sistema «Aleatorio» (cada letra extraída vale de 1 a 9 puntos) y el «Personalizado» (los valores los decide el Master de la sala): ninguno de los dos tiene datos fijos que corregir.',
            editMode: '✏️ Proponer cambios',
            editHint: 'Modo edición: selecciona una letra y elige su nuevo valor. Tus cambios se quedan en esta página hasta que los envíes.',
            pickLetter: 'Selecciona una letra para ver su valor en todos los idiomas.',
            valueIn: 'Vale {{value}} {{points}} en {{system}}',
            point: 'punto', points: 'puntos',
            notScored: 'Sin valor en este sistema',
            otherLanguages: 'La misma letra en los demás idiomas',
            newValue: 'Nuevo valor:',
            restore: 'Restaurar el valor original',
            notDrawable: 'No forma parte de las letras de este idioma: nunca se saca.',
            alphabetTitle: 'Letras que se pueden sacar',
            alphabetIntro: 'Cuando un jugador pide una vocal o una consonante, el juego saca al azar una de estas letras.',
            vowels: 'Vocales', consonants: 'Consonantes',
            neverDrawn: 'Tienen valor pero en este idioma nunca se sacan: {{letters}}',
            proposalTitle: 'Tu propuesta',
            reasonLabel: '¿Por qué deberían cambiar estos valores?',
            reasonPlaceholder: 'p. ej. en el juego oficial del Scrabble español la Ñ vale 8 puntos, no 10.',
            openIssue: 'Abrir una Issue con estos cambios',
            copyJson: 'Copiar el JSON actualizado',
            editOnGithub: 'Editar el archivo en GitHub (Pull Request)',
            resetChanges: 'Descartar los cambios',
            copied: '¡Copiado! Pégalo en data/scoring/{{lang}}.json en tu Pull Request.',
            copyFailed: 'No se pudo copiar: selecciona el texto a mano en la vista previa de la Issue.',
            loading: 'Cargando…',
            loadError: '⚠️ No se pudieron cargar los datos. Si abriste la página desde el disco (file://), sirve la carpeta «docs» con un servidor local (p. ej. «python3 -m http.server»).',
            footer: 'Los valores de las letras son hechos, no código: consulta <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. ¿Quieres ayudar? Lee <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">cómo proponer una corrección</a>.'
        },
        nl: {
            title: 'Letterpunten van LexiSmash',
            subtitle: 'De letterwaarden en lettersets van <a href="https://lexismash.it" target="_blank" rel="noopener noreferrer">LexiSmash</a>: controleer ze en stel een correctie voor.',
            uiLanguage: 'Taal van de site', uiLanguageHint: 'Eerst automatisch, op basis van je browser.',
            themeAuto: '🌓 Auto', themeLight: '☀️ Licht', themeDark: '🌙 Donker', themeLabel: 'Thema: {{mode}} (klik om te wisselen)',
            gameLanguage: 'Speltaal', scoringSystem: 'Puntensysteem',
            sys_frizzy: 'Standard Scarabeo', sys_scrabble: 'Officieel Scrabble',
            sysDesc_frizzy: 'Het klassieke systeem van LexiSmash, gebaseerd op hoe vaak elke letter in het Italiaans voorkomt. Alleen beschikbaar voor het Italiaans.',
            sysDesc_scrabble: 'De letterwaarden van de officiële Scrabble-set voor deze taal.',
            sysNote: 'Het spel heeft ook het systeem "Willekeurig" (elke getrokken letter is 1–9 punten waard) en "Aangepast" (de Master van de kamer bepaalt de waarden): geen van beide heeft vaste gegevens om te corrigeren.',
            editMode: '✏️ Wijzigingen voorstellen',
            editHint: 'Bewerkmodus: kies een letter en daarna de nieuwe waarde. Je wijzigingen blijven op deze pagina tot je ze verstuurt.',
            pickLetter: 'Kies een letter om de waarde in alle talen te zien.',
            valueIn: '{{value}} {{points}} waard in {{system}}',
            point: 'punt', points: 'punten',
            notScored: 'Geen waarde in dit systeem',
            otherLanguages: 'Dezelfde letter in de andere talen',
            newValue: 'Nieuwe waarde:',
            restore: 'Oorspronkelijke waarde herstellen',
            notDrawable: 'Hoort niet bij de letters van deze taal: wordt nooit getrokken.',
            alphabetTitle: 'Letters die getrokken kunnen worden',
            alphabetIntro: 'Als een speler om een klinker of medeklinker vraagt, trekt het spel willekeurig een van deze letters.',
            vowels: 'Klinkers', consonants: 'Medeklinkers',
            neverDrawn: 'Hebben een waarde maar worden in deze taal nooit getrokken: {{letters}}',
            proposalTitle: 'Jouw voorstel',
            reasonLabel: 'Waarom zouden deze waarden moeten veranderen?',
            reasonPlaceholder: 'bijv. in de officiële Spaanse Scrabble-set is de Ñ 8 punten waard, niet 10.',
            openIssue: 'Een Issue openen met deze wijzigingen',
            copyJson: 'Bijgewerkte JSON kopiëren',
            editOnGithub: 'Het bestand op GitHub bewerken (Pull Request)',
            resetChanges: 'Wijzigingen weggooien',
            copied: 'Gekopieerd! Plak het in data/scoring/{{lang}}.json in je Pull Request.',
            copyFailed: 'Kopiëren mislukt: selecteer de tekst handmatig in de voorbeeldweergave van de Issue.',
            loading: 'Laden…',
            loadError: '⚠️ De gegevens konden niet worden geladen. Heb je de pagina vanaf de schijf geopend (file://), serveer de map "docs" dan met een lokale server (bijv. "python3 -m http.server").',
            footer: 'Letterwaarden zijn feiten, geen code: zie <a href="./data/LICENSES.md" target="_blank" rel="noopener noreferrer">LICENSES.md</a>. Wil je helpen? Lees <a href="https://github.com/LexiSmash/LexiSmash_scoring/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">hoe je een correctie voorstelt</a>.'
        }
    };

    // ------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
    };
    let uiLang = 'en';
    let gameLang = 'it';
    let system = 'frizzy';
    let selectedLetter = null;
    let editMode = false;
    const scoring = {};   // lang -> { system -> { letter: value } }
    const alphabets = {}; // lang -> { vocals: [], consonants: [] }
    const drafts = {};    // "lang/system" -> { letter: newValue }

    const $ = (id) => document.getElementById(id);

    function t(key, vars) {
        let s = (STRINGS[uiLang] && STRINGS[uiLang][key]) || STRINGS.en[key] || key;
        if (vars) Object.keys(vars).forEach((k) => { s = s.split(`{{${k}}}`).join(vars[k]); });
        return s;
    }

    // ------------------------------------------------------------------
    // Site language: saved choice, otherwise the browser's, otherwise English.
    // ------------------------------------------------------------------
    function detectUiLang() {
        const saved = store.get('lsx_lang');
        if (saved && STRINGS[saved]) return saved;
        const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
        for (const l of list) {
            const code = String(l).slice(0, 2).toLowerCase();
            if (STRINGS[code]) return code;
        }
        return 'en';
    }

    function applyStrings() {
        document.documentElement.lang = uiLang;
        document.title = `${t('title')} — Explorer`;
        document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
        renderThemeButton();
    }

    function renderUiLangSelect() {
        const sel = $('ui-lang');
        sel.innerHTML = LANGS.map((c) => `<option value="${c}">${LANG_META[c].flag} ${LANG_META[c].native}</option>`).join('');
        sel.value = uiLang;
        sel.setAttribute('aria-label', t('uiLanguage'));
        sel.addEventListener('change', () => {
            uiLang = sel.value;
            store.set('lsx_lang', uiLang);
            applyStrings();
            renderAll();
        });
    }

    // ------------------------------------------------------------------
    // Theme: auto -> light -> dark -> auto
    // ------------------------------------------------------------------
    function themePref() { return store.get('lsx_theme') || 'auto'; }
    function applyTheme() {
        const pref = themePref();
        const dark = pref === 'dark' || (pref === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        renderThemeButton();
    }
    function renderThemeButton() {
        const pref = themePref();
        const label = pref === 'dark' ? t('themeDark') : pref === 'light' ? t('themeLight') : t('themeAuto');
        const btn = $('theme-toggle');
        btn.textContent = label;
        btn.setAttribute('aria-label', t('themeLabel', { mode: label }));
        btn.title = t('themeLabel', { mode: label });
    }
    function wireTheme() {
        $('theme-toggle').addEventListener('click', () => {
            const next = { auto: 'light', light: 'dark', dark: 'auto' }[themePref()] || 'auto';
            store.set('lsx_theme', next);
            applyTheme();
        });
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = () => { if (themePref() === 'auto') applyTheme(); };
            if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
        }
    }

    // ------------------------------------------------------------------
    // Data helpers
    // ------------------------------------------------------------------
    function systemsFor(lang) {
        const s = scoring[lang] || {};
        return SYSTEM_ORDER.filter((k) => s[k]);
    }
    function draftKey() { return `${gameLang}/${system}`; }
    function originalValues() { return (scoring[gameLang] && scoring[gameLang][system]) || {}; }
    function effectiveValues() { return { ...originalValues(), ...(drafts[draftKey()] || {}) }; }
    function drawable(lang) {
        const a = alphabets[lang] || { vocals: [], consonants: [] };
        return new Set([...(a.vocals || []), ...(a.consonants || [])]);
    }
    function colorFor(value) { return VALUE_COLORS[Math.max(1, Math.min(10, value)) - 1]; }

    // ------------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------------
    function renderGameLangTabs() {
        const el = $('game-lang-tabs');
        el.innerHTML = '';
        LANGS.forEach((code) => {
            const b = document.createElement('button');
            b.className = 'tab';
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', String(code === gameLang));
            b.textContent = `${LANG_META[code].flag} ${LANG_META[code].native}`;
            b.addEventListener('click', () => {
                gameLang = code;
                if (!systemsFor(gameLang).includes(system)) system = systemsFor(gameLang)[0];
                selectedLetter = null;
                renderAll();
            });
            el.appendChild(b);
        });
    }

    function renderSystemTabs() {
        const el = $('system-tabs');
        el.innerHTML = '';
        systemsFor(gameLang).forEach((sys) => {
            const b = document.createElement('button');
            b.className = 'tab';
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', String(sys === system));
            b.textContent = t(`sys_${sys}`);
            b.addEventListener('click', () => { system = sys; renderAll(); });
            el.appendChild(b);
        });
        $('system-description').textContent = `${t(`sysDesc_${system}`)} ${t('sysNote')}`;
        $('edit-hint').hidden = !editMode;
    }

    function chip(letter, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = letter;
        if (opts.selected) b.classList.add('selected');
        if (opts.changed) b.classList.add('changed');
        if (opts.notDrawable) b.classList.add('not-drawable');
        b.setAttribute('aria-pressed', String(!!opts.selected));
        b.addEventListener('click', () => { selectedLetter = letter; renderTiers(); renderDetail(); });
        return b;
    }

    function renderTiers() {
        const el = $('tier-list');
        el.innerHTML = '';
        const values = effectiveValues();
        const draft = drafts[draftKey()] || {};
        const canDraw = drawable(gameLang);
        const byValue = {};
        Object.entries(values).forEach(([l, v]) => { (byValue[v] = byValue[v] || []).push(l); });
        Object.keys(byValue).map(Number).sort((a, b) => a - b).forEach((v) => {
            const row = document.createElement('div');
            row.className = 'tier';
            row.style.setProperty('--tier-color', colorFor(v));
            const badge = document.createElement('div');
            badge.className = 'tier-value';
            badge.textContent = v;
            const chips = document.createElement('div');
            chips.className = 'chips';
            byValue[v].sort().forEach((l) => chips.appendChild(chip(l, {
                selected: l === selectedLetter, changed: l in draft, notDrawable: !canDraw.has(l)
            })));
            row.appendChild(badge);
            row.appendChild(chips);
            el.appendChild(row);
        });
    }

    function renderDetail() {
        const el = $('letter-detail');
        el.innerHTML = '';
        if (!selectedLetter) {
            el.textContent = t('pickLetter');
            return;
        }
        const values = effectiveValues();
        const v = values[selectedLetter];
        const big = document.createElement('div');
        big.className = 'detail-letter';
        big.textContent = selectedLetter;
        const val = document.createElement('div');
        val.className = 'detail-value';
        val.textContent = v ? t('valueIn', { value: v, points: v === 1 ? t('point') : t('points'), system: t(`sys_${system}`) }) : t('notScored');
        el.appendChild(big);
        el.appendChild(val);
        if (!drawable(gameLang).has(selectedLetter)) {
            const nd = document.createElement('p');
            nd.className = 'muted';
            nd.textContent = t('notDrawable');
            el.appendChild(nd);
        }

        if (editMode) {
            const lbl = document.createElement('div');
            lbl.className = 'small-title';
            lbl.textContent = t('newValue');
            el.appendChild(lbl);
            const picker = document.createElement('div');
            picker.className = 'value-picker';
            for (let n = 1; n <= 10; n++) {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = n;
                if (n === v) b.classList.add('current');
                b.addEventListener('click', () => setDraft(selectedLetter, n));
                picker.appendChild(b);
            }
            el.appendChild(picker);
            if (drafts[draftKey()] && selectedLetter in drafts[draftKey()]) {
                const r = document.createElement('button');
                r.type = 'button';
                r.className = 'button ghost';
                r.textContent = t('restore');
                r.addEventListener('click', () => setDraft(selectedLetter, null));
                el.appendChild(r);
            }
        }

        const h = document.createElement('div');
        h.className = 'small-title';
        h.style.marginTop = '0.8rem';
        h.textContent = t('otherLanguages');
        el.appendChild(h);
        const table = document.createElement('table');
        table.className = 'detail-table';
        LANGS.forEach((code) => {
            const sys = (scoring[code] && scoring[code].scrabble) ? 'scrabble' : systemsFor(code)[0];
            const value = sys && scoring[code][sys][selectedLetter];
            const tr = document.createElement('tr');
            const a = document.createElement('td');
            a.textContent = `${LANG_META[code].flag} ${LANG_META[code].native}`;
            const b = document.createElement('td');
            b.textContent = value ? String(value) : '—';
            tr.appendChild(a);
            tr.appendChild(b);
            table.appendChild(tr);
        });
        el.appendChild(table);
    }

    function renderAlphabet() {
        const a = alphabets[gameLang] || { vocals: [], consonants: [] };
        const make = (letters) => letters.map((l) => {
            const s = document.createElement('span');
            s.className = 'chip static';
            s.textContent = l;
            return s;
        });
        $('vowels').replaceChildren(...make([...new Set(a.vocals || [])]));
        $('consonants').replaceChildren(...make([...new Set(a.consonants || [])]));
        const canDraw = drawable(gameLang);
        const never = Object.keys(effectiveValues()).filter((l) => !canDraw.has(l)).sort();
        $('never-drawn').textContent = never.length ? t('neverDrawn', { letters: never.join(', ') }) : '';
    }

    // ------------------------------------------------------------------
    // Proposal (Issue / JSON / Pull Request)
    // ------------------------------------------------------------------
    function setDraft(letter, value) {
        const key = draftKey();
        const original = originalValues()[letter];
        drafts[key] = drafts[key] || {};
        if (value === null || value === original) delete drafts[key][letter];
        else drafts[key][letter] = value;
        if (Object.keys(drafts[key]).length === 0) delete drafts[key];
        renderTiers();
        renderDetail();
        renderAlphabet();
        renderProposal();
    }

    function allChanges() {
        const out = [];
        Object.entries(drafts).forEach(([key, changes]) => {
            const [lang, sys] = key.split('/');
            Object.entries(changes).forEach(([letter, to]) => {
                out.push({ lang, sys, letter, from: scoring[lang][sys][letter], to });
            });
        });
        return out;
    }

    function updatedJson(lang) {
        const base = JSON.parse(JSON.stringify({ lang, systems: Object.fromEntries(systemsFor(lang).map((s) => [s, { values: scoring[lang][s] }])) }));
        systemsFor(lang).forEach((s) => Object.assign(base.systems[s].values, drafts[`${lang}/${s}`] || {}));
        return JSON.stringify(base, null, 2);
    }

    function renderProposal() {
        const changes = allChanges();
        const card = $('proposal-card');
        card.hidden = !editMode;
        const list = $('change-list');
        list.innerHTML = '';
        changes.forEach((c) => {
            const li = document.createElement('li');
            li.textContent = `${LANG_META[c.lang].flag} ${t(`sys_${c.sys}`)} — ${c.letter}: ${c.from ?? '—'} → ${c.to}`;
            list.appendChild(li);
        });
        const has = changes.length > 0;
        ['open-issue', 'copy-json', 'reset-changes'].forEach((id) => $(id).setAttribute('aria-disabled', String(!has)));
        $('copy-json').disabled = !has;
        $('reset-changes').disabled = !has;

        // Prefilled Issue (always written in English, so every reviewer can read it).
        const langs = [...new Set(changes.map((c) => c.lang))];
        const title = `[Scores] ${langs.map((l) => l.toUpperCase()).join(', ')}: ${changes.map((c) => `${c.letter} ${c.from ?? '—'}→${c.to}`).join(', ')}`.slice(0, 200);
        const body = [
            '### Proposed changes',
            ...changes.map((c) => `- **${c.lang}** / \`${c.sys}\`: **${c.letter}** ${c.from ?? '(none)'} → **${c.to}**`),
            '',
            '### Why',
            $('reason').value.trim() || '_(please explain, ideally with a source)_',
            '',
            '_Prepared with the LexiSmash Letter Scores Explorer._'
        ].join('\n');
        $('open-issue').href = `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent('score correction')}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
        $('edit-on-github').href = `https://github.com/${REPO}/edit/${BRANCH}/docs/data/scoring/${langs[0] || gameLang}.json`;
    }

    function wireProposal() {
        $('edit-mode').addEventListener('change', (e) => {
            editMode = e.target.checked;
            renderAll();
        });
        $('reason').addEventListener('input', renderProposal);
        $('reset-changes').addEventListener('click', () => {
            Object.keys(drafts).forEach((k) => delete drafts[k]);
            renderAll();
        });
        $('copy-json').addEventListener('click', async () => {
            const lang = (allChanges()[0] || {}).lang || gameLang;
            try {
                await navigator.clipboard.writeText(updatedJson(lang));
                $('copy-status').textContent = t('copied', { lang });
            } catch (e) {
                $('copy-status').textContent = t('copyFailed');
            }
        });
    }

    function renderAll() {
        renderGameLangTabs();
        renderSystemTabs();
        renderTiers();
        renderDetail();
        renderAlphabet();
        renderProposal();
    }

    // ------------------------------------------------------------------
    // Start
    // ------------------------------------------------------------------
    async function init() {
        uiLang = detectUiLang();
        gameLang = uiLang;
        applyTheme();
        wireTheme();
        renderUiLangSelect();
        applyStrings();
        wireProposal();
        $('tier-list').textContent = t('loading');

        try {
            await Promise.all(LANGS.map(async (code) => {
                const [s, a] = await Promise.all([
                    fetch(`./data/scoring/${code}.json`).then((r) => { if (!r.ok) throw new Error(code); return r.json(); }),
                    fetch(`./data/alphabets/${code}.json`).then((r) => { if (!r.ok) throw new Error(code); return r.json(); })
                ]);
                scoring[code] = Object.fromEntries(Object.entries(s.systems || {}).map(([k, v]) => [k, v.values || {}]));
                alphabets[code] = a;
            }));
        } catch (err) {
            console.error(err);
            $('tier-list').textContent = t('loadError');
            return;
        }
        system = systemsFor(gameLang)[0];
        renderAll();
    }

    init();
})();
