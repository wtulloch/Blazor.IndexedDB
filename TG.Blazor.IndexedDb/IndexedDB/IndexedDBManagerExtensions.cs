using System.Threading.Tasks;

namespace TG.Blazor.IndexedDB.IndexedDB
{
    public static class IndexedDBManagerExtensions
    {
        public static async Task<int> AddRecordReturningId<T>(this IndexedDBManager manager, StoreRecord<T> record)
        {
            var receivedValue = new TaskCompletionSource<int>();

            void catchCallback(object _, IndexedDBNotificationArgs args)
            {
                if (!args.Message.StartsWith("Added new record with id"))
                    return;

                Task.Run(() =>
                {
                    receivedValue.TrySetResult(int.Parse(args.Message.Split()[5]));
                });
            }
            manager.ActionCompleted += catchCallback;

            await manager.AddRecord(record);
            var id = await receivedValue.Task;
            manager.ActionCompleted -= catchCallback;
            return id;
        }
    }
}
