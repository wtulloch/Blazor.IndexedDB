using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace Blazor.IndexedDB
{
    public static class PromiseHandler
    {
        private static readonly ConcurrentDictionary<string, IPromiseCallbackHandler> CallbackHandlers =
            new ConcurrentDictionary<string, IPromiseCallbackHandler>();

        [JSInvokable]
        public static void PromiseCallback(string callbackId, string result)
        {
            if(CallbackHandlers.TryGetValue(callbackId, out IPromiseCallbackHandler handler))
            {
                handler.SetResult(result);
                CallbackHandlers.TryRemove(callbackId, out IPromiseCallbackHandler _);
            }
        }

        [JSInvokable]
        public static void PromiseError(string callbackId, string error)
        {
            if (CallbackHandlers.TryGetValue(callbackId, out IPromiseCallbackHandler handler))
            {
                handler.SetError(error);
                CallbackHandlers.TryRemove(callbackId, out IPromiseCallbackHandler _);
            }
        }

        public static Task<TResult> ExecuteAsync<TResult>(string fnName, object data = null)
        {
            Console.WriteLine(nameof(ExecuteAsync));
            var tcs = new TaskCompletionSource<TResult>();
            
            string callbackId = Guid.NewGuid().ToString();
            if(CallbackHandlers.TryAdd(callbackId, new PromiseCallbackHandler<TResult>(tcs)))
            {
                if (data == null)
                {
                    JSRuntime.Current.InvokeAsync<bool>("TimeGhost.IndexedDbManager.runFunction", callbackId, fnName);
                }
                else
                {
                    JSRuntime.Current.InvokeAsync<bool>("TimeGhost.IndexedDbManager.runFunction", callbackId, fnName, data);
                }

                return tcs.Task;
            }
            throw new Exception("An entry with the same callback id already existed, really should never happen");
        }
    }
}
