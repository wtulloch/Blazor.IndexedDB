using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Provides functionality for accessing IndexedDB from Blazor application
    /// </summary>
    public class IndexedDBManager
    {
        private readonly DbStore _dbStore;
        private readonly IJSRuntime _jsRuntime;
        private const string InteropPrefix = "TimeGhost.IndexedDbManager";
        private bool _isOpen;

        /// <summary>
        /// A notification event that is raised when an action is completed
        /// </summary>
        public event EventHandler<IndexedDBNotificationArgs> ActionCompleted;

        public IndexedDBManager(DbStore dbStore, IJSRuntime jsRuntime)
        {
            _dbStore = dbStore;
            _jsRuntime = jsRuntime;
        }

        public List<StoreSchema> Stores => _dbStore.Stores;


        /// <summary>
        /// Opens the IndexedDB defined in the DbStore. Under the covers will create the database if it does not exist
        /// and create the stores defined in DbStore.
        /// </summary>
        /// <returns></returns>
        public async Task OpenDb()
        {
            var result = await CallJavascript<string>(DbFunctions.OpenDb, _dbStore, new { Instance = new DotNetObjectRef(this), MethodName= "Callback"});
            _isOpen = true;

            RaiseNotification(IndexDBActionOutCome.Successful, result);
        }

        /// <summary>
        /// Deletes the database corresponding to the dbName passed in
        /// </summary>
        /// <param name="dbName">The name of database to delete</param>
        /// <returns></returns>
        public async Task DeleteDb(string dbName)
        {
            if (string.IsNullOrEmpty(dbName))
            {
                throw new ArgumentException("dbName cannot be null or empty", nameof(dbName));
            }
            var result = await CallJavascript<string>(DbFunctions.DeleteDb, dbName);

            RaiseNotification(IndexDBActionOutCome.Successful, result);
        }
        
        /// <summary>
        /// Adds a new record/object to the specified store
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="recordToAdd">An instance of StoreRecord that provides the store name and the data to add</param>
        /// <returns></returns>
        public async Task AddRecord<T>(StoreRecord<T> recordToAdd)
        {
            await EnsureDbOpen();
            try
            {
                var result = await CallJavascript<StoreRecord<T>, string>(DbFunctions.AddRecord, recordToAdd);
                RaiseNotification(IndexDBActionOutCome.Successful, result);
            }
            catch (JSException e)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, e.Message);
            }
        }

        /// <summary>
        /// Updates and existing record
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="recordToUpdate">An instance of StoreRecord with the store name and the record to update</param>
        /// <returns></returns>
        public async Task UpdateRecord<T>(StoreRecord<T> recordToUpdate)
        {
            await EnsureDbOpen();
            try
            {
                var result = await CallJavascript<StoreRecord<T>, string>(DbFunctions.UpdateRecord, recordToUpdate);
                RaiseNotification(IndexDBActionOutCome.Successful, result);
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
            }
        }

        /// <summary>
        /// Gets all of the records in a given store.
        /// </summary>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="storeName">The name of the store from which to retrieve the records</param>
        /// <returns></returns>
        public async Task<List<TResult>> GetRecords<TResult>(string storeName)
        {
            await EnsureDbOpen();
            try
            {
                var results = await CallJavascript<List<TResult>>(DbFunctions.GetRecords, storeName);

                RaiseNotification(IndexDBActionOutCome.Successful, $"Retrieved {results.Count} records from {storeName}");

                return results;
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
                return default;
            }
           
        }

        /// <summary>
        /// Retrieve a record by id
        /// </summary>
        /// <typeparam name="TInput"></typeparam>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="storeName">The name of the  store to retrieve the record from</param>
        /// <param name="id">the id of the record</param>
        /// <returns></returns>
        public async Task<TResult> GetRecordById<TInput, TResult>(string storeName, TInput id)
        {
            await EnsureDbOpen();

            var data = new { Storename = storeName, Id = id };
            try
            {
                var record = await CallJavascript<TResult>(DbFunctions.GetRecordById, storeName, id);

                return record;
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
                return default;
            }
        }
        /// <summary>
        /// Deletes a reocrd from the store based on the id
        /// </summary>
        /// <typeparam name="TInput"></typeparam>
        /// <param name="storeName"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteRecord<TInput>(string storeName, TInput id)
        {
            try
            {
                await CallJavascript<string>(DbFunctions.DeleteRecord, storeName, id);
                RaiseNotification(IndexDBActionOutCome.Deleted, $"Deleted from {storeName} record: {id}");
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
            }
        }

        /// <summary>
        /// Clears all of the records from a given store.
        /// </summary>
        /// <param name="storeName">The name of the store to clear the records from</param>
        /// <returns></returns>
        public async Task ClearStore(string storeName)
        {
            if (string.IsNullOrEmpty(storeName))
            {
                throw new ArgumentException("Parameter cannot be null or empty", nameof(storeName));
            }

            try
            {
                var result =  await CallJavascript<string, string>(DbFunctions.ClearStore, storeName);
                RaiseNotification(IndexDBActionOutCome.Successful, result);
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);

            }
            
        }

        /// <summary>
        /// Returns the first record that matches a query against a given index
        /// </summary>
        /// <typeparam name="TInput"></typeparam>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="searchQuery">an instance of StoreIndexQuery</param>
        /// <returns></returns>
        public async Task<TResult> GetRecordByIndex<TInput, TResult>(StoreIndexQuery<TInput> searchQuery)
        {
            await EnsureDbOpen();

            try
            {
                var result = await CallJavascript<StoreIndexQuery<TInput>, TResult>(DbFunctions.GetRecordByIndex, searchQuery);
                return result;
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
                return default;
            }
        }
        /// <summary>
        /// Gets all of the records that match a given query in the specified index.
        /// </summary>
        /// <typeparam name="TInput"></typeparam>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="searchQuery"></param>
        /// <returns></returns>
        public async Task<IList<TResult>> GetAllRecordsByIndex<TInput, TResult>(StoreIndexQuery<TInput> searchQuery)
        {
            await EnsureDbOpen();
            try
            {
                var results = await CallJavascript<StoreIndexQuery<TInput>, IList<TResult>>(DbFunctions.GetAllRecordsByIndex, searchQuery);
                RaiseNotification(IndexDBActionOutCome.Successful, 
                    $"Retrieved {results.Count} records, for {searchQuery.QueryValue} on index {searchQuery.IndexName}");
                return results;
            }
            catch (JSException jse)
            {
                RaiseNotification(IndexDBActionOutCome.Failed, jse.Message);
                return default;
            }
        }

        [JSInvokable("Callback")]
        public void CalledFromJS(string message)
        {
            Console.WriteLine($"called from JS: {message}");
        }
        private async Task<TResult> CallJavascript<TData, TResult>(string functionName, TData data)
        {
            return await _jsRuntime.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", data);
        }

        private async Task<TResult> CallJavascript<TResult>(string functionName, params object[] args)
        {
            return await _jsRuntime.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", args);
        }

        private async Task EnsureDbOpen()
        {
            if (!_isOpen) await OpenDb();
        }

        private void RaiseNotification(IndexDBActionOutCome outcome, string message)
        {
            ActionCompleted?.Invoke(this, new IndexedDBNotificationArgs { Outcome = outcome, Message = message });
        }
    }
}