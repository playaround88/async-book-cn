# Final Project: Building a Concurrent Web Server with Async Rust(最终项目：使用Rust异步编程构建一个并发web服务器)
In this chapter, we'll use asynchronous Rust to modify the Rust book's 
[single-threaded web server](https://doc.rust-lang.org/book/ch20-01-single-threaded.html) 
to serve requests concurrently.

<p class="cn">
在本章中，我们将使用异步Rust来修改Rust手册的
<a href="https://doc.rust-lang.org/book/ch20-01-single-threaded.html">单线程web server</a>来支持并发的响应请求。
</p>

## Recap(回顾)
Here's what the code looked like at the end of the lesson.

<p class="cn">
那门课程的代码大概是如下
</p>

`src/main.rs`:
```rust
{{#include ../../examples/09_01_sync_tcp_server/src/main.rs}}
```

`hello.html`:
```html
{{#include ../../examples/09_01_sync_tcp_server/hello.html}}
```

`404.html`:
```html
{{#include ../../examples/09_01_sync_tcp_server/404.html}}
```

If you run the server with `cargo run` and visit `127.0.0.1:7878` in your browser,
you'll be greeted with a friendly message from Ferris!

<p class="cn">
如果你使用`cargo run`命令运行，并在浏览器访问`127.0.0.1:7878`，
你将会得到一句友好的欢迎语！
</p>
