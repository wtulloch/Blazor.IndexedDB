using System.Collections.Generic;

namespace TG.Blazor.IndexedDB
{
    public class StoreSchema
    { 
        public int? DbVersion { get; set; }
        public string Name { get; set; }
        public IndexSpec PrimaryKey { get; set; }
        public List<IndexSpec> Indexes { get; set; } = new List<IndexSpec>();
    }
}
