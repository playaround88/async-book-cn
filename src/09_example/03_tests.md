# Testing the TCP Server(测试TCP服务器)
Let's move on to testing our `handle_connection` function.

<p class="cn">
让我们继续测试`handle_connection`函数。
</p>

First, we need a `TcpStream` to work with.
In an end-to-end or integration test, we might want to make a real TCP connection
to test our code.
One strategy for doing this is to start a listener on `localhost` port 0.
Port 0 isn't a valid UNIX port, but it'll work for testing.
The operating system will pick an open TCP port for us.

<p class="cn">
首先，我们需要一个`TcpStream`来配合。
在端到端或集成测试中，我们可能希望建立真正的TCP连接来测试代码。
执行此操作的一种策略是在`localhost`端口0上启动侦听器。
端口0不是有效的UNIX端口，但可用于测试。
操作系统将为我们选择一个打开的TCP端口。
</p>

Instead, in this example we'll write a unit test for the connection handler,
to check that the correct responses are returned for the respective inputs.
To keep our unit test isolated and deterministic, we'll replace the `TcpStream` with a mock.

<p class="cn">
相反，在本例中，我们将为连接处理程序编写一个单元测试，以检查是否为各个输入返回了正确的响应。
为了保持单元测试的独立性和确定性，我们将用Mock替换`TcpStream`。
</p>

First, we'll change the signature of `handle_connection` to make it easier to test.
`handle_connection` doesn't actually require an `async_std::net::TcpStream`;
it requires any struct that implements `async_std::io::Read`, `async_std::io::Write`, and `marker::Unpin`.
Changing the type signature to reflect this allows us to pass a mock for testing.

<p class="cn">
首先，我们将更改`handle_connection`的签名，以便于测试。
`handle_connection`实际上并不需要`async_std::net::TcpStream`；
它需要实现`async_std::io::Read`, `async_std::io::Write`和`marker::Unpin`的任何结构。
更改类型签名以反映这一点允许我们通过模拟进行测试。
</p>

```rust,ignore
use std::marker::Unpin;
use async_std::io::{Read, Write};

async fn handle_connection(mut stream: impl Read + Write + Unpin) {
```

Next, let's build a mock `TcpStream` that implements these traits.
First, let's implement the `Read` trait, with one method, `poll_read`.
Our mock `TcpStream` will contain some data that is copied into the read buffer,
and we'll return `Poll::Ready` to signify that the read is complete.

<p class="cn">
接下来，让我们构建一个实现这些特性的Mock `TcpStream`。
首先，让我们用一个方法`poll_read`来实现`Read`特征。
我们的模拟`TcpStream`将包含一些复制到读取缓冲区的数据，我们将返回`Poll::Ready`以表示读取完成。
</p>

```rust,ignore
{{#include ../../examples/09_05_final_tcp_server/src/main.rs:mock_read}}
```

Our implementation of `Write` is very similar,
although we'll need to write three methods: `poll_write`, `poll_flush`, and `poll_close`.
`poll_write` will copy any input data into the mock `TcpStream`, and return `Poll::Ready` when complete.
No work needs to be done to flush or close the mock `TcpStream`, so `poll_flush` and `poll_close`
can just return `Poll::Ready`.

<p class="cn">
实现`Write`非常相似，虽然我们需要编写三个方法：`poll_write`, `poll_flush`和`poll_close`。
`poll_write`将把所有输入数据复制到模拟的 `TcpStream`中，完成后返回`Poll::Ready`。
无需执行任何操作即可刷新或关闭模拟的`TcpStream`，因此`poll_flush`和`poll_close`只需返回`Poll::Ready`。
</p>

```rust,ignore
{{#include ../../examples/09_05_final_tcp_server/src/main.rs:mock_write}}
```

Lastly, our mock will need to implement `Unpin`, signifying that its location in memory can safely be moved.
For more information on pinning and the `Unpin` trait, see the [section on pinning](../04_pinning/01_chapter.md).

<p class="cn">
最后，我们的mock需要实现`Unpin`，这意味着它在内存中的位置可以安全地移动。
有关固定和“Unpin”特性的更多信息，请参阅<a href="../04\u pinning/01\u chapter.md">[pinning章节]</a>。
</p>

```rust,ignore
{{#include ../../examples/09_05_final_tcp_server/src/main.rs:unpin}}
```

Now we're ready to test the `handle_connection` function.
After setting up the `MockTcpStream` containing some initial data,
we can run `handle_connection` using the attribute `#[async_std::test]`, similarly to how we used `#[async_std::main]`.
To ensure that `handle_connection` works as intended, we'll check that the correct data
was written to the `MockTcpStream` based on its initial contents.

<p class="cn">
现在，我们准备测试`handle_connection`函数。
在设置包含一些初始数据的`MockTcpStream`之后，
我们可以使用属性`#[async_std::test]`运行`handle_connection`，类似于使用`#[async_std::main]`的方式。
为了确保`handle_connection`按预期工作，我们将检查是否根据`MockTcpStream`的初始内容将正确的数据写入其中。
</p>

```rust,ignore
{{#include ../../examples/09_05_final_tcp_server/src/main.rs:test}}
```
