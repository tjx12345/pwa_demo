const fs = require('fs');
const https = require('https');

    const Koa = require('koa');
    let app = new Koa();
    // 向推送服务,发送消息

    const bodyParser = require('koa-bodyparser');
    const Router = require('koa-router');

    const endPoints = [];
  
    // 也可以直接根据 web-push 库生成
    var webpush = require('web-push');
    var vapidKeys = webpush.generateVAPIDKeys(); // 1.生成公私钥
    webpush.setVapidDetails( // 2.设置公私钥
        'mailto:tujunxiong@tokenpai.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
    console.log(vapidKeys.publicKey);

    let router = new Router();
    router
        .post('/test1', ctx => {
            console.dir(ctx.request.body);
            console.log('请求进入post:/test1')
            // 保存客户端点标识
            endPoints.push(ctx.request.body);
            ctx.status = 200;
            
            endPoints.forEach(pushSubscription => {
                let i = 1;
                let timer = setInterval(function() {
                    i++;
                    if(i=== 5) clearInterval(timer);
                    console.log(pushSubscription)
                    // 发送消息
                    webpush.sendNotification(pushSubscription, '服务器的消息来啦!')
                        .then(res => {
                            console.log('ok');
                            console.log(res);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }, 5000)
                // 
                // 

            });
        })
        .get('/pushmessage', async ctx => {

            ctx.status = 200;
            ctx.body = {};
            console.log('xxxx', endPoints)
            endPoints.forEach(endpoint => {
                console.log('app-server1:' + endpoint)
                // 发送消息
                webPush.sendNotification({ endpoint })
                    .then(console.log)
                    .catch(console.error);
            })
        })

    app.use(async (ctx,next)=>{
        if(ctx.request.url === '/main.js') {
            ctx.body = require('fs').readFileSync('./main.js','utf8').replace('^_^',vapidKeys.publicKey);
        } else {
            await next();
        }

    })
    app.use(require('koa-static')('./'));
    app.use(bodyParser());
    app.use(router.routes());


    const options = {
        key: fs.readFileSync('./cert/1530632509237.key'),
        cert: fs.readFileSync('./cert/1530632509237.pem')
    };


    https.createServer(options, app.callback()).listen(443,'0.0.0.0');

