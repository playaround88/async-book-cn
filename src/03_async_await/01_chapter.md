# `async`/`.await`

In [the first chapter], we took a brief look at `async`/`.await`.
This chapter will discuss `async`/`.await` in
greater detail, explaining how it works and how `async` code differs from
traditional Rust programs.

<p class="cn">
在第一章，我们大概的浏览了`async`/`.await`。
这一章我们将会更详细的讨论`async`/`.await`，解释它的工作原理以及“异步”代码与传统Rust程序的区别。
</p>

`async`/`.await` are special pieces of Rust syntax that make it possible to
yield control of the current thread rather than blocking, allowing other
code to make progress while waiting on an operation to complete.

<p class="cn">
`async`/`.await`是一种特殊的Rust语法，它可以产生对当前线程的控制，而不是阻塞，从而允许其他代码在等待操作完成的同时取得进展。
</p>

There are two main ways to use `async`: `async fn` and `async` blocks.
Each returns a value that implements the `Future` trait:

<p class="cn">
使用'async'有两种主要方法：'async fn'和'async'块。
每个返回一个实现`Future`特征的值：
</p>

```rust,edition2018,ignore
{{#include ../../examples/03_01_async_await/src/lib.rs:async_fn_and_block_examples}}
```

As we saw in the first chapter, `async` bodies and other futures are lazy:
they do nothing until they are run. The most common way to run a `Future`
is to `.await` it. When `.await` is called on a `Future`, it will attempt
to run it to completion. If the `Future` is blocked, it will yield control
of the current thread. When more progress can be made, the `Future` will be picked
up by the executor and will resume running, allowing the `.await` to resolve.

<p class="cn">
正如我们在第一章中看到的，`async`包体和其他future是惰性的：它们在运行之前什么都不做。
运行`Future`最常见的方式是`.await`。当在`Future`上调用`.await`，它将尝试运行它直到完成。
如果`Future`被阻止，它将释放对当前线程的控制。当可以取得更多进展时，执行器将选择`Future`，并将恢复运行，已允许`.await`解析。
</p>

## `async` Lifetimes(生命周期)

Unlike traditional functions, `async fn`s which take references or other
non-`'static` arguments return a `Future` which is bounded by the lifetime of
the arguments:

<p class="cn">
与传统函数不同，“async fn”接受引用或其他非`static`参数，返回一个受参数生存期限制的`Future`：
</p>

```rust,edition2018,ignore
{{#include ../../examples/03_01_async_await/src/lib.rs:lifetimes_expanded}}
```

This means that the future returned from an `async fn` must be `.await`ed
while its non-`'static` arguments are still valid. In the common
case of `.await`ing the future immediately after calling the function
(as in `foo(&x).await`) this is not an issue. However, if storing the future
or sending it over to another task or thread, this may be an issue.

<p class="cn">
这意味着从“async fn”返回的future，在非`static`参数仍然有效前，必须调用了`.await`。
在常见情况下调用函数后立即调用future的`.await`（如`foo(&x).await`）这不是问题。
但是，如果存储future或将其发送到另一个任务或线程，这可能是一个问题。
</p>

One common workaround for turning an `async fn` with references-as-arguments
into a `'static` future is to bundle the arguments with the call to the
`async fn` inside an `async` block:

<p class="cn">
将引用作为参数的`async fn`转换为`'static` future的一个常见解决方法是将参数与对“async”块内的“async fn”的调用捆绑在一起：
</p>

```rust,edition2018,ignore
{{#include ../../examples/03_01_async_await/src/lib.rs:static_future_with_borrow}}
```

By moving the argument into the `async` block, we extend its lifetime to match
that of the `Future` returned from the call to `good`.

<p class="cn">
通过将参数移动到“async”块中，我们可以延长其生存期，以匹配调用“good”返回的“Future”的生存期。
</p>

## `async move`

`async` blocks and closures allow the `move` keyword, much like normal
closures. An `async move` block will take ownership of the variables it
references, allowing it to outlive the current scope, but giving up the ability
to share those variables with other code:

<p class="cn">
`async `块和闭包允许使用`move`关键字，这与普通闭包非常相似。
“async move”块将获得其引用的变量的所有权，允许其超出当前范围，但放弃与其他代码共享这些变量的能力：
</p>

```rust,edition2018,ignore
{{#include ../../examples/03_01_async_await/src/lib.rs:async_move_examples}}
```

## `.await`ing on a Multithreaded Executor(多线程执行器中的`.await`)

Note that, when using a multithreaded `Future` executor, a `Future` may move
between threads, so any variables used in `async` bodies must be able to travel
between threads, as any `.await` can potentially result in a switch to a new
thread.

<p class="cn">
请注意，当使用多线程“Future”执行器时，“Future”可能会在线程之间移动，
因此“async”主体中使用的任何变量都必须能够在线程之间移动，就像任何`.await`可能会导致切换到新线程。
</p>

This means that it is not safe to use `Rc`, `&RefCell` or any other types
that don't implement the `Send` trait, including references to types that don't
implement the `Sync` trait.

<p class="cn">
这意味着使用“Rc”、“RefCell”或任何其他未实现“Send”特性的类型（包括对未实现“Sync”特性的类型的引用）是不安全的。
</p>

(Caveat: it is possible to use these types as long as they aren't in scope
during a call to `.await`.)

<p class="cn">
（注意：在调用`.await`期间，只要这些类型不在作用域内，就可以使用这些类型。）
</p>

Similarly, it isn't a good idea to hold a traditional non-futures-aware lock
across an `.await`, as it can cause the threadpool to lock up: one task could
take out a lock, `.await` and yield to the executor, allowing another task to
attempt to take the lock and cause a deadlock. To avoid this, use the `Mutex`
in `futures::lock` rather than the one from `std::sync`.

<p class="cn">
类似地，持有传统的non-futures-aware的锁也不是一个好主意，因为它可能会导致线程池锁定：
一个任务可以获得锁定，`.await`并向执行器屈服，允许另一个任务尝试获取锁并导致死锁。
要避免这种情况，请使用`futures::lock`中的`Mutex`，而不是`std::sync`中的`Mutex`。
</p>

[the first chapter]: ../01_getting_started/04_async_await_primer.md
