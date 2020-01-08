namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Defines an Index for a given object store.
    /// </summary>
    public class IndexSpec
    {
        /// <summary>
        /// The name of the index.
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// the identifier for the property in the object/record that is saved and is to be indexed.
        /// </summary>
        public string KeyPath { get; set; }
        /// <summary>
        /// defines whether the key value must be unique
        /// </summary>
        public bool? Unique { get; set; }
        /// <summary>
        /// determines whether the index value should be generate by IndexDB.
        /// Only use if you are defining a primary key such as "id"
        /// </summary>
        public bool Auto { get; set; }
    }
}
