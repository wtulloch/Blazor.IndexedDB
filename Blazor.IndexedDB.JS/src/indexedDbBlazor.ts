/// <reference path="Microsoft.JSInterop.d.ts"/>
import PromisedDB from 'promised-db';


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
    private assemblyName = 'Blazor.IndexedDB';
    private promiseCallback = 'PromiseCallback';
    private promiseError = 'PromiseError'; public runFunction = (callbackId: string, fnName: string, data: any): boolean => {

        console.log('Start runFunction');

        const promise = this[fnName](data);

        promise.then(value => {
            if (value === undefined) {
                value = '';
            }
            const result = JSON.stringify(value);
            DotNet.invokeMethodAsync(this.assemblyName, this.promiseCallback, callbackId, result);
        })
            .catch(reason => {
                const result = JSON.stringify(reason);
                DotNet.invokeMethodAsync(this.assemblyName, this.promiseError, callbackId, result);
            });

        return true;
    }
    private isOpen = false;
    private db: PromisedDB;



    public openDb = (data): Promise<string> => {
        var dbStore = data as IDbStore;
        return new Promise<string>((resolve, reject) => {
            this.db = new PromisedDB(dbStore.dbName, dbStore.version,
                (db, onDiskVersion, newVersion) => {

                    if (dbStore.stores) {
                        for (let i = 0; i < dbStore.stores.length; i++) {
                            const storeSchema = dbStore.stores[i];

                            if (!db.objectStoreNames.contains(storeSchema.name)) {
                                let primaryKey = storeSchema.primaryKey;

                                if (!primaryKey) {
                                    primaryKey = { name: 'id', keyPath: 'id', auto: true }
                                }
                                const store = db.createObjectStore(storeSchema.name,
                                    { keyPath: primaryKey.name, autoIncrement: primaryKey.auto });

                                for (let j = 0; j < storeSchema.indexes.length; j++) {
                                    const index = storeSchema.indexes[j];
                                    store.createIndex(index.name, index.keyPath, { unique: index.unique });
                                }
                            }

                        }
                    }

                });
            resolve(`${dbStore.dbName} is opened`);
        });

    }


    public addRecord = (record: ISingleRecord): Promise<any> => {
        const stName = record.storename;
        const itemToSave = record.data;
        //const store = this.getObjectStore(stName, 'readwrite');
        const trans = this.db.transaction(stName, 'readwrite', (tr, request) => {
           
            const store: IDBObjectStore = tr.objectStore(stName);
            console.log(store);
            const itemPromise = new Promise<any>((resolve, reject) => {
                const request = store.add(itemToSave);

                request.onsuccess = ev => resolve();
                request.onerror = ev => reject();
            });

            return itemPromise;
        });

        return new Promise<any>((resolve, reject) => {
            trans
                .then(result => {
                    console.log('Insertion successful');
                    console.log('result', result);

                    resolve("record added");
                })
                .catch(error => {
                    //console.log(error);
                    reject('Failed to add record');
                });
        });
    }

    public getRecords = (storeName: string): Promise<any> => {

        const trans = this.db.transaction(storeName,
            "readonly",
            (tr, getAll) => {
                const store = tr.objectStore(storeName);
                console.log(store);
                const getPromise = new PromisedDB<any>((resolve, reject) => {
                    const request = store.getAll();
                    request.onsuccess = ev => resolve(request);
                    request.onerror = ev => reject();
                });
                return getPromise;
            });

        return new Promise<any>((resolve, reject) => {
            trans
                .then(result => {
                    console.log('get successful');
                    console.log('result', result);

                    resolve(result);
                })
                .catch(error => {
                    //console.log(error);
                    reject(null);
                });
        });


    }
    public getObjectStore = (storeName: string, mode: 'readonly' | 'readwrite' | 'versionchange' | undefined): IDBObjectStore => {
        const tx: IDBTransaction = this.db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }



}