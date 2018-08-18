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
                    Name = "Boots"
                });
            });
        }

        public void Configure(IBlazorApplicationBuilder app)
        {
            app.AddComponent<App>("app");
        }
    }
}
