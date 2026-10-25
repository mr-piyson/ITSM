const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection('mysql://root:bfgA$$essDb@172.18.1.20:3306');
  for (const ip of ['172.18.1.82:80','172.18.1.80:80']) {
    const [rows] = await conn.query(
      "SELECT device_model, device_serial, serialNo FROM hikvision.log_202510 WHERE device_ip = ? ORDER BY id DESC LIMIT 1",
      [ip]
    );
    console.log(ip, JSON.stringify(rows));
    const [maxr] = await conn.query(
      "SELECT MAX(serialNo) AS maxSerial FROM hikvision.log_202510 WHERE device_ip = ?",
      [ip]
    );
    console.log('max serial', ip, maxr[0].maxSerial);
  }
  await conn.end();
})().catch(e=>{console.error(e);process.exit(1);});
