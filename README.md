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

The library provides a service extension to create a singleton instance of the DbStore.

Within the client application's startup.cs file, add the following to the ```ConfigureServices``` function.

```CSharp
services.AddIndexedDB(dbStore =>
            {
                dbStore.DbName = "TheFactory"; //example name
                dbStore.Version = 1;

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

## Using IndexedDBManager
For the following examples we are going to assume that we have Person class which is defined as follows:

```CSharp
 public class Person
    {
        public long? Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

    }
```
And the data store name is "Employees"

### Accessing IndexedDBManager
To use IndexedDB in a component or page first inject the IndexedDbManager instance.
```CSharp
@inject IndexedDBManager DbManager
``` 
### Setting up notifications
IndexedDBManager exposes ```ActionCompleted``` event that is raised when an action is completed. 

If you want to receive notifications in the ```OnInit()`` function subscribe to the event.

The function that handles the event should have the following signature:
```CSharp
 private void OnIndexedDbNotification(object sender, IndexedDBNotificationArgs args)
    {
        Message = args.Message;
    }
```

It is recommended that your page or component should also implement IDisposable to unsubscribe from the event.

### Adding a record to an IndexedDb store
Assuming we have a new instance of our sample ```Person``` class, to add to the "Employees" store doing the following:

```CSharp
var newRecord = new StoreRecord<Person>
        {
            Storename ="Employees",
            Data = NewPerson
        };

await DbManager.AddRecord(newRecord);
```

### Getting all records from a store

```CSharp
 var results = await DbManager.GetRecords<Person>("Employees");
 ```

### getting a record using the index

### Updating a record

### Deleting a record

### Query by index key






