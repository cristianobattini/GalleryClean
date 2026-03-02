import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterMode = 'all' | 'photo' | 'video';
export type SortMode = 'newest' | 'oldest' | 'size';

export interface GalleryAsset {
  id: string;
  uri: string;
  mediaType: 'photo' | 'video';
  duration?: number;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  filename: string;
  albumId?: string;
}

export interface Album {
  id: string;
  title: string;
  assetCount: number;
}

interface HistoryEntry {
  asset: GalleryAsset;
  action: 'delete' | 'keep';
}

interface GalleryState {
  assets: GalleryAsset[];
  currentIndex: number;
  toDelete: GalleryAsset[];
  toKeep: GalleryAsset[];
  history: HistoryEntry[];
  albums: Album[];
  selectedAlbum: string | null; // null = all
  filterMode: FilterMode;
  sortMode: SortMode;
  hasPermission: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  totalSize: number;
}

type GalleryAction =
  | { type: 'SET_PERMISSION'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_ASSETS'; payload: GalleryAsset[] }
  | { type: 'SET_ALBUMS'; payload: Album[] }
  | { type: 'SWIPE_DELETE' }
  | { type: 'SWIPE_KEEP' }
  | { type: 'UNDO' }
  | { type: 'SET_ALBUM'; payload: string | null }
  | { type: 'SET_FILTER'; payload: FilterMode }
  | { type: 'SET_SORT'; payload: SortMode }
  | { type: 'COMMIT_DELETES' }
  | { type: 'REMOVE_DELETED_ASSETS'; payload: string[] }
  | { type: 'RESTORE_SESSION'; payload: PersistedSession };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'SET_PERMISSION':
      return { ...state, hasPermission: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    case 'SET_ASSETS':
      return { ...state, assets: action.payload, currentIndex: 0 };
    case 'SET_ALBUMS':
      return { ...state, albums: action.payload };

    case 'SWIPE_DELETE': {
      const current = state.assets[state.currentIndex];
      if (!current) return state;
      return {
        ...state,
        toDelete: [...state.toDelete, current],
        history: [...state.history, { asset: current, action: 'delete' }],
        currentIndex: state.currentIndex + 1,
      };
    }

    case 'SWIPE_KEEP': {
      const current = state.assets[state.currentIndex];
      if (!current) return state;
      return {
        ...state,
        toKeep: [...state.toKeep, current],
        history: [...state.history, { asset: current, action: 'keep' }],
        currentIndex: state.currentIndex + 1,
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const lastEntry = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const newToDelete =
        lastEntry.action === 'delete'
          ? state.toDelete.filter((a) => a.id !== lastEntry.asset.id)
          : state.toDelete;
      const newToKeep =
        lastEntry.action === 'keep'
          ? state.toKeep.filter((a) => a.id !== lastEntry.asset.id)
          : state.toKeep;
      return {
        ...state,
        history: newHistory,
        toDelete: newToDelete,
        toKeep: newToKeep,
        currentIndex: state.currentIndex - 1,
      };
    }

    case 'SET_ALBUM':
      return { ...state, selectedAlbum: action.payload, currentIndex: 0, history: [], toDelete: [], toKeep: [] };
    case 'SET_FILTER':
      return { ...state, filterMode: action.payload, currentIndex: 0, history: [], toDelete: [], toKeep: [] };
    case 'SET_SORT':
      return { ...state, sortMode: action.payload, currentIndex: 0, history: [], toDelete: [], toKeep: [] };

    case 'REMOVE_DELETED_ASSETS': {
      const ids = new Set(action.payload);
      return {
        ...state,
        assets: state.assets.filter((a) => !ids.has(a.id)),
        toDelete: [],
        currentIndex: 0,
        history: [],
      };
    }

    case 'RESTORE_SESSION': {
      const { currentIndex, toDelete, toKeep, history } = action.payload;
      // Clamp index to valid range
      const safeIndex = Math.min(currentIndex, state.assets.length);
      return { ...state, currentIndex: safeIndex, toDelete, toKeep, history };
    }

    default:
      return state;
  }
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'gallery_session';

interface PersistedSession {
  filterMode: FilterMode;
  sortMode: SortMode;
  selectedAlbum: string | null;
  currentIndex: number;
  toDelete: GalleryAsset[];
  toKeep: GalleryAsset[];
  history: HistoryEntry[];
}

async function saveSession(state: GalleryState) {
  const session: PersistedSession = {
    filterMode: state.filterMode,
    sortMode: state.sortMode,
    selectedAlbum: state.selectedAlbum,
    currentIndex: state.currentIndex,
    toDelete: state.toDelete,
    toKeep: state.toKeep,
    history: state.history,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function loadSession(): Promise<PersistedSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PersistedSession) : null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GalleryContextValue {
  state: GalleryState;
  swipeDelete: () => void;
  swipeKeep: () => void;
  undo: () => void;
  setAlbum: (albumId: string | null) => void;
  setFilter: (mode: FilterMode) => void;
  setSort: (mode: SortMode) => void;
  commitDeletes: () => Promise<void>;
  loadAssets: () => Promise<void>;
  currentAsset: GalleryAsset | null;
  progress: { done: number; total: number };
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const initialState: GalleryState = {
  assets: [],
  currentIndex: 0,
  toDelete: [],
  toKeep: [],
  history: [],
  albums: [],
  selectedAlbum: null,
  filterMode: 'all',
  sortMode: 'newest',
  hasPermission: false,
  isLoading: false,
  isDeleting: false,
  totalSize: 0,
};

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(galleryReducer, initialState);
  const sessionRef = useRef<PersistedSession | null>(null);

  const loadAssets = useCallback(async (session?: PersistedSession | null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const granted = status === 'granted';
      dispatch({ type: 'SET_PERMISSION', payload: granted });
      if (!granted) return;

      // Load albums
      const albumList = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      const albums: Album[] = albumList.map((a) => ({
        id: a.id,
        title: a.title,
        assetCount: a.assetCount,
      }));
      dispatch({ type: 'SET_ALBUMS', payload: albums });

      // Load assets
      const filterMode = session?.filterMode ?? state.filterMode;
      const sortMode = session?.sortMode ?? state.sortMode;
      const selectedAlbum = session?.selectedAlbum ?? state.selectedAlbum;

      const mediaTypeFilter: MediaLibrary.MediaTypeValue[] =
        filterMode === 'all'
          ? ['photo', 'video']
          : filterMode === 'photo'
          ? ['photo']
          : ['video'];

      const options: MediaLibrary.AssetsOptions = {
        first: 1000,
        mediaType: mediaTypeFilter,
        sortBy:
          sortMode === 'newest'
            ? [[MediaLibrary.SortBy.creationTime, false]]
            : sortMode === 'oldest'
            ? [[MediaLibrary.SortBy.creationTime, true]]
            : [[MediaLibrary.SortBy.modificationTime, false]],
      };

      if (selectedAlbum) {
        options.album = selectedAlbum;
      }

      const result = await MediaLibrary.getAssetsAsync(options);

      const mapped: GalleryAsset[] = result.assets.map((a) => ({
        id: a.id,
        uri: a.uri,
        mediaType: a.mediaType as 'photo' | 'video',
        duration: a.duration,
        width: a.width,
        height: a.height,
        creationTime: a.creationTime,
        modificationTime: a.modificationTime,
        filename: a.filename,
      }));

      dispatch({ type: 'SET_ASSETS', payload: mapped });

      // Restore session progress if filter/sort/album match
      if (session) {
        dispatch({ type: 'RESTORE_SESSION', payload: session });
      }
    } catch (e) {
      console.error('loadAssets error', e);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filterMode, state.sortMode, state.selectedAlbum]);

  // Initial load: read saved session first
  useEffect(() => {
    (async () => {
      const session = await loadSession();
      sessionRef.current = session;
      if (session) {
        dispatch({ type: 'SET_FILTER', payload: session.filterMode });
        dispatch({ type: 'SET_SORT', payload: session.sortMode });
        if (session.selectedAlbum) {
          dispatch({ type: 'SET_ALBUM', payload: session.selectedAlbum });
        }
      }
      await loadAssets(session);
    })();
  }, []);

  // Reload on filter/sort/album changes (skip initial mount handled above)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    loadAssets();
  }, [state.filterMode, state.sortMode, state.selectedAlbum]);

  // Persist session on every relevant state change
  useEffect(() => {
    if (!state.isLoading && state.assets.length > 0) {
      saveSession(state);
    }
  }, [state.currentIndex, state.toDelete, state.toKeep, state.history]);

  const commitDeletes = useCallback(async () => {
    if (state.toDelete.length === 0) return;
    dispatch({ type: 'SET_DELETING', payload: true });
    try {
      const ids = state.toDelete.map((a) => a.id);
      await MediaLibrary.deleteAssetsAsync(ids);
      dispatch({ type: 'REMOVE_DELETED_ASSETS', payload: ids });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('commitDeletes error', e);
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, [state.toDelete]);

  const currentAsset = state.assets[state.currentIndex] ?? null;
  const progress = { done: state.currentIndex, total: state.assets.length };

  return (
    <GalleryContext.Provider
      value={{
        state,
        swipeDelete: () => dispatch({ type: 'SWIPE_DELETE' }),
        swipeKeep: () => dispatch({ type: 'SWIPE_KEEP' }),
        undo: () => dispatch({ type: 'UNDO' }),
        setAlbum: (id) => dispatch({ type: 'SET_ALBUM', payload: id }),
        setFilter: (mode) => dispatch({ type: 'SET_FILTER', payload: mode }),
        setSort: (mode) => dispatch({ type: 'SET_SORT', payload: mode }),
        commitDeletes,
        loadAssets,
        currentAsset,
        progress,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used inside GalleryProvider');
  return ctx;
}
