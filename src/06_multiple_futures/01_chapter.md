# Executing Multiple Futures at a Time(同时执行多个future)

Up until now, we've mostly executed futures by using `.await`, which blocks
the current task until a particular `Future` completes. However, real
asynchronous applications often need to execute several different
operations concurrently.

<p class="cn">
</p>

In this chapter, we'll cover some ways to execute multiple asynchronous
operations at the same time:
<p class="cn">
</p>

- `join!`: waits for futures to all complete
- <p class="cn"></p>
- `select!`: waits for one of several futures to complete
- <p class="cn"></p>
- Spawning: creates a top-level task which ambiently runs a future to completion
- <p class="cn"></p>
- `FuturesUnordered`: a group of futures which yields the result of each subfuture
- <p class="cn"></p>
