namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Defines an Index for a given object store.
    /// </summary>
    public class IndexSpec
    {
        public string Name { get; set; }
        public string KeyPath { get; set; }
        public bool? Unique { get; set; }
        public bool Auto { get; set; }
    }
}
