var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var commentsTemplate = function(comments) {
    var html = ''
    for(var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var t = `
            <div>
                ${c.content}
            </div>
        `
        html += t
    }
    return html
}

var WeiboTemplate = function(Weibo) {
    var content = Weibo.content
    log('content :', content, Weibo)
    var id = Weibo.id
    var comments = commentsTemplate(Weibo.comments)
    var t = `
        <div class='weibo-cell' data-id="${id}" id='weibo-${id}'>
            <span class='weibo-title'>[WEIBO]: ${content}</span>
            <button class="weibo-edit">编辑</button>
            <button class="weibo-delete">删除weibo</button>
            <div class="comment-list">
                ${comments}
            </div>
            <div class="comment-form">
                <input type="hidden" name="weibo_id" value="">
                <input name="content" id="input-comment-add">
                <br>
                <button class="comment-add">添加评论</button>
            </div>
        </div>
    `
    return t
    /*
    上面的写法在 python 中是这样的
    t = """
    <div class="Weibo-cell">
        <button class="Weibo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(Weibo)
    */
}

var insertWeibo = function(Weibo) {
    var WeiboCell = WeiboTemplate(Weibo)
    // 插入 Weibo-list
    var WeiboList = e('.weibo-list')
    WeiboList.insertAdjacentHTML('beforeend', WeiboCell)
}

var insertEditForm = function(cell) {
    var form = `
        <div class='weibo-edit-form'>
            <input class="weibo-edit-input">
            <button class='weibo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var loadWeibos = function() {
    // 调用 ajax api 来载入数据
    apiWeiboAll(function(r) {
        // console.log('load all', r)
        // 解析为 数组
        var Weibos = JSON.parse(r)
        // 循环添加到页面中
        for(var i = 0; i < Weibos.length; i++) {
            var Weibo = Weibos[i]
            insertWeibo(Weibo)
        }
    })
}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add-weibo')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var title = input.value
        //log('click add', title)
        var form = {
            'content': title,
        }
        apiWeiboAdd(form, function(r) {
            // 收到返回的数据, 插入到页面中
            var Weibo = JSON.parse(r)
            //log('weibo', Weibo)
            insertWeibo(Weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-delete')){
            // 删除这个 Weibo
            //log('come hereS')
            var WeiboCell = self.parentElement
            var Weibo_id = WeiboCell.dataset.id
            apiWeiboDelete(Weibo_id, function(r){
                log('删除成功', Weibo_id)
                WeiboCell.remove()
            })
        }
    })
}

var bindEventWeiboEdit = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-edit')){
            // 删除这个 Weibo
            var WeiboCell = self.parentElement
            insertEditForm(WeiboCell)
        }
    })
}


var bindEventWeiboUpdate = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-update')){
            log('点击了 update ')
            //
            var editForm = self.parentElement
            // querySelector 是 DOM 元素的方法
            // document.querySelector 中的 document 是所有元素的祖先元素
            var input = editForm.querySelector('.weibo-edit-input')
            var title = input.value
            // 用 closest 方法可以找到最近的直系父节点
            var WeiboCell = self.closest('.weibo-cell')
            var Weibo_id = WeiboCell.dataset.id
            var form = {
                'id': Weibo_id,
                'content': title,
            }
            apiWeiboUpdate(form, function(r){
                log('更新成功', Weibo_id)
                var Weibo = JSON.parse(r)
                var selector = '#weibo-' + Weibo.id
                var WeiboCell = e(selector)
                var titleSpan = WeiboCell.querySelector('.weibo-title')
                titleSpan.innerHTML = '[WEIBO]: ' + Weibo.content
//                WeiboCell.remove()
            })
        }
    })
}

var bindEventCommentAdd = function() {
    var b = e('.comment-list')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#input-comment-add')
        var title = input.value
        log('click add', title)
        var form = {
            'content': title,
        }
        apiWeiboAdd(form, function(r) {
            // 收到返回的数据, 插入到页面中
            var Weibo = JSON.parse(r)
            //log('weibo', Weibo)
            insertWeibo(Weibo)
        })
    })
}

var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventCommentAdd()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
