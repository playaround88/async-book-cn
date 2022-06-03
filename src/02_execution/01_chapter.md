# Under the Hood: Executing `Future`s and Tasks(执行Futures和任务的底层结构)

In this section, we'll cover the underlying structure of how `Future`s and
asynchronous tasks are scheduled. If you're only interested in learning
how to write higher-level code that uses existing `Future` types and aren't
interested in the details of how `Future` types work, you can skip ahead to
the `async`/`await` chapter. However, several of the topics discussed in this
chapter are useful for understanding how `async`/`await` code works,
understanding the runtime and performance properties of `async`/`await` code,
and building new asynchronous primitives. If you decide to skip this section
now, you may want to bookmark it to revisit in the future.

<p class="cn">
在本节中，我们将介绍`Future`和异步任务是如何调度的底层结构。
如果您只对学习如何编写使用现有“Future”类型的更层代码感兴趣，
而对“Future”类型如何工作的细节不感兴趣，那么可以跳到“async”/“await”一章。
然而，本章中讨论的几个主题对于理解“async”/“await”代码的工作原理、理解“async”/“await”代码的运行时和性能属性以及构建新的异步原语都很有用。
如果您现在决定跳过此部分，您可能希望将其添加为书签，以便将来再次访问。
</p>

Now, with that out of the way, let's talk about the `Future` trait.

<p class="cn">
现在，让我们来谈谈`Future`特征。
</p>
