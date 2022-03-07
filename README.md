# REST Tilemap3D API

REST API to store tilemap info and calculate paths

### Installation

```bash
git clone https://<url>
cd rest-tilemap-3d
npm install
npm run build
```

### Configuration

Create .env file in rest-tilemap-3d directory.

Full .env file looks like this.
```
HOST_NAME=localhost
PORT=3000
PASSWORD=strong_password
TOKEN_KEY=strong_key
ENCRYPTED=true
```

- **HOST_NAME**: IP or Hostname of the API. Default "localhost".
- **PORT**: Port of the API. Default "3000".
- **PASSWORD**: Required password for get the Token. **If not set, entire API is public**.
- **TOKEN_KEY**: Access Token key for revocation purposes. If password is set this is mandatory.
- **ENCRYPTED**: Optional. If set client must to encrypt their IP using RC4 with PASSWORD as key and login with the result as password.

### Run

CLI
```bash
npm start
```

PM2 ```ecosystem.config.js```
```js
module.exports = {
    apps: [
        {
            name: "rest-tilemap-3d",
            script: "~/rest-tilemap-3d/build/server.js",
            env: {
                PORT: 3000,
                PASSWORD: "<secure_password>"
            }
        }
    ]
};
```

### Usage

If PASSWORD is set login is needed and access token is required for all requests. 

##### POST /login

Client sends a POST request with PASSWORD or if ENCRYPTED their ip encrypted using PASSWORD.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |

Body
```json
{
    "password": "password or encrypted ip"
}
```

Response
```json
{
    "auth": true|false,
    "token": "if auth is true",
    "message": "if auth is false"
}
```

##### POST /block

Creates a new block if not exists.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Body
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "date": "2022/03/05",
    "info": {
        "name": "minecraft:dirt"
    }
}
```

Response
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "updated": "2022-03-05T23:00:00.000Z",
    "info": {
        "name": "minecraft:dirt"
    }
}
```

##### GET /block

Retrieve a stored block given their coordinates.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query
```/block?x=0&y=0&z=0```

Response
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "updated": "2022-03-05T23:00:00.000Z",
    "info": {
        "name": "minecraft:dirt"
    }
}
```

##### PUT /block

Create a block if not exists. If exists and date is later update it or delete if info is not given.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Body
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "date": "2022/03/06",
    "info": {
        "name": "minecraft:rock"
    }
}
```

Response
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "updated": "2022-03-06T23:00:00.000Z",
    "info": {
        "name": "minecraft:rock"
    }
}
```

##### PATCH /block

Update a block if exists given their coordinates

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query
```/block?x=0&y=0&z=0```

Body
```json
{
    "date": "2022/03/06",
    "info": {
        "name": "minecraft:rock"
    }
}
```

Response
```json
{
    "x": 0,
    "y": 0,
    "z": 0,
    "updated": "2022-03-06T23:00:00.000Z",
    "info": {
        "name": "minecraft:rock"
    }
}
```

##### DELETE /block

Delete a block given their coordinates

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query
```/block?x=0&y=0&z=0```


##### POST /blocks

Given an array of blocks this endpoint creates those that not exist, update those whose their date is later and delete those that do not contain information if their date is later.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Body
```json
[
    {
        "x": 0,
        "y": 0,
        "z": 0,
        "date": "2022/03/07",
        "info": {
            "name": "minecraft:rock"
        }
    },
    {
        "x": 1,
        "y": 0,
        "z": 0,
        "date": "2022/03/06",
        "info": {
            "name": "minecraft:dirt"
        }
    }
]
```

Response
```json
{
    "failed": [],            
    "inserted": [
        {
            "x": 1,
            "y": 0,
            "z": 0,
            "date": "2022/03/06",
            "info": {
                "name": "minecraft:dirt"
            }
        }
    ],
    "updated": [
        {
            "x": 0,
            "y": 0,
            "z": 0,
            "date": "2022/03/07",
            "info": {
                "name": "minecraft:rock"
            }
        }
    ],
    "expired": [],
    "deleted": []
}
```

##### GET /blocks

Straightforward search of blocks using mongodb syntax.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query

**filter**: Specify which blocks are searched. If not set all blocks will be returned.

**sort**: Specify the sorting method for the returned blocks. If not set default sorting will be applied.

**select**: Specify which fields will be displayed. If not set all fields are displayed.

**limit**: Specify the amount of blocks returned. If not set all filtered blocks will be returned.

Examples
```
/blocks
/blocks?filter={"x": { "$gt": 10 } }
/blocks?filter={"x": { "$gte" : -10, "$lte" : 10 }, "y": 0, "z": { "$gte" : -10, "$lte" : 10 } }
/blocks?filter={ "info.name": "minecraft:rock" }&select=["x", "y", "z"]&sort={"z": -1}$limit=10
```

Response
```json
[
    {
        "x": 0,
        "y": 0,
        "z": 0,
        "date": "2022/03/07",
        "info": {
            "name": "minecraft:rock"
        }
    },
    {
        "x": 1,
        "y": 0,
        "z": 0,
        "date": "2022/03/06",
        "info": {
            "name": "minecraft:dirt"
        }
    }
]
```

##### DELETE /blocks

Delete all blocks that match with the given filter

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query

**filter**: Specify which blocks are deleted. If not set all blocks will be deleted!

Examples
```
/blocks
/blocks?filter={"x": { "$gt": 10 } }
/blocks?filter={"x": { "$gte" : -10, "$lte" : 10 }, "y": 0, "z": { "$gte" : -10, "$lte" : 10 } }
/blocks?filter={ "info.name": "minecraft:rock" }
```

##### GET /path

Returns a valid path between given start and destination.

Header
| KEY | VALUE |
| :---: | :---: |
| Content-Type | application/json |
| x-access-token | <generated-token> |

Query

**filter**: Specify which blocks are considered obstacles. If not set all blocks in the area will be considered.

**start**: Specify the start position.

**destination**: Specify the destination point.

**space**: Specify how much blocks around the area are considered. If not set is 0.

Examples
```
/path?start={"x":0, "y": 0, "z": 0}&destination={"x": 3, "y": 0, "z": 0}
/path?filter={"info.name": {"$not" : "minecraft:dirt"} }&start={"x":0, "y": 0, "z": 0}&destination={"x": 3, "y": 0, "z": 0}&space=20
/path?start={"x":0, "y": 0, "z": 0}&destination={"x": 3, "y": 0, "z": 0}&space={"x":10, "y": 0, "z": 10}
/path?start=%7B%22x%22%3A0%2C%20%22y%22%3A0%2C%20%22z%22%3A0%7D&destination=%7B%22x%22%3A10%2C%20%22y%22%3A0%2C%20%22z%22%3A0%7D
```

Another way to send the request is using body instead:

Body
```json
{
    "filter": { "info.name": {"$not" : "minecraft:dirt"} },
    "start": {"x":0, "y": 0, "z": 0},
    "destination": {"x": 3, "y": 0, "z": 0},
    "space": 20
}
```

Response
```json
[
    {
        "x": 0,
        "y": 0,
        "z": 0
    },
    {
        "x": 1,
        "y": 0,
        "z": 0
    },
    {
        "x": 2,
        "y": 0,
        "z": 0
    },
    {
        "x": 3,
        "y": 0,
        "z": 0
    }
]
```