// let baseUrl = 'http://192.168.36.171:3030/pigApi';
let baseUrl
if( window.location.host === "tm.lilanz.com" ){
    baseUrl = "./itfripartycore.ashx"
} else{
    baseUrl = "http://tm.lilanz.com/qywx/test/2019itparty/itfripartycore.ashx"
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
                // if(err.errcode == 101){
                //
                // }else {
                //     $warn(err)
                // }
                $warn("服务器发生错误,请稍后再试")

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
    alert(msg)
}

// http://tm.lilanz.com/qywx/test/2019itparty/itfripartycore.ashx?action=avatarListTest

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