///// <reference path="Microsoft.JSInterop.d.ts"/>
import idb from 'idb';
import { DB, UpgradeDB, ObjectStore, Transaction } from 'idb';
import {IDbStore, IIndexSearch, IIndexSpec,IStoreRecord, IStoreSchema, IDotNetInstanceWrapper  } from './interopInterfaces'; 



export class IndexedDbManager {
   
    private dbPromise: Promise<DB> = new Promise<DB>((resolve, reject) => { });

    constructor() {}

    public openDb = (data:IDbStore, instanceWrapper: IDotNetInstanceWrapper): Promise<string> => {
        const dbStore = data;
        const test = instanceWrapper;
        instanceWrapper.instance.invokeMethod(instanceWrapper.methodName, "Hello from the other side");
        return new Promise<string>((resolve, reject) => {
            this.dbPromise = idb.open(dbStore.dbName, dbStore.version, upgradeDB => {
                this.upgradeDatabase(upgradeDB, dbStore);
            });
            
            resolve(`database ${data.dbName} open`);
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
            console.log(results);
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

    public getAllRecordsByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, searchData.storename, 'readonly');
        let results:any[] = [];
     
        let index = 0;
       tx.objectStore(searchData.storename)
            .index(searchData.indexName)
            .iterateCursor(cursor => {
                if (!cursor) {
                    return;
                }
                if (cursor.key === searchData.queryValue) {
                    results.push(cursor.value);
                    index++;
                }
               
                cursor.continue();
            });

        await tx.complete;
       
        return results;
    }

    public getRecordById = async (storename: string, id:any): Promise<string> => {
        
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, storename, 'readonly');
        let returnValue: string;

        try {
            let result = await tx.objectStore(storename).get(id);
            returnValue = JSON.stringify(result);

        } catch (err) {
            
            returnValue = (err as Error).message;
        }

        return returnValue;
    }

    public deleteRecord = async (storename: string, id: any): Promise<string> => {
        const dbInstance = await this.dbPromise;
        const tx = this.getTransaction(dbInstance, storename, 'readwrite');

        try {
            await tx.objectStore(storename).delete(id); 
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

    // Currently don't support aggregate keys
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
                for (var store of dbStore.stores) {
                    if (!upgradeDB.objectStoreNames.contains(store.name)) {
                        let primaryKey = store.primaryKey;

                        if (!primaryKey) {
                            primaryKey = { name: 'id', keyPath: 'id', auto: true };
                        }

                        const newStore = upgradeDB.createObjectStore(store.name, { keyPath: primaryKey.name, autoIncrement: primaryKey.auto });

                        for (var index of store.indexes) {
                            newStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                        }
                    }
                }
            }
        }
    }
}