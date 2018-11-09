# Tg.Blazor.IndexedDB
This is Blazor library for accessing IndexedDB and uses Jake Archibald's [idb library](https://github.com/jakearchibald/idb) for handling access to IndexedDB on the JavaScript side. 

This version currently provides the following functionality.
* Open and upgrade an instance of IndexedDB, creating stores
* Add and update a record to/in a given store
* Delete a record from a store 
* Retrieve all records from a given store
* Retrieve a record/or records from a store by index and value if th index exists

It does not, at the moment, support aggregate keys, searches using a range and some of the more obscure features of IndexedDB.

## Using the library

1. create a new instance of DbStore
2. add one or more store definitions
3. 


```CSharp
services.AddIndexedDB(dbStore =>
            {
                dbStore.DbName = "TheFactory";
                dbStore.Version = 2;

            dbStore.Stores.Add(new StoreSchema
            {
                Name = "Employees",
                PrimaryKey = new IndexSpec { Name = "id", KeyPath = "id", Auto = true },
                Indexes = new List<IndexSpec>
                    {
                        new IndexSpec{Name="firstName", KeyPath = "firstName", Auto=false},
                        new IndexSpec{Name="lastName", KeyPath = "lastName", Auto=false}

                    }
            });
                dbStore.Stores.Add(new StoreSchema
                {
                    Name = "Outbox",
                    PrimaryKey = new IndexSpec { Auto = true }
                }
                    );
            });
```







