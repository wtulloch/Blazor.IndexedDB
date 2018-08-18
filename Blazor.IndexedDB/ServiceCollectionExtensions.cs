using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Blazor.IndexedDB
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddIndexedDB(this IServiceCollection serviceCollection, Action<DbStore> options)
        {
            var dbStore = new DbStore();
            options(dbStore);
            Console.WriteLine($"DbStore name = {dbStore.DbName}");
            serviceCollection.TryAddSingleton(new IndexedDBManager(dbStore));

            return serviceCollection;
        }
    }
}
