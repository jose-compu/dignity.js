class IndexedDBPersistence {
  constructor({
    dbName = 'dignity',
    storeName = 'records',
    collections = null,
    indexedDB = typeof globalThis !== 'undefined' ? globalThis.indexedDB : null
  } = {}) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.collections = collections;
    this.indexedDB = indexedDB;
    this.node = null;
    this.changeHandler = null;
  }

  recordKey(collection, id) {
    return `${collection}:${id}`;
  }

  shouldPersist(collection) {
    if (!this.collections) {
      return true;
    }

    return this.collections.includes(collection);
  }

  openDb() {
    if (!this.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not available'));
    }

    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Unable to open IndexedDB'));
    });
  }

  runTransaction(mode, handler) {
    return this.openDb().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, mode);
      const store = transaction.objectStore(this.storeName);

      Promise.resolve(handler(store))
        .then(resolve)
        .catch(reject);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
    }));
  }

  serializeRecord(collection, id) {
    const record = this.node.getCollection(collection).get(id);
    if (!record) {
      return null;
    }

    return {
      key: this.recordKey(collection, id),
      collection,
      id,
      ownerId: record.ownerId,
      data: { ...record.data },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      version: record.version
    };
  }

  async persistRecord(collection, id) {
    if (!this.node || !this.shouldPersist(collection)) {
      return;
    }

    const serialized = this.serializeRecord(collection, id);
    const key = this.recordKey(collection, id);

    if (!serialized) {
      await this.runTransaction('readwrite', (store) => new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }));
      return;
    }

    await this.runTransaction('readwrite', (store) => new Promise((resolve, reject) => {
      const request = store.put(serialized);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }));
  }

  persistChange(event) {
    if (!event || !event.collection || !event.id) {
      return;
    }

    this.persistRecord(event.collection, event.id).catch((error) => {
      this.node.emit('warning', {
        type: 'persistence-failed',
        collection: event.collection,
        id: event.id,
        error
      });
    });
  }

  async loadAllRecords() {
    return this.runTransaction('readonly', (store) => new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    }));
  }

  async hydrate() {
    if (!this.node) {
      throw new Error('IndexedDBPersistence requires an attached node before hydrate');
    }

    const storedRecords = await this.loadAllRecords();
    for (const stored of storedRecords) {
      if (!this.shouldPersist(stored.collection)) {
        continue;
      }

      this.node.restoreRecord(stored.collection, {
        id: stored.id,
        ownerId: stored.ownerId,
        data: stored.data,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        deletedAt: stored.deletedAt,
        version: stored.version
      });
    }
  }

  async attach(node) {
    if (!node) {
      throw new Error('IndexedDBPersistence.attach requires a DignityP2P node');
    }

    this.node = node;
    await this.hydrate();

    this.changeHandler = (event) => this.persistChange(event);
    node.on('change', this.changeHandler);
  }

  async detach() {
    if (this.node && this.changeHandler) {
      this.node.off('change', this.changeHandler);
    }

    this.changeHandler = null;
    this.node = null;
  }

  async clear() {
    await this.runTransaction('readwrite', (store) => new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }));
  }
}

module.exports = IndexedDBPersistence;
