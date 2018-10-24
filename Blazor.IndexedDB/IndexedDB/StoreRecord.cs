namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// 
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class StoreRecord<T>
    {
        public string Storename { get; set; }
        public T Data { get; set; }
    }
}