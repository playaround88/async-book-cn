# Why Async?

We all love how Rust empowers us to write fast, safe software.
But how does asynchronous programming fit into this vision?

<p class="cn">
我们都喜欢 Rust 如何使我们能够编写快速、安全的软件。
但是异步编程如何适应这个愿景呢？
</p>

Asynchronous programming, or async for short, is a _concurrent programming model_
supported by an increasing number of programming languages.
It lets you run a large number of concurrent
tasks on a small number of OS threads, while preserving much of the
look and feel of ordinary synchronous programming, through the
`async/await` syntax.

<p class="cn">
异步编程，简称异步，是一种_并发编程模型_被越来越多的编程语言所支持。
它可以让你运行大量并发少量操作系统线程上的任务，通过`async/await` 语法，同时保留大部分普通同步编程的观感。
</p>

## Async vs other concurrency models(Aync 对比其他并发模型)

Concurrent programming is less mature and "standardized" than
regular, sequential programming. As a result, we express concurrency
differently depending on which concurrent programming model
the language is supporting.

<p class="cn">
并发编程没有那么成熟和“标准化”
定期，顺序编程。 结果，我们表示并发
取决于哪个并发编程模型
语言支持。
</p>

A brief overview of the most popular concurrency models can help
you understand how asynchronous programming fits within the broader
field of concurrent programming:

<p class="cn">
对最流行的并发模型的简要概述可以提供帮助
您了解异步编程如何适应更广泛的
并发编程领域：
</p>

- **OS threads** don't require any changes to the programming model,
  which makes it very easy to express concurrency. However, synchronizing
  between threads can be difficult, and the performance overhead is large.
  Thread pools can mitigate some of these costs, but not enough to support
  massive IO-bound workloads.
- <p class="cn"><b>系统线程</b>不需要对编程模型进行任何更改，
  这使得表达并发非常容易。 但是，同步
  线程之间可能很困难，并且性能开销很大。
  线程池可以减轻其中一些成本，但不足以支持
  大量 IO 密集型工作负载。</p>
- **Event-driven programming**, in conjunction with _callbacks_, can be very
  performant, but tends to result in a verbose, "non-linear" control flow.
  Data flow and error propagation is often hard to follow.
- <p class="cn"><b>事件驱动编程</b>与 _callbacks_ 一起使用，可以非常
  但往往会导致冗长的“非线性”控制流。
  数据流和错误传播通常很难跟踪</p>
- **Coroutines**, like threads, don't require changes to the programming model,
  which makes them easy to use. Like async, they can also support a large
  number of tasks. However, they abstract away low-level details that
  are important for systems programming and custom runtime implementors.
- <p class="cn"><b>协程</b>与线程一样，不需要更改编程模型，
  这使得它们易于使用。与async一样，它们也可以支持大型
  任务数。然而，他们抽象掉了一些低层次的细节
  对于系统编程和自定义运行时实现者来说非常重要。</p>
- **The actor model** divides all concurrent computation into units called
  actors, which communicate through fallible message passing, much like
  in distributed systems. The actor model can be efficiently implemented, but it leaves
  many practical issues unanswered, such as flow control and retry logic.
- <p class="cn"><b>角色模型</b>将所有并发计算划分为称为角色的单元，
  就像在分布式系统中，通过易出错的信息传递进行交流。参与者模型可以有效地实现，
  但是许多实际问题尚未解决，例如流控制和重试逻辑。</p>

In summary, asynchronous programming allows highly performant implementations
that are suitable for low-level languages like Rust, while providing
most of the ergonomic benefits of threads and coroutines.

<p class="cn">
总之，异步编程允许高性能的实现
适用于Rust之类的低级语言，同时提供
线程和协同程序的大部分人机工程学优点。
</p>

## Async in Rust vs other languages(Rust中Async与其他语言的对比)

Although asynchronous programming is supported in many languages, some
details vary across implementations. Rust's implementation of async
differs from most languages in a few ways:

<p class="cn">
虽然许多语言都支持异步编程，但有些各个实现的详细信息各不相同。
Rust的异步实现与大多数语言在以下几个方面不同：
</p>

- **Futures are inert** in Rust and make progress only when polled. Dropping a
  future stops it from making further progress.
- <p class="cn"><b>Futures是惰性的</b>只有在接受调查后才能取得进展。放弃未来会阻止它取得进一步的进步。</p>
- **Async is zero-cost** in Rust, which means that you only pay for what you use.
  Specifically, you can use async without heap allocations and dynamic dispatch,
  which is great for performance!
  This also lets you use async in constrained environments, such as embedded systems.
- <p class="cn"><b>Async是零开销的</b>在Rust中，这意味着你只需为你使用的东西付费。
  具体来说，您可以使用异步，而无需堆分配和动态调度，这对性能非常好！
  这还允许您在受限环境（如嵌入式系统）中使用异步。</p>
- **No built-in runtime** is provided by Rust. Instead, runtimes are provided by
  community maintained crates.
- <p class="cn">rust语言本身<b>不提供内置的运行时</b>，相反，运行时由社区维护的crates。</p>
- **Both single- and multithreaded** runtimes are available in Rust, which have
  different strengths and weaknesses.
- <p class="cn">Rust<b>可同时支持单线程和多线程</b>的运行时，它们有不同的优势和劣势</p>

## Async vs threads in Rust(Rust中的Async 对比 线程)

The primary alternative to async in Rust is using OS threads, either
directly through [`std::thread`](https://doc.rust-lang.org/std/thread/)
or indirectly through a thread pool.

<p class="cn">
Rust中异步的主要替代方法是使用OS线程，无论是使用<a href="https://doc.rust-lang.org/std/thread/">`std::thread`</a>
或者通过一个线程池。
</p>

Migrating from threads to async or vice versa
typically requires major refactoring work, both in terms of implementation and
(if you are building a library) any exposed public interfaces. As such,
picking the model that suits your needs early can save a lot of development time.

<p class="cn">
从线程迁移到异步或从异步迁移到线程通常需要进行大量重构工作，无论是在实现方面还是在任何公开的公共接口（如果您正在构建库）方面。
因此，尽早选择适合您需要的模型可以节省大量开发时间。
</p>

**OS threads** are suitable for a small number of tasks, since threads come with
CPU and memory overhead. Spawning and switching between threads
is quite expensive as even idle threads consume system resources.
A thread pool library can help mitigate some of these costs, but not all.
However, threads let you reuse existing synchronous code without significant
code changes—no particular programming model is required.
In some operating systems, you can also change the priority of a thread,
which is useful for drivers and other latency sensitive applications.

<p class="cn">
<b>系统线程</b>适用于少量任务，因为线程会带来CPU和内存开销。
生成线程和在线程之间切换非常昂贵，因为即使是空闲线程也会消耗系统资源。
线程池库可以帮助降低其中一些成本，但不是全部。
然而，线程允许您重用现有的同步代码，而无需进行重大的代码更改—不需要特定的编程模型。
在某些操作系统中，还可以更改线程的优先级，
这对于驱动程序和其他对延迟敏感的应用程序非常有用。
</p>

**Async** provides significantly reduced CPU and memory
overhead, especially for workloads with a
large amount of IO-bound tasks, such as servers and databases.
All else equal, you can have orders of magnitude more tasks than OS threads,
because an async runtime uses a small amount of (expensive) threads to handle
a large amount of (cheap) tasks.
However, async Rust results in larger binary blobs due to the state
machines generated from async functions and since each executable
bundles an async runtime.

<p class="cn">
<b>Async</b>可以显著降低了CPU和内存开销，特别是对于具有大量IO绑定任务的工作负载，如服务器和数据库，
因为异步运行时使用少量（昂贵的）线程来处理大量（廉价的）任务。
然而，Rust的异步会导致更大的二进制blob，主要由于为异步函数生成的状态机以及每个可执行文件需捆绑一个异步运行时。
</p>

On a last note, asynchronous programming is not _better_ than threads,
but different.
If you don't need async for performance reasons, threads can often be
the simpler alternative.

<p class="cn">
最后，异步编程并不比线程更好，
但不同。
如果出于性能原因不需要异步，线程通常是更简单的选择。
</p>

### Example: Concurrent downloading(例子：并发下载)

In this example our goal is to download two web pages concurrently.
In a typical threaded application we need to spawn threads
to achieve concurrency:

<p class="cn">
在本例中，我们的目标是同时下载两个网页。
在典型的线程化应用程序中，我们需要生成线程以实现并发：
</p>

```rust,ignore
{{#include ../../examples/01_02_why_async/src/lib.rs:get_two_sites}}
```

However, downloading a web page is a small task; creating a thread
for such a small amount of work is quite wasteful. For a larger application, it
can easily become a bottleneck. In async Rust, we can run these tasks
concurrently without extra threads:

<p class="cn">
然而，下载网页是一项小任务；为如此少量的工作创建一个线程是非常浪费的。
对于较大的应用程序，它很容易成为瓶颈。在Rust async中，我们可以在没有额外线程的情况下并发运行这些任务：
</p>

```rust,ignore
{{#include ../../examples/01_02_why_async/src/lib.rs:get_two_sites_async}}
```

Here, no extra threads are created. Additionally, all function calls are statically
dispatched, and there are no heap allocations!
However, we need to write the code to be asynchronous in the first place,
which this book will help you achieve.

<p class="cn">
在这里，不会创建额外的线程。此外，所有函数调用都是静态调度的，并且没有堆分配！
然而，我们首先需要将代码编写为异步的，这本书将帮助您实现。
</p>

## Custom concurrency models in Rust(在Rust中定制并发模型)

On a last note, Rust doesn't force you to choose between threads and async.
You can use both models within the same application, which can be
useful when you have mixed threaded and async dependencies.
In fact, you can even use a different concurrency model altogether,
such as event-driven programming, as long as you find a library that
implements it.

<p class="cn">
最后，Rust不会强迫您在线程和异步之间进行选择。
您可以在同一个应用程序中使用这两个模型，当您混合了线程依赖和异步依赖时，这会很有用。
事实上，您甚至可以使用不同的并发模型，
如事件驱动编程，只要找到实现它的库。
</p>
