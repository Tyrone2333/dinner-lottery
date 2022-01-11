let baseUrl
if (window.location.host === "xxx") {
    baseUrl = "../itfripartycore.ashx"
} else {
    baseUrl = "https://mockapi.eolinker.com/gJ8KvAQe305691bb6e19e1f515ca2af00b870574ed71616/lottery"
}

function _ajax(data, type) {
    let apiUrl = baseUrl
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: apiUrl,
            data: data,
            type: type,
            dataType: 'JSON',
            success: function (res) {
                try {
                    res = JSON.parse(res)
                } catch (e) {
                    res = {}
                }
                if (res.errcode == 0) {
                    resolve(res.data);
                } else {
                    // 101 是不能再增加游戏次数,
                    if (res.errcode == 101) {

                    } else {
                        $warn(res.errmsg || "服务器返回了不正确的数据: " + JSON.stringify(res))
                    }
                    reject(res);
                }
            },
            error: function (err) {
                $warn("网络开小差了,请稍后再试")

                reject(err);
            }
        });
    });
}

const _get = (data) => {
    return _ajax(data, 'GET');

}
const _post = (data) => {
    return _ajax(data, 'POST');

}

function $warn(msg) {
    console.error(msg)
    alert(msg)
}

// 1、获取头像【测试】
// action:avatarListTest
//
// 2、获取签到列表
// action:getSignList
//
// 3、更新中奖者信息
// action:updateAwarder cid=

function avatarListTest() {
    let params = {
        action: "avatarListTest",
    }
    return _get(params)
}

function getSignList() {
    let params = {
        action: "getSignList",
    }
    return _get(params)
}

function updateAwarder(cid) {
    let params = {
        action: "updateAwarder",
        cid: cid,
    }
    return _get(params)
}
