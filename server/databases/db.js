require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

class dbrepository {
  constructor(){
    this.pool = mysql.createPool({
      host: "monorail.proxy.rlwy.net",
      port: 27764,
      user: "root",
      password: process.env.MYSQL_PASSWORD,
      database: "railway"
    });
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async userExists(username, conn=null) {
    try{
      if(conn == null) conn = await this.getConnection();
      const [rows] = await conn.execute(
        'SELECT COUNT(*) AS count FROM Users WHERE username = ?',
        [username]
      );
      console.log("rows:", rows);
      return rows[0].count > 0;
    } catch (err) {
      console.error("Error while checking if user exists: ", err);
      throw err;
    } finally {
      conn.release();
    }
  }

  // Returns following:
  // 0 - Created user successfully
  // 1 - User with such nickname already exists
  // -1 - DB error
  async createUser(username, pwd_hash, conn=null) {
    console.log(username);
    console.log(pwd_hash);
    try{
      if(conn == null) conn = await this.getConnection();
      if(await this.userExists(username, conn)){
        return 1;
      }
      const query = 'INSERT INTO Users (username, password_hash, created_at) VALUES (?, ?, CURRENT_DATE())';
      const [result] = await conn.execute(query, [username, pwd_hash]);
      if(result.affectedRows === 1) console.log('Inserted user:', result);
      return result.affectedRows === 1 ? 0 : -1;
    } catch (err) {
      console.error("Error while creating user:", err);
      throw err;
    } finally {
      conn.release();
    }
  }


async getUsers(conn=null) {
  try{
    if(conn == null) conn = await this.getConnection();
    const [rows] = await conn.execute('SELECT username FROM Users');
    return rows.map(row => row.username);
  } catch (err) {
    console.error("Error while fetching users:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async validatePassword(username, password, conn=null) {
  try{
    if(conn == null) conn = await this.getConnection();
    const [result] = await conn.execute(
      'SELECT password_hash FROM Users WHERE username = ?',
      [username]
    );
    if(result.length == 0){
      return 0;
    }
    return await bcrypt.compare(password, result[0].password_hash);
  } catch (err) {
    console.error("Error while validating password:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

}

const dbrepo = new dbrepository();
module.exports = dbrepo;