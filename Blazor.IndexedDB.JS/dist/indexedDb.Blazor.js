/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/InitialiseIndexDbBlazor.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/idb/lib/idb.js":
/*!*************************************!*\
  !*** ./node_modules/idb/lib/idb.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
    module.exports.default = module.exports;
  }
  else {}
}());


/***/ }),

/***/ "./src/InitialiseIndexDbBlazor.ts":
/*!****************************************!*\
  !*** ./src/InitialiseIndexDbBlazor.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const indexedDbBlazor_1 = __webpack_require__(/*! ./indexedDbBlazor */ "./src/indexedDbBlazor.ts");
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
            window[timeghostExtensions] = Object.assign({}, window[timeghostExtensions], extensionObject);
        }
    }
    IndexDb.initialise = initialise;
})(IndexDb || (IndexDb = {}));
IndexDb.initialise();


/***/ }),

/***/ "./src/indexedDbBlazor.ts":
/*!********************************!*\
  !*** ./src/indexedDbBlazor.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const idb_1 = __webpack_require__(/*! idb */ "./node_modules/idb/lib/idb.js");
class IndexedDbManager {
    constructor() {
        this.dbPromise = new Promise((resolve, reject) => { });
        this.openDb = (data) => {
            var dbStore = data;
            return new Promise((resolve, reject) => {
                this.dbPromise = idb_1.default.open(dbStore.dbName, dbStore.version, upgradeDB => {
                    this.upgradeDatabase(upgradeDB, dbStore);
                });
                resolve('database created');
            });
        };
        this.addRecord = (record) => __awaiter(this, void 0, void 0, function* () {
            const stName = record.storename;
            let itemToSave = record.data;
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, stName, 'readwrite');
            const objectStore = tx.objectStore(stName);
            itemToSave = this.checkForKeyPath(objectStore, itemToSave);
            let returnValue = "";
            try {
                const result = yield objectStore.add(itemToSave);
                returnValue = `Added new record with id ${result}`;
            }
            catch (err) {
                returnValue = err.message;
            }
            return returnValue;
        });
        this.updateRecord = (record) => __awaiter(this, void 0, void 0, function* () {
            const stName = record.storename;
            const itemToSave = record.data;
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, stName, 'readwrite');
            let returnValue;
            try {
                const result = yield tx.objectStore(stName).put(itemToSave);
                returnValue = `updated record with id ${result}`;
            }
            catch (err) {
                returnValue = err.message;
            }
            return returnValue;
        });
        this.getRecords = (storeName) => __awaiter(this, void 0, void 0, function* () {
            const dbInstance = yield this.dbPromise;
            let returnValue;
            const tx = this.getTransaction(dbInstance, storeName, 'readonly');
            try {
                let results = yield tx.objectStore(storeName).getAll();
                returnValue = JSON.stringify(results);
            }
            catch (err) {
                returnValue = err.message;
            }
            return returnValue;
        });
        this.clearStore = (storeName) => __awaiter(this, void 0, void 0, function* () {
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, storeName, 'readwrite');
            try {
                yield tx.objectStore(storeName).clear();
                return `Store ${storeName} cleared`;
            }
            catch (err) {
                return err.message;
            }
        });
        this.getRecordByIndex = (searchData) => __awaiter(this, void 0, void 0, function* () {
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, searchData.storename, 'readonly');
            const results = yield tx.objectStore(searchData.storename)
                .index(searchData.indexName)
                .get(searchData.queryValue);
            return results;
        });
        this.getRecordById = (data) => __awaiter(this, void 0, void 0, function* () {
            const storeName = data.storename;
            const id = data.data;
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, storeName, 'readonly');
            let returnValue;
            try {
                let result = yield tx.objectStore(storeName).get(id);
                returnValue = JSON.stringify(result);
            }
            catch (err) {
                returnValue = err.message;
            }
            return returnValue;
        });
        this.deleteRecord = (data) => __awaiter(this, void 0, void 0, function* () {
            const storeName = data.storename;
            const id = data.data;
            const dbInstance = yield this.dbPromise;
            const tx = this.getTransaction(dbInstance, storeName, 'readwrite');
            try {
                yield tx.objectStore(storeName).delete(id);
                return 'Record deleted';
            }
            catch (err) {
                return err.message;
            }
        });
    }
    getTransaction(dbInstance, stName, mode) {
        const tx = dbInstance.transaction(stName, mode);
        tx.complete.catch(err => {
            console.log(err.message);
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
                for (let i = 0; i < dbStore.stores.length; i++) {
                    const storeSchema = dbStore.stores[i];
                    if (!upgradeDB.objectStoreNames.contains(storeSchema.name)) {
                        let primaryKey = storeSchema.primaryKey;
                        if (!primaryKey) {
                            primaryKey = { name: 'id', keyPath: 'id', auto: true };
                        }
                        const store = upgradeDB.createObjectStore(storeSchema.name, { keyPath: primaryKey.name, autoIncrement: primaryKey.auto });
                        for (let j = 0; j < storeSchema.indexes.length; j++) {
                            const index = storeSchema.indexes[j];
                            store.createIndex(index.name, index.keyPath, { unique: index.unique });
                        }
                    }
                }
            }
        }
    }
}
exports.IndexedDbManager = IndexedDbManager;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2lkYi9saWIvaWRiLmpzIiwid2VicGFjazovLy8uL3NyYy9Jbml0aWFsaXNlSW5kZXhEYkJsYXpvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXhlZERiQmxhem9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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b0JBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDeEQsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLFVBQVUsRUFBRTs0QkFDYixVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO3lCQUMxRDt3QkFDRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDMUgsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUNqRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt5QkFDMUU7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKO0lBQ0wsQ0FBQztDQUNKO0FBN0tELDRDQTZLQyIsImZpbGUiOiJpbmRleGVkRGIuQmxhem9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5pdGlhbGlzZUluZGV4RGJCbGF6b3IudHNcIik7XG4iLCIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gdG9BcnJheShhcnIpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0ID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgcC5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeUN1cnNvclJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIHAucmVxdWVzdCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eVByb3BlcnRpZXMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJveHlDbGFzcy5wcm90b3R5cGUsIHByb3AsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICB0aGlzW3RhcmdldFByb3BdW3Byb3BdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXS5hcHBseSh0aGlzW3RhcmdldFByb3BdLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBJbmRleChpbmRleCkge1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoSW5kZXgsICdfaW5kZXgnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnbXVsdGlFbnRyeScsXG4gICAgJ3VuaXF1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ2dldCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBmdW5jdGlvbiBDdXJzb3IoY3Vyc29yLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEN1cnNvciwgJ19jdXJzb3InLCBbXG4gICAgJ2RpcmVjdGlvbicsXG4gICAgJ2tleScsXG4gICAgJ3ByaW1hcnlLZXknLFxuICAgICd2YWx1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhDdXJzb3IsICdfY3Vyc29yJywgSURCQ3Vyc29yLCBbXG4gICAgJ3VwZGF0ZScsXG4gICAgJ2RlbGV0ZSdcbiAgXSk7XG5cbiAgLy8gcHJveHkgJ25leHQnIG1ldGhvZHNcbiAgWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgIGlmICghKG1ldGhvZE5hbWUgaW4gSURCQ3Vyc29yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICBDdXJzb3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnNvci5fY3Vyc29yW21ldGhvZE5hbWVdLmFwcGx5KGN1cnNvci5fY3Vyc29yLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QoY3Vyc29yLl9yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBjdXJzb3IuX3JlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE9iamVjdFN0b3JlKHN0b3JlKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuY3JlYXRlSW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuaW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdpbmRleE5hbWVzJyxcbiAgICAnYXV0b0luY3JlbWVudCdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ3B1dCcsXG4gICAgJ2FkZCcsXG4gICAgJ2RlbGV0ZScsXG4gICAgJ2NsZWFyJyxcbiAgICAnZ2V0JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ2RlbGV0ZUluZGV4J1xuICBdKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihpZGJUcmFuc2FjdGlvbikge1xuICAgIHRoaXMuX3R4ID0gaWRiVHJhbnNhY3Rpb247XG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KGlkYlRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBUcmFuc2FjdGlvbi5wcm90b3R5cGUub2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX3R4Lm9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX3R4LCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVHJhbnNhY3Rpb24sICdfdHgnLCBbXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnLFxuICAgICdtb2RlJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVHJhbnNhY3Rpb24sICdfdHgnLCBJREJUcmFuc2FjdGlvbiwgW1xuICAgICdhYm9ydCdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gVXBncmFkZURCKGRiLCBvbGRWZXJzaW9uLCB0cmFuc2FjdGlvbikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gICAgdGhpcy5vbGRWZXJzaW9uID0gb2xkVmVyc2lvbjtcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKTtcbiAgfVxuXG4gIFVwZ3JhZGVEQi5wcm90b3R5cGUuY3JlYXRlT2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX2RiLmNyZWF0ZU9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVXBncmFkZURCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhVcGdyYWRlREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdkZWxldGVPYmplY3RTdG9yZScsXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICBmdW5jdGlvbiBEQihkYikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gIH1cblxuICBEQi5wcm90b3R5cGUudHJhbnNhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKHRoaXMuX2RiLnRyYW5zYWN0aW9uLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKERCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIC8vIEFkZCBjdXJzb3IgaXRlcmF0b3JzXG4gIC8vIFRPRE86IHJlbW92ZSB0aGlzIG9uY2UgYnJvd3NlcnMgZG8gdGhlIHJpZ2h0IHRoaW5nIHdpdGggcHJvbWlzZXNcbiAgWydvcGVuQ3Vyc29yJywgJ29wZW5LZXlDdXJzb3InXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmNOYW1lKSB7XG4gICAgW09iamVjdFN0b3JlLCBJbmRleF0uZm9yRWFjaChmdW5jdGlvbihDb25zdHJ1Y3Rvcikge1xuICAgICAgLy8gRG9uJ3QgY3JlYXRlIGl0ZXJhdGVLZXlDdXJzb3IgaWYgb3BlbktleUN1cnNvciBkb2Vzbid0IGV4aXN0LlxuICAgICAgaWYgKCEoZnVuY05hbWUgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuXG4gICAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZnVuY05hbWUucmVwbGFjZSgnb3BlbicsICdpdGVyYXRlJyldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBuYXRpdmVPYmplY3QgPSB0aGlzLl9zdG9yZSB8fCB0aGlzLl9pbmRleDtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuYXRpdmVPYmplY3RbZnVuY05hbWVdLmFwcGx5KG5hdGl2ZU9iamVjdCwgYXJncy5zbGljZSgwLCAtMSkpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBvbHlmaWxsIGdldEFsbFxuICBbSW5kZXgsIE9iamVjdFN0b3JlXS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwpIHJldHVybjtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24ocXVlcnksIGNvdW50KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGluc3RhbmNlLml0ZXJhdGVDdXJzb3IocXVlcnksIGZ1bmN0aW9uKGN1cnNvcikge1xuICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaChjdXJzb3IudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQgJiYgaXRlbXMubGVuZ3RoID09IGNvdW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGV4cCA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnb3BlbicsIFtuYW1lLCB2ZXJzaW9uXSk7XG4gICAgICB2YXIgcmVxdWVzdCA9IHAucmVxdWVzdDtcblxuICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmICh1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHVwZ3JhZGVDYWxsYmFjayhuZXcgVXBncmFkZURCKHJlcXVlc3QucmVzdWx0LCBldmVudC5vbGRWZXJzaW9uLCByZXF1ZXN0LnRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgICAgIHJldHVybiBuZXcgREIoZGIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdkZWxldGVEYXRhYmFzZScsIFtuYW1lXSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwO1xuICAgIG1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLmlkYiA9IGV4cDtcbiAgfVxufSgpKTtcbiIsImltcG9ydCB7IEluZGV4ZWREYk1hbmFnZXIgfSBmcm9tICcuL2luZGV4ZWREYkJsYXpvcic7XHJcblxyXG5uYW1lc3BhY2UgSW5kZXhEYiB7XHJcbiAgICBjb25zdCB0aW1lZ2hvc3RFeHRlbnNpb25zOiBzdHJpbmcgPSAnVGltZUdob3N0JztcclxuICAgIGNvbnN0IGV4dGVuc2lvbk9iamVjdCA9IHtcclxuICAgICAgICBJbmRleGVkRGJNYW5hZ2VyOiBuZXcgSW5kZXhlZERiTWFuYWdlcigpXHJcbiAgICB9O1xyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXNlKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAhd2luZG93W3RpbWVnaG9zdEV4dGVuc2lvbnNdKSB7XHJcbiAgICAgICAgICAgIHdpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSA9IHtcclxuICAgICAgICAgICAgICAgIC4uLmV4dGVuc2lvbk9iamVjdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSA9IHtcclxuICAgICAgICAgICAgICAgIC4uLndpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSxcclxuICAgICAgICAgICAgICAgIC4uLmV4dGVuc2lvbk9iamVjdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkluZGV4RGIuaW5pdGlhbGlzZSgpOyIsIi8vLy8vIDxyZWZlcmVuY2UgcGF0aD1cIk1pY3Jvc29mdC5KU0ludGVyb3AuZC50c1wiLz5cclxuaW1wb3J0IGlkYiBmcm9tICdpZGInO1xyXG5pbXBvcnQgeyBEQiwgVXBncmFkZURCLCBPYmplY3RTdG9yZSwgVHJhbnNhY3Rpb24gfSBmcm9tICdpZGInO1xyXG5cclxuXHJcbmludGVyZmFjZSBJU3RvcmVSZWNvcmQge1xyXG4gICAgc3RvcmVuYW1lOiBzdHJpbmc7XHJcbiAgICBkYXRhOiBhbnk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJSW5kZXhTZWFyY2gge1xyXG4gICAgc3RvcmVuYW1lOiBzdHJpbmc7XHJcbiAgICBpbmRleE5hbWU6IHN0cmluZztcclxuICAgIHF1ZXJ5VmFsdWU6IGFueTtcclxuICAgIGFsbE1hdGNoaW5nOiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSUluZGV4U3BlYyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBrZXlQYXRoOiBzdHJpbmc7XHJcbiAgICB1bmlxdWU/OiBib29sZWFuO1xyXG4gICAgYXV0bzogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIElTdG9yZVNjaGVtYSB7XHJcbiAgICBkYlZlcnNpb24/OiBudW1iZXI7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBwcmltYXJ5S2V5OiBJSW5kZXhTcGVjO1xyXG4gICAgaW5kZXhlczogSUluZGV4U3BlY1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSURiU3RvcmUge1xyXG4gICAgZGJOYW1lOiBzdHJpbmc7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBzdG9yZXM6IElTdG9yZVNjaGVtYVtdO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEluZGV4ZWREYk1hbmFnZXIge1xyXG4gICBcclxuICAgIHByaXZhdGUgZGJQcm9taXNlOiBQcm9taXNlPERCPiA9IG5ldyBQcm9taXNlPERCPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IH0pO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgb3BlbkRiID0gKGRhdGEpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xyXG4gICAgICAgIHZhciBkYlN0b3JlID0gZGF0YSBhcyBJRGJTdG9yZTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGJQcm9taXNlID0gaWRiLm9wZW4oZGJTdG9yZS5kYk5hbWUsIGRiU3RvcmUudmVyc2lvbiwgdXBncmFkZURCID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBncmFkZURhdGFiYXNlKHVwZ3JhZGVEQiwgZGJTdG9yZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmVzb2x2ZSgnZGF0YWJhc2UgY3JlYXRlZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRSZWNvcmQgPSBhc3luYyAocmVjb3JkOiBJU3RvcmVSZWNvcmQpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0TmFtZSA9IHJlY29yZC5zdG9yZW5hbWU7XHJcbiAgICAgICAgbGV0IGl0ZW1Ub1NhdmUgPSByZWNvcmQuZGF0YTtcclxuICAgICAgICBjb25zdCBkYkluc3RhbmNlID0gYXdhaXQgdGhpcy5kYlByb21pc2U7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKGRiSW5zdGFuY2UsIHN0TmFtZSwncmVhZHdyaXRlJyk7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0eC5vYmplY3RTdG9yZShzdE5hbWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICBpdGVtVG9TYXZlID0gdGhpcy5jaGVja0ZvcktleVBhdGgob2JqZWN0U3RvcmUsIGl0ZW1Ub1NhdmUpO1xyXG4gICAgICAgXHJcbiAgICAgICAgbGV0IHJldHVyblZhbHVlOiBzdHJpbmc9XCJcIjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvYmplY3RTdG9yZS5hZGQoaXRlbVRvU2F2ZSk7XHJcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gYEFkZGVkIG5ldyByZWNvcmQgd2l0aCBpZCAke3Jlc3VsdH1gO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSAoZXJyIGFzIEVycm9yKS5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHVwZGF0ZVJlY29yZCA9IGFzeW5jIChyZWNvcmQ6IElTdG9yZVJlY29yZCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3ROYW1lID0gcmVjb3JkLnN0b3JlbmFtZTtcclxuICAgICAgICBjb25zdCBpdGVtVG9TYXZlID0gcmVjb3JkLmRhdGE7XHJcbiAgICAgICAgY29uc3QgZGJJbnN0YW5jZSA9IGF3YWl0IHRoaXMuZGJQcm9taXNlO1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbihkYkluc3RhbmNlLCBzdE5hbWUsICdyZWFkd3JpdGUnKTtcclxuICAgICAgICBsZXQgcmV0dXJuVmFsdWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3ROYW1lKS5wdXQoaXRlbVRvU2F2ZSk7XHJcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gYHVwZGF0ZWQgcmVjb3JkIHdpdGggaWQgJHtyZXN1bHR9YDtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gKGVyciBhcyBFcnJvcikubWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRSZWNvcmRzID0gYXN5bmMgKHN0b3JlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBjb25zdCBkYkluc3RhbmNlID0gYXdhaXQgdGhpcy5kYlByb21pc2U7XHJcbiAgICAgICAgbGV0IHJldHVyblZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKGRiSW5zdGFuY2UsIHN0b3JlTmFtZSwgJ3JlYWRvbmx5Jyk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5nZXRBbGwoKTtcclxuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBKU09OLnN0cmluZ2lmeShyZXN1bHRzKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSAoZXJyIGFzIEVycm9yKS5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhclN0b3JlID0gYXN5bmMgKHN0b3JlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBjb25zdCBkYkluc3RhbmNlID0gYXdhaXQgdGhpcy5kYlByb21pc2U7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKGRiSW5zdGFuY2UsIHN0b3JlTmFtZSwgJ3JlYWR3cml0ZScpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHR4Lm9iamVjdFN0b3JlKHN0b3JlTmFtZSkuY2xlYXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGBTdG9yZSAke3N0b3JlTmFtZX0gY2xlYXJlZGA7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoZXJyIGFzIEVycm9yKS5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmVjb3JkQnlJbmRleCA9IGFzeW5jIChzZWFyY2hEYXRhOiBJSW5kZXhTZWFyY2gpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIGNvbnN0IGRiSW5zdGFuY2UgPSBhd2FpdCB0aGlzLmRiUHJvbWlzZTtcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24oZGJJbnN0YW5jZSwgc2VhcmNoRGF0YS5zdG9yZW5hbWUsICdyZWFkb25seScpO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0eC5vYmplY3RTdG9yZShzZWFyY2hEYXRhLnN0b3JlbmFtZSlcclxuICAgICAgICAgICAgLmluZGV4KHNlYXJjaERhdGEuaW5kZXhOYW1lKVxyXG4gICAgICAgICAgICAuZ2V0KHNlYXJjaERhdGEucXVlcnlWYWx1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRSZWNvcmRCeUlkID0gYXN5bmMgKGRhdGE6IElTdG9yZVJlY29yZCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVOYW1lID0gZGF0YS5zdG9yZW5hbWU7XHJcbiAgICAgICAgY29uc3QgaWQgPSBkYXRhLmRhdGE7XHJcbiAgICAgICAgY29uc3QgZGJJbnN0YW5jZSA9IGF3YWl0IHRoaXMuZGJQcm9taXNlO1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbihkYkluc3RhbmNlLCBzdG9yZU5hbWUsICdyZWFkb25seScpO1xyXG4gICAgICAgIGxldCByZXR1cm5WYWx1ZTogc3RyaW5nO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5nZXQoaWQpO1xyXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSAoZXJyIGFzIEVycm9yKS5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGVSZWNvcmQgPSBhc3luYyAoZGF0YTogSVN0b3JlUmVjb3JkKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBjb25zdCBzdG9yZU5hbWUgPSBkYXRhLnN0b3JlbmFtZTtcclxuICAgICAgICBjb25zdCBpZCA9IGRhdGEuZGF0YTtcclxuICAgICAgICBjb25zdCBkYkluc3RhbmNlID0gYXdhaXQgdGhpcy5kYlByb21pc2U7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKGRiSW5zdGFuY2UsIHN0b3JlTmFtZSwgJ3JlYWR3cml0ZScpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCB0eC5vYmplY3RTdG9yZShzdG9yZU5hbWUpLmRlbGV0ZShpZCk7IFxyXG4gICAgICAgICAgICByZXR1cm4gJ1JlY29yZCBkZWxldGVkJztcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIChlcnIgYXMgRXJyb3IpLm1lc3NhZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gXHJcbiAgICBwcml2YXRlIGdldFRyYW5zYWN0aW9uKGRiSW5zdGFuY2U6IERCLCBzdE5hbWU6IHN0cmluZywgbW9kZT86ICdyZWFkb25seScgfCAncmVhZHdyaXRlJykge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gZGJJbnN0YW5jZS50cmFuc2FjdGlvbihzdE5hbWUsIG1vZGUpO1xyXG4gICAgICAgIHR4LmNvbXBsZXRlLmNhdGNoKFxyXG4gICAgICAgICAgICBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKGVyciBhcyBFcnJvcikubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tGb3JLZXlQYXRoKG9iamVjdFN0b3JlOiBPYmplY3RTdG9yZTxhbnksIGFueT4sIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGlmICghb2JqZWN0U3RvcmUuYXV0b0luY3JlbWVudCB8fCAhb2JqZWN0U3RvcmUua2V5UGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggdHlwZW9mIG9iamVjdFN0b3JlLmtleVBhdGggIT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleVBhdGggPSBvYmplY3RTdG9yZS5rZXlQYXRoIGFzIHN0cmluZztcclxuICAgICAgIFxyXG4gICAgICAgIGlmICghZGF0YVtrZXlQYXRoXSkge1xyXG4gICAgICAgICAgICBkZWxldGUgZGF0YVtrZXlQYXRoXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGdyYWRlRGF0YWJhc2UodXBncmFkZURCOiBVcGdyYWRlREIsIGRiU3RvcmU6IElEYlN0b3JlKSB7XHJcbiAgICAgICAgaWYgKHVwZ3JhZGVEQi5vbGRWZXJzaW9uIDwgZGJTdG9yZS52ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChkYlN0b3JlLnN0b3Jlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYlN0b3JlLnN0b3Jlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JlU2NoZW1hID0gZGJTdG9yZS5zdG9yZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1cGdyYWRlREIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhzdG9yZVNjaGVtYS5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJpbWFyeUtleSA9IHN0b3JlU2NoZW1hLnByaW1hcnlLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcHJpbWFyeUtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUtleSA9IHsgbmFtZTogJ2lkJywga2V5UGF0aDogJ2lkJywgYXV0bzogdHJ1ZSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gdXBncmFkZURCLmNyZWF0ZU9iamVjdFN0b3JlKHN0b3JlU2NoZW1hLm5hbWUsIHsga2V5UGF0aDogcHJpbWFyeUtleS5uYW1lLCBhdXRvSW5jcmVtZW50OiBwcmltYXJ5S2V5LmF1dG8gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3RvcmVTY2hlbWEuaW5kZXhlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzdG9yZVNjaGVtYS5pbmRleGVzW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmUuY3JlYXRlSW5kZXgoaW5kZXgubmFtZSwgaW5kZXgua2V5UGF0aCwgeyB1bmlxdWU6IGluZGV4LnVuaXF1ZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiIn0=