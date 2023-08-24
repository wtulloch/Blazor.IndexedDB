

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using System.Collections.Generic;
using TG.Blazor.IndexedDB;

namespace Blazor.IndexedDB.Test
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);

            builder.Services.AddIndexedDB(dbStore =>
            {
                dbStore.DbName = "TheFactory";
                dbStore.Version = 1;

                dbStore.Stores.Add(new StoreSchema
                {
                    Name = "Employees",
                    PrimaryKey = new IndexSpec { Name = "id", KeyPath = "id", Auto = true },
                    Indexes = new List<IndexSpec>
                    {
                        new IndexSpec{Name="firstName", KeyPath = "firstName", Auto=false},
                        new IndexSpec{Name="lastName", KeyPath = "lastName", Auto=false}

                    }
                });
                dbStore.Stores.Add(new StoreSchema
                {
                    Name = "Outbox",
                    PrimaryKey = new IndexSpec { Auto = true }
                });
            });
        }
    }
}
