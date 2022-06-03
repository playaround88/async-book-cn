# `select!`

The `futures::select` macro runs multiple futures simultaneously, allowing
the user to respond as soon as any future completes.

<p class="cn">
`futures::select`宏同时运行多个futures，允许用户在任何futures完成后立即响应。
</p>

```rust,edition2018
{{#include ../../examples/06_03_select/src/lib.rs:example}}
```

The function above will run both `t1` and `t2` concurrently. When either
`t1` or `t2` finishes, the corresponding handler will call `println!`, and
the function will end without completing the remaining task.

<p class="cn">
上述函数将同时运行't1'和't2'。当't1'或't2'完成时，相应的处理程序将调用`println!`，
该功能将在不完成剩余任务的情况下结束。
</p>

The basic syntax for `select` is `<pattern> = <expression> => <code>,`,
repeated for as many futures as you would like to `select` over.

<p class="cn">
`select`的基本语法是`<pattern> = <expression> => <code>`，重复你想要`select`的future。
</p>

## `default => ...` and `complete => ...`

`select` also supports `default` and `complete` branches.

<p class="cn">
`select`同时也支持`default`和`complete`分支
</p>

A `default` branch will run if none of the futures being `select`ed
over are yet complete. A `select` with a `default` branch will
therefore always return immediately, since `default` will be run
if none of the other futures are ready.

<p class="cn">
如果`select`的futures尚未完成，`default`分支将运行。
因此，带有`default`分支的 `select`总是会立即返回，因为如果没有其他future就绪，`default`将运行。
</p>

`complete` branches can be used to handle the case where all futures
being `select`ed over have completed and will no longer make progress.
This is often handy when looping over a `select!`.

<p class="cn">
`complete`分支可用于处理所有正在`select`的future已完成且不再取得进展的情况。
当在`select!`上循环时，这通常很方便。
</p>

```rust,edition2018
{{#include ../../examples/06_03_select/src/lib.rs:default_and_complete}}
```

## Interaction with `Unpin` and `FusedFuture`(与`Unpin`和`FusedFuture`的交互`)

One thing you may have noticed in the first example above is that we
had to call `.fuse()` on the futures returned by the two `async fn`s,
as well as pinning them with `pin_mut`. Both of these calls are necessary
because the futures used in `select` must implement both the `Unpin`
trait and the `FusedFuture` trait.

<p class="cn">
在上面的第一个示例中，您可能已经注意到一件事，那就是我们必须在两个`async fn`返回的future上调用`.fuse()`，并用`pin_mut`固定它们。
这两个调用都是必要的，因为在`select`中使用的future必须实现`Unpin`特性和`FusedFuture`特性。
</p>

`Unpin` is necessary because the futures used by `select` are not
taken by value, but by mutable reference. By not taking ownership
of the future, uncompleted futures can be used again after the
call to `select`.

<p class="cn">
`Unpin`是必需的，因为select使用的future不是按值，而是按可变引用。
通过不取得future的所有权，未完成的future可以在调用`select`后再次使用。
</p>

Similarly, the `FusedFuture` trait is required because `select` must
not poll a future after it has completed. `FusedFuture` is implemented
by futures which track whether or not they have completed. This makes
it possible to use `select` in a loop, only polling the futures which
still have yet to complete. This can be seen in the example above,
where `a_fut` or `b_fut` will have completed the second time through
the loop. Because the future returned by `future::ready` implements
`FusedFuture`, it's able to tell `select` not to poll it again.

<p class="cn">
同样，`FusedFuture`特性也是必需的，因为`select`必须在future完成后不轮询它.
future已实现`FusedFuture`，可以跟踪他们是否完成的。
这使得可以在循环中使用`select`，只轮询还没有完成的future。
这可以在上面的示例中看到，其中`a_fut`或`b_fut`将在第二次通过循环完成。
因为`future::ready`返回的future实现了`FusedFuture`，它可以告诉`select`不要再次轮询它。
</p>

Note that streams have a corresponding `FusedStream` trait. Streams
which implement this trait or have been wrapped using `.fuse()`
will yield `FusedFuture` futures from their
`.next()` / `.try_next()` combinators.

<p class="cn">
请注意，流具有相应的`FusedStream`特性。实现此特性或已使用`.fuse()`包装的流，
将从`.next()` / `.try_next()`组合符中产生实现了`FusedFuture`的future。
</p>

```rust,edition2018
{{#include ../../examples/06_03_select/src/lib.rs:fused_stream}}
```

## Concurrent tasks in a `select` loop with `Fuse` and `FuturesUnordered`(在`select`中使用`Fuse`和`FuturesUnordered`的并行任务)

One somewhat hard-to-discover but handy function is `Fuse::terminated()`,
which allows constructing an empty future which is already terminated,
and can later be filled in with a future that needs to be run.

<p class="cn">
一个有点难以发现但很方便的函数是`Fuse::terminated()`，它允许构建一个已经终止的空future，以后可以填充需要运行的future。
</p>

This can be handy when there's a task that needs to be run during a `select`
loop but which is created inside the `select` loop itself.

<p class="cn">
当有一个任务需要在`select`循环中运行，但它是在`select`循环本身中创建的时，这会很方便。
</p>

Note the use of the `.select_next_some()` function. This can be
used with `select` to only run the branch for `Some(_)` values
returned from the stream, ignoring `None`s.

<p class="cn">
请注意`.select_next_some()`函数的用法。这可以与`select`一起使用，以便只对从流返回的`Some(_)`值运行分支，而忽略`None`。
</p>

```rust,edition2018
{{#include ../../examples/06_03_select/src/lib.rs:fuse_terminated}}
```

When many copies of the same future need to be run simultaneously,
use the `FuturesUnordered` type. The following example is similar
to the one above, but will run each copy of `run_on_new_num_fut`
to completion, rather than aborting them when a new one is created.
It will also print out a value returned by `run_on_new_num_fut`.

<p class="cn">
当需要同时运行同一future的多个副本时，请使用`FuturesUnordered`类型。
以下示例与上面的示例类似，但将运行`run_on_new_num_fut`的每个副本直到完成，而不是在创建新副本时中止它们。
它还将打印`run_on_new_num_fut`返回的值。
</p>

```rust,edition2018
{{#include ../../examples/06_03_select/src/lib.rs:futures_unordered}}
```
