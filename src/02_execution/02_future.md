# The `Future` Trait(`Future`特征)

The `Future` trait is at the center of asynchronous programming in Rust.
A `Future` is an asynchronous computation that can produce a value
(although that value may be empty, e.g. `()`). A *simplified* version of
the future trait might look something like this:

<p class="cn">
`Future`特征是Rust异步编程的核心。
`Future`是一种可以生成值的异步计算（尽管该值可能为空，例如`()`）。
未来特征的简化版本可能如下所示：
</p>

```rust
{{#include ../../examples/02_02_future_trait/src/lib.rs:simple_future}}
```

Futures can be advanced by calling the `poll` function, which will drive the
future as far towards completion as possible. If the future completes, it
returns `Poll::Ready(result)`. If the future is not able to complete yet, it
returns `Poll::Pending` and arranges for the `wake()` function to be called
when the `Future` is ready to make more progress. When `wake()` is called, the
executor driving the `Future` will call `poll` again so that the `Future` can
make more progress.

<p class="cn">
可以通过调用“poll”函数来推进Future，这将推动Future尽可能接近完成。
如果future完成，它将返回`Poll::Ready(result)`。
如果future还不能完成，它将返回`Poll::Pending`，并安排在`Future`准备好取得更多进展时调用`wake()`函数。
调用`wake()`时，驱动`Future`的执行器将再次调用“poll”，以便`Future`可以取得更大的进展。
</p>

Without `wake()`, the executor would have no way of knowing when a particular
future could make progress, and would have to be constantly polling every
future. With `wake()`, the executor knows exactly which futures are ready to
be `poll`ed.

<p class="cn">
如果没有`wake()`，执行者将无法知道某个特定的未来何时能够取得进展，并且必须不断轮询每个`Future`。
使用`wake()`，执行者可以准确地知道哪些`Future`可以`poll`(轮询)。
</p>

For example, consider the case where we want to read from a socket that may
or may not have data available already. If there is data, we can read it
in and return `Poll::Ready(data)`, but if no data is ready, our future is
blocked and can no longer make progress. When no data is available, we
must register `wake` to be called when data becomes ready on the socket,
which will tell the executor that our future is ready to make progress.
A simple `SocketRead` future might look something like this:

<p class="cn">
例如，考虑这样一种情况，即我们想要从一个套接字中读取数据，该套接字可能已经有数据可用，也可能没有数据可用。
如果有数据，我们可以读入并返回`Poll::Ready(data)`，但如果没有数据准备就绪，我们的future就会受阻，无法再取得进展。
当没有可用数据时，我们必须注册`wake`，以便在套接字上的数据就绪时调用，这将告诉执行者我们的future已经准备好取得进展。
简单的`SocketRead`future可能是这样的：
</p>

```rust,ignore
{{#include ../../examples/02_02_future_trait/src/lib.rs:socket_read}}
```

This model of `Future`s allows for composing together multiple asynchronous
operations without needing intermediate allocations. Running multiple futures
at once or chaining futures together can be implemented via allocation-free
state machines, like this:

<p class="cn">
这种`Future`模型允许组合多个异步操作，而不需要中间分配。
可以通过无分配状态机实现一次运行多个future或将future链接在一起，如下所示：
</p>

```rust,ignore
{{#include ../../examples/02_02_future_trait/src/lib.rs:join}}
```

This shows how multiple futures can be run simultaneously without needing
separate allocations, allowing for more efficient asynchronous programs.
Similarly, multiple sequential futures can be run one after another, like this:

<p class="cn">
这说明了如何在不需要单独分配的情况下同时运行多个Future，从而实现更高效的异步程序。
类似地，可以一个接一个地运行多个顺序future，如下所示：
</p>

```rust,ignore
{{#include ../../examples/02_02_future_trait/src/lib.rs:and_then}}
```

These examples show how the `Future` trait can be used to express asynchronous
control flow without requiring multiple allocated objects and deeply nested
callbacks. With the basic control-flow out of the way, let's talk about the
real `Future` trait and how it is different.

<p class="cn">
这些示例展示了如何使用`Future`特性来表示异步控制流，而不需要多个分配的对象和深度嵌套的回调。
随着基本控制流程的结束，让我们来谈谈`Future`特征及其真正的不同之处。
</p>

```rust,ignore
{{#include ../../examples/02_02_future_trait/src/lib.rs:real_future}}
```

The first change you'll notice is that our `self` type is no longer `&mut Self`,
but has changed to `Pin<&mut Self>`. We'll talk more about pinning in [a later
section][pinning], but for now know that it allows us to create futures that
are immovable. Immovable objects can store pointers between their fields,
e.g. `struct MyFut { a: i32, ptr_to_a: *const i32 }`. Pinning is necessary
to enable async/await.

<p class="cn">
您会注意到的第一个变化是，`self`类型不再是`&mut Self`，而是改为`Pin<&mut Self>`。
我们将在[后面的一节][pinning]中更多地讨论“固定”，但现在要知道，它允许我们创造不可移动的future。
不可移动的对象可以在其字段之间存储指针，例如`struct MyFut { a: i32, ptr_to_a: *const i32 }`。
`Pin`是启用`async/await`所必需的。
</p>

Secondly, `wake: fn()` has changed to `&mut Context<'_>`. In `SimpleFuture`,
we used a call to a function pointer (`fn()`) to tell the future executor that
the future in question should be polled. However, since `fn()` is just a
function pointer, it can't store any data about *which* `Future` called `wake`.

<p class="cn">
其次，`wake: fn()`已更改为`&mut Context<'_>`。在`SimpleFuture`中，
我们使用对函数指针(`fn()`)的调用来告诉未来的执行者应该轮询所讨论的`future`。
然而，由于`fn()`只是一个函数指针，因此它不能存储关于是哪个`Future`调用`wake`的任何数据。
</p>

In a real-world scenario, a complex application like a web server may have
thousands of different connections whose wakeups should all be
managed separately. The `Context` type solves this by providing access to
a value of type `Waker`, which can be used to wake up a specific task.

<p class="cn">
在真实场景中，像web服务器这样的复杂应用程序可能有数千个不同的连接，这些连接的唤醒都应该单独管理。
`Context`类型通过提供对`Waker`类型值的访问来解决此问题，该值可用于唤醒特定任务。
</p>

[pinning]: ../04_pinning/01_chapter.md
