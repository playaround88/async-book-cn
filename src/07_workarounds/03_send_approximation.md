# `Send` Approximation(`Send`的相似问题)

Some `async fn` state machines are safe to be sent across threads, while
others are not. Whether or not an `async fn` `Future` is `Send` is determined
by whether a non-`Send` type is held across an `.await` point. The compiler
does its best to approximate when values may be held across an `.await`
point, but this analysis is too conservative in a number of places today.

<p class="cn">
一些`async fn`状态机可以安全地跨线程发送，而其他状态机则不安全。
`async fn` `Future`是否可`Send`取决于在跨越一个`.await`点，是否持有非`Send`类型。
编译器尽最大努力来估计在跨越一个`.await`点的值的保留时间，但这种分析在今天的一些地方过于保守。
</p>

For example, consider a simple non-`Send` type, perhaps a type
which contains an `Rc`:

<p class="cn">
例如，考虑一个简单的非`Send`类型，可能是一个包含`Rc`的类型：
</p>

```rust
use std::rc::Rc;

#[derive(Default)]
struct NotSend(Rc<()>);
```

Variables of type `NotSend` can briefly appear as temporaries in `async fn`s
even when the resulting `Future` type returned by the `async fn` must be `Send`:

<p class="cn">
即使`async fn`返回的结果`Future`类型必须为`Send`，类型为`NotSend`的变量也可以在`async fn`中短暂显示为临时变量：
</p>

```rust,edition2018
# use std::rc::Rc;
# #[derive(Default)]
# struct NotSend(Rc<()>);
async fn bar() {}
async fn foo() {
    NotSend::default();
    bar().await;
}

fn require_send(_: impl Send) {}

fn main() {
    require_send(foo());
}
```

However, if we change `foo` to store `NotSend` in a variable, this example no
longer compiles:

<p class="cn">
但是，如果将`foo`更改为在变量中存储`NotSend`，则此示例将不再可编译：
</p>

```rust,edition2018
# use std::rc::Rc;
# #[derive(Default)]
# struct NotSend(Rc<()>);
# async fn bar() {}
async fn foo() {
    let x = NotSend::default();
    bar().await;
}
# fn require_send(_: impl Send) {}
# fn main() {
#    require_send(foo());
# }
```

```
error[E0277]: `std::rc::Rc<()>` cannot be sent between threads safely
  --> src/main.rs:15:5
   |
15 |     require_send(foo());
   |     ^^^^^^^^^^^^ `std::rc::Rc<()>` cannot be sent between threads safely
   |
   = help: within `impl std::future::Future`, the trait `std::marker::Send` is not implemented for `std::rc::Rc<()>`
   = note: required because it appears within the type `NotSend`
   = note: required because it appears within the type `{NotSend, impl std::future::Future, ()}`
   = note: required because it appears within the type `[static generator@src/main.rs:7:16: 10:2 {NotSend, impl std::future::Future, ()}]`
   = note: required because it appears within the type `std::future::GenFuture<[static generator@src/main.rs:7:16: 10:2 {NotSend, impl std::future::Future, ()}]>`
   = note: required because it appears within the type `impl std::future::Future`
   = note: required because it appears within the type `impl std::future::Future`
note: required by `require_send`
  --> src/main.rs:12:1
   |
12 | fn require_send(_: impl Send) {}
   | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

error: aborting due to previous error

For more information about this error, try `rustc --explain E0277`.
```

This error is correct. If we store `x` into a variable, it won't be dropped
until after the `.await`, at which point the `async fn` may be running on
a different thread. Since `Rc` is not `Send`, allowing it to travel across
threads would be unsound. One simple solution to this would be to `drop`
the `Rc` before the `.await`, but unfortunately that does not work today.

<p class="cn">
此错误是正确的。如果我们将'x'存储到变量中，则直到`.await`之后才会删除它，此时'async fn'可能正在另一个线程上运行。
由于'Rc'不是'Send'，允许它在线程之间移动是不合理的。
解决这个问题的一个简单方法是在`.await`之前丢弃掉`Rc`，但不幸的是，这在今天不起作用。
</p>

In order to successfully work around this issue, you may have to introduce
a block scope encapsulating any non-`Send` variables. This makes it easier
for the compiler to tell that these variables do not live across an
`.await` point.

<p class="cn">
为了成功解决这个问题，您可能需要引入一个块范围来封装任何非`Send`变量。
这使得编译器更容易判断这些变量不跨`.await`点。
</p>

```rust,edition2018
# use std::rc::Rc;
# #[derive(Default)]
# struct NotSend(Rc<()>);
# async fn bar() {}
async fn foo() {
    {
        let x = NotSend::default();
    }
    bar().await;
}
# fn require_send(_: impl Send) {}
# fn main() {
#    require_send(foo());
# }
```
