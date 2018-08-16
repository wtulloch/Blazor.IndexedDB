using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace Blazor.IndexedDB
{
    public class IndexedDBManager
    {
        private const string InteropPrefix = "TimeGhost.IndexedDbManager";
        public IndexedDBManager()
        {

        }

       
        public  async Task<string> CreateDb2(DbStore dbStore)
        {
            var result = await JSRuntime.Current.InvokeAsync<string>($"{InteropPrefix}.createDb", dbStore);
            return result;
        }
        public async Task<string> OpenDb(string dbName)
        {
            return await PromiseHandler.ExecuteAsync<string>(DbFunctions.openDb, dbName);
        }

        public async Task<string> CreateDb(DbStore dbStore)
        {
            return await PromiseHandler.ExecuteAsync<string>(DbFunctions.CreateDb, dbStore);
        }

        public async Task<Tuple<bool, string, int>> AddRecord<T>(SingleRecord<T> recordToAdd)
        {
            return await PromiseHandler.ExecuteAsync<Tuple<bool, string, int>>(DbFunctions.AddRecord, recordToAdd);
        }

        public async Task<List<T>> GetRecords<T>(string storeName)
        {
            return await PromiseHandler.ExecuteAsync<List<T>>(DbFunctions.getRecords, storeName);
        }
    }

    public class SingleRecord<T>
    {
        public string Storename { get; set; }
        public T Data { get; set; }
    }

    public struct DbFunctions
    {
        public const string CreateDb = "createDb";
        public const string AddRecord = "addRecord";
        public const string getRecords = "getRecords";
        public const string openDb = "openDb";
    }
}

