import {_get, _post} from "../api/ajax"

// console.log("当前所在环境: " + process.env.NODE_ENV)

// 用户信息
export function avatarListTest() {
    let params = {
        action: "avatarListTest",
    }
    return _get(params)
}
