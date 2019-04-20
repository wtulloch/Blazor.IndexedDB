﻿///// <reference path="Microsoft.JSInterop.d.ts"/>
import idb from 'idb';
import { DB, UpgradeDB, ObjectStore, Transaction } from 'idb';
import { IDbStore, IIndexSearch, IIndexSpec, IStoreRecord, IStoreSchema, IDotNetInstanceWrapper } from './interopInterfaces';

export class IndexedDbManager {
    private dbInstance: any = null;

    constructor() { }

    public openDb = async (data: IDbStore, instanceWrapper: IDotNetInstanceWrapper): Promise<string> => {
        const dbStore = data;
        this.dbInstance = await idb.open(dbStore.dbName, dbStore.version, upgradeDB => {
            this.upgradeDatabase(upgradeDB, dbStore);
        });

        return `IndexedDB ${data.dbName} opened`;
    }

    public deleteDb = async (dbName: string): Promise<string> => {
        this.dbInstance.close();
        await idb.delete(dbName);
        return `The database ${dbName} has been deleted`;
    }

    public addRecord = async (record: IStoreRecord): Promise<string> => {
        try {
            const stName = record.storename;
            let itemToSave = record.data;
            const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
            const objectStore = tx.objectStore(stName);
            itemToSave = this.checkForKeyPath(objectStore, itemToSave);
            const result = await objectStore.add(itemToSave, record.key);
            return `Added new record with id ${result}`;
        }
        catch (ex) {
            console.log(ex);
            return ex;
        }
    }

    public updateRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
        const result = await tx.objectStore(stName).put(record.data, record.key);
        return `updated record with id ${result}`;
    }

    public getRecords = async (storeName: string): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, storeName, 'readonly');
        let results = await tx.objectStore(storeName).getAll();
        await tx.complete;
        return results;
    }

    public clearStore = async (storeName: string): Promise<string> => {
        const tx = this.getTransaction(this.dbInstance, storeName, 'readwrite');
        await tx.objectStore(storeName).clear();
        await tx.complete;
        return `Store ${storeName} cleared`;
    }

    public getRecordByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
        const results = await tx.objectStore(searchData.storename)
            .index(searchData.indexName)
            .get(searchData.queryValue);

        await tx.complete;
        return results;
    }

    public getAllRecordsByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
        let results: any[] = [];

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

        await tx.complete;

        return results;
    }

    public getRecordById = async (storename: string, id: any): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, storename, 'readonly');
        let result = await tx.objectStore(storename).get(id);
        return result;
    }

    public deleteRecord = async (storename: string, id: any): Promise<string> => {
        const tx = this.getTransaction(this.dbInstance, storename, 'readwrite');
        await tx.objectStore(storename).delete(id);
        return `Record with id: ${id} deleted`;
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

        if (typeof objectStore.keyPath !== 'string') {
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