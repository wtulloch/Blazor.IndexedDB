/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/idb/lib/idb.js":
/*!*************************************!*\
  !*** ./node_modules/idb/lib/idb.js ***!
  \*************************************/
/***/ ((module) => {



(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (true) {
    module.exports = exp;
    module.exports["default"] = module.exports;
  }
  else {}
}());


/***/ }),

/***/ "./client/indexedDbBlazor.ts":
/*!***********************************!*\
  !*** ./client/indexedDbBlazor.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IndexedDbManager = void 0;
const idb_1 = __webpack_require__(/*! ../node_modules/idb/lib/idb */ "./node_modules/idb/lib/idb.js");
class IndexedDbManager {
    constructor() {
        this.dbInstance = undefined;
        this.dotnetCallback = (message) => { };
        this.openDb = (data, instanceWrapper) => __awaiter(this, void 0, void 0, function* () {
            const dbStore = data;
            this.dotnetCallback = (message) => {
                instanceWrapper.instance.invokeMethodAsync(instanceWrapper.methodName, message);
            };
            try {
                if (!this.dbInstance || this.dbInstance.version < dbStore.version) {
                    if (this.dbInstance) {
                        this.dbInstance.close();
                    }
                    this.dbInstance = yield idb_1.default.open(dbStore.dbName, dbStore.version, upgradeDB => {
                        this.upgradeDatabase(upgradeDB, dbStore);
                    });
                }
            }
            catch (e) {
                this.dbInstance = yield idb_1.default.open(dbStore.dbName);
            }
            return `IndexedDB ${data.dbName} opened`;
        });
        this.getDbInfo = (dbName) => __awaiter(this, void 0, void 0, function* () {
            if (!this.dbInstance) {
                this.dbInstance = yield idb_1.default.open(dbName);
            }
            const currentDb = this.dbInstance;
            let getStoreNames = (list) => {
                let names = [];
                for (var i = 0; i < list.length; i++) {
                    names.push(list[i]);
                }
                return names;
            };
            const dbInfo = {
                version: currentDb.version,
                storeNames: getStoreNames(currentDb.objectStoreNames)
            };
            return dbInfo;
        });
        this.deleteDb = (dbName) => __awaiter(this, void 0, void 0, function* () {
            this.dbInstance.close();
            yield idb_1.default.delete(dbName);
            this.dbInstance = undefined;
            return `The database ${dbName} has been deleted`;
        });
        this.addRecord = (record) => __awaiter(this, void 0, void 0, function* () {
            const stName = record.storename;
            let itemToSave = record.data;
            const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
            const objectStore = tx.objectStore(stName);
            itemToSave = this.checkForKeyPath(objectStore, itemToSave);
            const result = yield objectStore.add(itemToSave, record.key);
            return `Added new record with id ${result}`;
        });
        this.updateRecord = (record) => __awaiter(this, void 0, void 0, function* () {
            const stName = record.storename;
            const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
            const result = yield tx.objectStore(stName).put(record.data, record.key);
            return `updated record with id ${result}`;
        });
        this.getRecords = (storeName) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, storeName, 'readonly');
            let results = yield tx.objectStore(storeName).getAll();
            yield tx.complete;
            return results;
        });
        this.clearStore = (storeName) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, storeName, 'readwrite');
            yield tx.objectStore(storeName).clear();
            yield tx.complete;
            return `Store ${storeName} cleared`;
        });
        this.getRecordByIndex = (searchData) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
            const results = yield tx.objectStore(searchData.storename)
                .index(searchData.indexName)
                .get(searchData.queryValue);
            yield tx.complete;
            return results;
        });
        this.getAllRecordsByIndex = (searchData) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
            let results = [];
            tx.objectStore(searchData.storename)
                .index(searchData.indexName)
                .iterateCursor(cursor => {
                if (!cursor) {
                    return;
                }
                if (cursor.key === searchData.queryValue) {
                    results.push(cursor.value);
                }
                cursor.continue();
            });
            yield tx.complete;
            return results;
        });
        this.getRecordById = (storename, id) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, storename, 'readonly');
            let result = yield tx.objectStore(storename).get(id);
            return result;
        });
        this.deleteRecord = (storename, id) => __awaiter(this, void 0, void 0, function* () {
            const tx = this.getTransaction(this.dbInstance, storename, 'readwrite');
            yield tx.objectStore(storename).delete(id);
            return `Record with id: ${id} deleted`;
        });
    }
    getTransaction(dbInstance, stName, mode) {
        const tx = dbInstance.transaction(stName, mode);
        tx.complete.catch(err => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.error('Undefined error in getTransaction()');
            }
        });
        return tx;
    }
    checkForKeyPath(objectStore, data) {
        if (!objectStore.autoIncrement || !objectStore.keyPath) {
            return data;
        }
        if (typeof objectStore.keyPath !== 'string') {
            return data;
        }
        const keyPath = objectStore.keyPath;
        if (!data[keyPath]) {
            delete data[keyPath];
        }
        return data;
    }
    upgradeDatabase(upgradeDB, dbStore) {
        if (upgradeDB.oldVersion < dbStore.version) {
            if (dbStore.stores) {
                for (var store of dbStore.stores) {
                    if (!upgradeDB.objectStoreNames.contains(store.name)) {
                        this.addNewStore(upgradeDB, store);
                        this.dotnetCallback(`store added ${store.name}: db version: ${dbStore.version}`);
                    }
                }
            }
        }
    }
    addNewStore(upgradeDB, store) {
        let primaryKey = store.primaryKey;
        if (!primaryKey) {
            primaryKey = { name: 'id', keyPath: 'id', auto: true };
        }
        const newStore = upgradeDB.createObjectStore(store.name, { keyPath: primaryKey.keyPath, autoIncrement: primaryKey.auto });
        for (var index of store.indexes) {
            newStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        }
    }
}
exports.IndexedDbManager = IndexedDbManager;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************************!*\
  !*** ./client/InitialiseIndexDbBlazor.ts ***!
  \*******************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const indexedDbBlazor_1 = __webpack_require__(/*! ./indexedDbBlazor */ "./client/indexedDbBlazor.ts");
var IndexDb;
(function (IndexDb) {
    const timeghostExtensions = 'TimeGhost';
    const extensionObject = {
        IndexedDbManager: new indexedDbBlazor_1.IndexedDbManager()
    };
    function initialise() {
        if (typeof window !== 'undefined' && !window[timeghostExtensions]) {
            window[timeghostExtensions] = Object.assign({}, extensionObject);
        }
        else {
            window[timeghostExtensions] = Object.assign(Object.assign({}, window[timeghostExtensions]), extensionObject);
        }
    }
    IndexDb.initialise = initialise;
})(IndexDb || (IndexDb = {}));
IndexDb.initialise();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sUUFtQmhCO0FBRUQsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW5kZXhlZGRiYmxhem9yLmpzLy4vbm9kZV9tb2R1bGVzL2lkYi9saWIvaWRiLmpzIiwid2VicGFjazovL2luZGV4ZWRkYmJsYXpvci5qcy8uL2NsaWVudC9pbmRleGVkRGJCbGF6b3IudHMiLCJ3ZWJwYWNrOi8vaW5kZXhlZGRiYmxhem9yLmpzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2luZGV4ZWRkYmJsYXpvci5qcy8uL2NsaWVudC9Jbml0aWFsaXNlSW5kZXhEYkJsYXpvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gdG9BcnJheShhcnIpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0ID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgcC5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeUN1cnNvclJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIHAucmVxdWVzdCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eVByb3BlcnRpZXMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJveHlDbGFzcy5wcm90b3R5cGUsIHByb3AsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICB0aGlzW3RhcmdldFByb3BdW3Byb3BdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXS5hcHBseSh0aGlzW3RhcmdldFByb3BdLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBJbmRleChpbmRleCkge1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoSW5kZXgsICdfaW5kZXgnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnbXVsdGlFbnRyeScsXG4gICAgJ3VuaXF1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ2dldCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBmdW5jdGlvbiBDdXJzb3IoY3Vyc29yLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEN1cnNvciwgJ19jdXJzb3InLCBbXG4gICAgJ2RpcmVjdGlvbicsXG4gICAgJ2tleScsXG4gICAgJ3ByaW1hcnlLZXknLFxuICAgICd2YWx1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhDdXJzb3IsICdfY3Vyc29yJywgSURCQ3Vyc29yLCBbXG4gICAgJ3VwZGF0ZScsXG4gICAgJ2RlbGV0ZSdcbiAgXSk7XG5cbiAgLy8gcHJveHkgJ25leHQnIG1ldGhvZHNcbiAgWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgIGlmICghKG1ldGhvZE5hbWUgaW4gSURCQ3Vyc29yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICBDdXJzb3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnNvci5fY3Vyc29yW21ldGhvZE5hbWVdLmFwcGx5KGN1cnNvci5fY3Vyc29yLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QoY3Vyc29yLl9yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBjdXJzb3IuX3JlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE9iamVjdFN0b3JlKHN0b3JlKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuY3JlYXRlSW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuaW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdpbmRleE5hbWVzJyxcbiAgICAnYXV0b0luY3JlbWVudCdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ3B1dCcsXG4gICAgJ2FkZCcsXG4gICAgJ2RlbGV0ZScsXG4gICAgJ2NsZWFyJyxcbiAgICAnZ2V0JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ2RlbGV0ZUluZGV4J1xuICBdKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihpZGJUcmFuc2FjdGlvbikge1xuICAgIHRoaXMuX3R4ID0gaWRiVHJhbnNhY3Rpb247XG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KGlkYlRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBUcmFuc2FjdGlvbi5wcm90b3R5cGUub2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX3R4Lm9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX3R4LCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVHJhbnNhY3Rpb24sICdfdHgnLCBbXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnLFxuICAgICdtb2RlJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVHJhbnNhY3Rpb24sICdfdHgnLCBJREJUcmFuc2FjdGlvbiwgW1xuICAgICdhYm9ydCdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gVXBncmFkZURCKGRiLCBvbGRWZXJzaW9uLCB0cmFuc2FjdGlvbikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gICAgdGhpcy5vbGRWZXJzaW9uID0gb2xkVmVyc2lvbjtcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKTtcbiAgfVxuXG4gIFVwZ3JhZGVEQi5wcm90b3R5cGUuY3JlYXRlT2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX2RiLmNyZWF0ZU9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVXBncmFkZURCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhVcGdyYWRlREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdkZWxldGVPYmplY3RTdG9yZScsXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICBmdW5jdGlvbiBEQihkYikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gIH1cblxuICBEQi5wcm90b3R5cGUudHJhbnNhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKHRoaXMuX2RiLnRyYW5zYWN0aW9uLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKERCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIC8vIEFkZCBjdXJzb3IgaXRlcmF0b3JzXG4gIC8vIFRPRE86IHJlbW92ZSB0aGlzIG9uY2UgYnJvd3NlcnMgZG8gdGhlIHJpZ2h0IHRoaW5nIHdpdGggcHJvbWlzZXNcbiAgWydvcGVuQ3Vyc29yJywgJ29wZW5LZXlDdXJzb3InXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmNOYW1lKSB7XG4gICAgW09iamVjdFN0b3JlLCBJbmRleF0uZm9yRWFjaChmdW5jdGlvbihDb25zdHJ1Y3Rvcikge1xuICAgICAgLy8gRG9uJ3QgY3JlYXRlIGl0ZXJhdGVLZXlDdXJzb3IgaWYgb3BlbktleUN1cnNvciBkb2Vzbid0IGV4aXN0LlxuICAgICAgaWYgKCEoZnVuY05hbWUgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuXG4gICAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZnVuY05hbWUucmVwbGFjZSgnb3BlbicsICdpdGVyYXRlJyldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBuYXRpdmVPYmplY3QgPSB0aGlzLl9zdG9yZSB8fCB0aGlzLl9pbmRleDtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuYXRpdmVPYmplY3RbZnVuY05hbWVdLmFwcGx5KG5hdGl2ZU9iamVjdCwgYXJncy5zbGljZSgwLCAtMSkpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBvbHlmaWxsIGdldEFsbFxuICBbSW5kZXgsIE9iamVjdFN0b3JlXS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwpIHJldHVybjtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24ocXVlcnksIGNvdW50KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGluc3RhbmNlLml0ZXJhdGVDdXJzb3IocXVlcnksIGZ1bmN0aW9uKGN1cnNvcikge1xuICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaChjdXJzb3IudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQgJiYgaXRlbXMubGVuZ3RoID09IGNvdW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGV4cCA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnb3BlbicsIFtuYW1lLCB2ZXJzaW9uXSk7XG4gICAgICB2YXIgcmVxdWVzdCA9IHAucmVxdWVzdDtcblxuICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmICh1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHVwZ3JhZGVDYWxsYmFjayhuZXcgVXBncmFkZURCKHJlcXVlc3QucmVzdWx0LCBldmVudC5vbGRWZXJzaW9uLCByZXF1ZXN0LnRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgICAgIHJldHVybiBuZXcgREIoZGIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdkZWxldGVEYXRhYmFzZScsIFtuYW1lXSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwO1xuICAgIG1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLmlkYiA9IGV4cDtcbiAgfVxufSgpKTtcbiIsIi8vLy8vIDxyZWZlcmVuY2UgcGF0aD1cIk1pY3Jvc29mdC5KU0ludGVyb3AuZC50c1wiLz5cclxuaW1wb3J0IGlkYiBmcm9tICcuLi9ub2RlX21vZHVsZXMvaWRiL2xpYi9pZGInO1xyXG5pbXBvcnQgeyBEQiwgVXBncmFkZURCLCBPYmplY3RTdG9yZSwgVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9ub2RlX21vZHVsZXMvaWRiL2xpYi9pZGInO1xyXG5pbXBvcnQgeyBJRGJTdG9yZSwgSUluZGV4U2VhcmNoLCBJSW5kZXhTcGVjLCBJU3RvcmVSZWNvcmQsIElTdG9yZVNjaGVtYSwgSURvdE5ldEluc3RhbmNlV3JhcHBlciwgSURiSW5mb3JtYXRpb24gfSBmcm9tICcuL0ludGVyb3BJbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBJbmRleGVkRGJNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIGRiSW5zdGFuY2U6YW55ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBkb3RuZXRDYWxsYmFjayA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHsgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuRGIgPSBhc3luYyAoZGF0YTogSURiU3RvcmUsIGluc3RhbmNlV3JhcHBlcjogSURvdE5ldEluc3RhbmNlV3JhcHBlcik6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3QgZGJTdG9yZSA9IGRhdGE7XHJcbiAgICAgICAgLy9qdXN0IGEgdGVzdCBmb3IgdGhlIG1vbWVudFxyXG4gICAgICAgIHRoaXMuZG90bmV0Q2FsbGJhY2sgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlV3JhcHBlci5pbnN0YW5jZS5pbnZva2VNZXRob2RBc3luYyhpbnN0YW5jZVdyYXBwZXIubWV0aG9kTmFtZSwgbWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGJJbnN0YW5jZSB8fCB0aGlzLmRiSW5zdGFuY2UudmVyc2lvbiA8IGRiU3RvcmUudmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGJJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYkluc3RhbmNlID0gYXdhaXQgaWRiLm9wZW4oZGJTdG9yZS5kYk5hbWUsIGRiU3RvcmUudmVyc2lvbiwgdXBncmFkZURCID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZ3JhZGVEYXRhYmFzZSh1cGdyYWRlREIsIGRiU3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGJJbnN0YW5jZSA9IGF3YWl0IGlkYi5vcGVuKGRiU3RvcmUuZGJOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGBJbmRleGVkREIgJHtkYXRhLmRiTmFtZX0gb3BlbmVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGJJbmZvID0gYXN5bmMgKGRiTmFtZTogc3RyaW5nKSA6IFByb21pc2U8SURiSW5mb3JtYXRpb24+ID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuZGJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRiSW5zdGFuY2UgPSBhd2FpdCBpZGIub3BlbihkYk5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudERiID0gPERCPnRoaXMuZGJJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgbGV0IGdldFN0b3JlTmFtZXMgPSAobGlzdDogRE9NU3RyaW5nTGlzdCk6IHN0cmluZ1tdID0+IHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWVzLnB1c2gobGlzdFtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkYkluZm86IElEYkluZm9ybWF0aW9uID0ge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBjdXJyZW50RGIudmVyc2lvbixcclxuICAgICAgICAgICAgc3RvcmVOYW1lczogZ2V0U3RvcmVOYW1lcyhjdXJyZW50RGIub2JqZWN0U3RvcmVOYW1lcylcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZGJJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGVEYiA9IGFzeW5jKGRiTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICB0aGlzLmRiSW5zdGFuY2UuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgYXdhaXQgaWRiLmRlbGV0ZShkYk5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLmRiSW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBgVGhlIGRhdGFiYXNlICR7ZGJOYW1lfSBoYXMgYmVlbiBkZWxldGVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkUmVjb3JkID0gYXN5bmMgKHJlY29yZDogSVN0b3JlUmVjb3JkKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBjb25zdCBzdE5hbWUgPSByZWNvcmQuc3RvcmVuYW1lO1xyXG4gICAgICAgIGxldCBpdGVtVG9TYXZlID0gcmVjb3JkLmRhdGE7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKHRoaXMuZGJJbnN0YW5jZSwgc3ROYW1lLCAncmVhZHdyaXRlJyk7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0eC5vYmplY3RTdG9yZShzdE5hbWUpO1xyXG5cclxuICAgICAgICBpdGVtVG9TYXZlID0gdGhpcy5jaGVja0ZvcktleVBhdGgob2JqZWN0U3RvcmUsIGl0ZW1Ub1NhdmUpO1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvYmplY3RTdG9yZS5hZGQoaXRlbVRvU2F2ZSwgcmVjb3JkLmtleSk7XHJcblxyXG4gICAgICAgIHJldHVybiBgQWRkZWQgbmV3IHJlY29yZCB3aXRoIGlkICR7cmVzdWx0fWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVJlY29yZCA9IGFzeW5jIChyZWNvcmQ6IElTdG9yZVJlY29yZCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3ROYW1lID0gcmVjb3JkLnN0b3JlbmFtZTtcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdE5hbWUsICdyZWFkd3JpdGUnKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3ROYW1lKS5wdXQocmVjb3JkLmRhdGEsIHJlY29yZC5rZXkpO1xyXG4gICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGB1cGRhdGVkIHJlY29yZCB3aXRoIGlkICR7cmVzdWx0fWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJlY29yZHMgPSBhc3luYyAoc3RvcmVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbih0aGlzLmRiSW5zdGFuY2UsIHN0b3JlTmFtZSwgJ3JlYWRvbmx5Jyk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5nZXRBbGwoKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdHguY29tcGxldGU7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhclN0b3JlID0gYXN5bmMgKHN0b3JlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdG9yZU5hbWUsICdyZWFkd3JpdGUnKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5jbGVhcigpO1xyXG4gICAgICAgIGF3YWl0IHR4LmNvbXBsZXRlO1xyXG5cclxuICAgICAgICByZXR1cm4gYFN0b3JlICR7c3RvcmVOYW1lfSBjbGVhcmVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmVjb3JkQnlJbmRleCA9IGFzeW5jIChzZWFyY2hEYXRhOiBJSW5kZXhTZWFyY2gpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbih0aGlzLmRiSW5zdGFuY2UsIHNlYXJjaERhdGEuc3RvcmVuYW1lLCAncmVhZG9ubHknKTtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc2VhcmNoRGF0YS5zdG9yZW5hbWUpXHJcbiAgICAgICAgICAgIC5pbmRleChzZWFyY2hEYXRhLmluZGV4TmFtZSlcclxuICAgICAgICAgICAgLmdldChzZWFyY2hEYXRhLnF1ZXJ5VmFsdWUpO1xyXG5cclxuICAgICAgICBhd2FpdCB0eC5jb21wbGV0ZTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QWxsUmVjb3Jkc0J5SW5kZXggPSBhc3luYyAoc2VhcmNoRGF0YTogSUluZGV4U2VhcmNoKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzZWFyY2hEYXRhLnN0b3JlbmFtZSwgJ3JlYWRvbmx5Jyk7XHJcbiAgICAgICAgbGV0IHJlc3VsdHM6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHR4Lm9iamVjdFN0b3JlKHNlYXJjaERhdGEuc3RvcmVuYW1lKVxyXG4gICAgICAgICAgICAuaW5kZXgoc2VhcmNoRGF0YS5pbmRleE5hbWUpXHJcbiAgICAgICAgICAgIC5pdGVyYXRlQ3Vyc29yKGN1cnNvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3Vyc29yLmtleSA9PT0gc2VhcmNoRGF0YS5xdWVyeVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGN1cnNvci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhd2FpdCB0eC5jb21wbGV0ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJlY29yZEJ5SWQgPSBhc3luYyAoc3RvcmVuYW1lOiBzdHJpbmcsIGlkOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdG9yZW5hbWUsICdyZWFkb25seScpO1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVuYW1lKS5nZXQoaWQpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZVJlY29yZCA9IGFzeW5jIChzdG9yZW5hbWU6IHN0cmluZywgaWQ6IGFueSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKHRoaXMuZGJJbnN0YW5jZSwgc3RvcmVuYW1lLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gICAgICAgIGF3YWl0IHR4Lm9iamVjdFN0b3JlKHN0b3JlbmFtZSkuZGVsZXRlKGlkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBSZWNvcmQgd2l0aCBpZDogJHtpZH0gZGVsZXRlZGA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2FjdGlvbihkYkluc3RhbmNlOiBEQiwgc3ROYW1lOiBzdHJpbmcsIG1vZGU/OiAncmVhZG9ubHknIHwgJ3JlYWR3cml0ZScpIHtcclxuICAgICAgICBjb25zdCB0eCA9IGRiSW5zdGFuY2UudHJhbnNhY3Rpb24oc3ROYW1lLCBtb2RlKTtcclxuICAgICAgICB0eC5jb21wbGV0ZS5jYXRjaChcclxuICAgICAgICAgICAgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKChlcnIgYXMgRXJyb3IpLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmRlZmluZWQgZXJyb3IgaW4gZ2V0VHJhbnNhY3Rpb24oKScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdHg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3VycmVudGx5IGRvbid0IHN1cHBvcnQgYWdncmVnYXRlIGtleXNcclxuICAgIHByaXZhdGUgY2hlY2tGb3JLZXlQYXRoKG9iamVjdFN0b3JlOiBPYmplY3RTdG9yZTxhbnksIGFueT4sIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGlmICghb2JqZWN0U3RvcmUuYXV0b0luY3JlbWVudCB8fCAhb2JqZWN0U3RvcmUua2V5UGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0U3RvcmUua2V5UGF0aCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXlQYXRoID0gb2JqZWN0U3RvcmUua2V5UGF0aCBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICghZGF0YVtrZXlQYXRoXSkge1xyXG4gICAgICAgICAgICBkZWxldGUgZGF0YVtrZXlQYXRoXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGdyYWRlRGF0YWJhc2UodXBncmFkZURCOiBVcGdyYWRlREIsIGRiU3RvcmU6IElEYlN0b3JlKSB7XHJcbiAgICAgICAgaWYgKHVwZ3JhZGVEQi5vbGRWZXJzaW9uIDwgZGJTdG9yZS52ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChkYlN0b3JlLnN0b3Jlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3RvcmUgb2YgZGJTdG9yZS5zdG9yZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVwZ3JhZGVEQi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKHN0b3JlLm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTmV3U3RvcmUodXBncmFkZURCLCBzdG9yZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG90bmV0Q2FsbGJhY2soYHN0b3JlIGFkZGVkICR7c3RvcmUubmFtZX06IGRiIHZlcnNpb246ICR7ZGJTdG9yZS52ZXJzaW9ufWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZE5ld1N0b3JlKHVwZ3JhZGVEQjogVXBncmFkZURCLCBzdG9yZTogSVN0b3JlU2NoZW1hKSB7XHJcbiAgICAgICAgbGV0IHByaW1hcnlLZXkgPSBzdG9yZS5wcmltYXJ5S2V5O1xyXG5cclxuICAgICAgICBpZiAoIXByaW1hcnlLZXkpIHtcclxuICAgICAgICAgICAgcHJpbWFyeUtleSA9IHsgbmFtZTogJ2lkJywga2V5UGF0aDogJ2lkJywgYXV0bzogdHJ1ZSB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV3U3RvcmUgPSB1cGdyYWRlREIuY3JlYXRlT2JqZWN0U3RvcmUoc3RvcmUubmFtZSwgeyBrZXlQYXRoOiBwcmltYXJ5S2V5LmtleVBhdGgsIGF1dG9JbmNyZW1lbnQ6IHByaW1hcnlLZXkuYXV0byB9KTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaW5kZXggb2Ygc3RvcmUuaW5kZXhlcykge1xyXG4gICAgICAgICAgICBuZXdTdG9yZS5jcmVhdGVJbmRleChpbmRleC5uYW1lLCBpbmRleC5rZXlQYXRoLCB7IHVuaXF1ZTogaW5kZXgudW5pcXVlIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBJbmRleGVkRGJNYW5hZ2VyIH0gZnJvbSAnLi9pbmRleGVkRGJCbGF6b3InO1xyXG5cclxubmFtZXNwYWNlIEluZGV4RGIge1xyXG4gICAgY29uc3QgdGltZWdob3N0RXh0ZW5zaW9uczogc3RyaW5nID0gJ1RpbWVHaG9zdCc7XHJcbiAgICBjb25zdCBleHRlbnNpb25PYmplY3QgPSB7XHJcbiAgICAgICAgSW5kZXhlZERiTWFuYWdlcjogbmV3IEluZGV4ZWREYk1hbmFnZXIoKVxyXG4gICAgfTtcclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gaW5pdGlhbGlzZSgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgIXdpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSkge1xyXG4gICAgICAgICAgICB3aW5kb3dbdGltZWdob3N0RXh0ZW5zaW9uc10gPSB7XHJcbiAgICAgICAgICAgICAgICAuLi5leHRlbnNpb25PYmplY3RcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3dbdGltZWdob3N0RXh0ZW5zaW9uc10gPSB7XHJcbiAgICAgICAgICAgICAgICAuLi53aW5kb3dbdGltZWdob3N0RXh0ZW5zaW9uc10sXHJcbiAgICAgICAgICAgICAgICAuLi5leHRlbnNpb25PYmplY3RcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5JbmRleERiLmluaXRpYWxpc2UoKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=