const url = require('url');
const fr = require('follow-redirects');

module.exports = (req, res) => {

    let rurl = decodeURIComponent(req.url.substr(req.url.indexOf("/http") == 0 ? 1 : 6) || "");

    if (/(.*)\.(.*)/.test(rurl)) {
        //��������ͷ
        if (rurl.toLowerCase().trim().indexOf("http") != 0) {
            rurl = "http://" + rurl;
        }
        let ops = url.parse(rurl);
        ops.headers = {};
        let hp = ops.protocol == "http:" ? fr.http : fr.https;

        //���Ե�����ʽ
        if (ops.method == "OPTIONS") {
            res.json({ code: 200 });
        } else {
            // ������ͷ����
            let keephd = ['user-agent', 'accept', 'accept-encoding', 'cache-control', 'cookie', 'content-type', 'referer', 'token', 'authorization'],
                headeryes = (req.headers["headeryes"] || "").split(','),
                //��������ͷ����
                headerno = (req.headers["headerno"] || "").split(',');

            keephd = keephd.concat(headeryes);

            for (var i in req.headers) {
                if (headerno.indexOf(i.toLowerCase()) == -1 && keephd.indexOf(i.toLowerCase()) >= 0) {
                    ops.headers[i] = req.headers[i];
                }
            }

            // �Ƿ�� body
            if (["POST", "PUT", "PATCH", "DELETE"].indexOf(ops.method) >= 0) {
                let bk = [];
                for (var i in req.body) {
                    bk.push(i + '=' + encodeURIComponent(req.body[i]));
                }
                ops.body = bk.join('&');
            }

            let hr = hp.request(ops, function (ro) {

                ['content-encoding', 'content-type'].forEach(hk => {
                    let chk = ro.headers[hk];
                    if (chk) {
                        res.setHeader(hk, chk);
                    }
                });

                ro.on("data", function (chunk) {
                    res.write(chunk);
                });

                ro.on("end", function () {
                    res.end();
                });
            });

            hr.on("error", function (err) {
                res.json({
                    code: -1,
                    msg: err.message
                });
            });

            hr.end();
        }
    } else {
        res.json({
            code: 0,
            usage: 'Host/cors/{URL}',
            source: 'https://github.com/netnr/serverless'
        });
    }
}