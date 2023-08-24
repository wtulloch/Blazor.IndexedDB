using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Blazor.IndexedDB.Test.Models
{
    public class Todo
    {
        public long? Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Done { get; set; }
        public bool Completed { get; set; }
    }
}
