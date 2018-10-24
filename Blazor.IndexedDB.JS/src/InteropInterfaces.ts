/**Defines the Database to open or create.*/
export interface IDbStore {
    /**the name of the database*/
    dbName: string;
    /**The version for this instance. This value is used when opening a database to determine if it needs to be updated*/
    version: number;
    /**Defines the stores to be created in the database defined as IStoreSchema*/
    stores: IStoreSchema[];

}

/**Defines a store to be created in the database. */
export interface IStoreSchema {
    dbVersion?: number;
    name: string;
    primaryKey: IIndexSpec;
    indexes: IIndexSpec[];
}
/** */
export interface IStoreRecord {
    storename: string;
    key?: any;
    data: any;
}

/**This used when querying a store using a predefined index*/
export interface IIndexSearch {
    storename: string;
    indexName: string;
    queryValue: any;
    allMatching: boolean;
}

/**Index definition for a store */
export interface IIndexSpec {
    name: string;
    keyPath: string;
    unique?: boolean;
    auto: boolean;
}

export interface IDotNetInstanceWrapper {
    instance: any;
    methodName: string;
}



