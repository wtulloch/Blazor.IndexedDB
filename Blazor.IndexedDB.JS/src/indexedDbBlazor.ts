/// <reference path="Microsoft.JSInterop.d.ts"/>
import idb from 'idb';
import { DB, UpgradeDB } from 'idb';


interface ISingleRecord {
    storename: string;
    data: object;
}

interface IIndexSpec {
    name: string;
    keyPath: string;
    unique?: boolean;
    auto: boolean;
}

interface IStoreSchema {
    dbVersion?: number;
    name: string;
    primaryKey: IIndexSpec;
    indexes: IIndexSpec[];
}

interface IDbStore {
    dbName: string;
    version: number;
    stores: IStoreSchema[];

}

export class IndexedDbManager {
    private isOpen = false;
    private db: Promise<DB> = new Promise<DB>((resolve, reject) => { });

    constructor() {}

    public openDb = (data): Promise<string> => {
        var dbStore = data as IDbStore;
        return new Promise<string>((resolve, reject) => {
            this.db = idb.open(dbStore.dbName, dbStore.version, upgradeDB => {
                this.upgradeDatabase(upgradeDB, dbStore);
            });

            resolve('database created');
        });
    }

    public addRecord = (record: ISingleRecord): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const stName = record.storename;
            const itemToSave = record.data;
            this.db.then(dbInstance => {
                const tx = dbInstance.transaction(stName, 'readwrite');
                tx.objectStore(stName).add(itemToSave)
                    .then(value => {
                        resolve(`Add new recorded with id ${value}`);
                    })
                    .catch(error => {
                        console.error(error);
                        reject('Failed to add new record')
                    });
            });
        })

    }
    public updateRecord = (record: ISingleRecord): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const stName = record.storename;
            const itemToSave = record.data;
            this.db.then(dbInstance => {
                const tx = dbInstance.transaction(stName, 'readwrite');
                tx.objectStore(stName).put(itemToSave)
                    .then(value => {
                        resolve(`updated record with id ${value}`);
                    })
                    .catch(error => {
                        console.error(error);
                        reject('Failed to add new record')
                    });
            });
        })

    }

    public getRecords = (storeName: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            this.db.then(db => {
                return db.transaction(storeName)
                    .objectStore(storeName).getAll();
            }).then(result => {
                var json = JSON.stringify(result);
                resolve(json);
            }).catch(error => {
                console.error("Issue getting all records", error);
                reject("failed to get records");
            });
        });
    }

    public getRecordById = (data: ISingleRecord): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const storeName = data.storename;
            const id = data.data;
            this.db.then(db => {
                return db.transaction(storeName, "readonly")
                    .objectStore(storeName).get(id);
            }).then(result => {
                var json = JSON.stringify(result);
                resolve(json);
            }).catch(error => {
                console.error(`failed to get record: ${id}`, error);
                reject(`failed to get record: ${id}`);
            });
        });
    }

    private upgradeDatabase(upgradeDB: UpgradeDB, dbStore: IDbStore) {
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