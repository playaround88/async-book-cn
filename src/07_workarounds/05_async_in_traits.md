# `async` in Traits(`async`特征化)

Currently, `async fn` cannot be used in traits. The reasons for this are
somewhat complex, but there are plans to remove this restriction in the
future.

<p class="cn">
目前，`async fn`不能用于traits。原因有点复杂，但将来有计划取消这一限制。
</p>

In the meantime, however, this can be worked around using the
[async-trait crate from crates.io](https://github.com/dtolnay/async-trait).

<p class="cn">
然而，在此期间，可以使用<a href="https://github.com/dtolnay/async-trait">async-trait crate from crates.io</a>
</p>

Note that using these trait methods will result in a heap allocation
per-function-call. This is not a significant cost for the vast majority
of applications, but should be considered when deciding whether to use
this functionality in the public API of a low-level function that is expected
to be called millions of times a second.

<p class="cn">
请注意，使用这些trait方法将导致每个函数调用的堆分配。对于绝大多数应用程序来说，这并不是一个很大的成本，
但在决定是否在预计每秒会被调用数百万次低级别函数的公共API中使用此功能时，应该考虑到这一点。
</p>
