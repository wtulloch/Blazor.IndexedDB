using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Provides 
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

        public async Task OpenDb()
        {
            var result = await CallJavascript<DbStore, string>(DbFunctions.OpenDb, _dbStore);
            _isOpen = true;

            RaiseNotification(result);
        }

        

        public async Task<string> AddRecord<T>(StoreRecord<T> recordToAdd)
        {
            await EnsureDbOpen();
            try
            {
                return await CallJavascript<StoreRecord<T>, string>(DbFunctions.AddRecord, recordToAdd);
            }
            catch (JSException e)
            {
                return e.Message;
            }
        }

        public async Task<string> UpdateRecord<T>(StoreRecord<T> recordToUpdate)
        {
            await EnsureDbOpen();

            return await CallJavascript<StoreRecord<T>, string>(DbFunctions.UpdateRecord, recordToUpdate);
        }

        public async Task<List<T>> GetRecords<T>(string storeName)
        {
            await EnsureDbOpen();

            var results = await CallJavascript<string, string>(DbFunctions.GetRecords, storeName);

            return Json.Deserialize<List<T>>(results);
        }

        public async Task<TResult> GetRecordById<TInput, TResult>(string storeName, TInput id)
        {
            await EnsureDbOpen();

            var data = new { Storename = storeName, Data = id };
            try
            {
                var record = await CallJavascript<object, string>(DbFunctions.GetRecordById, data);

                return Json.Deserialize<TResult>(record);
            }
            catch (JSException jse)
            {

                return default;
            }

        }

        public async Task<string> DeleteRecord<TInput>(string storeName, TInput id)
        {
            var data = new StoreRecord<TInput> { Storename = storeName, Data = id };
            try
            {
                var result = await CallJavascript<StoreRecord<TInput>, string>(DbFunctions.DeleteRecord, data);
                return result;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        public async Task<string> ClearStore(string storeName)
        {
            if (string.IsNullOrEmpty(storeName))
            {
                throw new ArgumentException("Parameter cannot be null or empty", nameof(storeName));
            }

            return await CallJavascript<string, string>(DbFunctions.ClearStore, storeName);
        }
        public async Task<TResult> GetRecordByIndex<TInput, TResult>(StoreIndexQuery<TInput> searchQuery)
        {
            await EnsureDbOpen();

            try
            {
                var result = await CallJavascript<StoreIndexQuery<TInput>, TResult>(DbFunctions.GetRecordByIndex, searchQuery);
                return result;
            }
            catch (Exception e)
            {
                Console.WriteLine($"tg: {e.Message}");
                return default;
            }
        }

        private async Task<TResult> CallJavascript<TData, TResult>(string functionName, TData data)
        {
            return await JSRuntime.Current.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", data);
        }

        private async Task EnsureDbOpen()
        {
            if (!_isOpen) await OpenDb();
        }

        //currently just a test to see how events work in Blazor may remove.
        private void RaiseNotification(string outcome, string result)
        {
            ActionCompleted?.Invoke(this, new IndexedDBNotificationArgs { Outcome = true, Message = result });
        }
    }
}