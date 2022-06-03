# Iteration and Concurrency(迭代和并发)

Similar to synchronous `Iterator`s, there are many different ways to iterate
over and process the values in a `Stream`. There are combinator-style methods
such as `map`, `filter`, and `fold`, and their early-exit-on-error cousins
`try_map`, `try_filter`, and `try_fold`.

<p class="cn">
与同步迭代器类似，有许多不同的方法可以迭代和处理`Stream`中的值。
有诸如`map`、`filter`和`fold`之类的组合式方法，以及它们的异常快速退出版本`try_map`、`try_filter`和`try_fold`。
</p>

Unfortunately, `for` loops are not usable with `Stream`s, but for
imperative-style code, `while let` and the `next`/`try_next` functions can
be used:

<p class="cn">
遗憾的是，`for`循环不能用于`Stream`，但对于命令式代码，`while let`和`next`/`try_next`函数可以使用：
</p>

```rust,edition2018,ignore
{{#include ../../examples/05_02_iteration_and_concurrency/src/lib.rs:nexts}}
```

However, if we're just processing one element at a time, we're potentially
leaving behind opportunity for concurrency, which is, after all, why we're
writing async code in the first place. To process multiple items from a stream
concurrently, use the `for_each_concurrent` and `try_for_each_concurrent`
methods:

<p class="cn">
然而，如果我们一次只处理一个元素，那么就可能会留下并发的机会，毕竟，这就是为什么我们首先要编写异步代码的原因。
要同时处理流中的多个项目，请使用`for_each_concurrent`和`try_for_each_concurrent`方法：
</p>

```rust,edition2018,ignore
{{#include ../../examples/05_02_iteration_and_concurrency/src/lib.rs:try_for_each_concurrent}}
```
