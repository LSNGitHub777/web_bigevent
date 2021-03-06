$(function() {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage;

    // 补零函数
    function padZero(n) {
        if (n < 10) {
            return '0' + n
        } else {
            return n
        }
    }

    //定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)
        var y = padZero(dt.getFullYear())
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, //页码值，默认请求第一页的数据
        pagesize: 2, //每页显示几条数据，默认每页显示2条
        cate_id: '', //文章分类的Id
        state: '' //文章的发布状态
    }

    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                console.log('ok');
                // 使用模板引擎渲染页面数据
                var htmlStr = template('tpl-table', res)
                    // console.log(htmlStr);
                $('tbody').html(htmlStr)
                    // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类数据失败！')
                }
                // 调用模板引擎渲染分类的可选项
                var htmStr = template('tpl-cate', res)
                    // console.log(htmStr);
                $('[name=cate_id]').html(htmStr)
                    // 通知 layui 重新渲染
                form.render()
            }
        })
    }

    // 为筛选表单绑定submit 事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault()
            // h获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
            // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
            // 根据最新的渲染条件重新渲染列表
        initTable()
        console.log('筛选成功');
    })

    // 定义渲染分页的方法
    function renderPage(total) {

        // console.log(total);
        // 调用laypage.render()方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox', //分页容器 注意，这里的 PageBox 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, //每页几条数据
            curr: q.pagenum, //设置默认选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'], //功能项
            limits: [2, 3, 5, 10], //设置每页条目数
            // 分页发生切换的时候，触发 jump 回调
            // 触发 jump 回调的方法有两种
            // 1，点击页码的时候，会触发jump回调 会产生死循环
            // 2.只要调用了 laypage.render()方法，就会触发 jump 回调

            jump: function(obj, first) {

                //可以通过 first 的值，来判断是通过哪种方式，触发的 jump 回调 
                // 如果 first 的值为 true，证明是方式2触发的
                // 否则是方式1触发的
                console.log(first);
                console.log(obj.curr);

                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr

                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit

                // 把最新的 q 获取对应的数据列表，并渲染表格
                // initTable() //死循环

                //首次不执行
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的形式，为删除按钮绑定 点击事件
    $('tbody').on('click', '.btn-delete', function() {
        // 获取删除按钮的个数
        var len = $('.btn-delete').length
            // 获取到文章的 id
        var id = $(this).attr('data-id')
            // 询问用户是否要删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            //do something

            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')

                    // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
                    // 如果没有剩余的数据了，则需要让页码值-1之后，
                    // 再重新调用initTable()函数

                    // 如果len等于1 ，说明删除完毕后，页面上就没有任何数据了
                    if (len === 1) {
                        // 页码值最小值必须是 1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})