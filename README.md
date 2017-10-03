# l4n-query
``` js
const query = require('l4n-query');
query.source({ address: '127.0.0.1' port: 27015 })
    .then(response => console.log(response))
    .catch(ex => console.log(ex));
```