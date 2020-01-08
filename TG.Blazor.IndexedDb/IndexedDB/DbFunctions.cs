namespace TG.Blazor.IndexedDB
{
    /// <summary>
    /// Constants defining the Javascript functions that can be called.
    /// </summary>
    public struct DbFunctions
    {
        public const string CreateDb = "createDb";
        public const string DeleteDb = "deleteDb";
        public const string AddRecord = "addRecord";
        public const string UpdateRecord = "updateRecord";
        public const string GetRecords = "getRecords";
        public const string OpenDb = "openDb";
        public const string DeleteRecord = "deleteRecord";
        public const string GetRecordById = "getRecordById";
        public const string ClearStore = "clearStore";
        public const string GetRecordByIndex = "getRecordByIndex";
        public const string GetAllRecordsByIndex = "getAllRecordsByIndex";
        public const string GetDbInfo = "getDbInfo";
    }
}