# The Async Ecosystem(异步生态)
Rust currently provides only the bare essentials for writing async code.
Importantly, executors, tasks, reactors, combinators, and low-level I/O futures and traits
are not yet provided in the standard library. In the meantime,
community-provided async ecosystems fill in these gaps.

<p class="cn">
Rust目前只提供编写异步代码的基本要素。
重要的是，标准库中尚未提供执行器、任务、反应器、组合器和低级I/O future和traits。
与此同时，社区提供的异步生态系统填补了这些空白。
</p>

The Async Foundations Team is interested in extending examples in the Async Book to cover multiple runtimes.
If you're interested in contributing to this project, please reach out to us on
[Zulip](https://rust-lang.zulipchat.com/#narrow/stream/201246-wg-async-foundations.2Fbook).

<p class="cn">
Async Foundation团队对扩展Async书籍中的示例以涵盖多个运行时很感兴趣。
如果您有兴趣为这个项目做出贡献，请联系我们
<a href="https://rust-lang.zulipchat.com/#narrow/stream/201246-wg-async-foundations.2Fbook">Zulip</a>
</p>

## Async Runtimes(异步运行时)
Async runtimes are libraries used for executing async applications.
Runtimes usually bundle together a *reactor* with one or more *executors*.
Reactors provide subscription mechanisms for external events, like async I/O, interprocess communication, and timers.
In an async runtime, subscribers are typically futures representing low-level I/O operations.
Executors handle the scheduling and execution of tasks.
They keep track of running and suspended tasks, poll futures to completion, and wake tasks when they can make progress.
The word "executor" is frequently used interchangeably with "runtime".
Here, we use the word "ecosystem" to describe a runtime bundled with compatible traits and features.

<p class="cn">
异步运行时是用于执行异步应用程序的库。
运行时通常将一个*反应器*与一个或多个*执行器*捆绑在一起。
反应器为外部事件提供订阅机制，如异步I/O、进程间通信和计时器。
在异步运行时中，订阅服务器通常是表示低级I/O操作的future。
执行器处理任务的调度和执行。
它们跟踪正在运行和暂停的任务，轮询future以完成任务，并在任务能够取得进展时唤醒任务。
“executor”一词经常与“runtime”互换使用。
这里，我们使用“生态系统”一词来描述与兼容traits和特性捆绑在一起的运行时。
</p>

## Community-Provided Async Crates(社区提供的异步Crates)

### The Futures Crate(Futures Crate)
The [`futures` crate](https://docs.rs/futures/) contains traits and functions useful for writing async code.
This includes the `Stream`, `Sink`, `AsyncRead`, and `AsyncWrite` traits, and utilities such as combinators.
These utilities and traits may eventually become part of the standard library.

<p class="cn">
<a href="https://docs.rs/futures/">`futures` crate</a>包含对编写异步代码有用的特征和函数。
这包括`Stream`, `Sink`, `AsyncRead`和`AsyncWrite`特征，以及诸如组合器之类的实用程序。
这些实用程序和特征最终可能成为标准库的一部分。
</p>

`futures` has its own executor, but not its own reactor, so it does not support execution of async I/O or timer futures.
For this reason, it's not considered a full runtime.
A common choice is to use utilities from `futures` with an executor from another crate.

<p class="cn">
`futures`有自己的执行器，但没有自己的反应器，因此它不支持异步I/O或计时器future的执行。
因此，它不被视为完整的运行时。
一种常见的选择是与另一个板条箱的执行器一起使用`futures`中的实用程序。
</p>

### Popular Async Runtimes(流行的运行时)
There is no asynchronous runtime in the standard library, and none are officially recommended.
The following crates provide popular runtimes.

<p class="cn">
标准库中没有异步运行时，官方也不推荐使用。
以下板条箱提供了流行的运行时。
</p>

- [Tokio](https://docs.rs/tokio/): A popular async ecosystem with HTTP, gRPC, and tracing frameworks.
- <p class="cn"><a href="https://docs.rs/tokio/">Tokio</a>: 一个流行的异步生态，包括HTTP, gRPC和调用追踪框架</p>
- [async-std](https://docs.rs/async-std/): A crate that provides asynchronous counterparts to standard library components.
- <p class="cn"><a href="https://docs.rs/async-std/">async-std</a>: 为标准库组件提供异步副本的板条箱</p>
- [smol](https://docs.rs/smol/): A small, simplified async runtime.
Provides the `Async` trait that can be used to wrap structs like `UnixStream` or `TcpListener`.
- <p class="cn"><a href="https://docs.rs/smol/">smol</a>: 一个小而简单的异步运行时。提供了`Async`特征可以用来包装`UnixStream`或者`TcpListener`等结构</p>
- [fuchsia-async](https://www.baidu.com/):
An executor for use in the Fuchsia OS.
- <p class="cn"><a href="https://www.baidu.com/">fuchsia-async</a>: 一个在Fuchsia OS中使用的执行器</p>

## Determining Ecosystem Compatibility(确定生态系统兼容性)
Not all async applications, frameworks, and libraries are compatible with each other, or with every OS or platform.
Most async code can be used with any ecosystem, but some frameworks and libraries require the use of a specific ecosystem.
Ecosystem constraints are not always documented, but there are several rules of thumb to determine
whether a library, trait, or function depends on a specific ecosystem.

<p class="cn">
并非所有异步应用程序、框架和库都彼此兼容，或者与每个操作系统或平台兼容。
大多数异步代码可以用于任何生态系统，但一些框架和库需要使用特定的生态系统。
生态系统限制并不总是有文档记录的，但有几个经验法则可以确定库、特征或功能是否依赖于特定的生态系统。
</p>

Any async code that interacts with async I/O, timers, interprocess communication, or tasks
generally depends on a specific async executor or reactor.
All other async code, such as async expressions, combinators, synchronization types, and streams
are usually ecosystem independent, provided that any nested futures are also ecosystem independent.
Before beginning a project, it's recommended to research relevant async frameworks and libraries to ensure
compatibility with your chosen runtime and with each other.

<p class="cn">
与异步I/O、计时器、进程间通信或任务交互的任何异步代码通常取决于特定的异步执行器或反应器。
所有其他异步代码（如异步表达式、组合符、同步类型和流）通常与生态系统无关，前提是任何嵌套的future也与生态系统无关。
在开始一个项目之前，建议研究相关的异步框架和库，以确保与您选择的运行时以及彼此之间的兼容性。
</p>

Notably, `Tokio` uses the `mio` reactor and defines its own versions of async I/O traits,
including `AsyncRead` and `AsyncWrite`.
On its own, it's not compatible with `async-std` and `smol`,
which rely on the [`async-executor` crate](https://docs.rs/async-executor), and the `AsyncRead` and `AsyncWrite`
traits defined in `futures`.

<p class="cn">
值得注意的是，`Tokio`使用了`mio`反应器，并定义了自己的异步I/O特性版本，包括`AsyncRead`和`AsyncWrite`。
就其本身而言，它与依赖于<a href="https://docs.rs/async-executor">`async-executor` crate</a>，
并且`AsyncRead`和`AsyncWrite`来自于`futures`的`async-std`和`smol`不兼容
</p>

Conflicting runtime requirements can sometimes be resolved by compatibility layers
that allow you to call code written for one runtime within another.
For example, the [`async_compat` crate](https://docs.rs/async_compat) provides a compatibility layer between
`Tokio` and other runtimes.

<p class="cn">
有时，冲突的运行时需求可以通过兼容层来解决，兼容层允许您在另一个运行时中调用为一个运行时编写的代码。
例如，<a href="https://docs.rs/async_compat">`async_compat` crate</a>提供了在`Tokio`和其他运行时直接的兼容层
</p>

Libraries exposing async APIs should not depend on a specific executor or reactor,
unless they need to spawn tasks or define their own async I/O or timer futures.
Ideally, only binaries should be responsible for scheduling and running tasks.

<p class="cn">
公开异步API的库不应依赖于特定的执行器或反应器，
除非他们需要生成任务或定义自己的异步I/O或计时器未来。
理想情况下，应该只有二进制文件负责调度和运行任务。
</p>

## Single Threaded vs Multi-Threaded Executors(单线程对比多线程执行器)
Async executors can be single-threaded or multi-threaded.
For example, the `async-executor` crate has both a single-threaded `LocalExecutor` and a multi-threaded `Executor`.

<p class="cn">
异步执行器可以是单线程或多线程的。
例如，`async executor`板条箱既有一个单线程的`LocalExecutor`，也有一个多线程的`executor`。
</p>

A multi-threaded executor makes progress on several tasks simultaneously.
It can speed up the execution greatly for workloads with many tasks,
but synchronizing data between tasks is usually more expensive.
It is recommended to measure performance for your application
when you are choosing between a single- and a multi-threaded runtime.

<p class="cn">
多线程执行器同时在多个任务上取得进展。
对于有许多任务的工作负载，它可以大大加快执行速度，但在任务之间同步数据通常成本更高。
在单线程和多线程运行时之间进行选择时，建议测量应用程序的性能。
</p>

Tasks can either be run on the thread that created them or on a separate thread.
Async runtimes often provide functionality for spawning tasks onto separate threads.
Even if tasks are executed on separate threads, they should still be non-blocking.
In order to schedule tasks on a multi-threaded executor, they must also be `Send`.
Some runtimes provide functions for spawning non-`Send` tasks,
which ensures every task is executed on the thread that spawned it.
They may also provide functions for spawning blocking tasks onto dedicated threads,
which is useful for running blocking synchronous code from other libraries.

<p class="cn">
任务可以在创建它们的线程上运行，也可以在单独的线程上运行。
异步运行时通常提供将任务派生到单独线程的功能。
即使任务在单独的线程上执行，它们也应该是非阻塞的。
为了在多线程执行器上调度任务，它们还必须是可“Send”的。
一些运行时提供了派生非“Send”任务的函数，确保每个任务都在派生它的线程上执行。
它们还可以提供将阻塞任务派生到专用线程的函数，这对于从其他库运行阻塞同步代码很有用。
</p>
