const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id', 'file_name']);
    if (params == null)
        return;

    album_util.check_album_exist(params['album_id'], conn, cb, function () {
        get_max_picture_id();
    });

    function get_max_picture_id() {
        let sql = 'SELECT MAX(picture_id) AS max FROM Picture WHERE album_id = \'{album_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            params.next_picture_id = results[0]['max'] + 1;
            insert1();
        });
    }

    function insert1() {
        let sql = 'INSERT INTO Picture (album_id, picture_id, name) VALUES (\'{album_id}\', \'{next_picture_id}\', \'{file_name}\')';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            get_inserted();
        });
    }

    function get_inserted() {
        let sql = 'SELECT * FROM Picture WHERE album_id = \'{album_id}\' AND picture_id = \'{next_picture_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 200, results[0], conn);
        });
    }
};