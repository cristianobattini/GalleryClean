# GalleryClean 🧹

App Expo per pulire la galleria foto con swipe gesture.

## Funzionalità
- **Swipe destra** → elimina la foto
- **Swipe sinistra** → tieni la foto
- **Anteprima video** con play/pause inline
- **Undo** dell'ultima azione
- **Filtri** per tipo (foto/video) e album
- **Riepilogo** con griglia delle foto da eliminare
- Eliminazione effettiva solo al conferma finale

## Setup

```bash
# 1. Installa le dipendenze
npm install

# Prima di run
npx expo prebuild --clean

# 2. Per iOS (macOS only)
npx expo run:ios

# 3. Per Android
npx expo run:android

# 4. Oppure usa Expo Go (alcune funzionalità native potrebbero essere limitate)
npx expo start
```

## Struttura del progetto

```
GalleryClean/
├── App.tsx                          # Entry point
├── app.json                         # Config Expo
├── src/
│   ├── constants/
│   │   └── theme.ts                 # Colori e costanti
│   ├── context/
│   │   └── GalleryContext.tsx       # State management (useReducer)
│   ├── navigation/
│   │   └── MainNavigator.tsx        # Stack navigator
│   ├── screens/
│   │   ├── SwipeScreen.tsx          # Schermata principale
│   │   ├── FilterScreen.tsx         # Filtri e album
│   │   └── SummaryScreen.tsx        # Riepilogo e conferma eliminazione
│   └── components/
│       ├── SwipableCard.tsx         # Card con gesture (Reanimated v3)
│       ├── VideoCard.tsx            # Player video inline
│       ├── ActionButtons.tsx        # Bottoni elimina/tieni/undo
│       └── ProgressBar.tsx          # Barra avanzamento
```

## Dipendenze chiave

| Pacchetto | Uso |
|-----------|-----|
| `expo-media-library` | Accesso alla galleria e eliminazione |
| `expo-av` | Riproduzione video |
| `react-native-gesture-handler` | Rilevamento swipe |
| `react-native-reanimated` | Animazioni fluide (60fps) |
| `@react-navigation/stack` | Navigazione tra schermate |

## Note importanti

- Su **Android**, la vera eliminazione richiede `expo-media-library` v16+ e Android 11+
- Su **iOS**, l'app richiede il permesso `NSPhotoLibraryUsageDescription`
- Usa **Expo Development Build** (non Expo Go) per accedere alle API native
- Il context carica max 500 asset per performance — aumenta `first: 500` in `loadAssets()` se necessario

## Personalizzazione

### Soglia di swipe
In `src/constants/theme.ts`:
```ts
export const SWIPE_THRESHOLD = 120; // pixel necessari per triggerare lo swipe
```

### Colori
Tutti i colori sono centralizzati in `src/constants/theme.ts`.
