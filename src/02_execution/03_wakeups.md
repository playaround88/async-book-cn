# Task Wakeups with `Waker`(使用 `Waker`唤醒任务)

It's common that futures aren't able to complete the first time they are
`poll`ed. When this happens, the future needs to ensure that it is polled
again once it is ready to make more progress. This is done with the `Waker`
type.

<p class="cn">
future无法在第一次`poll`时完成是很常见的。
当这种情况发生时，future需要确保一旦准备好，就可以再次进行`poll`。
这是通过`Waker`类型完成的。
</p>

Each time a future is polled, it is polled as part of a "task". Tasks are
the top-level futures that have been submitted to an executor.

<p class="cn">
每次轮询future时，都会将其作为“任务”的一部分进行轮询。任务是提交给执行者的顶级future。
</p>

`Waker` provides a `wake()` method that can be used to tell the executor that
the associated task should be awoken. When `wake()` is called, the executor
knows that the task associated with the `Waker` is ready to make progress, and
its future should be polled again.

<p class="cn">
`Waker`提供了一个`wake()`方法，可以用来告诉执行器应该唤醒关联的任务。
调用`wake()`时，执行器知道与`Waker`关联的任务已准备就绪，应该再次轮询它的future。
</p>

`Waker` also implements `clone()` so that it can be copied around and stored.

<p class="cn">
`Waker`还实现了`clone()`以便可以对其进行复制和存储。
</p>

Let's try implementing a simple timer future using `Waker`.

<p class="cn">
让我们尝试使用`Waker`实现一个简单的计时器future。
</p>

## Applied: Build a Timer(应用: 构建一个计时器)

For the sake of the example, we'll just spin up a new thread when the timer
is created, sleep for the required time, and then signal the timer future
when the time window has elapsed.

<p class="cn">
出于示例的考虑，我们将在创建计时器时启动一个新线程，在所需的时间内休眠，然后在时间窗口结束时向计时器发出future信号。
</p>

First, start a new project with `cargo new --lib timer_future` and add the imports
we'll need to get started to `src/lib.rs`:

<p class="cn">
首先，用`cargo new --lib timer_future`启动一个新项目，并将开始所需的导入添加到`src/lib.rs`:
</p>

```rust
{{#include ../../examples/02_03_timer/src/lib.rs:imports}}
```

Let's start by defining the future type itself. Our future needs a way for the
thread to communicate that the timer has elapsed and the future should complete.
We'll use a shared `Arc<Mutex<..>>` value to communicate between the thread and
the future.

<p class="cn">
让我们从定义future类型开始。我们的future需要一种线程通信的方式，即计时器已经过了，future应该完成了。
我们将使用共享的`Arc<Mutex<..>>`在线程与future之间通信。
</p>

```rust,ignore
{{#include ../../examples/02_03_timer/src/lib.rs:timer_decl}}
```

Now, let's actually write the `Future` implementation!

<p class="cn">
现在，让我们实际编写`Future`实现！
</p>

```rust,ignore
{{#include ../../examples/02_03_timer/src/lib.rs:future_for_timer}}
```

Pretty simple, right? If the thread has set `shared_state.completed = true`,
we're done! Otherwise, we clone the `Waker` for the current task and pass it to
`shared_state.waker` so that the thread can wake the task back up.

<p class="cn">
很简单吧？如果线程已设置`shared_state.completed = true`，我们完成了！
否则，我们将克隆当前任务的`Waker`，并将其传递到`shared_state.waker`以便线程可以将任务唤醒。
</p>

Importantly, we have to update the `Waker` every time the future is polled
because the future may have moved to a different task with a different
`Waker`. This will happen when futures are passed around between tasks after
being polled.

<p class="cn">
重要的是，我们必须在每次轮询future时更新`Waker`，因为future可能已移动到具有不同`Waker`的不同任务。
当future在被轮询后在任务之间传递时，就会发生这种情况。
</p>

Finally, we need the API to actually construct the timer and start the thread:

<p class="cn">
最后，我们需要API来实际构造计时器并启动线程：
</p>

```rust,ignore
{{#include ../../examples/02_03_timer/src/lib.rs:timer_new}}
```

Woot! That's all we need to build a simple timer future. Now, if only we had
an executor to run the future on...

<p class="cn">
吼吼！这就是我们构建一个简单计时器未来所需的全部内容。现在，我们只差一个执行器来运行future......
</p>
