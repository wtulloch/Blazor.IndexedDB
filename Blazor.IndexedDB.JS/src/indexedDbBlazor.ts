///// <reference path="Microsoft.JSInterop.d.ts"/>
import idb from 'idb';
import { DB, UpgradeDB, ObjectStore, Transaction } from 'idb';
import { IDbStore, IIndexSearch, IIndexSpec, IStoreRecord, IStoreSchema, IDotNetInstanceWrapper, IDbInformation } from './interopInterfaces';



export class IndexedDbManager {

    private dbInstance:any = undefined;
    private dotnetCallback = (message: string) => { };

    constructor() { }

    public openDb = async (data: IDbStore, instanceWrapper: IDotNetInstanceWrapper): Promise<string> => {
        const dbStore = data;
        //just a test for the moment
        this.dotnetCallback = (message: string) => {
            instanceWrapper.instance.invokeMethod(instanceWrapper.methodName, message);
        }

        try {
            if (!this.dbInstance || this.dbInstance.version < dbStore.version) {
                if (this.dbInstance) {
                    this.dbInstance.close();
                }
                this.dbInstance = await idb.open(dbStore.dbName, dbStore.version, upgradeDB => {
                    this.upgradeDatabase(upgradeDB, dbStore);
                });
            }
        } catch (e) {
            this.dbInstance = await idb.open(dbStore.dbName);
        }
        
        return `IndexedDB ${data.dbName} opened`;
    }

    public getDbInfo = async (dbName: string) : Promise<IDbInformation> => {
        if (!this.dbInstance) {
            this.dbInstance = await idb.open(dbName);
        }

        const currentDb = <DB>this.dbInstance;

        let getStoreNames = (list: DOMStringList): string[] => {
            let names: string[] = [];
            for (var i = 0; i < list.length; i++) {
                names.push(list[i]);
            }
            return names;
        }
        const dbInfo: IDbInformation = {
            version: currentDb.version,
            storeNames: getStoreNames(currentDb.objectStoreNames)
        };

        return dbInfo;
    }

    public deleteDb = async(dbName: string): Promise<string> => {
        this.dbInstance.close();

        await idb.delete(dbName);

        this.dbInstance = undefined;

        return `The database ${dbName} has been deleted`;
}

    public addRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        let itemToSave = record.data;
        const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
        const objectStore = tx.objectStore(stName);

        itemToSave = this.checkForKeyPath(objectStore, itemToSave);

        const result = await objectStore.add(itemToSave, record.key);

        return `Added new record with id ${result}`;
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
                        this.addNewStore(upgradeDB, store);
                        this.dotnetCallback(`store added ${store.name}: db version: ${dbStore.version}`);
                    }
                }
            }
        }
    }

    private addNewStore(upgradeDB: UpgradeDB, store: IStoreSchema) {
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