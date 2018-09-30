using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace Blazor.IndexedDB
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
            var result = await CallJavascript<DbStore,string>(DbFunctions.OpenDb, _dbStore);
            _isOpen = true;
            return result;
        }

        public async Task<string> AddRecord<T>(StoreRecord<T> recordToAdd)
        {
            if (!_isOpen) 
            await OpenDb();
            return await CallJavascript<StoreRecord<T>, string>(DbFunctions.AddRecord, recordToAdd);
        }

        public async Task<string> UpdateRecord<T>(StoreRecord<T> recordToUpdate)
        {
            if (!_isOpen)
                await OpenDb();
            return await CallJavascript<StoreRecord<T>, string>(DbFunctions.UpdateRecord, recordToUpdate);
        }

        public async Task<List<T>> GetRecords<T>(string storeName)
        {
            if (!_isOpen)
                await OpenDb();

            var results = await CallJavascript<string, string>(DbFunctions.GetRecords, storeName);

            return Json.Deserialize<List<T>>(results);
        }

        public async Task<T> GetRecordById<T>(string storeName, string id)
        {
            var data = new StoreRecord<string> { Storename = storeName, Data = id };
            var record = await CallJavascript<StoreRecord<string>, string>(DbFunctions.GetRecordById,data );
            return Json.Deserialize<T>(record);
        }

        private async Task<TResult> CallJavascript<TData,TResult>(string functionName,TData data)
        {
            return await JSRuntime.Current.InvokeAsync<TResult>($"{InteropPrefix}.{functionName}", data);
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

    /// <summary>
    /// 
    /// </summary>
    public struct DbFunctions
    {
        public const string CreateDb = "createDb";
        public const string AddRecord = "addRecordAsync";
        public const string UpdateRecord = "updateRecord";
        public const string GetRecords = "getRecords";
        public const string OpenDb = "openDb";
        public const string DeleteRecord = "deleteRecord";
        public const string GetRecordById = "getRecordById";
    }
}

