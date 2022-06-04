# Recursion(递归)

Internally, `async fn` creates a state machine type containing each
sub-`Future` being `.await`ed. This makes recursive `async fn`s a little
tricky, since the resulting state machine type has to contain itself:

<p class="cn">
在内部，`async fn`创建一个状态机类型，其中包含每个正在`.await`的子`Future`。
这使得递归`async fn`有点棘手，因为生成的状态机类型必须包含自己：
</p>

```rust,edition2018
# async fn step_one() { /* ... */ }
# async fn step_two() { /* ... */ }
# struct StepOne;
# struct StepTwo;
// This function:
async fn foo() {
    step_one().await;
    step_two().await;
}
// generates a type like this:
enum Foo {
    First(StepOne),
    Second(StepTwo),
}

// So this function:
async fn recursive() {
    recursive().await;
    recursive().await;
}

// generates a type like this:
enum Recursive {
    First(Recursive),
    Second(Recursive),
}
```

This won't work—we've created an infinitely-sized type!
The compiler will complain:

<p class="cn">
这行不通，我们已经创建了一个无限大小的类型！
编译器将抱怨：
</p>

```
error[E0733]: recursion in an `async fn` requires boxing
 --> src/lib.rs:1:22
  |
1 | async fn recursive() {
  |                      ^ an `async fn` cannot invoke itself directly
  |
  = note: a recursive `async fn` must be rewritten to return a boxed future.
```

In order to allow this, we have to introduce an indirection using `Box`.
Unfortunately, compiler limitations mean that just wrapping the calls to
`recursive()` in `Box::pin` isn't enough. To make this work, we have
to make `recursive` into a non-`async` function which returns a `.boxed()`
`async` block:

<p class="cn">
为了实现这一点，我们必须引入一个使用`Box`的间接寻址。
不幸的是，编译器的限制意味着仅仅将对`recursive()`的调用包装在`Box::pin`中是不够的。
为了实现这一点，我们必须将`recursive`转换为一个非`async`函数，该函数返回一个`.boxed()` `async`块：
</p>

```rust,edition2018
{{#include ../../examples/07_05_recursion/src/lib.rs:example}}
```
