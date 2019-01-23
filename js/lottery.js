// let avatar = ` <img src="http://thirdwx.qlogo.cn/mmopen/rlURialPOob0XybYlNzB04F8kkgWTOl28n8U7qWB7OQaFTdC6z2GiaiaMFAA5hbTiarhRdxibfP98O7NLGNriaYUaC0PxY3OklZ31a/132"
//              alt="" class="avatar">`
let avatar = `<img src="http://wx.qlogo.cn/mmopen/PiajxSqBRaELjhaJH7u24kBD2KVfBiaBj7jn6l7c4SRRlziagIsoaeU4icbflCIrv469JDpk7jiaNBUYfQYgAq7ME2Q/64" alt="" class="avatar">`
let myAvatar = `<img src="http://thirdwx.qlogo.cn/mmopen/rlURialPOob0XybYlNzB04F8kkgWTOl28n8U7qWB7OQaFTdC6z2GiaiaMFAA5hbTiarhRdxibfP98O7NLGNriaYUaC0PxY3OklZ31a/132" alt="" class="avatar">`

let avatars = ""
for (let i = 0; i < 50; i++) {
    avatars += `<img key="${i}" src="http://wx.qlogo.cn/mmopen/PiajxSqBRaELjhaJH7u24kBD2KVfBiaBj7jn6l7c4SRRlziagIsoaeU4icbflCIrv469JDpk7jiaNBUYfQYgAq7ME2Q/64" alt="" class="avatar">`
}
avatars += myAvatar

let avatarWrapper = $(".avatar-wrapper")
let container = $(".container")

// 所有的头像,丢到头像容器
avatarWrapper.html(avatars)

let avatarWrapperHeight = avatarWrapper.height()
let containerHeight = container.height()
// 如果不能用 vh,就执行这个函数
// addKeyFrames(`calc(-100% + ${container.height()}px)`)

// 抽奖的效果
let draw = {
    timer: null,
    randomNum: 0,
    start: function () {
        let avatars = avatarWrapper.find("img")

        this.timer = setInterval(() => {
            this.randomNum = getRandomNum(0, avatars.length - 1)
            $(avatars[this.randomNum]).addClass("avatar-highlight").siblings().removeClass("avatar-highlight")
        }, 200)

    },
    stop: function () {
        clearInterval(this.timer)
        let avatars = avatarWrapper.find("img")
        // 获取自定义属性 `key`
        // avatars[this.randomNum].getAttribute("key")
        console.log("中奖者: " + this.randomNum, avatars[this.randomNum])
    }
}

draw.start()
setTimeout((res) => {
    draw.stop()
}, 2000)


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

