using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace TG.Blazor.IndexedDB
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddIndexedDB(this IServiceCollection serviceCollection, Action<DbStore> options)
        {
            var dbStore = new DbStore();
            options(dbStore);
            serviceCollection.TryAddSingleton(new IndexedDBManager(dbStore));

            return serviceCollection;
        }
    }
}
