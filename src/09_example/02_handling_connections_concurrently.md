# Handling Connections Concurrently(并发地处理连接)
The problem with our code so far is that `listener.incoming()` is a blocking iterator.
The executor can't run other futures while `listener` waits on incoming connections,
and we can't handle a new connection until we're done with the previous one.

<p class="cn">
到目前为止，我们的代码存在的问题是`listener.incoming()`是一个阻塞迭代器。
`listener`等待传入连接时，执行器无法运行其他future，
在完成前一个连接之前，我们无法处理新连接。
</p>

In order to fix this, we'll transform `listener.incoming()` from a blocking Iterator
to a non-blocking Stream. Streams are similar to Iterators, but can be consumed asynchronously.
For more information, see the [chapter on Streams](../05_streams/01_chapter.md).

<p class="cn">
为了解决这个问题，我们将转换`listener.incoming()`从阻塞迭代器到非阻塞流。
流与迭代器类似，但可以异步使用。
有关更多信息，可以看<a href="../05_streams/01_chapter.md">Streams章节</a>
</p>

Let's replace our blocking `std::net::TcpListener` with the non-blocking `async_std::net::TcpListener`,
and update our connection handler to accept an `async_std::net::TcpStream`:

<p class="cn">
让我们将阻塞的 `std::net::TcpListener`替换为非阻塞的`async_std::net::TcpListener`，
并更新连接处理程序以接受`async_std::net::TcpStream`：
</p>

```rust,ignore
{{#include ../../examples/09_04_concurrent_tcp_server/src/main.rs:handle_connection}}
```

The asynchronous version of `TcpListener` implements the `Stream` trait for `listener.incoming()`,
a change which provides two benefits.
The first is that `listener.incoming()` no longer blocks the executor.
The executor can now yield to other pending futures 
while there are no incoming TCP connections to be processed.

<p class="cn">
异步版本的`TcpListener`为`listener.incoming()`实现了`Stream`特性，这一更改提供了两个好处。
第一个是`listener.incoming()` 不再阻塞执行器。
当没有要处理的传入TCP连接时，执行器现在可以向其他挂起的future让步。
</p>

The second benefit is that elements from the Stream can optionally be processed concurrently,
using a Stream's `for_each_concurrent` method.
Here, we'll take advantage of this method to handle each incoming request concurrently.
We'll need to import the `Stream` trait from the `futures` crate, so our Cargo.toml now looks like this:

<p class="cn">
第二个好处是，可以选择使用流的`for_each_concurrent`方法并发处理流中的元素。
这里，我们将利用此方法并发处理每个传入请求。
我们需要从`futures`板条箱中导入`Stream`特性，修改我们Cargo.toml看起来像这样：
</p>

```diff
+[dependencies]
+futures = "0.3"

 [dependencies.async-std]
 version = "1.6"
 features = ["attributes"]
```

Now, we can handle each connection concurrently by passing `handle_connection` in through a closure function.
The closure function takes ownership of each `TcpStream`, and is run as soon as a new `TcpStream` becomes available.
As long as `handle_connection` does not block, a slow request will no longer prevent other requests from completing.

<p class="cn">
现在，我们可以通过闭包函数传入`handle_connection`来并发处理每个连接。
闭包函数拥有每个`TcpStream`的所有权，并在新的`TcpStream`可用时立即运行。
只要`handle_connection`没有阻塞，一个缓慢的请求将不再阻止其他请求完成。
</p>

```rust,ignore
{{#include ../../examples/09_04_concurrent_tcp_server/src/main.rs:main_func}}
```
# Serving Requests in Parallel(并行服务请求)
Our example so far has largely presented concurrency (using async code)
as an alternative to parallelism (using threads).
However, async code and threads are not mutually exclusive.
In our example, `for_each_concurrent` processes each connection concurrently, but on the same thread.
The `async-std` crate allows us to spawn tasks onto separate threads as well.
Because `handle_connection` is both `Send` and non-blocking, it's safe to use with `async_std::task::spawn`.
Here's what that would look like:

<p class="cn">
到目前为止，我们的示例在很大程度上提供了并发（使用异步代码）作为并行（使用线程）的替代方案。
然而，异步代码和线程并不是互斥的。
在我们的示例中，`for_each_concurrent`并发处理每个连接，但在同一线程上。
`async-std`板条箱也允许我们将任务派生到单独的线程上。
因为`handle_connection`既是可`Send`的又是非阻塞的，所以与 `async_std::task::spawn`一起使用是安全的。
下面是它的样子：
</p>

```rust
{{#include ../../examples/09_05_final_tcp_server/src/main.rs:main_func}}
```
Now we are using both concurrency and parallelism to handle multiple requests at the same time!
See the [section on multithreaded executors](../08_ecosystem/00_chapter.md#single-threading-vs-multithreading)
for more information.

<p class="cn">
现在，我们同时使用并发性和并行性来处理多个请求！
请参考<a href="../08_ecosystem/00_chapter.md#single-threading-vs-multithreading">多线程执行器</a>获取更多信息
</p>
