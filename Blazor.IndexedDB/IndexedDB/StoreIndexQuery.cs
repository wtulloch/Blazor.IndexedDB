namespace TG.Blazor.IndexedDB
{
    public class StoreIndexQuery<TInput>
    {
        public string Storename { get; set; }
        public string IndexName { get; set; }
        public bool AllMatching { get; set; }
        public TInput QueryValue { get; set; }
    }
}