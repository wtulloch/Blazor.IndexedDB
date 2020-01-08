namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Class used for running an index query.
    /// </summary>
    /// <typeparam name="TInput"></typeparam>
    public class StoreIndexQuery<TInput>
    {
        /// <summary>
        /// The name of store that the index query will run against
        /// </summary>
        public string Storename { get; set; }

        /// <summary>
        /// The name of the index to use for the query
        /// </summary>
        public string IndexName { get; set; }
       
        /// <summary>
        /// By default IndexedDB will only return the first match in an index query.
        /// Set this value to true if you want to return all the records that match the query
        /// </summary>
        public bool AllMatching { get; set; }

        /// <summary>
        /// The value to search for
        /// </summary>
        public TInput QueryValue { get; set; }
    }
}