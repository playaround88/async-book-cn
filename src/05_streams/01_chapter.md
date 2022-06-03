# The `Stream` Trait(`Stream`特征)

The `Stream` trait is similar to `Future` but can yield multiple values before
completing, similar to the `Iterator` trait from the standard library:

<p class="cn">
`Stream`特征类似于`Future`，但在完成之前可以生成多个值，类似于标准库中的`Iterator`特征：
</p>

```rust,ignore
{{#include ../../examples/05_01_streams/src/lib.rs:stream_trait}}
```

One common example of a `Stream` is the `Receiver` for the channel type from
the `futures` crate. It will yield `Some(val)` every time a value is sent
from the `Sender` end, and will yield `None` once the `Sender` has been
dropped and all pending messages have been received:

<p class="cn">
`Stream`的一个常见示例是来自`futures`板条箱的通道类型的`Receiver`。
每次从`Sender`端发送值时，它都会生成`Some(val)`，一旦删除`Sender`并接收到所有挂起的消息，它将生成`None`：
</p>

```rust,edition2018,ignore
{{#include ../../examples/05_01_streams/src/lib.rs:channels}}
```
