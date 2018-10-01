/// <reference path="Microsoft.JSInterop.d.ts"/>
import idb, { Transaction } from 'idb';
import { DB, UpgradeDB } from 'idb';


interface IStoreRecord {
    storename: string;
    data: any;
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
        const itemToSave = record.data;
        const dbInstance = await this.dbPromise;
        const tx = dbInstance.transaction(stName, 'readwrite');
        const objectStore = tx.objectStore(stName);
        const keyPath = objectStore.keyPath as string;

        // if a keyPath is defined with auto increment true and data object has a corresponding
        //property that is null or defined it needs to be removed otherwise autoincrement will fail.
        if (keyPath && objectStore.autoIncrement && !itemToSave[keyPath]) {
            delete itemToSave[keyPath];
        }

        let returnValue: string;
        try {
            const result = await objectStore.add(itemToSave);
            returnValue = `Added new record with id ${result}`;
        } catch (err) {
            console.log("Error adding recording:", err.message)
            returnValue = 'Failed to add new record';
        }

        return returnValue;
    }
    public updateRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        const itemToSave = record.data;
        const dbInstance = await this.dbPromise;
        const tx = dbInstance.transaction(stName, 'readwrite');
        let returnValue: string;

        try {
            const result = await tx.objectStore(stName).put(itemToSave);
            returnValue = `updated record with id ${result}`;
        } catch (err) {
            console.log("Error adding recording:", err.message)
            returnValue = 'Failed to update record';
        }

        return returnValue;
    }

    public getRecords = async (storeName: string): Promise<string> => {
        const dbInstance = await this.dbPromise;
        let returnValue: string;

        try {
            let results = await dbInstance.transaction(storeName).objectStore(storeName).getAll();
            returnValue = JSON.stringify(results);
        } catch (err) {
            console.error("Issue getting all records", err);
            returnValue = "failed to get records";
        }

        return returnValue;
    }

    public getRecordById = async (data: IStoreRecord): Promise<string> => {
        const storeName = data.storename;
        const id = data.data;
        const dbInstance = await this.dbPromise;
        let returnValue: string;

        try {
            let result = await dbInstance.transaction(storeName, 'readonly')
                .objectStore(storeName).get(id);
            returnValue = JSON.stringify(result);
        } catch (err) {
            console.error(`failed to get record: ${id}`, err);
            returnValue = `failed to get record: ${id}`;
        }

        return returnValue;
    }

    public deleteRecord = async (data: IStoreRecord): Promise<string> => {
        const storeName = data.storename;
        const id = data.data;
        const dbInstance = await this.dbPromise;
        const tx = dbInstance.transaction(storeName, 'readwrite');

        try {
            await tx.objectStore(storeName).delete(id); 
            await tx.complete;
            return 'Record deleted';
        } catch (err) {
            console.error('failed to delete record', err);
            return 'Failed to delete record';
        }
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