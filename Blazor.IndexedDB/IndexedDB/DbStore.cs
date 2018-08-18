using System.Collections.Generic;

namespace Blazor.IndexedDB
{
    public class DbStore
    {
        public string DbName { get; set; } 
        public int Version { get; set; }
        public List<StoreSchema> Stores { get; } = new List<StoreSchema>();

    }
}
