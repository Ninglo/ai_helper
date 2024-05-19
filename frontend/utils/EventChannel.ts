import { ChannelHub, pipe } from 'flowp';

export class EventChannel<T> {
    private hub = new ChannelHub<T>();

    event(handler: (v: T) => unknown) {
        const reader = this.hub.reader();
        reader.pipe(pipe.to(handler));
        return () => reader.unpipe();
    }

    fire(v: T) { this.hub.broadcast(v); }
}
