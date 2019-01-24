// let avatar = ` <img src="http://thirdwx.qlogo.cn/mmopen/rlURialPOob0XybYlNzB04F8kkgWTOl28n8U7qWB7OQaFTdC6z2GiaiaMFAA5hbTiarhRdxibfP98O7NLGNriaYUaC0PxY3OklZ31a/132"
//              alt="" class="avatar">`

let slideAvatarTimer = null

let avatar = `<img src="http://wx.qlogo.cn/mmopen/PiajxSqBRaELjhaJH7u24kBD2KVfBiaBj7jn6l7c4SRRlziagIsoaeU4icbflCIrv469JDpk7jiaNBUYfQYgAq7ME2Q/64" alt="" class="avatar">`
let myAvatar = `<img style="z-index: 2000" src="http://thirdwx.qlogo.cn/mmopen/rlURialPOob0XybYlNzB04F8kkgWTOl28n8U7qWB7OQaFTdC6z2GiaiaMFAA5hbTiarhRdxibfP98O7NLGNriaYUaC0PxY3OklZ31a/132" alt="" class="avatar">`

let avatars = ""
for (let i = 0; i < 150; i++) {
    avatars += `<img key="姓名${i}" department="信息管理中心" src="http://wx.qlogo.cn/mmopen/PiajxSqBRaELjhaJH7u24kBD2KVfBiaBj7jn6l7c4SRRlziagIsoaeU4icbflCIrv469JDpk7jiaNBUYfQYgAq7ME2Q/64" alt="" class="avatar">`
}
avatars += myAvatar

let avatarWrapper = $(".avatar-container")
let container = $(".container")

let avatarWrapperHeight = avatarWrapper.height()
let containerHeight = container.height()
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
        }, 200)

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
                console.log(
                    "中奖者: ", currentAvatars[this.randomNum]
                )
                showPopup(currentAvatars[this.randomNum])

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

    // 所有的头像,丢到头像容器
    splitAvatarGroup(avatars)

    // 轮播头像组
    slideAvatarWrapper()

    createEventListenr()
})

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

function formatDecimal(num, decimal) {
    num = num.toString()
    let index = num.indexOf('.')
    if (index !== -1) {
        num = num.substring(0, decimal + index + 1)
    } else {
        num = num.substring(0)
    }
    return parseFloat(num).toFixed(decimal)
}

// 切分头像组放到容器
function splitAvatarGroup(avatars) {
    // 固定一排有多少个头像
    const colAvatarNum = 15

    let wrapperWidth = avatarWrapper.width()
    let wrapperHeight = avatarWrapper.height()
    // 一排10个,单个正方形头像宽度
    let singleAvatarWidth = wrapperWidth / colAvatarNum
    // 可以容纳多少行头像
    let rowAvatarNum = Math.floor(wrapperHeight / singleAvatarWidth)
    let groupNum = Math.ceil(($(avatars).length / (rowAvatarNum * colAvatarNum)))
    // 一组里有多少个头像
    let singleAvatarGroupNum = rowAvatarNum * colAvatarNum
    console.warn(
        "容器宽: " + wrapperWidth,
        "容器高: " + wrapperHeight,
        "单头像长度: " + singleAvatarWidth,
        )
    for (let i = 0; i < groupNum; i++) {
        let oneGroupArr = $(avatars).slice(i * singleAvatarGroupNum, (i + 1) * singleAvatarGroupNum)
        // 把每一组头像添加到 avatarWrapper
        i === 0
            ? avatarWrapper.append($('<div class="one-group active"></div>').html(oneGroupArr))
            : avatarWrapper.append($('<div class="one-group"></div>').html(oneGroupArr))
    }

    // 更改图片的宽度
    avatarWrapper.find(".avatar").css("width", `calc(100%/${colAvatarNum})`)

    // avatarWrapper.html(groupDom)

}

// 轮播头像组
function slideAvatarWrapper() {

    slideAvatarTimer = setInterval(() => {
        let avatarWrapper = $(".avatar-container")
        let group = avatarWrapper.children()

        for (let i = 0; i < group.length; i++) {
            if ($(group[i]).hasClass("active")) {
                // 下一个轮播的索引
                let nextActiveIdx = i + 1 >= group.length
                    ? 0
                    : i + 1
                $(group[nextActiveIdx]).addClass("active").siblings().removeClass("active")
                return
            }
        }
    }, 1200)
}

function showPopup(image) {
    $(".header-wrapper .avatar").attr("src", image.getAttribute("src"))
    $(".user-wrapper .name").text(image.getAttribute("key"))
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

