# `join!`

The `futures::join` macro makes it possible to wait for multiple different
futures to complete while executing them all concurrently.

<p class="cn">
`futures::join`宏允许在同时执行多个不同的futures时等待它们完成。
</p>

# `join!`

When performing multiple asynchronous operations, it's tempting to simply
`.await` them in a series:

<p class="cn">
当执行多个异步操作时，很简单容易地在一系列future中`.await`他们：
</p>

```rust,edition2018,ignore
{{#include ../../examples/06_02_join/src/lib.rs:naiive}}
```

However, this will be slower than necessary, since it won't start trying to
`get_music` until after `get_book` has completed. In some other languages,
futures are ambiently run to completion, so two operations can be
run concurrently by first calling each `async fn` to start the futures, and
then awaiting them both:

<p class="cn">
然而，这将比必要的速度慢，因为在`get_book`完成之前，它不会开始尝试`get_music`。
在其他一些语言中，futures会自动运行到完成，因此可以同时运行两个操作，首先调用每个`async fn`来启动futures，然后等待这两个操作：
</p>

```rust,edition2018,ignore
{{#include ../../examples/06_02_join/src/lib.rs:other_langs}}
```

However, Rust futures won't do any work until they're actively `.await`ed.
This means that the two code snippets above will both run
`book_future` and `music_future` in series rather than running them
concurrently. To correctly run the two futures concurrently, use
`futures::join!`:

<p class="cn">
然而，Rust future不会起任何作用直到通过`.await`激活它。
这意味着上面的两段代码都将串联运行`book_future`和`music_future`，而不是同时运行它们。
要同时正确运行这两个未来，请使用`futures::join!`。
</p>

```rust,edition2018,ignore
{{#include ../../examples/06_02_join/src/lib.rs:join}}
```

The value returned by `join!` is a tuple containing the output of each
`Future` passed in.

<p class="cn">
`join!`返回的值`是一个元组，包含传入的每个`Future`的输出。
</p>

## `try_join!`

For futures which return `Result`, consider using `try_join!` rather than
`join!`. Since `join!` only completes once all subfutures have completed,
it'll continue processing other futures even after one of its subfutures
has returned an `Err`.

<p class="cn">
对于返回`Result`的future，请考虑使用`try_join!`而不是`join!`。
因为`join!`仅在所有子期future成后完成，它将继续处理其他future，即使其中一个子future返回“Err”。
</p>

Unlike `join!`, `try_join!` will complete immediately if one of the subfutures
returns an error.

<p class="cn">
不像`join!`, `try_join!`如果其中一个子未来返回错误，将立即完成。
</p>

```rust,edition2018,ignore
{{#include ../../examples/06_02_join/src/lib.rs:try_join}}
```

Note that the futures passed to `try_join!` must all have the same error type.
Consider using the `.map_err(|e| ...)` and `.err_into()` functions from
`futures::future::TryFutureExt` to consolidate the error types:

<p class="cn">
请注意，future传递给`try_join!`所有错误类型必须相同。
考虑使用来自`futures::future::TryFutureExt`的函数`.map_err(|e| ...)`和`.err_into()`以合并错误类型：
</p>

```rust,edition2018,ignore
{{#include ../../examples/06_02_join/src/lib.rs:try_join_map_err}}
```
