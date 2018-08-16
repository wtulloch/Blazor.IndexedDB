using System.Collections.Generic;

namespace Blazor.IndexedDB
{
    public class DbStore
    {
        public string Name { get; set; } 
        public int Version { get; set; }
        public List<TableSchema> Tables { get; } = new List<TableSchema>();

    }
}
