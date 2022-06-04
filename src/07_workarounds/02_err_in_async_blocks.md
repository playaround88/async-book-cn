# `?` in `async` Blocks(`async`块中的`?`)

Just as in `async fn`, it's common to use `?` inside `async` blocks.
However, the return type of `async` blocks isn't explicitly stated.
This can cause the compiler to fail to infer the error type of the
`async` block.

<p class="cn">
就像在`async fn`中一样，经常在`async`块内使用`?`。
但是，`async`块的返回类型没有明确说明。
这可能会导致编译器无法推断`async`块的错误类型。
</p>

For example, this code:

<p class="cn">
例如下面的代码：
</p>

```rust,edition2018
# struct MyError;
# async fn foo() -> Result<(), MyError> { Ok(()) }
# async fn bar() -> Result<(), MyError> { Ok(()) }
let fut = async {
    foo().await?;
    bar().await?;
    Ok(())
};
```

will trigger this error:

<p class="cn">
将会触发这个错误：
</p>

```
error[E0282]: type annotations needed
 --> src/main.rs:5:9
  |
4 |     let fut = async {
  |         --- consider giving `fut` a type
5 |         foo().await?;
  |         ^^^^^^^^^^^^ cannot infer type
```

Unfortunately, there's currently no way to "give `fut` a type", nor a way
to explicitly specify the return type of an `async` block.
To work around this, use the "turbofish" operator to supply the success and
error types for the `async` block:

<p class="cn">
不幸的是，目前没有办法"给`fut`一个类型"，也没有办法显式指定`async`块的返回类型。
要解决此问题，请使用`turbofish`操作符为`async`块提供成功和错误类型：
</p>

```rust,edition2018
# struct MyError;
# async fn foo() -> Result<(), MyError> { Ok(()) }
# async fn bar() -> Result<(), MyError> { Ok(()) }
let fut = async {
    foo().await?;
    bar().await?;
    Ok::<(), MyError>(()) // <- note the explicit type annotation here
};
```

