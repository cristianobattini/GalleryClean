import { getLocales } from 'expo-localization';

const translations = {
  en: {
    // SwipeScreen
    loadedTitle: 'Loading complete',
    loadedBody: (n: number) => `${n} assets loaded (max 1000).`,
    ok: 'OK',
    noAccess: 'No access',
    noAccessSub: 'Enable photo library access in Settings.',
    loading: 'Loading gallery...',
    allReviewed: 'All done!',
    toDelete: (n: number) => `${n} items to delete`,
    nothingToDelete: 'Nothing to delete',
    viewSummary: 'View summary',
    keep: 'KEEP',
    delete: 'DELETE',
    // FilterScreen
    all: 'All',
    photos: 'Photos',
    videos: 'Videos',
    newest: 'Newest first',
    oldest: 'Oldest first',
    lastModified: 'Last modified',
    filters: 'FILTERS',
    mediaType: 'MEDIA TYPE',
    sortBy: 'SORT BY',
    album: 'ALBUM',
    allMedia: 'All media',
    items: (n: number) => `${n} items`,
    // SummaryScreen
    deleteConfirmTitle: 'Delete permanently',
    deleteConfirmBody: (n: number) =>
      `You are about to delete ${n} file${n !== 1 ? 's' : ''}. This action is irreversible.`,
    cancel: 'Cancel',
    summary: 'SUMMARY',
    toDeleteLabel: 'to delete',
    kept: 'kept',
    remaining: 'remaining',
    nothingToDeleteSummary: 'No items to delete',
    deleting: 'Deleting...',
    deleteFiles: (n: number) => `Delete ${n} file${n !== 1 ? 's' : ''}`,
  },
  it: {
    loadedTitle: 'Caricamento completato',
    loadedBody: (n: number) => `Sono stati caricati ${n} elementi (limite massimo: 1000).`,
    ok: 'OK',
    noAccess: 'Nessun accesso',
    noAccessSub: "Abilita l'accesso alla libreria foto nelle impostazioni.",
    loading: 'Caricamento galleria...',
    allReviewed: 'Tutto revisionato!',
    toDelete: (n: number) => `${n} elementi da eliminare`,
    nothingToDelete: 'Nessuna foto da eliminare',
    viewSummary: 'Vedi riepilogo',
    keep: 'TIENI',
    delete: 'ELIMINA',
    all: 'Tutto',
    photos: 'Foto',
    videos: 'Video',
    newest: 'Più recenti',
    oldest: 'Più vecchi',
    lastModified: 'Ultima modifica',
    filters: 'FILTRI',
    mediaType: 'TIPO DI MEDIA',
    sortBy: 'ORDINA PER',
    album: 'ALBUM',
    allMedia: 'Tutti i media',
    items: (n: number) => `${n} elementi`,
    deleteConfirmTitle: 'Elimina definitivamente',
    deleteConfirmBody: (n: number) =>
      `Stai per eliminare ${n} file. Questa azione è irreversibile.`,
    cancel: 'Annulla',
    summary: 'RIEPILOGO',
    toDeleteLabel: 'da eliminare',
    kept: 'tenute',
    remaining: 'rimanenti',
    nothingToDeleteSummary: 'Nessuna foto da eliminare',
    deleting: 'Eliminazione...',
    deleteFiles: (n: number) => `Elimina ${n} file`,
  },
};

type Lang = keyof typeof translations;

function getLanguage(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return code in translations ? (code as Lang) : 'en';
}

export const t = translations[getLanguage()];
