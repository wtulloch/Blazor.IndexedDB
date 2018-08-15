using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Blazor.IndexedDB
{
    public class IndexedDBManager
    {
    }

    public class DbStore
    {
        public string Name { get; set; } 
        public int Version { get; set; }
        public List<TableSchema> Tables { get; } = new List<TableSchema>();

    }

    public class TableSchema
    { 
        public int? DbVersion { get; set; }
        public string Name { get; set; }
        public IndexSpec PrimaryKey { get; set; }
        public List<IndexSpec> Indexes { get; set; } = new List<IndexSpec>();
    }

    public class IndexSpec
    {
        public string Name { get; set; }
        public string KeyPath { get; set; }
        public bool? Unique { get; set; }
        public bool Auto { get; set; }
    }
}
