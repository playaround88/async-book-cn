"use strict";

// 翻译语言对应的class
let language = 'cn';

/**
 * 切换元素是否显示
 * @param {Element} ele 
 */
function toggle(ele) {
    if(ele.style['display'] == 'none') {
        ele.style.display = '';
    } else {
        ele.style.display = 'none';
    }
}

// 翻译特殊处理
(function() {
    // 隐藏所有英文段落
    var en_p = document.querySelectorAll('#content > main > p:not([class="' + language + '"])');
    en_p.forEach(it => toggle(it));

    // 所有cn添加点击时间
    var cn_p = document.querySelectorAll('#content > main > p[class="' + language + '"]');
    cn_p.forEach(it => {
        it.addEventListener('click', function(e) {
            toggle(e.target.previousElementSibling);
        });
    });

    // 隐藏所有英文列表
    // var en_li = document.querySelectorAll('#content > main > ul > li > p:not([class="' + language + '"])');
    // en_li.forEach(it => toggle(it.parentElement));
    // 新版本li下没有p
    var all_li = document.querySelectorAll('#content > main > ul > li');
    Array.from(all_li)
            .filter(it => it.querySelector('p[class="' + language + '"]') == null)
            .forEach(it => toggle(it));

    // 中文列表添加点击事件
    var cn_li = document.querySelectorAll('#content > main > ul > li > p[class="' + language + '"]');
    cn_li.forEach(it => {
        it.addEventListener('click', function(e) {
            var p_li = e.target.parentElement;
            toggle(p_li.previousElementSibling);
        });
    });
    
})();