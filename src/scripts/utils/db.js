import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 2;
const STORE_PENDING = 'pending-stories';
const STORE_FAVORITE = 'favorite-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, oldVersion, newVersion) {
    if (!db.objectStoreNames.contains(STORE_PENDING)) {
      db.createObjectStore(STORE_PENDING, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(STORE_FAVORITE)) {
      db.createObjectStore(STORE_FAVORITE, { keyPath: 'id' });
    }
  },
});

export const FavoriteDb = {
  async putStory(story) {
    return (await dbPromise).put(STORE_FAVORITE, story);
  },
  async getStory(id) {
    return (await dbPromise).get(STORE_FAVORITE, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(STORE_FAVORITE);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(STORE_FAVORITE, id);
  },
};

export const StoryDb = {
  async putStory(story) {
    return (await dbPromise).add(STORE_PENDING, story);
  },
  async getAllStories() {
    return (await dbPromise).getAll(STORE_PENDING);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(STORE_PENDING, id);
  },
};