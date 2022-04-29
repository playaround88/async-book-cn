# 异步 async-book
Asynchronous Programming in Rust

<p class="cn">
Rust异步编程
</p>

## 依赖 Requirements
The async book is built with [`mdbook`], you can install it using cargo.

<p class="cn">
本异步书籍是使用[`mdbook`]编译，你可以通过cargo来安装它。
</p>

```
cargo install mdbook
cargo install mdbook-linkcheck
```

[`mdbook`]: https://github.com/rust-lang/mdBook

## 构建 Building
To create a finished book, run `mdbook build` to generate it under the `book/` directory.

<p class="cn">
要创建完成的书籍，请运行 `mdbook build` 来在 `book/` 目录中生成它。
</p>

```
mdbook build
```

## 编写 Development
While writing it can be handy to see your changes, `mdbook serve` will launch a local web
server to serve the book.

<p class="cn">
在编写时，可以方便地查看你的变更效果，`mdbook serve` 命令会在本地启动一个web服务器来预览本书。
</p>

```
mdbook serve
```
