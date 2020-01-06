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

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2lkYi9saWIvaWRiLmpzIiwid2VicGFjazovLy8uL3NyYy9Jbml0aWFsaXNlSW5kZXhEYkJsYXpvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXhlZERiQmxhem9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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QVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBRWxDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQzFEO1FBRUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFFMUgsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdCLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQzdFO0lBQ0wsQ0FBQztDQUNKO0FBL01ELDRDQStNQyIsImZpbGUiOiJpbmRleGVkRGIuQmxhem9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5pdGlhbGlzZUluZGV4RGJCbGF6b3IudHNcIik7XG4iLCIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gdG9BcnJheShhcnIpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0ID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgcC5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeUN1cnNvclJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIHAucmVxdWVzdCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eVByb3BlcnRpZXMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJveHlDbGFzcy5wcm90b3R5cGUsIHByb3AsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICB0aGlzW3RhcmdldFByb3BdW3Byb3BdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXS5hcHBseSh0aGlzW3RhcmdldFByb3BdLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBJbmRleChpbmRleCkge1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoSW5kZXgsICdfaW5kZXgnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnbXVsdGlFbnRyeScsXG4gICAgJ3VuaXF1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ2dldCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBmdW5jdGlvbiBDdXJzb3IoY3Vyc29yLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEN1cnNvciwgJ19jdXJzb3InLCBbXG4gICAgJ2RpcmVjdGlvbicsXG4gICAgJ2tleScsXG4gICAgJ3ByaW1hcnlLZXknLFxuICAgICd2YWx1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhDdXJzb3IsICdfY3Vyc29yJywgSURCQ3Vyc29yLCBbXG4gICAgJ3VwZGF0ZScsXG4gICAgJ2RlbGV0ZSdcbiAgXSk7XG5cbiAgLy8gcHJveHkgJ25leHQnIG1ldGhvZHNcbiAgWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgIGlmICghKG1ldGhvZE5hbWUgaW4gSURCQ3Vyc29yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICBDdXJzb3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnNvci5fY3Vyc29yW21ldGhvZE5hbWVdLmFwcGx5KGN1cnNvci5fY3Vyc29yLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QoY3Vyc29yLl9yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBjdXJzb3IuX3JlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE9iamVjdFN0b3JlKHN0b3JlKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuY3JlYXRlSW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuaW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdpbmRleE5hbWVzJyxcbiAgICAnYXV0b0luY3JlbWVudCdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ3B1dCcsXG4gICAgJ2FkZCcsXG4gICAgJ2RlbGV0ZScsXG4gICAgJ2NsZWFyJyxcbiAgICAnZ2V0JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ2RlbGV0ZUluZGV4J1xuICBdKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihpZGJUcmFuc2FjdGlvbikge1xuICAgIHRoaXMuX3R4ID0gaWRiVHJhbnNhY3Rpb247XG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KGlkYlRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBUcmFuc2FjdGlvbi5wcm90b3R5cGUub2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX3R4Lm9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX3R4LCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVHJhbnNhY3Rpb24sICdfdHgnLCBbXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnLFxuICAgICdtb2RlJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVHJhbnNhY3Rpb24sICdfdHgnLCBJREJUcmFuc2FjdGlvbiwgW1xuICAgICdhYm9ydCdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gVXBncmFkZURCKGRiLCBvbGRWZXJzaW9uLCB0cmFuc2FjdGlvbikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gICAgdGhpcy5vbGRWZXJzaW9uID0gb2xkVmVyc2lvbjtcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKTtcbiAgfVxuXG4gIFVwZ3JhZGVEQi5wcm90b3R5cGUuY3JlYXRlT2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX2RiLmNyZWF0ZU9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVXBncmFkZURCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhVcGdyYWRlREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdkZWxldGVPYmplY3RTdG9yZScsXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICBmdW5jdGlvbiBEQihkYikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gIH1cblxuICBEQi5wcm90b3R5cGUudHJhbnNhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKHRoaXMuX2RiLnRyYW5zYWN0aW9uLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKERCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIC8vIEFkZCBjdXJzb3IgaXRlcmF0b3JzXG4gIC8vIFRPRE86IHJlbW92ZSB0aGlzIG9uY2UgYnJvd3NlcnMgZG8gdGhlIHJpZ2h0IHRoaW5nIHdpdGggcHJvbWlzZXNcbiAgWydvcGVuQ3Vyc29yJywgJ29wZW5LZXlDdXJzb3InXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmNOYW1lKSB7XG4gICAgW09iamVjdFN0b3JlLCBJbmRleF0uZm9yRWFjaChmdW5jdGlvbihDb25zdHJ1Y3Rvcikge1xuICAgICAgLy8gRG9uJ3QgY3JlYXRlIGl0ZXJhdGVLZXlDdXJzb3IgaWYgb3BlbktleUN1cnNvciBkb2Vzbid0IGV4aXN0LlxuICAgICAgaWYgKCEoZnVuY05hbWUgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuXG4gICAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZnVuY05hbWUucmVwbGFjZSgnb3BlbicsICdpdGVyYXRlJyldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBuYXRpdmVPYmplY3QgPSB0aGlzLl9zdG9yZSB8fCB0aGlzLl9pbmRleDtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuYXRpdmVPYmplY3RbZnVuY05hbWVdLmFwcGx5KG5hdGl2ZU9iamVjdCwgYXJncy5zbGljZSgwLCAtMSkpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBvbHlmaWxsIGdldEFsbFxuICBbSW5kZXgsIE9iamVjdFN0b3JlXS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwpIHJldHVybjtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24ocXVlcnksIGNvdW50KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGluc3RhbmNlLml0ZXJhdGVDdXJzb3IocXVlcnksIGZ1bmN0aW9uKGN1cnNvcikge1xuICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaChjdXJzb3IudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQgJiYgaXRlbXMubGVuZ3RoID09IGNvdW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGV4cCA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnb3BlbicsIFtuYW1lLCB2ZXJzaW9uXSk7XG4gICAgICB2YXIgcmVxdWVzdCA9IHAucmVxdWVzdDtcblxuICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmICh1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHVwZ3JhZGVDYWxsYmFjayhuZXcgVXBncmFkZURCKHJlcXVlc3QucmVzdWx0LCBldmVudC5vbGRWZXJzaW9uLCByZXF1ZXN0LnRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgICAgIHJldHVybiBuZXcgREIoZGIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdkZWxldGVEYXRhYmFzZScsIFtuYW1lXSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwO1xuICAgIG1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLmlkYiA9IGV4cDtcbiAgfVxufSgpKTtcbiIsImltcG9ydCB7IEluZGV4ZWREYk1hbmFnZXIgfSBmcm9tICcuL2luZGV4ZWREYkJsYXpvcic7XHJcblxyXG5uYW1lc3BhY2UgSW5kZXhEYiB7XHJcbiAgICBjb25zdCB0aW1lZ2hvc3RFeHRlbnNpb25zOiBzdHJpbmcgPSAnVGltZUdob3N0JztcclxuICAgIGNvbnN0IGV4dGVuc2lvbk9iamVjdCA9IHtcclxuICAgICAgICBJbmRleGVkRGJNYW5hZ2VyOiBuZXcgSW5kZXhlZERiTWFuYWdlcigpXHJcbiAgICB9O1xyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXNlKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAhd2luZG93W3RpbWVnaG9zdEV4dGVuc2lvbnNdKSB7XHJcbiAgICAgICAgICAgIHdpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSA9IHtcclxuICAgICAgICAgICAgICAgIC4uLmV4dGVuc2lvbk9iamVjdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSA9IHtcclxuICAgICAgICAgICAgICAgIC4uLndpbmRvd1t0aW1lZ2hvc3RFeHRlbnNpb25zXSxcclxuICAgICAgICAgICAgICAgIC4uLmV4dGVuc2lvbk9iamVjdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkluZGV4RGIuaW5pdGlhbGlzZSgpOyIsIi8vLy8vIDxyZWZlcmVuY2UgcGF0aD1cIk1pY3Jvc29mdC5KU0ludGVyb3AuZC50c1wiLz5cclxuaW1wb3J0IGlkYiBmcm9tICdpZGInO1xyXG5pbXBvcnQgeyBEQiwgVXBncmFkZURCLCBPYmplY3RTdG9yZSwgVHJhbnNhY3Rpb24gfSBmcm9tICdpZGInO1xyXG5pbXBvcnQgeyBJRGJTdG9yZSwgSUluZGV4U2VhcmNoLCBJSW5kZXhTcGVjLCBJU3RvcmVSZWNvcmQsIElTdG9yZVNjaGVtYSwgSURvdE5ldEluc3RhbmNlV3JhcHBlciwgSURiSW5mb3JtYXRpb24gfSBmcm9tICcuL0ludGVyb3BJbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBJbmRleGVkRGJNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIGRiSW5zdGFuY2U6YW55ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBkb3RuZXRDYWxsYmFjayA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHsgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuRGIgPSBhc3luYyAoZGF0YTogSURiU3RvcmUsIGluc3RhbmNlV3JhcHBlcjogSURvdE5ldEluc3RhbmNlV3JhcHBlcik6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3QgZGJTdG9yZSA9IGRhdGE7XHJcbiAgICAgICAgLy9qdXN0IGEgdGVzdCBmb3IgdGhlIG1vbWVudFxyXG4gICAgICAgIHRoaXMuZG90bmV0Q2FsbGJhY2sgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlV3JhcHBlci5pbnN0YW5jZS5pbnZva2VNZXRob2RBc3luYyhpbnN0YW5jZVdyYXBwZXIubWV0aG9kTmFtZSwgbWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGJJbnN0YW5jZSB8fCB0aGlzLmRiSW5zdGFuY2UudmVyc2lvbiA8IGRiU3RvcmUudmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGJJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYkluc3RhbmNlID0gYXdhaXQgaWRiLm9wZW4oZGJTdG9yZS5kYk5hbWUsIGRiU3RvcmUudmVyc2lvbiwgdXBncmFkZURCID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZ3JhZGVEYXRhYmFzZSh1cGdyYWRlREIsIGRiU3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGJJbnN0YW5jZSA9IGF3YWl0IGlkYi5vcGVuKGRiU3RvcmUuZGJOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGBJbmRleGVkREIgJHtkYXRhLmRiTmFtZX0gb3BlbmVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGJJbmZvID0gYXN5bmMgKGRiTmFtZTogc3RyaW5nKSA6IFByb21pc2U8SURiSW5mb3JtYXRpb24+ID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuZGJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRiSW5zdGFuY2UgPSBhd2FpdCBpZGIub3BlbihkYk5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudERiID0gPERCPnRoaXMuZGJJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgbGV0IGdldFN0b3JlTmFtZXMgPSAobGlzdDogRE9NU3RyaW5nTGlzdCk6IHN0cmluZ1tdID0+IHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWVzLnB1c2gobGlzdFtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkYkluZm86IElEYkluZm9ybWF0aW9uID0ge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBjdXJyZW50RGIudmVyc2lvbixcclxuICAgICAgICAgICAgc3RvcmVOYW1lczogZ2V0U3RvcmVOYW1lcyhjdXJyZW50RGIub2JqZWN0U3RvcmVOYW1lcylcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZGJJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGVEYiA9IGFzeW5jKGRiTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICB0aGlzLmRiSW5zdGFuY2UuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgYXdhaXQgaWRiLmRlbGV0ZShkYk5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLmRiSW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBgVGhlIGRhdGFiYXNlICR7ZGJOYW1lfSBoYXMgYmVlbiBkZWxldGVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkUmVjb3JkID0gYXN5bmMgKHJlY29yZDogSVN0b3JlUmVjb3JkKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBjb25zdCBzdE5hbWUgPSByZWNvcmQuc3RvcmVuYW1lO1xyXG4gICAgICAgIGxldCBpdGVtVG9TYXZlID0gcmVjb3JkLmRhdGE7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKHRoaXMuZGJJbnN0YW5jZSwgc3ROYW1lLCAncmVhZHdyaXRlJyk7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0eC5vYmplY3RTdG9yZShzdE5hbWUpO1xyXG5cclxuICAgICAgICBpdGVtVG9TYXZlID0gdGhpcy5jaGVja0ZvcktleVBhdGgob2JqZWN0U3RvcmUsIGl0ZW1Ub1NhdmUpO1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvYmplY3RTdG9yZS5hZGQoaXRlbVRvU2F2ZSwgcmVjb3JkLmtleSk7XHJcblxyXG4gICAgICAgIHJldHVybiBgQWRkZWQgbmV3IHJlY29yZCB3aXRoIGlkICR7cmVzdWx0fWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVJlY29yZCA9IGFzeW5jIChyZWNvcmQ6IElTdG9yZVJlY29yZCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3ROYW1lID0gcmVjb3JkLnN0b3JlbmFtZTtcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdE5hbWUsICdyZWFkd3JpdGUnKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3ROYW1lKS5wdXQocmVjb3JkLmRhdGEsIHJlY29yZC5rZXkpO1xyXG4gICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGB1cGRhdGVkIHJlY29yZCB3aXRoIGlkICR7cmVzdWx0fWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJlY29yZHMgPSBhc3luYyAoc3RvcmVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbih0aGlzLmRiSW5zdGFuY2UsIHN0b3JlTmFtZSwgJ3JlYWRvbmx5Jyk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5nZXRBbGwoKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdHguY29tcGxldGU7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhclN0b3JlID0gYXN5bmMgKHN0b3JlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdG9yZU5hbWUsICdyZWFkd3JpdGUnKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5jbGVhcigpO1xyXG4gICAgICAgIGF3YWl0IHR4LmNvbXBsZXRlO1xyXG5cclxuICAgICAgICByZXR1cm4gYFN0b3JlICR7c3RvcmVOYW1lfSBjbGVhcmVkYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmVjb3JkQnlJbmRleCA9IGFzeW5jIChzZWFyY2hEYXRhOiBJSW5kZXhTZWFyY2gpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy5nZXRUcmFuc2FjdGlvbih0aGlzLmRiSW5zdGFuY2UsIHNlYXJjaERhdGEuc3RvcmVuYW1lLCAncmVhZG9ubHknKTtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc2VhcmNoRGF0YS5zdG9yZW5hbWUpXHJcbiAgICAgICAgICAgIC5pbmRleChzZWFyY2hEYXRhLmluZGV4TmFtZSlcclxuICAgICAgICAgICAgLmdldChzZWFyY2hEYXRhLnF1ZXJ5VmFsdWUpO1xyXG5cclxuICAgICAgICBhd2FpdCB0eC5jb21wbGV0ZTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QWxsUmVjb3Jkc0J5SW5kZXggPSBhc3luYyAoc2VhcmNoRGF0YTogSUluZGV4U2VhcmNoKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzZWFyY2hEYXRhLnN0b3JlbmFtZSwgJ3JlYWRvbmx5Jyk7XHJcbiAgICAgICAgbGV0IHJlc3VsdHM6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHR4Lm9iamVjdFN0b3JlKHNlYXJjaERhdGEuc3RvcmVuYW1lKVxyXG4gICAgICAgICAgICAuaW5kZXgoc2VhcmNoRGF0YS5pbmRleE5hbWUpXHJcbiAgICAgICAgICAgIC5pdGVyYXRlQ3Vyc29yKGN1cnNvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3Vyc29yLmtleSA9PT0gc2VhcmNoRGF0YS5xdWVyeVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGN1cnNvci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhd2FpdCB0eC5jb21wbGV0ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJlY29yZEJ5SWQgPSBhc3luYyAoc3RvcmVuYW1lOiBzdHJpbmcsIGlkOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB0eCA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24odGhpcy5kYkluc3RhbmNlLCBzdG9yZW5hbWUsICdyZWFkb25seScpO1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdHgub2JqZWN0U3RvcmUoc3RvcmVuYW1lKS5nZXQoaWQpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZVJlY29yZCA9IGFzeW5jIChzdG9yZW5hbWU6IHN0cmluZywgaWQ6IGFueSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLmdldFRyYW5zYWN0aW9uKHRoaXMuZGJJbnN0YW5jZSwgc3RvcmVuYW1lLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gICAgICAgIGF3YWl0IHR4Lm9iamVjdFN0b3JlKHN0b3JlbmFtZSkuZGVsZXRlKGlkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBSZWNvcmQgd2l0aCBpZDogJHtpZH0gZGVsZXRlZGA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2FjdGlvbihkYkluc3RhbmNlOiBEQiwgc3ROYW1lOiBzdHJpbmcsIG1vZGU/OiAncmVhZG9ubHknIHwgJ3JlYWR3cml0ZScpIHtcclxuICAgICAgICBjb25zdCB0eCA9IGRiSW5zdGFuY2UudHJhbnNhY3Rpb24oc3ROYW1lLCBtb2RlKTtcclxuICAgICAgICB0eC5jb21wbGV0ZS5jYXRjaChcclxuICAgICAgICAgICAgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKChlcnIgYXMgRXJyb3IpLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHR4O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEN1cnJlbnRseSBkb24ndCBzdXBwb3J0IGFnZ3JlZ2F0ZSBrZXlzXHJcbiAgICBwcml2YXRlIGNoZWNrRm9yS2V5UGF0aChvYmplY3RTdG9yZTogT2JqZWN0U3RvcmU8YW55LCBhbnk+LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBpZiAoIW9iamVjdFN0b3JlLmF1dG9JbmNyZW1lbnQgfHwgIW9iamVjdFN0b3JlLmtleVBhdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG9iamVjdFN0b3JlLmtleVBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2V5UGF0aCA9IG9iamVjdFN0b3JlLmtleVBhdGggYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGFba2V5UGF0aF0pIHtcclxuICAgICAgICAgICAgZGVsZXRlIGRhdGFba2V5UGF0aF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBncmFkZURhdGFiYXNlKHVwZ3JhZGVEQjogVXBncmFkZURCLCBkYlN0b3JlOiBJRGJTdG9yZSkge1xyXG4gICAgICAgIGlmICh1cGdyYWRlREIub2xkVmVyc2lvbiA8IGRiU3RvcmUudmVyc2lvbikge1xyXG4gICAgICAgICAgICBpZiAoZGJTdG9yZS5zdG9yZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHN0b3JlIG9mIGRiU3RvcmUuc3RvcmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1cGdyYWRlREIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhzdG9yZS5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE5ld1N0b3JlKHVwZ3JhZGVEQiwgc3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvdG5ldENhbGxiYWNrKGBzdG9yZSBhZGRlZCAke3N0b3JlLm5hbWV9OiBkYiB2ZXJzaW9uOiAke2RiU3RvcmUudmVyc2lvbn1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGROZXdTdG9yZSh1cGdyYWRlREI6IFVwZ3JhZGVEQiwgc3RvcmU6IElTdG9yZVNjaGVtYSkge1xyXG4gICAgICAgIGxldCBwcmltYXJ5S2V5ID0gc3RvcmUucHJpbWFyeUtleTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmltYXJ5S2V5KSB7XHJcbiAgICAgICAgICAgIHByaW1hcnlLZXkgPSB7IG5hbWU6ICdpZCcsIGtleVBhdGg6ICdpZCcsIGF1dG86IHRydWUgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1N0b3JlID0gdXBncmFkZURCLmNyZWF0ZU9iamVjdFN0b3JlKHN0b3JlLm5hbWUsIHsga2V5UGF0aDogcHJpbWFyeUtleS5rZXlQYXRoLCBhdXRvSW5jcmVtZW50OiBwcmltYXJ5S2V5LmF1dG8gfSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGluZGV4IG9mIHN0b3JlLmluZGV4ZXMpIHtcclxuICAgICAgICAgICAgbmV3U3RvcmUuY3JlYXRlSW5kZXgoaW5kZXgubmFtZSwgaW5kZXgua2V5UGF0aCwgeyB1bmlxdWU6IGluZGV4LnVuaXF1ZSB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXSwic291cmNlUm9vdCI6IiJ9