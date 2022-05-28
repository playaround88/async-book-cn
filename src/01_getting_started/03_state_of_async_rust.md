# The State of Asynchronous Rust(Rust异步编程的状态)

Parts of async Rust are supported with the same stability guarantees as
synchronous Rust. Other parts are still maturing and will change
over time. With async Rust, you can expect:

<p class="cn">
async-Rust的部分功能提供与synchronous-Rust相同的稳定性保证。
其他部分仍在稳定中，并将随着时间的推移而变化。对于async Rust，您可以预期：
</p>

- Outstanding runtime performance for typical concurrent workloads.
- <p class="cn">典型并发工作负载的出色运行时性能。</p>
- More frequent interaction with advanced language features, such as lifetimes
  and pinning.
- <p class="cn">更频繁地与高级语言功能交互，如生命周期和固定。</p>
- Some compatibility constraints, both between sync and async code, and between
  different async runtimes.
- <p class="cn">同步和异步代码之间以及不同异步运行时之间的一些兼容性约束。</p>
- Higher maintenance burden, due to the ongoing evolution of async runtimes
  and language support.
- <p class="cn">由于异步运行时和语言支持的不断发展，维护负担更高。</p>

In short, async Rust is more difficult to use and can result in a higher
maintenance burden than synchronous Rust,
but gives you best-in-class performance in return.
All areas of async Rust are constantly improving,
so the impact of these issues will wear off over time.

<p class="cn">
简言之，异步Rust比同步Rust更难使用，并可能导致更高的维护负担，
但作为回报，它会为您提供一流的性能。
异步Rust的所有领域都在不断改进，
因此，随着时间的推移，这些问题的影响将逐渐消失。
</p>

## Language and library support(语言和库支持)

While asynchronous programming is supported by Rust itself,
most async applications depend on functionality provided
by community crates.

<p class="cn">
虽然Rust本身支持异步编程，
大多数异步应用程序依赖于社区crates提供的功能。
</p>

As such, you need to rely on a mixture of
language features and library support:

<p class="cn">
因此，您需要同时使用语言功能和库支持：
</p>

- The most fundamental traits, types and functions, such as the
  [`Future`](https://doc.rust-lang.org/std/future/trait.Future.html) trait
  are provided by the standard library.
- <p class="cn">大部分的基础traits, types 和 functions，例如<a href="https://doc.rust-lang.org/std/future/trait.Future.html">`Future`</a> trait 是由标准库提供的。</p>
- The `async/await` syntax is supported directly by the Rust compiler.
- <p class="cn">`async/await`语法是Rust编译器直接支持的。</p>
- Many utility types, macros and functions are provided by the
  [`futures`](https://docs.rs/futures/) crate. They can be used in any async
  Rust application.
- <p class="cn">许多实用程序类型、宏和函数由<a href="https://docs.rs/futures/">`futures`</a>crate提供的。
  它们可以用于任何异步Rust应用程序。</p>
- Execution of async code, IO and task spawning are provided by "async
  runtimes", such as Tokio and async-std. Most async applications, and some
  async crates, depend on a specific runtime. See
  ["The Async Ecosystem"](../08_ecosystem/00_chapter.md) section for more
  details.
- <p class="cn">异步代码、IO和任务生成的执行由“异步运行时”提供，如Tokio和async-std。
  大多数异步应用程序和一些异步crate取决于特定的运行时。
  请参考<a href="../08_ecosystem/00_chapter.md">"The Async Ecosystem"</a>章节了解更多信息</p>

Some language features you may be used to from synchronous Rust are not yet
available in async Rust. Notably, Rust does not let you declare async
functions in traits. Instead, you need to use workarounds to achieve the same
result, which can be more verbose.

<p class="cn">
您可能从synchronous Rust中使用的某些语言功能在async Rust中尚不可用。
值得注意的是，Rust不允许在traits中声明异步函数。相反，您需要使用变通方法来实现相同的结果，这可能会更加冗长。
</p>

## Compiling and debugging(编译和调试)

For the most part, compiler- and runtime errors in async Rust work
the same way as they have always done in Rust. There are a few
noteworthy differences:

<p class="cn">
在大多数情况下，异步Rust中的编译器错误和运行时错误的工作方式与它们在Rust中的工作方式相同。
有几个值得注意的区别：
</p>

### Compilation errors(编译错误)

Compilation errors in async Rust conform to the same high standards as
synchronous Rust, but since async Rust often depends on more complex language
features, such as lifetimes and pinning, you may encounter these types of
errors more frequently.

<p class="cn">
async-Rust中的编译错误与synchronous-Rust遵循相同的高标准，
但由于async-Rust通常依赖于更复杂的语言功能，如生存期和固定，
因此您可能会更频繁地遇到这些类型的错误。
</p>

### Runtime errors(运行时错误)

Whenever the compiler encounters an async function, it generates a state
machine under the hood. Stack traces in async Rust typically contain details
from these state machines, as well as function calls from
the runtime. As such, interpreting stack traces can be a bit more involved than
it would be in synchronous Rust.

<p class="cn">
每当编译器遇到异步函数时，它都会在后台生成一个状态机。
async Rust中的堆栈跟踪通常包含来自这些状态机的详细信息，以及来自运行时的函数调用。
因此，解释堆栈跟踪可能比在同步Rust中要复杂一些。
</p>

### New failure modes(新的失败模型)

A few novel failure modes are possible in async Rust, for instance
if you call a blocking function from an async context or if you implement
the `Future` trait incorrectly. Such errors can silently pass both the
compiler and sometimes even unit tests. Having a firm understanding
of the underlying concepts, which this book aims to give you, can help you
avoid these pitfalls.

<p class="cn">
异步信任中可能存在一些新的故障模式，例如，如果您从异步上下文调用阻塞函数，或者如果您错误地实现了“Future”特性。
这样的错误可以悄悄地通过编译器，有时甚至是单元测试。对本书旨在给你的基本概念有一个坚定的理解，可以帮助你避免这些陷阱。
</p>

## Compatibility considerations(兼容性注意事项)

Asynchronous and synchronous code cannot always be combined freely.
For instance, you can't directly call an async function from a sync function.
Sync and async code also tend to promote different design patterns, which can
make it difficult to compose code intended for the different environments.

<p class="cn">
异步和同步代码不能总是自由组合。
例如，您不能直接从同步函数调用异步函数。
同步和异步代码也倾向于促进不同的设计模式，这会使编写针对不同环境的代码变得困难。
</p>

Even async code cannot always be combined freely. Some crates depend on a
specific async runtime to function. If so, it is usually specified in the
crate's dependency list.

<p class="cn">
即使异步代码也不能总是自由组合。有些板条箱依赖于特定的异步运行时来运行。如果是，通常在板条箱的依赖项列表中指定。
</p>

These compatibility issues can limit your options, so make sure to
research which async runtime and what crates you may need early.
Once you have settled in with a runtime, you won't have to worry
much about compatibility.

<p class="cn">
这些兼容性问题可能会限制您的选择，因此请确保尽早研究您可能需要的异步运行时和crate。
一旦您适应了运行时，就不必太担心兼容性。
</p>

## Performance characteristics(性能特点)

The performance of async Rust depends on the implementation of the
async runtime you're using.
Even though the runtimes that power async Rust applications are relatively new,
they perform exceptionally well for most practical workloads.

<p class="cn">
async Rust的性能取决于所使用的异步运行时的实现。
尽管为异步Rust应用程序提供动力的运行时相对较新，但它们在大多数实际工作负载中表现得异常出色。
</p>

That said, most of the async ecosystem assumes a _multi-threaded_ runtime.
This makes it difficult to enjoy the theoretical performance benefits
of single-threaded async applications, namely cheaper synchronization.
Another overlooked use-case is _latency sensitive tasks_, which are
important for drivers, GUI applications and so on. Such tasks depend
on runtime and/or OS support in order to be scheduled appropriately.
You can expect better library support for these use cases in the future.

<p class="cn">
也就是说，大多数异步生态系统都假设有一个多线程运行时。这使得很难享受单线程异步应用程序的理论性能优势，即更便宜的同步。
另一个被忽视的用例是对延迟敏感的任务，它对驱动程序、GUI应用程序等很重要。这些任务取决于运行时和/或操作系统支持，以便进行适当的调度。
您可以期望将来对这些用例提供更好的库支持。
</p>
