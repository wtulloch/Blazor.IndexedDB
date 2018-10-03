import { IndexedDbManager } from './indexedDbBlazor';

namespace IndexDb {
    const timeghostExtensions: string = 'TimeGhost';
    const extensionObject = {
        IndexedDbManager: new IndexedDbManager()
    };

    export function initialise(): void {
        if (typeof window !== 'undefined' && !window[timeghostExtensions]) {
            window[timeghostExtensions] = {
                ...extensionObject
            };
        } else {
            window[timeghostExtensions] = {
                ...window[timeghostExtensions],
                ...extensionObject
            };
        }

    }
}

IndexDb.initialise();