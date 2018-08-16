namespace Blazor.IndexedDB
{
    public interface IPromiseCallbackHandler
    {
        void SetResult(string json);
        void SetError(string error);
    }
}