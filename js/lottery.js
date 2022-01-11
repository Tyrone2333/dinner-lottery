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
const colAvatarNum = 15
// 一组里面有多少个头像
let singleAvatarGroupNum = 0
// 默认头像
let defaultAvatar = `https://img01.yzcdn.cn/vant/apple-2.jpg`
// 签到列表
let signList = []
let counterObj = {}
let oldCounter = {}
// 配置参数 END

let avatarWrapper = $(".avatar-container")

// 抽奖的效果
let draw = {
    timer: null,
    randomNum: 0,
    isDrawing: false,
    start: function () {
        this.isDrawing = true
        // 先添加 黑色 遮罩
        let avatarWrapper = $(".avatar-container")
        let group = avatarWrapper.children()
        group.prepend($(`<div class="avatar-mask mask"></div>`))

        // 清掉以前的轮播,用更快的速度轮播抽奖,并且不用动画
        slideAvatarWrapper(500, false)
        clearInterval(pollingSignListTimer)

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

        this.isDrawing = false
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
    // hidePopup()

    // avatarListTest().then(async (res) => {
    //     signList = res
    getSignList().then(async (res) => {
        signList = res.list
        updateSignNum({
            it: res.it,
            sc: res.sc
        })

        let avatars = ""
        for (let i = 0; i < signList.length; i++) {
            avatars += `<img class="avatar ${avatarAnimName}" cname="${signList[i].cname}" department="${signList[i].department || '部门未知'}" key="${signList[i].cid || 0}" src="${signList[i].avatar || defaultAvatar}" alt="">`
        }

        // 所有的头像,丢到头像容器
        await splitAvatarGroup(avatars)

        // 轮播头像组
        // slideAvatarWrapper()

        createEventListenr()
    })
})

function updateSignNum(count) {
    for (let p in count) {
        if (counterObj[p]) {
            console.log(counterObj[p], count[p], oldCounter[p])
            if (count[p] === oldCounter[p])
            // 只能退出本轮,return 就不会循环 count 后面的 key 了
                continue
            (function (key) {
                // counterObj[key].reset();
                setTimeout(function () {
                    counterObj[key].update(count[key]);
                    console.log(counterObj[key], count[key]);
                }, 50);
            })(p);
        } else {
            let opts = {
                useEasing: true
            };
            counterObj[p] = new CountUp(p + "-num", 0, count[p], 0, 2, opts);
            counterObj[p].start();
        }

    }
    oldCounter = count
}

// 轮询签到列表
function pollingSignList() {
    clearInterval(pollingSignListTimer)

    pollingSignListTimer = setInterval(() => {
        getSignList().then(async (res) => {

            if (signList.length < res.list.length) {
                updateSignNum({
                    it: res.it,
                    sc: res.sc
                })
                res = res.list
                let avatars = ""
                // 从已有列表开始,循环新增的数量
                for (let i = signList.length; i < res.length; i++) {
                    avatars += `<img class="avatar ${avatarAnimName}" cname="${res[i].cname}" department="${res[i].department || '部门未知'}" key="${res[i].id || 0}" src="${res[i].avatar || defaultAvatar}" alt="">`
                }
                // await pushOneByOne(arr, target, start, end)
                let avatarWrapper = $(".avatar-container")
                let target = avatarWrapper.children().last()

                console.warn(
                    "一共:" + (target.children().length + $(avatars).length),
                    "一组可以容纳:" + singleAvatarGroupNum
                    ,)
                if (target.children().length + $(avatars).length > singleAvatarGroupNum) {
                    window.location.reload()
                }

                // 清掉计时器,停在单页等插入头像完成再开始轮播
                clearInterval(slideAvatarTimer)
                let group = avatarWrapper.children()

                let lastGroup = avatarWrapper.children().last()
                lastGroup.addClass("active").siblings().removeClass("active")

                await pushOneByOne($(avatars), target, 0, $(avatars).length)

                avatarWrapper.find(".avatar").removeClass(avatarAnimName)
                setTimeout(() => {
                    if (draw.isDrawing) {
                        console.log("正在抽奖,不能重复轮播")
                        return
                    }
                    slideAvatarWrapper()
                }, 5000)
                signList = res
            }
        })
    }, 2000)
}

function handleLottery() {
    if ($(".popup").hasClass("show")) {
        return
    }
    let lotteryImg = $(".img-begin-lottery")
    if (lotteryImg.attr("src") === "./image/stop-lottery.png") {
        // 结束抽奖
        lotteryImg.attr("src", "./image/begin-lottery.png")
        draw.stop()
    } else {
        // 开始抽奖
        lotteryImg.attr("src", "./image/stop-lottery.png")
        draw.start()
    }
}

function createEventListenr() {
    // 抽奖按钮
    $(".begin-lottery").on("click", handleLottery)

    // 点击遮罩关闭
    $(".popup-mask").on("click", function () {
        hidePopup()
        $(".avatar-mask").remove()

        // 重新打开轮询和轮播
        slideAvatarWrapper()
        pollingSignList()
    })

    // 预加载头像
    $(".img-title").on("click", preloadAvatar)
    // 空格抽奖
    $(document).keydown(function (event) {
        if (event.code === "Space")
            handleLottery()
    });

}

function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay)
    })
}

async function pushOneByOne(arr, target, start, end) {
    for (let i = start; i < end; i++) {
        console.log('添加 ' + i, '共 ' + end)
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
    // 有多少个组,至少要有一个组
    let groupNum = Math.ceil(($(avatars).length / (rowAvatarNum * colAvatarNum)))
    groupNum = groupNum === 0
        ? 1
        : groupNum
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
    style.innerHTML = `.avatar-container .avatar{width: calc(100%/${colAvatarNum}) !important;min-width: calc(100%/${colAvatarNum});height:${singleAvatarWidth}px;`
    document.getElementsByTagName('head')[0].appendChild(style);

    for (let i = 0; i < groupNum; i++) {
        avatarWrapper.append($('<div class="one-group"></div>'))

        // 要插入的目标页
        let target = avatarWrapper.children().eq(i)
        // 激活目标页,等待插入动画完成
        target.addClass("active").siblings().removeClass("active")
        await pushOneByOne($(avatars), target, i * singleAvatarGroupNum, (i + 1) * singleAvatarGroupNum)
    }

    // 要先更改 css 图片的宽度
    avatarWrapper.find(".avatar").removeClass(avatarAnimName)

    // 轮询签到人数
    pollingSignList()

    // 轮播头像组
    slideAvatarWrapper()

}

// 轮播头像组
function slideAvatarWrapper(speed, uesAnim = true) {
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
                // 默认在切换的时候使用动画过渡,如果以前有轮播会残留动画class,要移除
                let anim = uesAnim ? groupAnimName : ""
                $(group[nextActiveIdx]).addClass("active " + anim).siblings().removeClass("active " + groupAnimName)
                return
            }
        }
    }, speed || slideAvatarSpeed)
}

function showPopup(image) {
    $(".header-wrapper .avatar").attr("src", image.getAttribute("src"))
    $(".user-wrapper .name").text(image.getAttribute("cname"))
    $(".user-wrapper .department").text(image.getAttribute("department"))

    $(".popup-mask").addClass("show").removeClass("hide")
    $(".popup").addClass("show").removeClass("hide")
}

function hidePopup() {
    $(".popup-mask").removeClass("show").addClass("hide")
    $(".popup").removeClass("show").addClass("hide")
}

// 获取 (min, max) 的随机数
function getRandomNum(min, max) {
    // parseInt(Math.random() * (max - min + 1) + min, 10);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// 预加载头像图片
function preloadAvatar() {
    avatarListTest().then((res) => {
        console.log(res)
        for (let i = 0; i < res.length; i++) {
            let img = new Image();
            img.src = res[i].avatar
        }
    }).catch((e) => {
        console.error(e)
    })
}
