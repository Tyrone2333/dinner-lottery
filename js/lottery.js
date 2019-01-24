// let avatar = ` <img src="http://thirdwx.qlogo.cn/mmopen/rlURialPOob0XybYlNzB04F8kkgWTOl28n8U7qWB7OQaFTdC6z2GiaiaMFAA5hbTiarhRdxibfP98O7NLGNriaYUaC0PxY3OklZ31a/132"
//              alt="" class="avatar">`

// 配置参数 BEGIN
// 计时器
let slideAvatarTimer = null
let pollingSignListTimer = null
// 头像动画名
let avatarAnimName = "animated bounceIn"
let groupAnimName = "animated fadeIn"
// 轮播时延
let slideAvatarSpeed = 2500
// 抽奖随机人头时延
let lotterySpeed = 50
// 加入头像的时延
let addAvatarSpeed = 50
// 固定一排有多少个头像
const colAvatarNum = 10
// 一组里面有多少个头像
let singleAvatarGroupNum = 0
// let avatar = `<img src="http://wx.qlogo.cn/mmopen/PiajxSqBRaELjhaJH7u24kBD2KVfBiaBj7jn6l7c4SRRlziagIsoaeU4icbflCIrv469JDpk7jiaNBUYfQYgAq7ME2Q/64" alt="" class="avatar">`
// 默认头像
let defaultAvatar = `http://tm.lilanz.com/qywx/res/img/system.jpg`
// 签到列表
let signList = []

// 配置参数 END

let avatarWrapper = $(".avatar-container")
let container = $(".container")

// 如果不能用 vh,就执行这个函数
// addKeyFrames(`calc(-100% + ${container.height()}px)`)

// 抽奖的效果
let draw = {
    timer: null,
    randomNum: 0,
    start: function () {
        // 先添加 黑色 遮罩
        let avatarWrapper = $(".avatar-container")
        let group = avatarWrapper.children()
        group.prepend($(`<div class="avatar-mask mask"></div>`))

        // 清掉以前的轮播,用更快的速度轮播抽奖
        slideAvatarWrapper(500)

        this.timer = setInterval(() => {
            // 一边跳一边换页,所以要重新选择
            let avatarWrapper = $(".avatar-container")
            let group = avatarWrapper.children()

            for (let i = 0; i < group.length; i++) {
                if ($(group[i]).hasClass("active")) {
                    let currentAvatars = $(group[i]).children()
                    this.randomNum = getRandomNum(1, currentAvatars.length - 1)
                    $(currentAvatars[this.randomNum]).addClass("avatar-highlight").siblings().removeClass("avatar-highlight")
                    return
                }
            }
        }, lotterySpeed)

        // 旧版的
        // this.timer = setInterval(() => {
        //     this.randomNum = getRandomNum(0, avatars.length - 1)
        //     $(avatars[this.randomNum]).addClass("avatar-highlight").siblings().removeClass("avatar-highlight")
        // }, 200)

    },
    stop: function () {
        clearInterval(this.timer)
        clearInterval(slideAvatarTimer)

        let avatarWrapper = $(".avatar-container")
        let group = avatarWrapper.children()

        for (let i = 0; i < group.length; i++) {
            if ($(group[i]).hasClass("active")) {
                let currentAvatars = $(group[i]).children()
                // 中奖者,img
                let awarder = currentAvatars[this.randomNum]
                console.log(
                    "中奖者: ", awarder
                )
                showPopup(awarder)
                updateAwarder(awarder.getAttribute("key")).then((res) => {

                }).catch((error) => {
                    console.error(error)

                })
                return
            }
        }
        // 获取自定义属性 `key`
        // avatars[this.randomNum].getAttribute("key")
        console.log("中奖者: " + this.randomNum, avatars[this.randomNum])
    }
}

$(function () {

    // 隐藏遮罩(抽奖结果层)
    hidePopup()

    // avatarListTest().then((res) => {
    getSignList().then(async (res) => {
        let t = [{
            "id": 1,
            "cname": "李清峰",
            "department": "信息管理中心",
            "mobile": "15260825009",
            "avatar": "http://shp.qpic.cn/bizmp/aFWqEucQiblaQ9VU2nArnomOPTCXKSsHJAroYAn7jnj9Xs91VkEB9mQ/",
            "signtime": "2019-01-24 15:24:03"
        }]
        // signList = t
        // res = t
        signList = res


        let avatars = ""
        for (let i = 0; i < res.length; i++) {
            avatars += `<img class="avatar ${avatarAnimName}" cname="${res[i].cname}" department="${res[i].department || '部门未知'}" key="${res[i].cid || 0}" src="${res[i].avatar || defaultAvatar}" alt="">`
        }
        // avatars += myAvatar
        // 所有的头像,丢到头像容器
        splitAvatarGroup(avatars)

        // 轮播头像组
        // slideAvatarWrapper()

        createEventListenr()
        pollingSignList()
    })


})

// 轮询签到列表
function pollingSignList() {
    pollingSignListTimer = setInterval(() => {
        getSignList().then(async (res) => {
            if (signList.length < res.length) {

                let avatars = ""
                // 从已有列表开始,循环新增的数量
                for (let i = signList.length; i < res.length; i++) {
                    avatars += `<img class="avatar ${avatarAnimName}" cname="${res[i].cname}" department="${res[i].department || '部门未知'}" key="${res[i].id || 0}" src="${res[i].avatar || defaultAvatar}" alt="">`
                }
                // await pushOneByOne(arr, target, start, end)
                let avatarWrapper = $(".avatar-container")
                let target = avatarWrapper.children().last()

                console.warn(
                    "一共:" + target.children().length + $(avatars).length,
                    "一组可以容纳:" + singleAvatarGroupNum
                    , )
                if (target.children().length + $(avatars).length > singleAvatarGroupNum) {
                    window.location.reload()
                }

                // 清掉计时器,停在单页等插入头像完成再开始轮播
                clearInterval(slideAvatarTimer)
                let group = avatarWrapper.children()

                let lastGroup = avatarWrapper.children().last()
                lastGroup.addClass("active").siblings().removeClass("active")

                await pushOneByOne($(avatars), target, 0, $(avatars).length)

                setTimeout(() => {
                    slideAvatarWrapper()
                    // 要先更改 css 图片的宽度
                    avatarWrapper.find(".avatar").removeClass(avatarAnimName)
                }, 2000)

                signList = res

            }
        })

    }, 2000)

}

function createEventListenr() {
    // 抽奖按钮
    $(".begin-lottery").on("click", function () {
        if ($(".img-begin-lottery").attr("src") === "./image/stop-lottery.png") {
            stopLottery()
        } else {
            beginLottery()
        }
    })

    // 点击遮罩关闭
    $(".popup-mask").on("click", function () {
        hidePopup()
        $(".avatar-mask").remove()

        slideAvatarWrapper()
    })

}

// 开始抽奖
function beginLottery() {
    $(".img-begin-lottery").attr("src", "./image/stop-lottery.png")
    draw.start()
}

function stopLottery() {
    $(".img-begin-lottery").attr("src", "./image/begin-lottery.png")

    draw.stop()
}

function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay)
    })
}

async function pushOneByOne(arr, target, start, end) {

    // console.log(arr, target, start, end)

    for (let i = start; i < end; i++) {
        target.append(arr[i])
        await sleep(addAvatarSpeed)

    }
}

// 切分头像组放到容器
async function splitAvatarGroup(avatars) {
    let wrapperWidth = avatarWrapper.width()
    let wrapperHeight = avatarWrapper.height()
    // 一排10个,单个正方形头像宽度
    let singleAvatarWidth = wrapperWidth / colAvatarNum
    // 可以容纳多少行头像
    let rowAvatarNum = Math.floor(wrapperHeight / singleAvatarWidth)
    let groupNum = Math.ceil(($(avatars).length / (rowAvatarNum * colAvatarNum)))
    // 一组里有多少个头像
    singleAvatarGroupNum = rowAvatarNum * colAvatarNum
    console.warn(
        "容器宽: " + wrapperWidth,
        "容器高: " + wrapperHeight,
        "单头像长度: " + singleAvatarWidth,
    )

    // css 头像的宽度
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.avatar-container .avatar{width: calc(100%/${colAvatarNum}) !important;}`
    document.getElementsByTagName('head')[0].appendChild(style);

    for (let i = 0; i < groupNum; i++) {
        // if (i === 0) {
        //     avatarWrapper.append($('<div class="one-group  active"></div>'))
        // } else {
        //     avatarWrapper.append($('<div class="one-group "></div>'))
        // }
        avatarWrapper.append($('<div class="one-group"></div>'))

        // 要插入的目标页
        let target = avatarWrapper.children().eq(i)
        // 激活目标页,等待插入动画完成
        target.addClass("active").siblings().removeClass("active")
        await pushOneByOne($(avatars), target, i * singleAvatarGroupNum, (i + 1) * singleAvatarGroupNum)

        // let oneGroupArr = $(avatars).slice(i * singleAvatarGroupNum, (i + 1) * singleAvatarGroupNum)
        // // 把每一组头像添加到 avatarWrapper
        // i === 0
        //     ? avatarWrapper.append($('<div class="one-group  active"></div>').html(oneGroupArr))
        //     : avatarWrapper.append($('<div class="one-group "></div>').html(oneGroupArr))
        //
    }

    // 要先更改 css 图片的宽度
    avatarWrapper.find(".avatar").removeClass(avatarAnimName)

    // 轮播头像组
    slideAvatarWrapper()


    // avatarWrapper.html(groupDom)

}

// 轮播头像组
function slideAvatarWrapper(speed) {
    clearInterval(slideAvatarTimer)

    slideAvatarTimer = setInterval(() => {
        let avatarWrapper = $(".avatar-container")
        let group = avatarWrapper.children()

        for (let i = 0; i < group.length; i++) {
            if ($(group[i]).hasClass("active")) {
                // 下一个轮播的索引
                let nextActiveIdx = i + 1 >= group.length
                    ? 0
                    : i + 1
                $(group[nextActiveIdx]).addClass("active " + groupAnimName).siblings().removeClass("active " + groupAnimName)
                return
            }
        }
    }, speed || slideAvatarSpeed)
}

function showPopup(image) {
    $(".header-wrapper .avatar").attr("src", image.getAttribute("src"))
    $(".user-wrapper .name").text(image.getAttribute("cname"))
    $(".user-wrapper .department").text(image.getAttribute("department"))

    $(".popup-mask").show()
    $(".popup").show()
}

function hidePopup() {
    $(".popup-mask").hide()
    $(".popup").hide()
}

// 获取 (min, max) 的随机数
function getRandomNum(min, max) {
    // parseInt(Math.random() * (max - min + 1) + min, 10);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// 设置keyframes属性
function addKeyFrames(y) {
    var style = document.createElement('style');
    style.type = 'text/css';
    var keyFrames = `
    @keyframes scrollAvatar {
      0% {
        transform: translate3d(0, 0, 0);
      }
      50% {
        transform: translate3d(0, A_DYNAMIC_VALUE , 0);
      }
      100% {
        transform: translate3d(0, 0, 0);
      }
    }
    `
    style.innerHTML = keyFrames.replace(/A_DYNAMIC_VALUE/g, y);
    document.getElementsByTagName('head')[0].appendChild(style);
}

