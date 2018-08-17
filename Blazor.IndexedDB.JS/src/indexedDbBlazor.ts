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

interface ITableSchema {
    dbVersion?: number;
    name: string;
    primaryKey: IIndexSpec;
    indexes: IIndexSpec[];
}

interface IDbStore {
    name: string;
    version: number;
    tables: ITableSchema[];

}

export class IndexedDbManager {
    private assemblyName = 'Blazor.IndexedDB';
    private promiseCallback = 'PromiseCallback';
    private promiseError = 'PromiseError';  public runFunction = (callbackId: string, fnName: string, data: any): boolean => {

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
            this.db = new PromisedDB(dbStore.name, dbStore.version,
                (db, onDiskVersion, newVersion) => {

                    if (dbStore.tables) {
                        for (let i = 0; i < dbStore.tables.length; i++) {
                            const table = dbStore.tables[i];
                            if (!db.objectStoreNames.contains(table.name)) {
                                const primaryKey = table.primaryKey;
                                const store = db.createObjectStore(table.name,
                                    { keyPath: primaryKey.name, autoIncrement: primaryKey.auto });

                                for (let j = 0; j < table.indexes.length; j++) {
                                    const index = table.indexes[j];
                                    store.createIndex(index.name, index.keyPath, { unique: index.unique });
                                }
                            }
                            
                        }
                    }

                });
            resolve(`${dbStore.name} is opened`);
            
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

    public getObjectStore = (storeName: string, mode: 'readonly' | 'readwrite' | 'versionchange' | undefined): IDBObjectStore => {
        const tx: IDBTransaction = this.db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }



}