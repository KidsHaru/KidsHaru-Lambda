const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, []);
    if (params == null)
        return;

    get();

    function get() {
        let sql = `
            SELECT ViewPicture.* FROM ViewPicture
            JOIN Album_Picture ON Album_Picture.picture_id = ViewPicture.picture_id
            JOIN Album ON Album.album_id = Album_Picture.album_id
            WHERE ViewPicture.status LIKE 'processing' AND Album.status LIKE 'processing';
        `;
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let picture_list = picture_util.process_picture_list(results);
            response.end(cb, 200, picture_list, conn);
        });
    }
};