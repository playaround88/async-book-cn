# Running Asynchronous Code(运行异步代码)
An HTTP server should be able to serve multiple clients concurrently;
that is, it should not wait for previous requests to complete before handling the current request.
The book
[solves this problem](https://doc.rust-lang.org/book/ch20-02-multithreaded.html#turning-our-single-threaded-server-into-a-multithreaded-server)
by creating a thread pool where each connection is handled on its own thread.
Here, instead of improving throughput by adding threads, we'll achieve the same effect using asynchronous code.

<p class="cn">
HTTP服务器应该能够同时为多个客户端提供服务；
也就是说，它不应该在处理当前请求之前等待以前的请求完成。
这本书<a href="https://doc.rust-lang.org/book/ch20-02-multithreaded.html#turning-our-single-threaded-server-into-a-multithreaded-server">solves this problem</a>通过创建线程池让每一个请求都在他们自己的线程中处理。
在这里，我们将使用异步代码来实现相同的效果，而不是通过添加线程来提高吞吐量。
</p>

Let's modify `handle_connection` to return a future by declaring it an `async fn`:

<p class="cn">
让我们修改`handle_connection`，通过将其声明为`async fn`来返回future：
</p>

```rust,ignore
{{#include ../../examples/09_02_async_tcp_server/src/main.rs:handle_connection_async}}
```

Adding `async` to the function declaration changes its return type
from the unit type `()` to a type that implements `Future<Output=()>`.

<p class="cn">
将`async`添加到函数声明中会将其返回类型从单元类型`()`更改为实现`Future<Output=()>`的类型。
</p>

If we try to compile this, the compiler warns us that it will not work:

<p class="cn">
如果我们试图编译它，编译器会警告我们它将无法工作：
</p>

```console
$ cargo check
    Checking async-rust v0.1.0 (file:///projects/async-rust)
warning: unused implementer of `std::future::Future` that must be used
  --> src/main.rs:12:9
   |
12 |         handle_connection(stream);
   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = note: `#[warn(unused_must_use)]` on by default
   = note: futures do nothing unless you `.await` or poll them
```

Because we haven't `await`ed or `poll`ed the result of `handle_connection`,
it'll never run. If you run the server and visit `127.0.0.1:7878` in a browser,
you'll see that the connection is refused; our server is not handling requests.

<p class="cn">
因为我们没有`await`或`poll` `handle_connection`的结果，所以它永远不会运行。
如果运行服务器并在浏览器中访问“127.0.0.1:7878”，
您将看到连接被拒绝；我们的服务器没有处理请求。
</p>

We can't `await` or `poll` futures within synchronous code by itself.
We'll need an asynchronous runtime to handle scheduling and running futures to completion.
Please consult the [section on choosing a runtime](../08_ecosystem/00_chapter.md)
for more information on asynchronous runtimes, executors, and reactors.
Any of the runtimes listed will work for this project, but for these examples,
we've chosen to use the `async-std` crate.

<p class="cn">
我们不能单独在同步代码中“等待”或“轮询”未来。
我们需要一个异步运行时来处理调度和运行期货直到完成。
请参考<a href="../08_ecosystem/00_chapter.md">section on choosing a runtime</a>
获取更多关于异步运行时，执行器和反应器的信息。
列出的任何运行时都适用于此项目，但对于这里的示例，我们选择使用`async std`板条箱。
</p>

## Adding an Async Runtime(添加一个异步运行时)
The following example will demonstrate refactoring synchronous code to use an async runtime; here, `async-std`.
The `#[async_std::main]` attribute from `async-std` allows us to write an asynchronous main function.
To use it, enable the `attributes` feature of `async-std` in `Cargo.toml`:

<p class="cn">
以下示例将演示如何重构同步代码以使用异步运行时；此处为`async-std`。
`async-std`中的`#[async_std::main]`属性允许我们编写异步main函数。
要使用它，请在`Cargo.toml`中启用`async-std`的`attributes`特性:
</p>

```toml
[dependencies.async-std]
version = "1.6"
features = ["attributes"]
```

As a first step, we'll switch to an asynchronous main function,
and `await` the future returned by the async version of `handle_connection`.
Then, we'll test how the server responds.
Here's what that would look like:

<p class="cn">
作为第一步，我们将切换到异步主函数，
和`await`由`handle_connection`的异步版本返回的future。
然后，我们将测试服务器如何响应。
下面是修改后代码：
</p>

```rust
{{#include ../../examples/09_02_async_tcp_server/src/main.rs:main_func}}
```
Now, let's test to see if our server can handle connections concurrently.
Simply making `handle_connection` asynchronous doesn't mean that the server
can handle multiple connections at the same time, and we'll soon see why.

<p class="cn">
现在，让我们测试一下服务器是否可以并发处理连接。
简单地将`handle_connection`设置为异步并不意味着服务器可以同时处理多个连接，我们很快就会知道原因。
</p>

To illustrate this, let's simulate a slow request.
When a client makes a request to `127.0.0.1:7878/sleep`,
our server will sleep for 5 seconds:

<p class="cn">
为了说明这一点，让我们模拟一个缓慢的请求。当客户端请求 `127.0.0.1:7878/sleep`时，我们的服务器将睡眠5秒钟：
</p>

```rust,ignore
{{#include ../../examples/09_03_slow_request/src/main.rs:handle_connection}}
```
This is very similar to the 
[simulation of a slow request](https://doc.rust-lang.org/book/ch20-02-multithreaded.html#simulating-a-slow-request-in-the-current-server-implementation)
from the Book, but with one important difference:
we're using the non-blocking function `async_std::task::sleep` instead of the blocking function `std::thread::sleep`.
It's important to remember that even if a piece of code is run within an `async fn` and `await`ed, it may still block.
To test whether our server handles connections concurrently, we'll need to ensure that `handle_connection` is non-blocking.

<p class="cn">
这和书中<a href="https://doc.rust-lang.org/book/ch20-02-multithreaded.html#simulating-a-slow-request-in-the-current-server-implementation">simulation of a slow request</a>十分相似，但有一点重要的不同：
我们使用的是非阻塞函数`async_std::task::sleep`，而不是阻塞函数`std::thread::sleep`。
重要的是要记住，即使一段代码在“async fn”和`await`中运行，它仍然可能阻塞。
为了测试服务器是否同时处理连接，我们需要确保`handle_connection`是非阻塞的。
</p>

If you run the server, you'll see that a request to `127.0.0.1:7878/sleep`
will block any other incoming requests for 5 seconds!
This is because there are no other concurrent tasks that can make progress
while we are `await`ing the result of `handle_connection`.
In the next section, we'll see how to use async code to handle connections concurrently.

<p class="cn">
如果您运行服务器，您将看到对“127.0.0.1:7878/sleep”的请求将阻止任何其他传入请求5秒钟！
这是因为当我们`await`等待`handle_connection`的结果时，没有其他并发任务可以取得进展。
在下一节中，我们将看到如何使用异步代码并发处理连接。
</p>
