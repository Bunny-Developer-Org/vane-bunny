// Flat, dot-namespaced keys (rather than nested objects) so `pl` is typed as
// Record<TranslationKey, string> — TypeScript then errors if a translation is
// missing or misspelled in either language, without needing a recursive type.
const en = {
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.back': '‹ Back',
  'common.avg': 'avg',
  'common.average': 'average',
  'common.median': 'median',
  'common.entryOne': 'entry',
  'common.entryFew': 'entries',
  'common.entryMany': 'entries',

  'tabs.checkIn': 'Check in',

  'checkIn.prompt': 'How are you, right now?',
  'checkIn.avgToday': 'avg today',
  'checkIn.checkInOne': 'check-in',
  'checkIn.checkInFew': 'check-ins',
  'checkIn.checkInMany': 'check-ins',
  'checkIn.notePlaceholder': 'Add a short note (optional)',
  'checkIn.save': 'Save check-in',

  'moodPicker.outOf10': 'out of 10',
  'moodPicker.moodLabel': 'Mood {{score}} of 10',

  'history.title': 'History',
  'history.emptyTitle': 'Nothing here yet',
  'history.emptyBody': 'Your daily check-ins will show up here.',

  'dayDetail.noEntries': 'No entries for this day.',
  'dayDetail.deleteTitle': 'Delete this entry?',
  'dayDetail.deleteMessage': 'This can’t be undone.',
  'dayDetail.deleteEntryLabel': 'Delete entry',

  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.language': 'Language',
  'settings.about': 'About',
  'settings.privacyPolicy': 'Privacy policy',
  'settings.version': 'Version',
  'settings.footnote':
    'Vane Bunny keeps everything on this device. No account, no analytics, no network calls.',

  'privacy.title': 'Privacy Policy',
  'privacy.updated': 'Last updated: July 2026',
  'privacy.summaryStrong': 'The short version: ',
  'privacy.summaryText':
    "Vane Bunny collects nothing. There's no account, no analytics, no crash reporting, and no network access at all. Everything you enter stays only on your device.",
  'privacy.sectionCollectTitle': 'What data we collect',
  'privacy.sectionCollectBody':
    'None. Vane Bunny does not have user accounts, does not use analytics or advertising SDKs, does not use crash-reporting services, and does not make any network requests. There is nothing for us — the developer — to see, store, or receive.',
  'privacy.sectionStoreTitle': 'What the app stores, and where',
  'privacy.sectionStoreBody':
    "When you log a mood check-in (a score from 1–10 and an optional short note), it's saved using your device's local on-device storage only. It never leaves your device — not to a server, not to us, not to anyone.",
  'privacy.sectionDeleteTitle': 'Deleting your data',
  'privacy.sectionDeleteBody':
    'You can delete an individual check-in at any time from within the app. Uninstalling the app removes all of its data from your device, since nothing exists anywhere else.',
  'privacy.sectionThirdPartyTitle': 'Third parties',
  'privacy.sectionThirdPartyBody':
    "None are involved. Vane Bunny doesn't share data with anyone because it doesn't collect or transmit any data in the first place.",
  'privacy.sectionChildrenTitle': "Children's privacy",
  'privacy.sectionChildrenBody':
    'Because the app collects no personal information from anyone, it does not knowingly collect information from children either.',
  'privacy.sectionChangesTitle': 'Changes to this policy',
  'privacy.sectionChangesBody':
    "If Vane Bunny's data practices ever change (for example, if a future version adds optional cloud sync), this page will be updated first, and the change will be reflected in the app's description in whichever app store it's distributed through.",
} as const;

export type TranslationKey = keyof typeof en;

const pl: Record<TranslationKey, string> = {
  'common.cancel': 'Anuluj',
  'common.delete': 'Usuń',
  'common.back': '‹ Wstecz',
  'common.avg': 'śr.',
  'common.average': 'średnia',
  'common.median': 'mediana',
  'common.entryOne': 'wpis',
  'common.entryFew': 'wpisy',
  'common.entryMany': 'wpisów',

  'tabs.checkIn': 'Wpis',

  'checkIn.prompt': 'Jak się teraz czujesz?',
  'checkIn.avgToday': 'śr. dzisiaj',
  'checkIn.checkInOne': 'wpis',
  'checkIn.checkInFew': 'wpisy',
  'checkIn.checkInMany': 'wpisów',
  'checkIn.notePlaceholder': 'Dodaj krótką notatkę (opcjonalnie)',
  'checkIn.save': 'Zapisz wpis',

  'moodPicker.outOf10': 'na 10',
  'moodPicker.moodLabel': 'Nastrój {{score}} na 10',

  'history.title': 'Historia',
  'history.emptyTitle': 'Nic tu jeszcze nie ma',
  'history.emptyBody': 'Twoje codzienne wpisy pojawią się tutaj.',

  'dayDetail.noEntries': 'Brak wpisów tego dnia.',
  'dayDetail.deleteTitle': 'Usunąć ten wpis?',
  'dayDetail.deleteMessage': 'Tej operacji nie można cofnąć.',
  'dayDetail.deleteEntryLabel': 'Usuń wpis',

  'settings.title': 'Ustawienia',
  'settings.appearance': 'Wygląd',
  'settings.language': 'Język',
  'settings.about': 'Informacje',
  'settings.privacyPolicy': 'Polityka prywatności',
  'settings.version': 'Wersja',
  'settings.footnote':
    'Vane Bunny przechowuje wszystko na tym urządzeniu. Bez konta, bez analityki, bez połączeń z siecią.',

  'privacy.title': 'Polityka prywatności',
  'privacy.updated': 'Ostatnia aktualizacja: lipiec 2026',
  'privacy.summaryStrong': 'W skrócie: ',
  'privacy.summaryText':
    'Vane Bunny nic nie zbiera. Nie ma konta, analityki, raportowania awarii ani jakiegokolwiek dostępu do sieci. Wszystko, co wpiszesz, zostaje wyłącznie na Twoim urządzeniu.',
  'privacy.sectionCollectTitle': 'Jakie dane zbieramy',
  'privacy.sectionCollectBody':
    'Żadne. Vane Bunny nie posiada kont użytkowników, nie korzysta z analityki ani SDK reklamowych, nie używa usług raportowania awarii i nie wykonuje żadnych zapytań sieciowych. Nie ma nic, co my — twórca — moglibyśmy zobaczyć, zapisać czy otrzymać.',
  'privacy.sectionStoreTitle': 'Co aplikacja przechowuje i gdzie',
  'privacy.sectionStoreBody':
    'Gdy zapisujesz wpis nastroju (ocenę od 1 do 10 i opcjonalną krótką notatkę), jest on zapisywany wyłącznie w lokalnej pamięci Twojego urządzenia. Nigdy nie opuszcza urządzenia — ani na serwer, ani do nas, ani do nikogo innego.',
  'privacy.sectionDeleteTitle': 'Usuwanie danych',
  'privacy.sectionDeleteBody':
    'W dowolnym momencie możesz usunąć pojedynczy wpis w aplikacji. Odinstalowanie aplikacji usuwa wszystkie jej dane z urządzenia, ponieważ nic nie istnieje nigdzie indziej.',
  'privacy.sectionThirdPartyTitle': 'Strony trzecie',
  'privacy.sectionThirdPartyBody':
    'Żadne nie są zaangażowane. Vane Bunny nie udostępnia danych nikomu, ponieważ w ogóle ich nie zbiera ani nie przesyła.',
  'privacy.sectionChildrenTitle': 'Prywatność dzieci',
  'privacy.sectionChildrenBody':
    'Ponieważ aplikacja nie zbiera od nikogo żadnych danych osobowych, świadomie nie zbiera również danych od dzieci.',
  'privacy.sectionChangesTitle': 'Zmiany w tej polityce',
  'privacy.sectionChangesBody':
    'Jeśli praktyki dotyczące danych Vane Bunny kiedykolwiek się zmienią (na przykład gdy przyszła wersja doda opcjonalną synchronizację w chmurze), ta strona zostanie zaktualizowana jako pierwsza, a zmiana znajdzie odzwierciedlenie w opisie aplikacji w sklepie, przez który jest dystrybuowana.',
};

export const translations = { en, pl };
