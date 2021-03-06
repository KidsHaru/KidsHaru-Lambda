const credential = require('../../utils/credential.js');
const Jimp = require('jimp');
const aws = require('aws-sdk');
const s3Util = require('../../utils/s3_util.js');
aws.config.update({
    accessKeyId: credential.access_key_id,
    secretAccessKey: credential.secret_key_id,
    region: 'ap-northeast-2'
});
const s3 = new aws.S3();

exports.handle = (event, context, callback) => {
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const folderName = key.split("/")[0];

    if (folderName === "album") {
        load();
    } else {
        callback(null, null);
    }

    function load() {
        return new Promise(function (resolve, reject) {
            const param = {
                'Bucket': s3Util.bucketName,
                'Key': key
            };

            s3.getObject(param, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data.Body);
            });
        });
    }

    function buffer_to_image(buffer) {
        return Jimp.read(buffer);
    }

    function resize(image) {
        return image
            .cover(512, 512, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
            .quality(60)
            .getBufferAsync(Jimp.MIME_JPEG);
    }

    function upload(buffer) {
        return new Promise(function (resolve, reject) {
            const param = {
                'Bucket': s3Util.bucketName,
                'Key': key.replace("album/", "album-thumbnail/"),
                'Body': buffer,
                'ContentType': 'image/jpeg'
            };

            s3.upload(param, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });
    }

    load()
        .then(buffer_to_image)
        .then(resize)
        .then(upload)
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => {
            callback(err);
            console.error(err);
        });
};
