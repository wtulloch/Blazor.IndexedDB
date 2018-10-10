///// <reference path="Microsoft.JSInterop.d.ts"/>
import idb from 'idb';
import { DB, UpgradeDB, ObjectStore, Transaction } from 'idb';
import {IDbStore, IIndexSearch, IIndexSpec,IStoreRecord, IStoreSchema  } from './interopInterfaces'; 



export class IndexedDbManager {
   
    private dbPromise: Promise<DB> = new Promise<DB>((resolve, reject) => { });

    constructor() {}

    public openDb = (data): Promise<string> => {
        var dbStore = data as IDbStore;
        return new Promise<string>((resolve, reject) => {
            this.dbPromise = idb.open(dbStore.dbName, dbStore.version, upgradeDB => {
                this.upgradeDatabase(upgradeDB, dbStore);
            });

            resolve('database created');
        });
    }

    public addRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        let itemToSave = record.data;
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, stName,'readwrite');
        const objectStore = tx.objectStore(stName);
        
         itemToSave = this.checkForKeyPath(objectStore, itemToSave);
       
        let returnValue: string="";
        try {
            const result = await objectStore.add(itemToSave, record.key);
            returnValue = `Added new record with id ${result}`;
        } catch (err) {
             returnValue = (err as Error).message;
        }

        return returnValue;
    }
    public updateRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        const itemToSave = record.data;
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, stName, 'readwrite');
        let returnValue: string;

        try {
            const result = await tx.objectStore(stName).put(itemToSave,record.key);
            returnValue = `updated record with id ${result}`;
        } catch (err) {
            
            returnValue = (err as Error).message;
        }
        
        return returnValue;
    }

    public getRecords = async (storeName: string): Promise<string> => {
        const dbInstance = await this.dbPromise;
        let returnValue: string;
        const tx = this.getTransaction(dbInstance, storeName, 'readonly');

        try {
            let results = await tx.objectStore(storeName).getAll();
            returnValue = JSON.stringify(results);
        } catch (err) {
           
            returnValue = (err as Error).message;
        }

        return returnValue;
    }

    public clearStore = async (storeName: string): Promise<string> => {
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, storeName, 'readwrite');
        try {
            await tx.objectStore(storeName).clear();
            return `Store ${storeName} cleared`;
        } catch (err) {
            return (err as Error).message;
        }
    }

    public getRecordByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, searchData.storename, 'readonly');
        if (searchData.allMatching) {

        }

        const results = await tx.objectStore(searchData.storename)
            .index(searchData.indexName)
            .get(searchData.queryValue);

        return results;
    }

    public getRecordById = async (data: IStoreRecord): Promise<string> => {
        const storeName = data.storename;
        const id = data.data;
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, storeName, 'readonly');
        let returnValue: string;

        try {
            let result = await tx.objectStore(storeName).get(id);
            returnValue = JSON.stringify(result);

        } catch (err) {
            
            returnValue = (err as Error).message;
        }

        return returnValue;
    }

    public deleteRecord = async (data: IStoreRecord): Promise<string> => {
        const storeName = data.storename;
        const id = data.data;
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, storeName, 'readwrite');

        try {
            await tx.objectStore(storeName).delete(id); 
            return 'Record deleted';
        } catch (err) {
           
            return (err as Error).message;
        }
    }
 
    private getTransaction(dbInstance: DB, stName: string, mode?: 'readonly' | 'readwrite') {
        const tx = dbInstance.transaction(stName, mode);
        tx.complete.catch(
            err => {
                console.log((err as Error).message);
            });

        return tx;
    }


    private checkForKeyPath(objectStore: ObjectStore<any, any>, data: any) {
        if (!objectStore.autoIncrement || !objectStore.keyPath) {
            return data;
        }

        if ( typeof objectStore.keyPath !== 'string' ) {
            return data;
        }

        const keyPath = objectStore.keyPath as string;
       
        if (!data[keyPath]) {
            delete data[keyPath];
        }
        return data;
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