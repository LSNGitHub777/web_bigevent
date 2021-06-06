$(function() {
        getUserInfo()
            // 点击实现退出功能
        $('#btnLogout').on('click', function() {
            // 提示用户是否确认退出
            layer.confirm('确认退出登录?', { icon: 3, title: '提示' }, function(index) {
                //do something
                // console.log('ok');
                // 1.清空本地存储中的token
                localStorage.removeItem('token')

                // 2.重新跳转的到登录页面
                location.href = '/前后端交互/大事件项目/login.html'
                layer.close(index);
            });
        })
    })
    // 获取用户基本信息
function getUserInfo() {
    $.ajax({
        method: "GET",
        url: '/my/userinfo',
        // headers 就是请求头配置对象
        // headers: {
        //     Authorization: localStorage.getItem('token') || ''
        // },
        success: function(res) {
                console.log(res);
                if (res.status !== 0) {
                    return layui.layer.msg('获取用户信息失败！')
                }
                // 调用渲染头像
                renderAvater(res.data)
            } //,
            // // 不论成功还是失败，最终都会调用complete 回调函数
            // complete: function(res) {
            //     console.log('执行了 complete 回调');
            //     console.log(res);
            //     // 在complete 回调函数中，可以使用 res.responseJSON 拿到服务器响应回来的数据
            //     if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
            //         // console.log('ok');
            //         // 1.强制清空token
            //         localStorage.removeItem('token')

        //         // 2.强制跳转到登录页面
        //         location.href = '/前后端交互/大事件项目/login.html'
        //     }
        // }
    })
}
// 渲染用户的头像
function renderAvater(user) {
    //1. 获取用户名称
    var name = user.nickname || user.username
        // 2.设置欢迎文本
    $('#welcome').html('欢迎&nbsp;&nbsp;' + name)
        // 3.按需渲染用户的头像
    if (user.user_pic !== null) {
        // 3.1 渲染图片头像
        $('.layui-nav-img').attr('src', user.user_pic).show()
        $('.text-avatar').hide()
    } else {
        // 3.2 渲染文本头像
        $('.layui-nav-img').hide()
            // 获取名称的第一个字母并将其大写
        var first = name[0].toUpperCase()
        $('.text-avatar').html(first).show()
    }
}