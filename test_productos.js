const http = require('http');
http.get('http://localhost:3000/productos', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
        console.log("Status:", res.statusCode);
        console.log(JSON.parse(data));
    } catch(e) {
        console.log("Data:", data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
