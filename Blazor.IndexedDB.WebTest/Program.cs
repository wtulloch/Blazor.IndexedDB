using TG.Blazor.IndexedDB;
using Blazor.IndexedDB.WebTest;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

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

await builder.Build().RunAsync();
