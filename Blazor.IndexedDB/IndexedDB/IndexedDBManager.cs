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
        private const string InteropPrefix = "TimeGhost.IndexedDbManager";
        private bool _isOpen;


        public event EventHandler<IndexedDBNotificationArgs> ActionCompleted;
        public IndexedDBManager()
        {
        }
        public IndexedDBManager(DbStore dbStore)
        {
            _dbStore = dbStore;
        }

        public List<StoreSchema> Stores => _dbStore.Stores;


        /// <summary>
        /// Opens IndexedDb
        /// </summary>
        /// <returns></returns>
        public async Task OpenDb()
        {
            var result = await CallJavascript<string>(DbFunctions.OpenDb, _dbStore, new { Instance = new DotNetObjectRef(this), MethodName= "Callback"});
            _isOpen = true;

            RaiseNotification(IndexDBActionOutCome.Successful, result);
        }

        public async Task DeleteDb(string dbName)
        {
            var result = await CallJavascript<string>(DbFunctions.DeleteDb, dbName);

            RaiseNotification(IndexDBActionOutCome.Successful, result);
        }
        

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
            return await JSRuntime.Current.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", data);
        }

        private async Task<TResult> CallJavascript<TResult>(string functionName, params object[] args)
        {
            return await JSRuntime.Current.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", args);
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