using System;

namespace TG.Blazor.IndexedDB
{
    public class IndexedDBNotificationArgs : EventArgs
    {
        public string Outcome { get; set; }
        public string Message { get; set; }
    }
}