const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['teacher_id']);
    if (params == null)
        return;

    get();

    function get() {
        let sql =
            'SELECT Child.* FROM Teacher_Child ' +
            'INNER JOIN Child ON Teacher_Child.child_id = Child.child_id ' +
            'WHERE Teacher_Child.teacher_id = \'{teacher_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 200, results, conn);
        });
    }
};