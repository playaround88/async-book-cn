# `async`/`.await` Primer(启蒙)

`async`/`.await` is Rust's built-in tool for writing asynchronous functions
that look like synchronous code. `async` transforms a block of code into a
state machine that implements a trait called `Future`. Whereas calling a
blocking function in a synchronous method would block the whole thread,
blocked `Future`s will yield control of the thread, allowing other
`Future`s to run.

<p class="cn">
`async`/`.await`是Rust的内置工具，用于编写类似同步代码的异步函数。
`async`将代码块转换为实现称为“Future”的trait的状态机。
虽然在同步方法中调用阻塞函数会阻塞整个线程，但阻塞的“Future”将释放对线程的控制，允许其他“Future”运行。
</p>

Let's add some dependencies to the `Cargo.toml` file:

<p class="cn">
让我们为`Cargo.toml`文件添加一些依赖：
</p>

```toml
{{#include ../../examples/01_04_async_await_primer/Cargo.toml:9:10}}
```

To create an asynchronous function, you can use the `async fn` syntax:

<p class="cn">
要创建异步函数，可以使用'async fn'语法：
</p>

```rust,edition2018
async fn do_something() { /* ... */ }
```

The value returned by `async fn` is a `Future`. For anything to happen,
the `Future` needs to be run on an executor.

<p class="cn">
“async fn”返回的值是“Future”。
为得到执行，“Future”需要在执行器上运行。
</p>

```rust,edition2018
{{#include ../../examples/01_04_async_await_primer/src/lib.rs:hello_world}}
```

Inside an `async fn`, you can use `.await` to wait for the completion of
another type that implements the `Future` trait, such as the output of
another `async fn`. Unlike `block_on`, `.await` doesn't block the current
thread, but instead asynchronously waits for the future to complete, allowing
other tasks to run if the future is currently unable to make progress.

<p class="cn">
在“async fn”中，可以使用“”。wait`等待实现“Future”特性的另一个类型的完成，例如另一个“async fn”的输出。
与“block_on”不同，`.wait`不会阻止当前线程，而是异步等待Future完成，如果Future当前无法取得进展，则允许运行其他任务。
</p>

For example, imagine that we have three `async fn`: `learn_song`, `sing_song`,
and `dance`:

<p class="cn">
例如，假设我们有三个“async fn”：“learn_song”、“sing_song”和“dance”：
</p>

```rust,ignore
async fn learn_song() -> Song { /* ... */ }
async fn sing_song(song: Song) { /* ... */ }
async fn dance() { /* ... */ }
```

One way to do learn, sing, and dance would be to block on each of these
individually:

<p class="cn">
学习、唱歌和跳舞的一种方法是分别学习以下内容：
</p>

```rust,ignore
{{#include ../../examples/01_04_async_await_primer/src/lib.rs:block_on_each}}
```

However, we're not giving the best performance possible this way—we're
only ever doing one thing at once! Clearly we have to learn the song before
we can sing it, but it's possible to dance at the same time as learning and
singing the song. To do this, we can create two separate `async fn` which
can be run concurrently:

<p class="cn">
然而，我们并没有尽可能地提供最好的性能，我们只是一次做一件事！
很明显，我们必须先学这首歌，然后才能唱，但也可以在学唱这首歌的同时跳舞。
为此，我们可以创建两个单独的“async fn”，它们可以同时运行：
</p>

```rust,ignore
{{#include ../../examples/01_04_async_await_primer/src/lib.rs:block_on_main}}
```

In this example, learning the song must happen before singing the song, but
both learning and singing can happen at the same time as dancing. If we used
`block_on(learn_song())` rather than `learn_song().await` in `learn_and_sing`,
the thread wouldn't be able to do anything else while `learn_song` was running.
This would make it impossible to dance at the same time. By `.await`-ing
the `learn_song` future, we allow other tasks to take over the current thread
if `learn_song` is blocked. This makes it possible to run multiple futures
to completion concurrently on the same thread.

<p class="cn">
在本例中，学习歌曲必须在唱歌之前进行，但学习和唱歌可以与跳舞同时进行。
如果我们在`learn_and_sing`中使用 `block_on(learn_song())`而不是`learn_song().wait`等待，
运行`learn_song`时，线程将无法执行任何其他操作。这样就不可能同时跳舞了。
由`.wait`等待`learn_song`的Future，如果`learn_song`被阻止，允许其他任务接管当前线程。
这使得可以在同一线程上同时运行多个Future来完成。
</p>