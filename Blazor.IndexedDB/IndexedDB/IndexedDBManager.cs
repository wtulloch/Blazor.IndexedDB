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
            var result = await JSRuntime.Current.InvokeAsync<string>($"{InteropPrefix}.openDb", _dbStore);
            _isOpen = true;
            return result;
        }

        
        public async Task<string> AddRecord<T>(SingleRecord<T> recordToAdd)
        {
            if (!_isOpen)
            {
                await OpenDb();
                _isOpen = true;
            }
            return await JSRuntime.Current.InvokeAsync<string>($"{InteropPrefix}.addRecord", recordToAdd);
        }

        public async Task<List<T>> GetRecords<T>(string storeName)
        {
            throw new NotImplementedException(nameof(GetRecords));
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

