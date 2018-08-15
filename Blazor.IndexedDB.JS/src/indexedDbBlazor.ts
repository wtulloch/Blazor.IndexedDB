/// <reference path="Microsoft.JSInterop.d.ts"/>


interface IDatabaseSetup {
    dbName: string;
    version?: number;
}

export class IndexedDbManager {
    private db: any;
    private assemblyName = 'Blazor.IndexedDB';
    private promiseCallback = 'PromiseCallback';
   private promiseError = 'PromiseError';

    public runFunction = (callbackId: string, fnName: string, data: any): boolean => {

        console.log('Start runFunction');
       const promise = this.createDb();

        promise.then(value => {
            if (value === undefined) {
                value = '';
            }
                const result =  JSON.stringify(value);
                DotNet.invokeMethodAsync(this.assemblyName, this.promiseCallback,callbackId, result);
            })
            .catch(reason => {
                const result = JSON.stringify(reason);
                DotNet.invokeMethodAsync(this.assemblyName, this.promiseError,callbackId, result);
            });

        return true;
    }

    public createDb = (): Promise<string> => {
        const dbSetup: IDatabaseSetup = {
            dbName: 'test',
            version: 1
        };
        console.log("createDb");
        return new Promise<string>((resolve, reject) => {
            const openRequest = window.indexedDB.open(dbSetup.dbName, dbSetup.version);

            openRequest.onsuccess = ev => {
                this.db = openRequest.result;
                resolve(`Database ${dbSetup.dbName} created. Version: ${dbSetup.version}`);
            } 

            openRequest.onerror = ev => {
                reject(`Failed to create database ${dbSetup.dbName}`);
        }

            openRequest.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
                const db = openRequest.result;
                db.createObjectStore("names", { autoIncrement: true });
            }
        });
    }

    public testFunction = (message: string):string => {
        const testVar = this.assemblyName;
        return `${message}: ${testVar}`;
    }
}