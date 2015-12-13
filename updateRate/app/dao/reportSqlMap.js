// CRUD SQL语句
var report = {
  insert:'INSERT INTO report(content, web, category) VALUES(?,?,?)',
  update:'update report set name=?, age=? where id=?',
  delete: 'delete from report where id=?',
  queryById: 'select * from report where id=?',
  queryAll: 'select * from report'
};

module.exports = report;