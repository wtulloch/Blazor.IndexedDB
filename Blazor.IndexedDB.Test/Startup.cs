using System.Collections.Generic;
using Microsoft.AspNetCore.Blazor.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Blazor.IndexedDB.Test
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddIndexedDB(dbStore =>
            {
                dbStore.DbName = "CowboysAreGreat";
                dbStore.Version = 1;
               
                dbStore.Stores.Add(new StoreSchema
                {
                    Name = "Boots",
                    PrimaryKey = new IndexSpec { Name = "id", KeyPath = "id", Auto = false },
                    Indexes = new List<IndexSpec>
                    {
                        new IndexSpec{Name="firstName", KeyPath = "firstName", Auto=false},
                        new IndexSpec{Name="lastName", KeyPath = "lastName", Auto=false}

                    }
                });
            });
        }

        public void Configure(IBlazorApplicationBuilder app)
        {
            app.AddComponent<App>("app");
        }
    }
}
