using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// 
    /// </summary>
    public class IndexedDBManager
    {
        private readonly DbStore _dbStore;
        private const string InteropPrefix = "TimeGhost.IndexedDbManager";
        private bool _isOpen;

        public IndexedDBManager()
        {
        }
        public IndexedDBManager(DbStore dbStore)
        {
            _dbStore = dbStore;
        }

        public List<StoreSchema> Stores => _dbStore.Stores;

        public async Task<string> OpenDb()
        {
            var result = await CallJavascript<DbStore, string>(DbFunctions.OpenDb, _dbStore);
            _isOpen = true;
            return result;
        }

        public async Task<string> AddRecord<T>(StoreRecord<T> recordToAdd)
        {
            await EnsureDbOpen();
            try
            {
                return await CallJavascript<StoreRecord<T>, string>(DbFunctions.AddRecord, recordToAdd);
            }
            catch (Exception e)
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
            catch (Exception e)
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
    }



    /// <summary>
    /// 
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class StoreRecord<T>
    {
        public string Storename { get; set; }
        public T Data { get; set; }
    }

    public class StoreIndexQuery<TInput>
    {
        public string Storename { get; set; }
        public string IndexName { get; set; }
        public bool AllMatching { get; set; }
        public TInput QueryValue { get; set; }
    }

    /// <summary>
    /// 
    /// </summary>
    public struct DbFunctions
    {
        public const string CreateDb = "createDb";
        public const string AddRecord = "addRecord";
        public const string UpdateRecord = "updateRecord";
        public const string GetRecords = "getRecords";
        public const string OpenDb = "openDb";
        public const string DeleteRecord = "deleteRecord";
        public const string GetRecordById = "getRecordById";
        public const string ClearStore = "clearStore";
        public const string GetRecordByIndex = "getRecordByIndex";
    }
}

