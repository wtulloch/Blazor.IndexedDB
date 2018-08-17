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
        public async Task<string> OpenDb(DbStore dbName)
        {
            var result = await JSRuntime.Current.InvokeAsync<string>($"{InteropPrefix}.openDb", dbName);
            return result;
        }

        
        public async Task<string> AddRecord<T>(SingleRecord<T> recordToAdd)
        {
            return await JSRuntime.Current.InvokeAsync<string>($"{InteropPrefix}.addRecord", recordToAdd);
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

